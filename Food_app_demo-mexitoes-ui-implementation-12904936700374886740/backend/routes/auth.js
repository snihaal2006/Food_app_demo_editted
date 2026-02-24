const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { supabase } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'mexitoes-super-secret-key-2024';

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    // Save to Supabase since serverless memory is ephemeral
    try {
        await supabase.from('otp_store').upsert({
            phone: phone.trim(),
            otp,
            expires_at: expiresAt
        });
    } catch (err) {
        console.error('Error saving OTP to DB:', err);
    }

    // Demo Mode: Print OTP to console
    console.log(`\n[DEMO MODE] 🚨 Generated OTP for ${phone}: ${otp}\n`);

    // Send OTP via Fast2SMS (OTP Route)
    try {
        if (process.env.FAST2SMS_API_KEY) {
            const axios = require('axios');
            await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                params: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    route: 'otp',
                    variables_values: otp,
                    numbers: phone,
                },
                headers: { 'cache-control': 'no-cache' }
            });
            console.log(`📱 OTP sent to ${phone} via Fast2SMS`);
        }
    } catch (smsErr) {
        console.error('Fast2SMS error:', smsErr.response?.data || smsErr.message);
        console.log('Continuing with demo OTP since SMS failed.');
    }

    res.json({ success: true, message: 'OTP sent to your number', demo_otp: otp });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, name } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }

        // Fetch OTP from Supabase
        const { data: storedOtp, error: otpErr } = await supabase
            .from('otp_store')
            .select('*')
            .eq('phone', phone.trim())
            .single();

        if (otpErr || !storedOtp) {
            return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
        }
        if (Date.now() > storedOtp.expires_at) {
            await supabase.from('otp_store').delete().eq('phone', phone.trim());
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }
        if (storedOtp.otp !== otp.trim()) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        // OTP valid — clear it
        await supabase.from('otp_store').delete().eq('phone', phone.trim());

        // Find or create user by phone
        const { data: users, error: findErr } = await supabase
            .from('users')
            .select('id, name, phone, email, address, loyalty_tier')
            .eq('phone', phone.trim());

        if (findErr) throw findErr;

        let user = users?.[0];

        if (!user) {
            const id = uuid();
            const displayName = name || `User${phone.trim().slice(-4)}`;

            const { error: insertErr } = await supabase.from('users').insert({
                id,
                name: displayName,
                phone: phone.trim(),
                email: `${id}@placeholder.com`, // enforce unique
                password_hash: ''
            });
            if (insertErr) throw insertErr;

            const { data: newUser } = await supabase
                .from('users')
                .select('id, name, phone, email, address, loyalty_tier')
                .eq('id', id)
                .single();
            user = newUser;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user, isNewUser: !user.name || user.name.startsWith('User') });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error verifying OTP' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { queryRow, run } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'mexitoes-super-secret-key-2024';

// In-memory OTP store: { phone -> { otp, expiresAt } }
const otpStore = new Map();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }
    const otp = generateOTP();
    otpStore.set(phone.trim(), { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

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
        return res.status(500).json({ error: 'Failed to send OTP using Fast2SMS. Please try again.' });
    }

    res.json({ success: true, message: 'OTP sent to your number' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const stored = otpStore.get(phone.trim());
    if (!stored) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(phone.trim());
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (stored.otp !== otp.trim()) {
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP valid — clear it
    otpStore.delete(phone.trim());

    // Find or create user by phone
    let user = queryRow('SELECT id, name, phone, email, address, loyalty_tier FROM users WHERE phone = ?', [phone.trim()]);
    if (!user) {
        const id = uuid();
        const displayName = name || `User${phone.trim().slice(-4)}`;
        run('INSERT INTO users (id, name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)',
            [id, displayName, phone.trim(), '', '']);
        user = queryRow('SELECT id, name, phone, email, address, loyalty_tier FROM users WHERE id = ?', [id]);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user, isNewUser: !user.name || user.name.startsWith('User') });
});

module.exports = router;

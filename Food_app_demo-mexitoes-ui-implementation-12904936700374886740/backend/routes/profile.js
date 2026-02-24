const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { supabase } = require('../database');

router.use(auth);

// GET /api/profile
router.get('/', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, address, loyalty_tier, created_at')
            .eq('id', req.userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile
router.put('/', async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const { error: updateErr } = await supabase
            .from('users')
            .update({
                name: name || '',
                phone: phone || '',
                address: address || ''
            })
            .eq('id', req.userId);

        if (updateErr) throw updateErr;

        const { data: user, error: selectErr } = await supabase
            .from('users')
            .select('id, name, email, phone, address, loyalty_tier, created_at')
            .eq('id', req.userId)
            .single();

        if (selectErr) throw selectErr;

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;

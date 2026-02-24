const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { queryRow, run } = require('../database');

router.use(auth);

// GET /api/profile
router.get('/', (req, res) => {
    try {
        const user = queryRow(
            'SELECT id, name, email, phone, address, loyalty_tier, created_at FROM users WHERE id = ?',
            [req.userId]
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile
router.put('/', (req, res) => {
    try {
        const { name, phone, address } = req.body;
        run(
            'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
            [name || '', phone || '', address || '', req.userId]
        );
        const user = queryRow(
            'SELECT id, name, email, phone, address, loyalty_tier, created_at FROM users WHERE id = ?',
            [req.userId]
        );
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;

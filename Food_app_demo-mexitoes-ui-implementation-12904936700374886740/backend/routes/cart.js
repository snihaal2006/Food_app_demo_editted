const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query, queryRow, run } = require('../database');

router.use(auth);

// GET /api/cart
router.get('/', (req, res) => {
    try {
        const items = query(
            `SELECT c.menu_item_id, c.quantity, m.name, m.price, m.image_url, m.category
       FROM cart_items c
       JOIN menu_items m ON c.menu_item_id = m.id
       WHERE c.user_id = ?`,
            [req.userId]
        );
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST /api/cart — add or update item
router.post('/', (req, res) => {
    try {
        const { menu_item_id, quantity } = req.body;
        if (!menu_item_id || quantity == null) return res.status(400).json({ error: 'menu_item_id and quantity required' });
        const existing = queryRow(
            'SELECT id FROM cart_items WHERE user_id = ? AND menu_item_id = ?',
            [req.userId, menu_item_id]
        );
        if (existing) {
            run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND menu_item_id = ?', [quantity, req.userId, menu_item_id]);
        } else {
            run('INSERT INTO cart_items (user_id, menu_item_id, quantity) VALUES (?, ?, ?)', [req.userId, menu_item_id, quantity]);
        }
        const items = query(
            `SELECT c.menu_item_id, c.quantity, m.name, m.price, m.image_url FROM cart_items c JOIN menu_items m ON c.menu_item_id = m.id WHERE c.user_id = ?`,
            [req.userId]
        );
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// DELETE /api/cart/:menu_item_id
router.delete('/:menu_item_id', (req, res) => {
    try {
        run('DELETE FROM cart_items WHERE user_id = ? AND menu_item_id = ?', [req.userId, req.params.menu_item_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// DELETE /api/cart — clear cart
router.delete('/', (req, res) => {
    try {
        run('DELETE FROM cart_items WHERE user_id = ?', [req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const auth = require('../middleware/auth');
const { query, queryRow, run } = require('../database');

router.use(auth);

// POST /api/orders — place order from cart
router.post('/', (req, res) => {
    try {
        const cartItems = query(
            `SELECT c.menu_item_id, c.quantity, m.name, m.price
       FROM cart_items c
       JOIN menu_items m ON c.menu_item_id = m.id
       WHERE c.user_id = ?`,
            [req.userId]
        );
        if (!cartItems.length) return res.status(400).json({ error: 'Your cart is empty' });

        const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const tax = subtotal * 0.08;
        const total = parseFloat((subtotal + tax).toFixed(2));

        const orderId = uuid();
        const itemsSummary = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');

        run(
            'INSERT INTO orders (id, user_id, total, status, items_summary) VALUES (?, ?, ?, ?, ?)',
            [orderId, req.userId, total, 'placed', itemsSummary]
        );

        for (const item of cartItems) {
            run(
                'INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.menu_item_id, item.name, item.price, item.quantity]
            );
        }

        // Clear cart
        run('DELETE FROM cart_items WHERE user_id = ?', [req.userId]);

        // Simulate status progression
        const progressOrder = () => {
            const progressions = [
                { delay: 5000, status: 'preparing' },
                { delay: 30000, status: 'out_for_delivery' },
                { delay: 90000, status: 'delivered' },
            ];
            for (const p of progressions) {
                setTimeout(() => {
                    try {
                        run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [p.status, orderId]);
                    } catch { }
                }, p.delay);
            }
        };
        progressOrder();

        const order = queryRow('SELECT * FROM orders WHERE id = ?', [orderId]);
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// GET /api/orders — order history
router.get('/', (req, res) => {
    try {
        const orders = query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
    try {
        const order = queryRow('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const items = query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.json({ ...order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

module.exports = router;

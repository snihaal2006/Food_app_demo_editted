const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const auth = require('../middleware/auth');
const { supabase } = require('../database');

router.use(auth);

// POST /api/orders — place order from cart
router.post('/', async (req, res) => {
    try {
        // Fetch cart items
        const { data: items, error: cartErr } = await supabase
            .from('cart_items')
            .select(`
                menu_item_id, 
                quantity, 
                menu_items (name, price)
            `)
            .eq('user_id', req.userId);

        if (cartErr) throw cartErr;

        const cartItems = items.map(i => ({
            menu_item_id: i.menu_item_id,
            quantity: i.quantity,
            name: i.menu_items?.name,
            price: i.menu_items?.price
        }));

        if (!cartItems.length) return res.status(400).json({ error: 'Your cart is empty' });

        const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const tax = subtotal * 0.08;
        const total = parseFloat((subtotal + tax).toFixed(2));

        const orderId = uuid();
        const itemsSummary = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');

        const { error: orderErr } = await supabase.from('orders').insert({
            id: orderId,
            user_id: req.userId,
            total,
            status: 'placed',
            items_summary: itemsSummary
        });
        if (orderErr) throw orderErr;

        const orderItemsToInsert = cartItems.map(item => ({
            order_id: orderId,
            menu_item_id: item.menu_item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const { error: orderItemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (orderItemsErr) throw orderItemsErr;

        // Clear cart
        await supabase.from('cart_items').delete().eq('user_id', req.userId);

        const { data: order, error: finalOrderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (finalOrderErr) throw finalOrderErr;

        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// GET /api/orders/admin/all — fetch ALL orders for the admin dashboard
router.get('/admin/all', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                users:user_id(name, phone, address)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;

        // Also fetch order items to display details
        for (let order of orders) {
            const { data: items } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);
            order.items = items || [];
        }

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
});

// PUT /api/orders/admin/:id/status — update an order's status
router.put('/admin/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// GET /api/orders — order history
router.get('/', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });

        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', req.params.id);

        if (itemsErr) throw itemsErr;

        res.json({ ...order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

module.exports = router;

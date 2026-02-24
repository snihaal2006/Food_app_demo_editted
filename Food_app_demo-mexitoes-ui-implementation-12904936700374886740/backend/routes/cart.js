const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { supabase } = require('../database');

router.use(auth);

// Helper to fetch flat cart details
const fetchCart = async (userId) => {
    const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
            menu_item_id, 
            quantity, 
            menu_items (name, price, image_url, category)
        `)
        .eq('user_id', userId);

    if (error) throw error;

    return items.map(i => ({
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        name: i.menu_items?.name,
        price: i.menu_items?.price,
        image_url: i.menu_items?.image_url,
        category: i.menu_items?.category
    }));
};

// GET /api/cart
router.get('/', async (req, res) => {
    try {
        const mappedItems = await fetchCart(req.userId);
        res.json(mappedItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST /api/cart — add or update item
router.post('/', async (req, res) => {
    try {
        const { menu_item_id, quantity } = req.body;
        if (!menu_item_id || quantity == null) return res.status(400).json({ error: 'menu_item_id and quantity required' });

        const { data: existing } = await supabase
            .from('cart_items')
            .select('id')
            .eq('user_id', req.userId)
            .eq('menu_item_id', menu_item_id)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('user_id', req.userId)
                .eq('menu_item_id', menu_item_id);
        } else {
            await supabase
                .from('cart_items')
                .insert({ user_id: req.userId, menu_item_id, quantity });
        }

        const mappedItems = await fetchCart(req.userId);
        res.json(mappedItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// DELETE /api/cart/:menu_item_id
router.delete('/:menu_item_id', async (req, res) => {
    try {
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', req.userId)
            .eq('menu_item_id', req.params.menu_item_id);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// DELETE /api/cart — clear cart
router.delete('/', async (req, res) => {
    try {
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', req.userId);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;

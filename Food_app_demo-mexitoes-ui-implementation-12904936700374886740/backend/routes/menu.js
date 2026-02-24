const express = require('express');
const router = express.Router();
const { supabase } = require('../database');

// GET /api/menu
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = supabase.from('menu_items').select('*');

        if (category) {
            query = query.eq('category', category);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        query = query.order('rating', { ascending: false });

        const { data: items, error } = await query;
        if (error) throw error;

        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// GET /api/menu/categories
router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase.from('menu_items').select('category');
        if (error) throw error;

        const categories = [...new Set(data.map(r => r.category))].sort();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
    try {
        const { data: item, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

module.exports = router;

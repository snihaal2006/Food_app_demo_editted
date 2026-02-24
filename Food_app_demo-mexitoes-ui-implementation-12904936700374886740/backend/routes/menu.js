const express = require('express');
const router = express.Router();
const { query, queryRow } = require('../database');

// GET /api/menu
router.get('/', (req, res) => {
    try {
        const { category, search } = req.query;
        let sql = 'SELECT * FROM menu_items WHERE 1=1';
        const params = [];
        if (category) { sql += ' AND category = ?'; params.push(category); }
        if (search) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY rating DESC';
        const items = query(sql, params);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// GET /api/menu/categories
router.get('/categories', (req, res) => {
    try {
        const rows = query('SELECT DISTINCT category FROM menu_items ORDER BY category');
        res.json(rows.map(r => r.category));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/menu/:id
router.get('/:id', (req, res) => {
    try {
        const item = queryRow('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

module.exports = router;

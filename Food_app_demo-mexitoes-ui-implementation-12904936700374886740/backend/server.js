require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profile', require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) {
    app.listen(3001, () => {
        console.log('Mexitoes backend running locally on http://localhost:3001');
    });
}

module.exports = app;

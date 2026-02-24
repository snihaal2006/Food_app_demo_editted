require('dotenv').config();
const { supabase } = require('./database');

async function checkTables() {
    console.log('Checking users table...');
    const { data: users, error: err1 } = await supabase.from('users').select('*').limit(1);
    console.log('Users table:', err1 || 'EXISTS');

    console.log('Checking menu_items table...');
    const { data: menu, error: err2 } = await supabase.from('menu_items').select('*').limit(1);
    console.log('Menu table:', err2 || 'EXISTS');
}

checkTables();

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
    console.log("Testing search for 'momOs'...");
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .or('name.ilike.%momos%,description.ilike.%momos%');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found items:", data.map(i => i.name));
    }
}

testSearch();

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://cldkpypjkpsepidufjuk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_3AG6tSsUh-KB17wCY4lsFw_rkbXNHU8';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };

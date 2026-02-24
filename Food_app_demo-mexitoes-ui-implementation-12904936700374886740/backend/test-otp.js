require('dotenv').config();
const { supabase } = require('./database');

async function testOtp() {
    console.log('Fetching all OTPs...');
    const res2 = await supabase.from('otp_store').select('*');
    console.log('Fetch Result:', JSON.stringify(res2, null, 2));
}

testOtp();

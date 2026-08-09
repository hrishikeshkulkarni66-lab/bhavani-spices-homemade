/* ==========================================================================
   SUPABASE CLIENT CONFIGURATION
   ========================================================================== */

const SUPABASE_URL = 'https://akumpcejcbtdmjwrbfzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_L-xrbZB8lZrXXQS04zGsSw_4UGffWGZ';

// Destructure createClient from the global 'supabase' loaded via CDN
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized:', supabaseClient ? 'SUCCESS' : 'FAILED');

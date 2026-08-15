/* ==========================================================================
   SUPABASE CLIENT CONFIGURATION
   Wrapped in try/catch so that if the CDN or key fails, app.js still loads.
   ========================================================================== */

let supabaseClient = null;

try {
    const SUPABASE_URL = 'https://akumpcejcbtdmjwrbfzj.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_L-xrbZB8lZrXXQS04zGsSw_4UGffWGZ';

    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized: SUCCESS');
    } else {
        console.warn('⚠️ Supabase CDN not loaded. Running in offline/local mode.');
    }
} catch (err) {
    console.warn('⚠️ Supabase init error (non-fatal):', err.message);
    supabaseClient = null;
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: SUPABASE_URL and SUPABASE_KEY are not fully configured in your .env file.');
}

// Initializing client using env variables or placeholders to avoid boot crashes
const supabase = createClient(
  supabaseUrl || 'https://placeholder-project-id.supabase.co',
  supabaseKey || 'placeholder-anon-or-service-role-key'
);

module.exports = supabase;

// ==========================================
// SUPABASE CONFIGURATION TEMPLATE
// ==========================================
// 
// INSTRUCTIONS:
// 1. Go to https://supabase.com/dashboard
// 2. Select your project
// 3. Go to Settings → API
// 4. Copy the Project URL and Anon/Public Key
// 5. Replace the placeholder values below
// 6. Save this file
//

// OPTION 1: Direct Configuration (for development)
// ================================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// Example (DO NOT USE - replace with your actual credentials):
// const SUPABASE_URL = 'https://eabcdef.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...';


// OPTION 2: Environment Variables (for production)
// ===================================================
// If you're using a build tool or environment variables:
// 
// const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
// const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';


// Finding Your Credentials:
// =========================
// 
// Project URL:
// - Go to Supabase Dashboard → Settings → API
// - Look for "Project URL" field
// - Looks like: https://xyzabc.supabase.co
//
// Anon Key:
// - Same page as above, look for "Project API keys"
// - Copy the "anon" public key (NOT the service_role key!)
// - It's a long JWT token starting with "eyJ..."
//
// ⚠️  NEVER expose your service_role key in frontend code!


// Validation:
// ===========
// Your configuration is correct if:
// ✓ SUPABASE_URL contains "supabase.co"
// ✓ SUPABASE_ANON_KEY starts with "eyJ" and is very long
// ✓ No curly braces or template literals in the values
// ✓ Strings are properly quoted


// Security Notes:
// ==================
// - The anon key CAN be public (it's safe in frontend)
// - The service_role key MUST be kept secret (backend only)
// - RLS (Row Level Security) policies protect your data
// - Use Supabase Dashboard to set up RLS rules


// Troubleshooting:
// ==================
// 
// Error: "Supabase not configured"
//   → Check SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
//   → Make sure quotes are included in the strings
//
// Error: "Invalid API key"
//   → Double-check you copied the entire anon key
//   → Make sure it's not the service_role key
//
// Error: "Supabase JS not found"
//   → Check index.html has: <script src="...supabase-js@2"></script>
//   → Make sure it's loaded before app.js

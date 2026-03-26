# Supabase Authentication Setup Guide

This guide explains how to integrate your Supabase credentials into the frontend authentication system.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like `https://xyzabc.supabase.co`)
   - **Anon/Public Key** (the public key that starts with `eyJ...`)

## Step 2: Update app.js

Open `frontend/app.js` and find these lines at the top (around line 8-9):

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace them with your actual credentials:

```javascript
const SUPABASE_URL = 'https://xyzabc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 3: Verify Database Tables

Make sure your Supabase database has the following tables and fields. These should already exist if you set up the backend with Supabase:

### `users` table
- `user_id` (UUID, primary key)
- `name` (text)
- `email` (text)
- `created_at` (timestamp)

### `performance_records` table
- `record_id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `subject_name` (text)
- `marks` (integer)
- `created_at` (timestamp)

## Step 4: Test the Setup

1. Open `frontend/index.html` in your browser
2. Try creating a new account with an email and password
3. Verify the account was created in Supabase Dashboard → Authentication
4. Try logging in

## Features Implemented

✅ **Sign Up** - Create new account with Supabase Auth
✅ **Login** - Sign in with email and password
✅ **Error Handling** - Clear error messages displayed
✅ **Success Messages** - Confirmation messages shown
✅ **Session Persistence** - Keep users logged in across page reloads
✅ **Logout** - Clear session and show login screen
✅ **Email Verification** - User receives verification email
✅ **Page Reload Prevention** - Form submission uses preventDefault()
✅ **Event Listeners** - Properly attached and detached

## Security Notes

- The anon key is meant to be public (it's safe to expose in frontend)
- Never share your **service role key** (that one is secret!)
- Use RLS (Row Level Security) policies in Supabase to protect data
- Passwords are hashed by Supabase Auth automatically

## Troubleshooting

### "Supabase not configured" error
- Check your SUPABASE_URL and SUPABASE_ANON_KEY values
- Make sure Supabase JS library is loaded (check `<script src="...supabase-js@2"></script>` in index.html)

### Sign up works but can't log in
- User might need to verify email first
- Check Supabase Dashboard → Authentication for the user status

### localStorage not working
- Clear browser cache and cookies
- Check browser storage limits

## Next Steps

1. **Environment Variables**: For production, use environment variables instead of hardcoding
2. **Email Templates**: Customize verification and reset emails in Supabase Dashboard
3. **RLS Policies**: Set up Row Level Security for your tables
4. **Test Suite**: Add automated tests for authentication flows

## Support

For more details, see:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)

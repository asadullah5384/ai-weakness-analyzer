# Quick Setup - 3 Steps

## Step 1️⃣: Get Your Supabase Credentials

1. Open https://supabase.com/dashboard
2. Click on your project
3. Click **Settings** (gear icon)
4. Click **API** in the left menu
5. Copy these two values:
   - **Project URL**: `https://xyzabc.supabase.co`
   - **Anon Key**: `eyJhbGc...` (the first one under "Project API keys")

## Step 2️⃣: Update app.js

Open `frontend/app.js`

Find lines 7-8:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace with your credentials:
```javascript
const SUPABASE_URL = 'https://abc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 3️⃣: Test It!

1. Open `frontend/index.html` in your browser
2. Click **Sign Up**
3. Enter an email, password, and name
4. Click **Sign Up** button
5. ✅ Success! You should see a green message

---

## What Each Component Does

| File | What Changed |
|------|-------------|
| `index.html` | Added Supabase library, success message div |
| `app.js` | Complete auth rewrite - signup, login, logout |
| `style.css` | Added success message styling |

---

## Features Now Working

| Feature | Status |
|---------|--------|
| Signup with email/password | ✅ |
| Login to existing account | ✅ |
| Error messages | ✅ |
| Success messages | ✅ |
| Page reload prevention | ✅ |
| Session persistence | ✅ |
| Logout | ✅ |
| Form validation | ✅ |

---

## Common Issues & Fixes

**"Signup button doesn't work"**
→ Check if SUPABASE_URL and SUPABASE_ANON_KEY are filled in app.js

**"Page reloads after clicking signup"**
→ Check if `e.preventDefault()` is in the code (it should be)

**"I see 'Supabase not configured' error"**
→ Your credentials are missing or incorrect in app.js

**"Can't log back in after page reload"**
→ This is actually working - app checks for existing session!

---

## Next: Customize Further

These can be changed in `app.js`:
- Error messages (search for `showError()`)
- Success messages (search for `showSuccess()`)
- Password requirements (search for `minlength="6"`)
- Redirect delay after signup (search for `setTimeout`)

---

## Backup & Before/After

Before: Used backend API `/api/auth/signup`
After: Direct Supabase authentication in frontend

This is better because:
- Faster response
- Works offline (after initial auth)
- No backend dependency for auth
- Easier to add social login later

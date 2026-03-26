# ✅ Signup System Verification Checklist

## Pre-Testing Setup

- [ ] Read `QUICK_SETUP.md` for overview
- [ ] Have Supabase project credentials ready
- [ ] Updated `frontend/app.js` lines 7-8 with credentials
- [ ] Saved all files

---

## Core Functionality Tests

### Test 1: Signup Form Appears
- [ ] Open `frontend/index.html` in browser
- [ ] See "Welcome to StudyAssist" dialog
- [ ] See login form with email/password fields
- [ ] See "Sign Up" link at the bottom

### Test 2: Toggle to Signup Mode
- [ ] Click "Sign Up" link
- [ ] Form changes to show Name field
- [ ] Form changes to show Institute/Class dropdowns
- [ ] Button text changes to "Sign Up"
- [ ] Top text says "Create a new account"

### Test 3: Signup Button Submission
- [ ] Enter valid data:
  - Name: John Doe
  - Email: test@example.com
  - Password: password123
  - Click Level dropdown & select one
- [ ] Click "Sign Up" button
- [ ] Page DOES NOT reload ✅
- [ ] See green success message
- [ ] Message disappears after 2-3 seconds
- [ ] Redirected to dashboard automatically
- [ ] Can see input fields filled with data

### Test 4: Login with New Account
- [ ] Click Logout button (bottom of sidebar)
- [ ] See auth overlay again
- [ ] Click "Login" link
- [ ] Form shows only email/password
- [ ] Enter the email and password from Test 3
- [ ] Click "Login" button
- [ ] Page DOES NOT reload ✅
- [ ] See green success message
- [ ] Automatically redirect to dashboard

### Test 5: Page Reload Persistence
- [ ] While logged in, press F5 to reload page
- [ ] Auth overlay DOES NOT appear
- [ ] Dashboard still visible
- [ ] User info still shows
- [ ] Session is maintained ✅

### Test 6: Wrong Password Error
- [ ] Click Logout
- [ ] Click "Login"
- [ ] Enter correct email but wrong password
- [ ] Click "Login"
- [ ] See red error message
- [ ] Error message says "wrong credentials" or similar
- [ ] Can try again without page reload

### Test 7: Weak Password Error
- [ ] Click "Sign Up"
- [ ] Enter: email@new.com, pass, Name
- [ ] Click "Sign Up"
- [ ] See error about password length
- [ ] Form doesn't submit
- [ ] Can correct and try again

### Test 8: Missing Fields Error
- [ ] Click "Sign Up"
- [ ] Leave Name empty
- [ ] Try to submit
- [ ] See error message
- [ ] Form doesn't submit
- [ ] No page reload

### Test 9: Empty Email/Password
- [ ] Try login with blank email
- [ ] See error message
- [ ] Try signup with blank password
- [ ] See error message

### Test 10: Institute Selection (if available)
- [ ] In signup form, click Institute Type dropdown
- [ ] See options: School, College, University
- [ ] Select one
- [ ] Institute dropdown becomes enabled
- [ ] See institutes list
- [ ] Select an institute
- [ ] Class dropdown becomes enabled
- [ ] Continue signup

---

## Event Listener Tests

### Test 11: Form Submission
- [ ] Click form submit button
- [ ] Check browser console (F12)
- [ ] NO errors should appear
- [ ] Look for auth success/error messages in console

### Test 12: Toggle Button Multiple Times
- [ ] Click "Sign Up" link
- [ ] Click back to "Login"
- [ ] Click to "Sign Up" again
- [ ] Each time form updates correctly
- [ ] Event listeners still working

### Test 13: Logout Button
- [ ] When logged in, click "Logout" button
- [ ] Auth overlay appears immediately
- [ ] Form is reset (empty fields)
- [ ] Toggle link shows "Sign Up"
- [ ] Can attempt to logout again

---

## UI/UX Tests

### Test 14: Error Message Styling
- [ ] Generate an error (wrong password)
- [ ] Error appears in red color
- [ ] Error is readable and clear
- [ ] Error disappears if you submit again

### Test 15: Success Message Styling
- [ ] Successfully sign up or login
- [ ] Success message appears in green
- [ ] Success message is visible and clear
- [ ] Message auto-hides

### Test 16: Button States
- [ ] Click submit button
- [ ] Button becomes disabled during submission ✅
- [ ] Button text might show "..." or loading state
- [ ] Button re-enables after response

### Test 17: Form Input Clearing
- [ ] Fill signup form
- [ ] Make an error
- [ ] Click logout
- [ ] See form is empty
- [ ] Try same action again - still works

---

## Browser Developer Tools

### Test 18: Console Check
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Should see minimal to no errors
- [ ] Type: `console.log(!!supabase)` → should show `true`
- [ ] Type: `localStorage.getItem('userId')` → should show user ID after login

### Test 19: Network Requests
- [ ] Open DevTools → Network tab
- [ ] Perform signup
- [ ] Look for requests to supabase
- [ ] Should see successful responses (HTTP 200)
- [ ] NOT seeing `/api/auth/signup` (that's the old backend way)

### Test 20: Local Storage
- [ ] Open DevTools → Application tab
- [ ] View Local Storage
- [ ] After login, check for:
  - `userId` - should have UUID
  - `userEmail` - should have email
  - `userName` - should have name

---

## Email Verification Tests

### Test 21: Check Email
- [ ] After signup, you should receive an email
- [ ] Check inbox for verification link
- [ ] Click verification link
- [ ] Email should be marked as verified in Supabase

### Test 22: Resend Verification (if needed)
- [ ] In Supabase Dashboard → Auth
- [ ] Find your test user
- [ ] If not verified, resend verification email
- [ ] Verify the new link works

---

## Cross-Browser Testing (if possible)

- [ ] Test in Chrome
- [ ] Test in Firefox  
- [ ] Test in Safari
- [ ] Test in Edge

All should work the same way.

---

## Mobile Testing (if possible)

- [ ] Open in mobile browser
- [ ] Verify form is readable (responsive)
- [ ] Touch interactions work (not just click)
- [ ] No layout issues
- [ ] Messages display properly

---

## Performance Tests

### Test 23: Load Time
- [ ] Open DevTools → Performance tab
- [ ] Reload page
- [ ] Check load time (should be < 3 seconds)
- [ ] No long freeze after form submit

### Test 24: Response Time
- [ ] Submit login form
- [ ] Time how long until response (should be < 2 seconds)
- [ ] Even on slow internet

---

## Accessibility Tests

- [ ] Can tab through form fields ✅
- [ ] Error messages are announced (screen readers)
- [ ] Form labels are clear
- [ ] Click target is reasonably sized (not tiny buttons)

---

## Final Security Check

- [ ] SUPABASE_URL is filled in (not placeholder)
- [ ] SUPABASE_ANON_KEY is filled in (not placeholder)
- [ ] Credentials are from Supabase dashboard
- [ ] No passwords shown in console
- [ ] No credentials committed to git (never do this!)

---

## Completion Checklist

When ready for production:

- [ ] All tests above passed
- [ ] Code is clean and documented
- [ ] No console errors
- [ ] Error messages are helpful
- [ ] Success messages are clear
- [ ] Session persists correctly
- [ ] Logout works properly
- [ ] Nothing hardcoded except Supabase credentials
- [ ] Ready for user testing

---

## Known Limitations

⚠️ Note these for expected behavior:

- [ ] Email verification may take 1-2 minutes
- [ ] Wrong password shows generic message (for security)
- [ ] Session lasts 1 hour (configurable in Supabase)
- [ ] Multiple tabs share same session
- [ ] Clearing localStorage clears session locally

---

## Bug Report Template

If you find an issue, document:

**Title**: [What's broken]
**Steps to Reproduce**:
1. Do this
2. Then this
3. Observe this

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Browser**: Chrome, Firefox, Safari, etc.
**Error Message**: (from console if applicable)

---

## Success Criteria ✅

The signup system is working when:

1. ✅ Can create account with email/password
2. ✅ Can login with credentials  
3. ✅ Can logout
4. ✅ Session persists after page reload
5. ✅ Error messages display correctly
6. ✅ Success messages appear
7. ✅ No page reloads on form submit
8. ✅ Form prevents double submission
9. ✅ Email verification works
10. ✅ No console errors

---

**Date Tested**: _______________
**Tester Name**: _______________
**Browser/Version**: _______________
**Result**: ✅ PASSED / ❌ FAILED

---

For issues or questions, check:
- `IMPLEMENTATION_GUIDE.md` - Full reference
- `SUPABASE_SETUP.md` - Setup help
- `QUICK_SETUP.md` - Quick start
- `FIXES_SUMMARY.md` - What was fixed

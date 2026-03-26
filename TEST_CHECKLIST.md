SIGNUP & PROFILE FLOW - TEST CHECKLIST
====================================

STEP 1: SIGNUP PAGE
✓ Email field visible
✓ Password field visible
✓ Name field visible (for signup)
✓ "Sign Up" button visible
  ACTION: Click Sign Up

EXPECTED RESULT:
- Account created message appears
- After ~1 second, profile modal should appear

---

STEP 2: PROFILE MODAL - STEP 1 (of 4)
✓ Modal title: "Complete Your Profile"
✓ Step indicator shows "Step 1 of 4: Education Level"
✓ Dropdown with options:
  - School
  - College  
  - University
✓ "Continue" button visible
  ACTION: Select any level, click Continue

EXPECTED RESULT:
- Step 1 hides
- Step 2 appears

---

STEP 3: PROFILE MODAL - STEP 2 (of 4)
✓ Step indicator shows "Step 2 of 4: Institute/School"
✓ Institute dropdown populated with names like:
  * For School: "Karachi Grammar School", "Malir Public School", etc.
  * For College: "Adamjee Govt Science College", "Malir Government Science College", etc.
  * For University: "University of Karachi", "FUUAST Karachi Main Campus", "FUUAST Gulshan Campus", "FUUAST Abdul Haq Campus", etc.
✓ "Back" button visible
✓ "Continue" button visible
  ACTION: Select any institute, click Continue

EXPECTED RESULT:
- Step 2 hides
- Step 3 appears

---

STEP 4: PROFILE MODAL - STEP 3 (of 4)
✓ Step indicator shows "Step 3 of 3: Class / Year"
✓ Class dropdown populated with:
  * For School: "Class 8", "Class 9", "Class 10"
  * For College: "Pre-Engineering (11)", "Pre-Engineering (12)", "Pre-Medical (11)", "Pre-Medical (12)", "General Science (11)", "General Science (12)"
  * For University: "Semester 1", "Semester 2", ..., "Semester 8"
✓ "Back" button visible
✓ "Continue" button visible
  ACTION: Select any class/year, click Continue

EXPECTED RESULT:
- IF COLLEGE SELECTED: Step 3 hides, Step 4 appears ✓
- IF SCHOOL/UNIVERSITY: Subjects auto-load in dashboard

---

STEP 5: PROFILE MODAL - STEP 4 (of 4) - ONLY FOR COLLEGES!
✓ Step indicator shows "Step 4 of 4: Field / Stream (Optional)"
✓ Field dropdown populated based on selected class:
  * If "Pre-Engineering (11)" or "Pre-Engineering (12)" selected → Show "Pre-Engineering"
  * If "Pre-Medical (11)" or "Pre-Medical (12)" selected → Show "Pre-Medical"
  * If "General Science (11)" or "General Science (12)" selected → Show "General Science"
✓ "Back" button visible
✓ "Complete Profile" button visible
  ACTION: Select a field (optional), click Complete Profile

EXPECTED RESULT:
- "Profile completed successfully!" message appears
- Modal hides after 1.5 seconds
- Dashboard appears with subjects auto-loaded

---

STEP 6: DASHBOARD - AUTO-LOADED SUBJECTS
✓ "Your Subjects" heading visible
✓ Subject cards visible showing subjects for selected class/field
  * For Schools: Mathematics, Physics, Chemistry, Biology/Comp, English, Urdu, Islamiyat
  * For Colleges (Pre-Engineering): Mathematics, Physics, Chemistry, Mechanics, English
  * For Colleges (Pre-Medical): Mathematics, Physics, Chemistry, Biology, English
  * For Colleges (General Science): Mathematics, Physics, Chemistry, Statistics, English
  * For Universities: Programming Fundamentals, Calculus & Analyt. Geometry, Functional English, ICT, Applied Physics
✓ Marks input field in each card
  ACTION: Enter marks for subjects (0-100), click "Analyze & Save"

---

DUPLICATE CHECK
✓ In institute dropdown, verify NO DUPLICATE names appear
  * Each school name appears ONCE
  * Each college name appears ONCE
  * Each university name appears ONCE

✓ In class dropdown, verify NO DUPLICATE classes appear

✓ FUUAST should have EXACTLY 3 entries:
  * Federal Urdu University Karachi Main Campus
  * Federal Urdu University Gulshan Campus
  * Federal Urdu University Abdul Haq Campus

---

ISSUES TO REPORT IF NOT WORKING:
- If Step 4 doesn't appear for colleges
- If field dropdown is empty for colleges
- If subjects don't auto-load after profile completion
- If duplicate institute/class names appear
- If FUUAST sections missing or extra
- If wrong subjects load for the selected class

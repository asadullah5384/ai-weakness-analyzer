document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // GLOBAL STORAGE PATCH (Handle Tracking Prevention)
    // ==========================================
    // Patch localStorage globally to handle tracking prevention
    const originalStorage = window.localStorage;
    window.__appStorage ||= {};
    
    const StorageProxy = new Proxy(originalStorage, {
        get(target, prop) {
            if (prop === 'setItem') {
                return (key, val) => {
                    try { target.setItem(key, val); } catch(e) { window.__appStorage[key] = val; }
                };
            }
            if (prop === 'getItem') {
                return (key) => {
                    try { return target.getItem(key) || window.__appStorage[key] || null; } catch(e) { return window.__appStorage[key] || null; }
                };
            }
            if (prop === 'removeItem') {
                return (key) => {
                    try { target.removeItem(key); } catch(e) {}; delete window.__appStorage[key];
                };
            }
            if (prop === 'clear') {
                return () => {
                    try { target.clear(); } catch(e) {}; window.__appStorage = {};
                };
            }
            return target[prop];
        }
    });
    
    // Override window.localStorage
    Object.defineProperty(window, 'localStorage', { value: StorageProxy, writable: false });

    // Create StorageHelper alias for convenience
    const StorageHelper = {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, val) => localStorage.setItem(key, val),
        removeItem: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    };

    // ==========================================
    // SUPABASE CONFIGURATION & INITIALIZATION
    // ==========================================
    // Get Supabase URL and Key from environment or use these placeholders
    const SUPABASE_URL = 'https://tqadztsovfigraudmgkw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYWR6dHNvdmZpZ3JhdWRtZ2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzMxMTksImV4cCI6MjA4OTUwOTExOX0.G7AvX1ir1KwDaJkIQ2G6zExYFRA83owkwT0EvwKGdik'
    
    // Initialize Supabase client
    let supabase = null;
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        const { createClient } = window.supabase;
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // API Configuration
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^[\d.]+$/.test(window.location.hostname))
        ? `http://${window.location.hostname}:3000` 
        : ''; // Same domain on Vercel, paths already start with /api

    // ==========================================
    // AUTHENTICATION UI ELEMENTS (6-Step Signup)
    // ==========================================
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    const authName = document.getElementById('authName');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    
    // Phase 5 Onboarding Fields
    const authTypeSelect = document.getElementById('authTypeSelect');
    const authInstituteSelect = document.getElementById('authInstituteSelect');
    const authClassSelect = document.getElementById('authClassSelect');
    const authFieldSelect = document.getElementById('authFieldSelect');
    
    // UI Elements
    const sidebar = document.querySelector('.sidebar');
    const chatbotBtn = document.getElementById('chatbotBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // Default: Hide App UI before login
    if(sidebar) sidebar.style.display = 'none';
    if(chatbotBtn) chatbotBtn.style.display = 'none';

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if(sidebar) sidebar.classList.toggle('open');
        });
    }

    function showAppUI() {
        if(sidebar) sidebar.style.display = 'flex';
        if(chatbotBtn) chatbotBtn.style.display = 'flex';
        if(mobileMenuBtn) mobileMenuBtn.classList.remove('hidden');
        setHeaderContext();
    }

    function setHeaderContext() {
        const ctxBadge = document.getElementById('headerStudentContext');
        if (ctxBadge) {
            const pClass = localStorage.getItem('profileClass') || '';
            ctxBadge.textContent = pClass ? `👤 ${pClass}` : '';
        }
    }

    // ==========================================
    // AUTHENTICATION FUNCTIONS (6-Step Signup)
    // ==========================================
    
    function clearAuthMessages() {
        authError.classList.add('hidden');
        authSuccess.classList.add('hidden');
        authError.textContent = '';
        authSuccess.textContent = '';
    }

    function showError(message) {
        authError.textContent = message;
        authError.classList.remove('hidden');
        authSuccess.classList.add('hidden');
    }

    function showSuccess(message) {
        authSuccess.textContent = message;
        authSuccess.classList.remove('hidden');
        authError.classList.add('hidden');
    }

    // ==========================================
    // PHASE 5: DYNAMIC ONBOARDING LOGIC
    // ==========================================
    if (authTypeSelect) {
        authTypeSelect.addEventListener('change', async () => {
            const type = authTypeSelect.value;
            authInstituteSelect.innerHTML = '<option value="">Select Institute</option>';
            authInstituteSelect.disabled = !type;
            
            authClassSelect.innerHTML = '<option value="">Select Class / Semester</option>';
            authClassSelect.disabled = !type;
            
            authFieldSelect.innerHTML = '<option value="">Select Field</option>';
            authFieldSelect.classList.add('hidden');
            authFieldSelect.disabled = true;
            authFieldSelect.removeAttribute('required');

            if (type === 'School') {
                ['Class 8', 'Class 9', 'Class 10'].forEach(c => authClassSelect.appendChild(new Option(c, c)));
            } else if (type === 'College') {
                authClassSelect.appendChild(new Option('Class 11 (1st Year)', 'Class 11'));
                authClassSelect.appendChild(new Option('Class 12 (2nd Year)', 'Class 12'));
            } else if (type === 'University') {
                for(let i=1; i<=8; i++) authClassSelect.appendChild(new Option(`Semester ${i}`, `Semester ${i}`));
            }

            if (!type) return;

            try {
                const res = await fetch(`${API_BASE_URL}/api/institutes?type=${type}`);
                const institutes = await res.json();
                
                // Filter Duplicates and limit to 15
                const uniqueInstitutes = [];
                const seen = new Set();
                for (const inst of institutes) {
                    if (!seen.has(inst.name)) {
                        seen.add(inst.name);
                        uniqueInstitutes.push(inst);
                        if (uniqueInstitutes.length >= 15) break;
                    }
                }

                uniqueInstitutes.forEach(inst => {
                    const opt = document.createElement('option');
                    opt.value = inst.institute_id;
                    opt.textContent = inst.name;
                    authInstituteSelect.appendChild(opt);
                });
            } catch (e) {
                console.error("Error loading institutes:", e);
                showError("Could not load institutes.");
            }
        });
    }

    if (authClassSelect) {
        authClassSelect.addEventListener('change', () => {
            const cls = authClassSelect.value;
            authFieldSelect.innerHTML = '<option value="">Select Field</option>';
            
            if (!cls || cls === 'Class 8') {
                authFieldSelect.classList.add('hidden');
                authFieldSelect.disabled = true;
                authFieldSelect.removeAttribute('required');
                return;
            }
            
            let fields = [];
            if (['Class 8', 'Class 9', 'Class 10'].includes(cls)) {
                fields = ['Bio', 'Comp'];
            } else if (['Class 11', 'Class 12'].includes(cls)) {
                fields = ['Pre-Med', 'Pre-Eng', 'CS'];
            } else if (cls && cls.startsWith('Semester')) {
                fields = ['Software Engineering', 'Computer Science', 'BBA', 'AI', 'Cyber Security'];
            }
            
            fields.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f;
                opt.textContent = f;
                authFieldSelect.appendChild(opt);
            });
            
            authFieldSelect.classList.remove('hidden');
            authFieldSelect.disabled = false;
            authFieldSelect.setAttribute('required', 'true');
        });
    }

    let isSignupMode = true;

    async function handleSignup() {
        if (!supabase) {
            showError('Supabase not configured. Please check your credentials.');
            return;
        }

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: authEmail.value,
                password: authPassword.value,
                options: { data: { full_name: authName.value } }
            });

            if (authError) throw new Error(authError.message);
            if (!authData.user) throw new Error('Signup failed. Please try again.');

            // Save user data to localStorage
            localStorage.setItem('userId', authData.user.id);
            localStorage.setItem('userEmail', authEmail.value);
            localStorage.setItem('userName', authName.value);
            
            // Save Profile Data from Phase 5 Onboarding
            const selectedClass = authClassSelect.value;
            const selectedStream = authFieldSelect.value;
            
            let fullProfileClass = selectedClass;
            if (selectedStream && selectedStream !== "") {
                fullProfileClass = `${selectedClass} (${selectedStream})`;
            }
            
            localStorage.setItem('className', selectedClass);
            localStorage.setItem('profileField', selectedStream);
            localStorage.setItem('profileClass', fullProfileClass);

            showSuccess('✓ Account created! Redirecting to dashboard...');

            setTimeout(async () => {
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: authEmail.value,
                    password: authPassword.value
                });

                if (!loginError) {
                    authOverlay.classList.add('hidden');
                    document.getElementById('userName')?.setAttribute('value', authName.value);
                    showAppUI();
                    
                    const savedClass = localStorage.getItem('profileClass');
                    if (savedClass) loadAutoSubjects(savedClass);
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 1000);

        } catch (err) {
            console.error('Signup error:', err);
            showError(err.message || 'Signup failed. Please try again.');
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = 'Create account';
        }
    }

    async function handleLogin() {
        if (!supabase) return showError('Supabase not configured.');

        const email = document.getElementById('loginEmail').value.trim();
        const pwd = document.getElementById('loginPassword').value.trim();
        const loginBtn = document.getElementById('loginSubmitBtn');

        if (!email || !pwd) return showError('Email and password are required.');

        try {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
            if (error) throw error;

            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userEmail', data.user.email);
            
            showSuccess('Welcome back!');
            
            setTimeout(() => {
                authOverlay.classList.add('hidden');
                showAppUI();
                document.getElementById('userName')?.setAttribute('value', data.user.user_metadata?.full_name || localStorage.getItem('userName') || '');
                
                // Load subjects based on saved class
                const savedClass = localStorage.getItem('profileClass');
                if (savedClass) loadAutoSubjects(savedClass);
            }, 500);

        } catch (err) {
            console.error('Login error:', err);
            showError(err.message || 'Invalid login credentials.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Log In';
        }
    }

    // ==========================================
    // AUTHENTICATION TOGGLE & SUBMIT
    // ==========================================
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthMessages();
        
        if (isSignupMode) {
            const termsBox = document.getElementById('termsCheck');
            if (termsBox && !termsBox.checked) {
                showError('Please agree to the terms and conditions.');
                return;
            }
            await handleSignup();
        } else {
            document.getElementById('loginStep').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
    });

    // We also need to listen to the specific login button because it's inside the same form visually but triggered differently.
    document.getElementById('loginSubmitBtn').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogin();
    });

    const toggleLink = document.getElementById('toggleAuthMode');
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignupMode = !isSignupMode;
            clearAuthMessages();

            const signupStep = document.getElementById('signupStep');
            const loginStep = document.getElementById('loginStep');

            if (isSignupMode) {
                // Show signup
                signupStep.classList.remove('hidden');
                loginStep.classList.add('hidden');
                document.querySelector('.auth-header h2').textContent = 'Create an account';
                document.getElementById('toggleAuthMode').textContent = 'Log in';
                document.getElementById('toggleAuthMode').parentNode.childNodes[0].nodeValue = 'Already have an account? ';
            } else {
                // Show login
                signupStep.classList.add('hidden');
                loginStep.classList.remove('hidden');
                document.querySelector('.auth-header h2').textContent = 'Welcome Back';
                document.getElementById('toggleAuthMode').textContent = 'Sign up';
                document.getElementById('toggleAuthMode').parentNode.childNodes[0].nodeValue = "Don't have an account? ";
            }
        });
    }

    // ==========================================
    // CHECK EXISTING SESSION
    // ==========================================
    async function checkExistingSession() {
        if (!supabase) return;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session && session.user) {
                authOverlay.classList.add('hidden');
                showAppUI();
                document.getElementById('userName')?.setAttribute('value', session.user.user_metadata?.full_name || localStorage.getItem('userName') || '');
                document.getElementById('userEmail')?.setAttribute('value', session.user.email || '');
                localStorage.setItem('userId', session.user.id);
                localStorage.setItem('userEmail', session.user.email);
                
                const savedClass = localStorage.getItem('profileClass');
                if (savedClass) loadAutoSubjects(savedClass);
                else {
                    // Fallback load default subjects if old account mapping
                    loadAutoSubjects('Class 9'); 
                }
            }
        } catch (err) { console.error('Session check error:', err); }
    }

    if (supabase) checkExistingSession();
    else if (localStorage.getItem('userId')) {
        authOverlay.classList.add('hidden');
        showAppUI();
        const savedClass = localStorage.getItem('profileClass');
        if (savedClass) loadAutoSubjects(savedClass);
    }

    // LOGOUT FUNCTIONALITY
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.clear();
        window.location.reload();
    });

    // ==========================================
    // SINDH BOARD SUBJECT AUTO-LOADER
    // ==========================================
    async function loadAutoSubjects(classId) {
        const subjectsList = document.getElementById('subjectsList');
        const className = localStorage.getItem('className') || '';
        const fieldName = localStorage.getItem('profileField') || '';

        // Strict Mappings for Sindh Board based on Class & Stream with accurate Max Marks
        const sindhBoardMap = {
            'Class 8': [{name: 'English', max: 100}, {name: 'Urdu', max: 100}, {name: 'Islamiat', max: 100}, {name: 'Pakistan Studies', max: 100}, {name: 'Maths', max: 100}, {name: 'Computer', max: 100}],
            'Class 9 (Bio)': [{name: 'Biology', max: 60}, {name: 'Physics', max: 60}, {name: 'Chemistry', max: 60}, {name: 'English', max: 100}, {name: 'Islamiat', max: 75}, {name: 'Urdu', max: 75}, {name: 'Maths', max: 75}],
            'Class 9 (Comp)': [{name: 'Computer', max: 60}, {name: 'Physics', max: 60}, {name: 'Chemistry', max: 60}, {name: 'English', max: 100}, {name: 'Islamiat', max: 75}, {name: 'Urdu', max: 75}, {name: 'Maths', max: 75}],
            'Class 10 (Bio)': [{name: 'Biology', max: 60}, {name: 'Physics', max: 60}, {name: 'Chemistry', max: 60}, {name: 'English', max: 100}, {name: 'Pakistan Studies', max: 75}, {name: 'Sindhi', max: 75}, {name: 'Maths', max: 75}],
            'Class 10 (Comp)': [{name: 'Computer', max: 60}, {name: 'Physics', max: 60}, {name: 'Chemistry', max: 60}, {name: 'English', max: 100}, {name: 'Pakistan Studies', max: 75}, {name: 'Sindhi', max: 75}, {name: 'Maths', max: 75}],
            'Class 11 (Pre-Med)': [{name: 'Physics', max: 85}, {name: 'Chemistry', max: 85}, {name: 'English', max: 100}, {name: 'Islamiat', max: 50}, {name: 'Urdu', max: 100}, {name: 'Biology', max: 85}],
            'Class 11 (Pre-Eng)': [{name: 'Physics', max: 85}, {name: 'Chemistry', max: 85}, {name: 'English', max: 100}, {name: 'Islamiat', max: 50}, {name: 'Urdu', max: 100}, {name: 'Maths', max: 100}],
            'Class 11 (CS)': [{name: 'Physics', max: 85}, {name: 'Computer', max: 85}, {name: 'English', max: 100}, {name: 'Islamiat', max: 50}, {name: 'Urdu', max: 100}, {name: 'Maths', max: 100}],
            'Class 12 (Pre-Med)': [{name: 'Physics', max: 85}, {name: 'Chemistry', max: 85}, {name: 'English', max: 100}, {name: 'Pakistan Studies', max: 50}, {name: 'Urdu', max: 100}, {name: 'Biology', max: 85}],
            'Class 12 (Pre-Eng)': [{name: 'Physics', max: 85}, {name: 'Chemistry', max: 85}, {name: 'English', max: 100}, {name: 'Pakistan Studies', max: 50}, {name: 'Urdu', max: 100}, {name: 'Maths', max: 100}],
            'Class 12 (CS)': [{name: 'Physics', max: 85}, {name: 'Computer', max: 85}, {name: 'English', max: 100}, {name: 'Pakistan Studies', max: 50}, {name: 'Urdu', max: 100}, {name: 'Maths', max: 100}]
        };

        const lookupKey = localStorage.getItem('profileClass');
        let subjects = sindhBoardMap[lookupKey] || [{name: 'English', max: 100}, {name: 'Math', max: 100}, {name: 'Science', max: 100}];
        
        subjectsList.innerHTML = '';
        subjectCount = 0;
        
        const heading = document.createElement('h3');
        heading.style.marginTop = '1.5rem';
        heading.style.marginBottom = '1rem';
        heading.innerHTML = '<i class="fa-solid fa-book"></i> Your Subjects';
        subjectsList.appendChild(heading);
        
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
        grid.style.gap = '1rem';
        grid.style.marginBottom = '1.5rem';
        
        subjects.forEach(subject => {
            const card = document.createElement('div');
            // Remove manual close functionality
            card.className = 'subject-card';
            card.style.background = 'var(--card-bg)';
            card.style.border = '1px solid var(--border)';
            card.style.borderRadius = '12px';
            card.style.padding = '1.2rem';
            card.style.transition = '0.3s';
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-book-open" style="color: var(--accent); font-size: 1.2rem;"></i>
                        <h4 style="margin: 0; font-size: 1.1rem; color: #fff;">${subject.name}</h4>
                    </div>
                    <span style="font-size: 0.8rem; background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 12px; color: var(--text-muted);">/${subject.max} Marks</span>
                </div>
                <input type="number" 
                       class="input-field subj-auto-marks" 
                       data-subject="${subject.name}" 
                       data-max="${subject.max}"
                       placeholder="Enter marks 0-${subject.max}" 
                       min="0" max="${subject.max}"
                       style="margin: 0; width: 100%; border: 1px solid rgba(255,255,255,0.1);">
            `;
            grid.appendChild(card);
        });
        
        subjectsList.appendChild(grid);
        
        // Hide add subject button completely
        const addSubjBtn = document.getElementById('addSubjectBtn');
        if (addSubjBtn) addSubjBtn.style.display = 'none';
        const addSubjSection = document.getElementById('subjectInputs');
        if (addSubjSection) addSubjSection.style.display = 'none';
    }

    // ==========================================
    // SELECTION LOGIC (DASHBOARD) - REMOVED
    // ==========================================
    // The Dashboard selection dropdown logic was purged as it was consolidated into the Signup Onboarding Flow (Phase 5).
    // 1. Navigation Logic
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            
            views.forEach(view => {
                view.classList.remove('active-view');
                view.classList.add('hidden-view');
            });
            const targetView = document.getElementById(targetId);
            targetView.classList.remove('hidden-view');
            targetView.classList.add('active-view');

            if(targetId === 'analytics-view'){
                loadAnalytics();
            }
        });
    });

    // 2. Dashboard / Analysis Logic
    const recordYearSelect = document.getElementById('recordYear');
    if (recordYearSelect) {
        const currentYear = new Date().getFullYear();
        for (let y = 2000; y <= 2050; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            recordYearSelect.appendChild(opt);
        }
    }

    const recordMonthSelect = document.getElementById('recordMonth');
    if (recordMonthSelect) {
        recordMonthSelect.addEventListener('change', () => {
             document.querySelectorAll('.subj-marks, .subj-auto-marks').forEach(inp => inp.value = '');
        });
    }

    let subjectCount = 0;
    const subjectsList = document.getElementById('subjectsList');
    addSubjectRow();
    document.getElementById('addSubjectBtn').addEventListener('click', () => addSubjectRow());
    
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const userName = StorageHelper.getItem('userName') || 'Student';
        const userEmail = StorageHelper.getItem('userEmail') || '';
        const recordMonth = document.getElementById('recordMonth') ? document.getElementById('recordMonth').value : 'March';
        const recordYear = document.getElementById('recordYear') ? parseInt(document.getElementById('recordYear').value) : 2026;
        
        if (userEmail) StorageHelper.setItem('userEmail', userEmail); // save for analytics

        const subjects = [];
        let isValid = true;
        
        // Collect from manual subject rows (if any)
        const rows = document.querySelectorAll('.subject-row');
        rows.forEach(row => {
            const name = row.querySelector('.subj-name').value.trim();
            const marks = parseInt(row.querySelector('.subj-marks').value.trim(), 10);
            if (!name || isNaN(marks) || marks < 0 || marks > 100) isValid = false;
            else subjects.push({ name, marks, max_marks: 100 });
        });
        
        // Collect from auto-loaded subject cards (from profile selection)
        const cards = document.querySelectorAll('.subj-auto-marks');
        cards.forEach(input => {
            const name = input.getAttribute('data-subject');
            const max = parseInt(input.getAttribute('data-max') || '100', 10);
            const marks = parseInt(input.value.trim(), 10);
            if (name && !isNaN(marks) && marks >= 0 && marks <= max) {
                subjects.push({ name, marks, max_marks: max });
            } else if (name && input.value.trim()) {
                isValid = false; // Invalid marks entered
            }
        });

        if (!isValid || subjects.length === 0) return alert('Please enter valid data.');

        document.getElementById('analyzeBtn').disabled = true;
        document.getElementById('loadingIndicator').classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_name: userName, 
                    user_email: userEmail, 
                    record_month: recordMonth,
                    record_year: recordYear,
                    subjects 
                })
            });
            const data = await response.json();
            if(data.user_id) StorageHelper.setItem('userId', data.user_id); // Save for analytics
            displayResults(data);
        } catch (error) {
            console.error("Fetch error details:", error);
            alert(`Error: Backend is unreachable. Check if the server is running on ${API_BASE_URL || window.location.origin} and CORS is allowed.`);
        } finally {
            document.getElementById('analyzeBtn').disabled = false;
            document.getElementById('loadingIndicator').classList.add('hidden');
        }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('inputSection').classList.remove('hidden');
        ['strongCol', 'averageCol', 'weakCol'].forEach(col => {
            document.getElementById(col).querySelector('.subject-items').innerHTML = '';
        });
    });

    function addSubjectRow(name = '') {
        subjectCount++;
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.innerHTML = `
            <input type="text" placeholder="Subject (e.g., Math)" class="input-field subj-name" value="${name}">
            <input type="number" placeholder="Marks (0-100)" class="input-field subj-marks" min="0" max="100">
            <button class="remove-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
        `;
        row.querySelector('.remove-btn').addEventListener('click', () => {
            if (document.querySelectorAll('.subject-row').length > 1) row.remove();
        });
        subjectsList.appendChild(row);
    }

    function displayResults(data) {
        document.getElementById('inputSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');
        
        document.getElementById('overallPercentageValue').textContent = Math.round(data.overall_percentage);
        document.getElementById('totalMarksValue').textContent = data.total_marks;
        document.getElementById('totalMaxMarksValue').textContent = data.total_max_marks;

        // Goals Widget
        const target = 90;
        const diff = (data.total_max_marks * target / 100) - data.total_marks;
        const goalText = document.getElementById('goalText');
        if (diff > 0) goalText.innerHTML = `You need <span style="color:var(--warning);font-weight:bold;">+${Math.ceil(diff)} marks</span> to reach your 90% goal!`;
        else goalText.innerHTML = `Amazing! You've achieved your goal of 90%+!`;

        // Clear cols
        const cols = {
            'Strong': document.getElementById('strongCol').querySelector('.subject-items'),
            'Average': document.getElementById('averageCol').querySelector('.subject-items'),
            'Weak': document.getElementById('weakCol').querySelector('.subject-items')
        };
        Object.values(cols).forEach(c => c.innerHTML = '');
        
        data.results.forEach(res => {
            const tag = document.createElement('div');
            tag.className = 'subject-tag';
            let inner = `<span>${res.name}</span> <strong>${res.marks}</strong>`;
            if (res.category === 'Weak') {
                inner += `<button class="btn btn-secondary why-weak-btn" data-subject="${res.name}">Why?</button>`;
            }
            tag.innerHTML = inner;
            cols[res.category].appendChild(tag);
        });

        // Add listeners for "Why?" buttons
        document.querySelectorAll('.why-weak-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const subName = btn.getAttribute('data-subject');
                const userId = StorageHelper.getItem('userId');
                btn.disabled = true;
                btn.textContent = '...';
                try {
                    const res = await fetch(`${API_BASE_URL}/api/analyze/why-weak?user_id=${userId}&subject_name=${subName}`);
                    const whyData = await res.json();
                    alert(`AI Analysis for ${subName}:\n\n${whyData.analysis}`);
                } catch(e) { console.error(e); }
                finally { btn.disabled = false; btn.textContent = 'Why?'; }
            });
        });

        // AI Summary Parsing
        let feedback = data.ai_feedback || "Analyzing feedback...";
        const summaryMatch = feedback.match(/AI Summary:\s*(.*?)(?=\n|$)/i);
        if (summaryMatch) {
            document.getElementById('aiSummary').classList.remove('hidden');
            document.getElementById('aiSummaryText').textContent = summaryMatch[1];
            feedback = feedback.replace(/AI Summary:.*?\n/i, '').trim();
        } else {
            document.getElementById('aiSummary').classList.add('hidden');
        }
        
        function formatAiText(text) {
            const urlRegex = /(https?:\/\/[^\s()]+)/g;
            let formatted = text.replace(urlRegex, `<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline; word-break: break-all;">Link <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i></a>`);
            return formatted;
        }
        
        document.getElementById('aiFeedbackContent').innerHTML = formatAiText(feedback);
    }

    // 3. Analytics Logic
    let myChart = null;
    let globalPerformanceData = [];

    async function loadAnalytics() {
        const userId = localStorage.getItem('userId');
        if(!userId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/history/${userId}`);
            const data = await response.json();
            if(data.performance && data.performance.length > 0) {
                globalPerformanceData = data.performance;
                
                // Keep the filter selection in sync if they previously selected it
                const filterVal = document.getElementById('analyticsMonthFilter') ? document.getElementById('analyticsMonthFilter').value : 'Overall';
                let dataToRender = globalPerformanceData;
                if (filterVal !== 'Overall') {
                    dataToRender = globalPerformanceData.filter(r => r.record_month === filterVal);
                }
                
                if (dataToRender.length > 0) renderAnalytics(dataToRender);
            }
        } catch(e) { console.error(e); }
    }

    const analyticsMonthFilter = document.getElementById('analyticsMonthFilter');
    if (analyticsMonthFilter) {
        analyticsMonthFilter.addEventListener('change', () => {
            if (!globalPerformanceData.length) return;
            const selectedMonth = analyticsMonthFilter.value;
            let filteredData = globalPerformanceData;
            
            if (selectedMonth !== 'Overall') {
                filteredData = globalPerformanceData.filter(r => r.record_month === selectedMonth);
            }
            
            if (filteredData.length > 0) {
                renderAnalytics(filteredData);
            } else {
                if (myChart) myChart.destroy();
                document.getElementById('compareStats').innerHTML = `<p>No records found for ${selectedMonth}.</p>`;
            }
        });
    }

    function renderAnalytics(performanceRecords) {
        // Simplify to just show latest marks for each subject in a Bar chart
        const latestMarks = {};
        performanceRecords.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).forEach(r => {
            if(r.subjects) latestMarks[r.subjects.name] = r.marks;
        });

        const subjects = Object.keys(latestMarks);
        const marks = Object.values(latestMarks);
        
        // Green > 75, Yellow > 50, Red < 50
        const bgColors = marks.map(m => m >= 75 ? '#22c55e' : (m >= 50 ? '#eab308' : '#ef4444'));

        const ctx = document.getElementById('performanceChart').getContext('2d');
        if(myChart) myChart.destroy();
        
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Current performance (%)',
                    data: marks,
                    backgroundColor: bgColors,
                    borderRadius: 8
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { 
                    y: { beginAtZero: true, max: 100, ticks: {color: '#f1f5f9'} }, 
                    x: { ticks: {color: '#f1f5f9'} } 
                }, 
                plugins: { 
                    legend: { display: false } 
                } 
            }
        });

        document.getElementById('compareStats').innerHTML = `<p>Here are your latest marks for the selected period!</p><p><span style="color:#22c55e">Green = Strong</span> | <span style="color:#eab308">Yellow = Average</span> | <span style="color:#ef4444">Red = Weak</span></p>`;
    }

    // 4. Countdown Timer & Goals Logic (Phase 4)
    let timerInterval = null;
    let baseTime = 25 * 60;
    let timeLeft = baseTime;
    let isRunning = false;
    let focusMins = 0;
    let sessions = 0;

    const display = document.getElementById('timerDisplay');
    const status = document.getElementById('timerStatus');
    const btnStart = document.getElementById('startTimerBtn');
    const btnPause = document.getElementById('pauseTimerBtn');
    const btnReset = document.getElementById('resetTimerBtn');
    const customTimerInput = document.getElementById('customTimerInput');
    const setTimerBtn = document.getElementById('setTimerBtn');

    function updateDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
    }

    async function saveStudySession(duration) {
        const userId = localStorage.getItem('userId');
        if(!userId) return;
        try {
            await fetch(`${API_BASE_URL}/api/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, duration_minutes: duration })
            });
        } catch(e) { console.error(e); }
    }

    function toggleTimer() {
        if (!isRunning) {
            isRunning = true;
            status.textContent = "Focusing... No Distractions!";
            btnStart.classList.add('hidden');
            btnPause.classList.remove('hidden');
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    sessions++;
                    saveStudySession(Math.floor(baseTime / 60)); 
                    alert("Focus session completed! Great work.");
                    setTimer(5, "Break Time!");
                }
            }, 1000);
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            status.textContent = "Paused";
            btnStart.classList.remove('hidden');
            btnPause.classList.add('hidden');
        }
    }

    function setTimer(minutes, textStatus) {
        clearInterval(timerInterval);
        isRunning = false;
        baseTime = minutes * 60;
        timeLeft = baseTime;
        status.textContent = textStatus;
        btnStart.classList.remove('hidden');
        btnPause.classList.add('hidden');
        updateDisplay();
    }

    btnStart.addEventListener('click', toggleTimer);
    btnPause.addEventListener('click', toggleTimer);
    btnReset.addEventListener('click', () => {
        let currentMins = parseInt(customTimerInput.value) || 25;
        setTimer(currentMins, "Ready to Focus");
    });
    
    if (customTimerInput) {
        customTimerInput.addEventListener('change', () => {
             if (isRunning) return;
             let mins = parseInt(customTimerInput.value) || 25;
             if (mins > 0) setTimer(mins, `Set for ${mins} mins`);
        });
    }
    
    if (setTimerBtn && customTimerInput) {
        setTimerBtn.addEventListener('click', () => {
             let mins = parseInt(customTimerInput.value) || 25;
             if (mins > 0) setTimer(mins, `Set for ${mins} mins`);
        });
    }

    // Goals Management
    const goalsList = document.getElementById('goalsList');
    const newGoalInput = document.getElementById('newGoalInput');
    const addGoalBtn = document.getElementById('addGoalBtn');

    async function loadGoals() {
        const userId = localStorage.getItem('userId');
        if(!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/goals/${userId}`);
            const data = await res.json();
            if (!res.ok) {
                console.error("Goals Fetch Error:", data.detail || "Server failed");
                return;
            }
            goalsList.innerHTML = '';
            if (Array.isArray(data)) {
                data.forEach(goal => renderGoal(goal));
            }
        } catch(e) { console.error(e); }
    }

    function renderGoal(goal) {
        const li = document.createElement('li');
        li.className = 'goal-item';
        li.dataset.id = goal.goal_id;
        li.style.display = 'list-item'; // maintain default numbering
        
        const contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'inline-flex';
        contentWrapper.style.justifyContent = 'space-between';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.width = 'calc(100% - 10px)';
        
        contentWrapper.innerHTML = `
            <span class="goal-text" style="flex:1; word-break: break-all;">${goal.goal_text}</span>
            <div style="display: flex; gap: 0.8rem; padding-left: 1rem;">
                <button class="edit-goal-btn" title="Edit" style="background:none; border:none; color: var(--warning); cursor:pointer; font-size: 0.9rem;"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-goal-btn" title="Delete" style="background:none; border:none; color: var(--danger); cursor:pointer; font-size: 0.9rem;"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
        li.appendChild(contentWrapper);
        goalsList.appendChild(li);

        // Delete Logic
        const delBtn = li.querySelector('.delete-goal-btn');
        delBtn.addEventListener('click', async () => {
            delBtn.disabled = true;
            try {
                await fetch(`${API_BASE_URL}/api/goals/${goal.goal_id}`, { method: 'DELETE' });
                li.remove(); // The <ol> numbering will automatically update
            } catch (e) {
                console.error(e);
                delBtn.disabled = false;
            }
        });

        // Update Logic
        const editBtn = li.querySelector('.edit-goal-btn');
        const textSpan = li.querySelector('.goal-text');
        editBtn.addEventListener('click', async () => {
            const currentText = textSpan.textContent;
            const newText = prompt("Edit your goal:", currentText);
            if (newText && newText.trim() !== "" && newText !== currentText) {
                editBtn.disabled = true;
                try {
                    const res = await fetch(`${API_BASE_URL}/api/goals/${goal.goal_id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ goal_text: newText.trim() })
                    });
                    const updatedData = await res.json();
                    if (!res.ok) throw new Error(updatedData.detail || "Goal update failed");
                    textSpan.textContent = updatedData.goal_text;
                } catch (e) {
                    alert("Unable to update goal. Error: " + e.message);
                    console.error(e);
                } finally {
                    editBtn.disabled = false;
                }
            }
        });
    }

    addGoalBtn.addEventListener('click', async () => {
        const text = newGoalInput.value.trim();
        const userId = localStorage.getItem('userId');
        if (!text || !userId) return;

        addGoalBtn.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/api/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, goal_text: text })
            });
            const newData = await res.json();
            if(!res.ok) {
                alert("Failed to create goal in database! Did you run the SQL migration? Error: " + (newData.detail || "Unknown"));
                throw new Error(newData.detail);
            }
            renderGoal(newData);
            newGoalInput.value = '';
        } catch(e) { console.error(e); }
        finally { addGoalBtn.disabled = false; }
    });

    // ==========================================
    // AI CHATBOT FUNCTIONS
    // ==========================================
    
    // chatbotBtn is declared globally at the top
    const chatbotModal = document.getElementById('chatbotModal');
    const closeChatbot = document.getElementById('closeChatbot');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');

    // Chatbot event listeners
    chatbotBtn.addEventListener('click', () => {
        chatbotModal.classList.remove('hidden');
        chatInput.focus();
    });

    closeChatbot.addEventListener('click', () => {
        chatbotModal.classList.add('hidden');
    });

    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    async function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Disable send button while processing
        sendChatBtn.disabled = true;
        sendChatBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            // Send to AI API
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    user_id: localStorage.getItem('userId') || 'anonymous',
                    context: {
                        level: localStorage.getItem('profileLevel'),
                        institute: localStorage.getItem('profileInstitute'),
                        class: localStorage.getItem('profileClass'),
                        field: localStorage.getItem('profileField')
                    }
                })
            });

            const data = await response.json();
            addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Chat error:', error);
            addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'bot');
        } finally {
            // Re-enable send button
            sendChatBtn.disabled = false;
            sendChatBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        }
    }

    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = type === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        function formatAiChat(text) {
            const urlRegex = /(https?:\/\/[^\s()]+)/g;
            let formatted = text.replace(urlRegex, `<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #fff; text-decoration: underline; word-break: break-all;">Link <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem;"></i></a>`);
            return formatted.replace(/\n/g, '<br>');
        }
        
        contentDiv.innerHTML = formatAiChat(content);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Logout Logic
    document.getElementById('logoutBtn').addEventListener('click', () => {
        StorageHelper.clear = () => {
            try { localStorage.clear(); } catch(e) { window.__appStorage = {}; }
        };
        StorageHelper.clear();
        location.reload();
    });

    // Fallback logic for Local Storage Sessions
    if (StorageHelper.getItem('userId')) {
        authOverlay.classList.add('hidden');
        showAppUI();
        document.getElementById('userName')?.setAttribute('value', StorageHelper.getItem('userName') || '');
        document.getElementById('userEmail')?.setAttribute('value', localStorage.getItem('userEmail') || '');
        const savedClass = localStorage.getItem('profileClass');
        if (savedClass) loadAutoSubjects(savedClass);
        if (typeof loadGoals === 'function') loadGoals();
    }
});

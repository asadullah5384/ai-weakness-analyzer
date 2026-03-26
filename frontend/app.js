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
    const authLevel = document.getElementById('authLevel');
    const authInstitute = document.getElementById('authInstitute');
    const authClass = document.getElementById('authClass');
    const authField = document.getElementById('authField');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');

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

    // 6-Step Navigation
    window.nextAuthStep = async function(currentStep) {
        clearAuthMessages();

        if (currentStep === 1) {
            if (!authName.value.trim()) {
                showError('Please enter your name');
                return;
            }
            document.getElementById('authStep1').classList.add('hidden');
            document.getElementById('authStep2').classList.remove('hidden');
        } else if (currentStep === 2) {
            if (!authLevel.value) {
                showError('Please select your grade level');
                return;
            }
            await loadAuthInstitutes();
            document.getElementById('authStep2').classList.add('hidden');
            document.getElementById('authStep3').classList.remove('hidden');
        } else if (currentStep === 3) {
            if (!authInstitute.value) {
                showError('Please select your institute');
                return;
            }
            await loadAuthClasses();
            document.getElementById('authStep3').classList.add('hidden');
            document.getElementById('authStep4').classList.remove('hidden');
        } else if (currentStep === 4) {
            if (!authClass.value) {
                showError('Please select your class/year');
                return;
            }
            if (authLevel.value === 'College' || authLevel.value === 'University') {
                loadAuthFields();
                document.getElementById('authStep4').classList.add('hidden');
                document.getElementById('authStep5').classList.remove('hidden');
            } else {
                document.getElementById('authStep4').classList.add('hidden');
                document.getElementById('authStep6').classList.remove('hidden');
            }
        } else if (currentStep === 5) {
            if (!authField.value) {
                showError('Please select your field');
                return;
            }
            document.getElementById('authStep5').classList.add('hidden');
            document.getElementById('authStep6').classList.remove('hidden');
        }
    };

    window.prevAuthStep = function(currentStep) {
        clearAuthMessages();

        if (currentStep === 2) {
            document.getElementById('authStep2').classList.add('hidden');
            document.getElementById('authStep1').classList.remove('hidden');
        } else if (currentStep === 3) {
            document.getElementById('authStep3').classList.add('hidden');
            document.getElementById('authStep2').classList.remove('hidden');
        } else if (currentStep === 4) {
            document.getElementById('authStep4').classList.add('hidden');
            document.getElementById('authStep3').classList.remove('hidden');
        } else if (currentStep === 5) {
            document.getElementById('authStep5').classList.add('hidden');
            document.getElementById('authStep4').classList.remove('hidden');
        } else if (currentStep === 6) {
            if (authLevel.value === 'College' || authLevel.value === 'University') {
                document.getElementById('authStep6').classList.add('hidden');
                document.getElementById('authStep5').classList.remove('hidden');
            } else {
                document.getElementById('authStep6').classList.add('hidden');
                document.getElementById('authStep4').classList.remove('hidden');
            }
        }
    };

    // Load institutes for signup
    async function loadAuthInstitutes() {
        const level = authLevel.value;
        authInstitute.innerHTML = '<option value="">Loading...</option>';

        try {
            const res = await fetch(`${API_BASE_URL}/api/institutes?type=${level}`);
            const institutes = await res.json();
            authInstitute.innerHTML = '<option value="">Select your institute</option>';
            institutes.slice(0, 10).forEach(inst => { // Show only 8-10 institutes
                const opt = document.createElement('option');
                opt.value = inst.institute_id;
                opt.textContent = inst.name;
                authInstitute.appendChild(opt);
            });
            authInstitute.disabled = false;
        } catch (e) {
            console.error("Error loading institutes:", e);
            showError('Error loading institutes. Please try again.');
        }
    }

    // Load classes for signup
    async function loadAuthClasses() {
        const instId = authInstitute.value;
        authClass.innerHTML = '<option value="">Loading...</option>';

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${instId}`);
            const classes = await res.json();
            authClass.innerHTML = '<option value="">Select your class/year</option>';
            classes.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls.class_id;
                opt.textContent = cls.name;
                authClass.appendChild(opt);
            });
            authClass.disabled = false;
        } catch (e) {
            console.error("Error loading classes:", e);
            showError('Error loading classes. Please try again.');
        }
    }

    // Load fields for signup (College/University only)
    function loadAuthFields() {
        const className = authClass.options[authClass.selectedIndex].text;
        const fieldsMap = {
            'Pre-Engineering (11)': ['Pre-Engineering'],
            'Pre-Engineering (12)': ['Pre-Engineering'],
            'Pre-Medical (11)': ['Pre-Medical'],
            'Pre-Medical (12)': ['Pre-Medical'],
            'General Science (11)': ['General Science'],
            'General Science (12)': ['General Science'],
            'Undergraduate': ['Computer Science', 'BBA', 'Engineering', 'Medical', 'Arts']
        };

        const fields = fieldsMap[className] || [];
        authField.innerHTML = '<option value="">Select your field</option>';

        fields.forEach(field => {
            const opt = document.createElement('option');
            opt.value = field;
            opt.textContent = field;
            authField.appendChild(opt);
        });

        authField.disabled = fields.length === 0;
    }

    async function handleSignup() {
        if (!supabase) {
            showError('Supabase not configured. Please check your credentials.');
            return;
        }

        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: authEmail.value,
                password: authPassword.value,
                options: {
                    data: {
                        full_name: authName.value
                    }
                }
            });

            if (authError) throw new Error(authError.message);

            if (!authData.user) {
                throw new Error('Signup failed. Please try again.');
            }

            // Save user data to localStorage
            localStorage.setItem('userId', authData.user.id);
            localStorage.setItem('userEmail', authEmail.value);
            if (authName.value) localStorage.setItem('userName', authName.value);
            localStorage.setItem('profileLevel', authLevel.value);
            localStorage.setItem('profileInstitute', authInstitute.value);
            localStorage.setItem('profileClass', authClass.value);
            localStorage.setItem('className', authClass.options[authClass.selectedIndex].text);
            if (authField.value) localStorage.setItem('profileField', authField.value);

            showSuccess('✓ Account created! Redirecting to dashboard...');

            // Auto-login and redirect
            setTimeout(async () => {
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: authEmail.value,
                    password: authPassword.value
                });

                if (!loginError && loginData.user) {
                    authOverlay.classList.add('hidden');
                    initSelectionData();
                    // Auto-load subjects
                    await loadAutoSubjects(authClass.value);
                    document.getElementById('inputSection').classList.remove('hidden');
                    document.getElementById('dashboard-view').scrollIntoView({ behavior: 'smooth' });
                }
            }, 1500);

        } catch (err) {
            console.error('Signup error:', err);
            showError(err.message || 'Signup failed. Please try again.');
        }
    }

    // ==========================================
    // AUTH FORM SUBMISSION
    // ==========================================
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload
        
        clearAuthMessages();
        authSubmitBtn.disabled = true;

        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();
        const name = document.getElementById('authName').value.trim();
        const instId = document.getElementById('authInstituteSelect').value;
        const classId = document.getElementById('authClassSelect').value;

        // Validate inputs
        if (!email || !password) {
            showError('Email and password are required.');
            authSubmitBtn.disabled = false;
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            authSubmitBtn.disabled = false;
            return;
        }

        if (isSignupMode) {
            if (!name) {
                showError('Name is required for signup.');
                authSubmitBtn.disabled = false;
                return;
            }
            await handleSignup(email, password, name, instId, classId);
        } else {
            await handleLogin(email, password);
        }

        authSubmitBtn.disabled = false;
    });

    // ==========================================
    // AUTH MODE TOGGLE (Login/Signup)
    // ==========================================
    function attachToggleListener() {
        const toggleLink = document.getElementById('toggleAuthMode');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                isSignupMode = !isSignupMode;
                clearAuthMessages();

                // Update UI
                signupOnlyFields.classList.toggle('hidden');
                authSubtitle.textContent = isSignupMode ? 'Create a new account' : 'Please login to continue';
                authSubmitBtn.textContent = isSignupMode ? 'Sign Up' : 'Login';
                
                document.getElementById('toggleAuthText').innerHTML = isSignupMode 
                    ? `Already have an account? <a href="#" id="toggleAuthMode">Login</a>`
                    : `Don't have an account? <a href="#" id="toggleAuthMode">Sign Up</a>`;

                if (isSignupMode) {
                    initAuthSelectionData();
                }

                // Re-attach listener to new toggle link
                attachToggleListener();
            });
        }
    }

    attachToggleListener();

    // ==========================================
    // CHECK EXISTING SESSION
    // ==========================================
    async function checkExistingSession() {
        if (!supabase) return;
        
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session && session.user) {
                // User is already logged in
                authOverlay.classList.add('hidden');
                document.getElementById('userName').value = session.user.user_metadata?.full_name || localStorage.getItem('userName') || '';
                document.getElementById('userEmail').value = session.user.email || '';
                localStorage.setItem('userId', session.user.id);
                localStorage.setItem('userEmail', session.user.email);
                initSelectionData(); // Initialize Phase 2 data
            }
        } catch (err) {
            console.error('Session check error:', err);
        }
    }

    // Check for existing session on page load
    if (supabase) {
        checkExistingSession();
    } else {
        // Fallback: check localStorage if Supabase not configured
        if (localStorage.getItem('userId')) {
            authOverlay.classList.add('hidden');
            document.getElementById('userName').value = localStorage.getItem('userName') || '';
            document.getElementById('userEmail').value = localStorage.getItem('userEmail') || '';
            initSelectionData();
        }
    }

    // ==========================================
    // LOGOUT FUNCTIONALITY
    // ==========================================
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (supabase) {
            const { error } = await supabase.auth.signOut();
            if (error) console.error('Logout error:', error);
        }
        
        // Clear localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('classId');

        // Reset form
        authForm.reset();
        clearAuthMessages();
        isSignupMode = false;
        signupOnlyFields.classList.add('hidden');
        authSubtitle.textContent = 'Please login to continue';
        authSubmitBtn.textContent = 'Login';
        document.getElementById('toggleAuthText').innerHTML = `Don't have an account? <a href="#" id="toggleAuthMode">Sign Up</a>`;
        attachToggleListener();

        // Show auth overlay
        authOverlay.classList.remove('hidden');
    });

    // ==========================================
    // PROFILE CREATION FORM LOGIC (NYA)
    // ==========================================
    // PROFILE MODAL LOGIC
    // ==========================================
    // Profile Modal Elements
    const profileModal = document.getElementById('profileModal');
    const profileForm = document.getElementById('profileForm');
    const profileLevel = document.getElementById('profileLevel');
    const profileInstitute = document.getElementById('profileInstitute');
    const profileClass = document.getElementById('profileClass');
    const profileField = document.getElementById('profileField');
    const profileError = document.getElementById('profileError');
    const profileSuccess = document.getElementById('profileSuccess');

    // Step navigation functions
    window.nextStep = async function(currentStep) {
        if (currentStep === 1) {
            if (!profileLevel.value) {
                profileError.textContent = 'Please select your education level';
                profileError.classList.remove('hidden');
                return;
            }
            profileError.classList.add('hidden');
            
            // Populate institutes
            await loadProfileInstitutes();
            document.getElementById('step1').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
        } else if (currentStep === 2) {
            if (!profileInstitute.value) {
                profileError.textContent = 'Please select your institute';
                profileError.classList.remove('hidden');
                return;
            }
            profileError.classList.add('hidden');
            
            // Populate classes
            await loadProfileClasses();
            document.getElementById('step2').classList.add('hidden');
            document.getElementById('step3').classList.remove('hidden');
        } else if (currentStep === 3) {
            if (!profileClass.value) {
                profileError.textContent = 'Please select your class/year';
                profileError.classList.remove('hidden');
                return;
            }
            profileError.classList.add('hidden');
            
            // If college, show field selection step
            if (profileLevel.value === 'College') {
                loadProfileFields();
                document.getElementById('step3').classList.add('hidden');
                document.getElementById('step4').classList.remove('hidden');
            } else {
                // For school and university, skip field step and submit
                profileForm.dispatchEvent(new Event('submit'));
            }
        }
    };

    window.prevStep = function(currentStep) {
        if (currentStep === 2) {
            document.getElementById('step2').classList.add('hidden');
            document.getElementById('step1').classList.remove('hidden');
        } else if (currentStep === 3) {
            document.getElementById('step3').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
        } else if (currentStep === 4) {
            document.getElementById('step4').classList.add('hidden');
            document.getElementById('step3').classList.remove('hidden');
        }
        profileError.classList.add('hidden');
    };

    // Load institutes based on level
    async function loadProfileInstitutes() {
        const level = profileLevel.value;
        profileInstitute.innerHTML = '<option value="">Loading...</option>';
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/institutes?type=${level}`);
            const institutes = await res.json();
            profileInstitute.innerHTML = '<option value="">Select Your Institute</option>';
            institutes.forEach(inst => {
                const opt = document.createElement('option');
                opt.value = inst.institute_id;
                opt.textContent = inst.name;
                profileInstitute.appendChild(opt);
            });
            profileInstitute.disabled = false;
        } catch (e) {
            console.error("Error loading institutes:", e);
            profileError.textContent = 'Error loading institutes. Please try again.';
            profileError.classList.remove('hidden');
        }
    }

    // Load classes based on institute
    async function loadProfileClasses() {
        const instId = profileInstitute.value;
        profileClass.innerHTML = '<option value="">Loading...</option>';
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${instId}`);
            const classes = await res.json();
            profileClass.innerHTML = '<option value="">Select Your Class/Year</option>';
            classes.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls.class_id;
                opt.textContent = cls.name;
                profileClass.appendChild(opt);
            });
            profileClass.disabled = false;
        } catch (e) {
            console.error("Error loading classes:", e);
            profileError.textContent = 'Error loading classes. Please try again.';
            profileError.classList.remove('hidden');
        }
    }

    // Load fields based on class (for colleges only)
    function loadProfileFields() {
        const className = profileClass.options[profileClass.selectedIndex].text;
        const fieldsMap = {
            'Pre-Engineering (11)': ['Pre-Engineering'],
            'Pre-Engineering (12)': ['Pre-Engineering'],
            'Pre-Medical (11)': ['Pre-Medical'],
            'Pre-Medical (12)': ['Pre-Medical'],
            'General Science (11)': ['General Science'],
            'General Science (12)': ['General Science']
        };
        
        const fields = fieldsMap[className] || [];
        profileField.innerHTML = '<option value="">Select Your Field (Optional)</option>';
        
        fields.forEach(field => {
            const opt = document.createElement('option');
            opt.value = field;
            opt.textContent = field;
            profileField.appendChild(opt);
        });
        
        profileField.disabled = fields.length === 0;
    }

    // Handle profile form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!profileClass.value) {
            profileError.textContent = 'Please select your class/year';
            profileError.classList.remove('hidden');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const userName = document.getElementById('userName').value;
            const userEmail = localStorage.getItem('userEmail');
            
            // Save profile to localStorage
            localStorage.setItem('profileLevel', profileLevel.value);
            localStorage.setItem('profileInstitute', profileInstitute.value);
            localStorage.setItem('profileClass', profileClass.value);
            localStorage.setItem('className', profileClass.options[profileClass.selectedIndex].text);
            
            // Save field if it exists (for colleges)
            if (profileField.value) {
                localStorage.setItem('profileField', profileField.value);
            }
            
            profileSuccess.textContent = '✓ Profile completed successfully!';
            profileSuccess.classList.remove('hidden');
            profileError.classList.add('hidden');
            
            // Auto-load subjects based on selected class
            await loadAutoSubjects(profileClass.value);
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                profileModal.classList.add('hidden');
                document.getElementById('inputSection').classList.remove('hidden');
                document.getElementById('dashboard-view').scrollIntoView({ behavior: 'smooth' });
            }, 1500);
            
        } catch (err) {
            console.error('Profile save error:', err);
            profileError.textContent = err.message || 'Error saving profile';
            profileError.classList.remove('hidden');
        }
    });

    // Auto-load subjects based on class
    async function loadAutoSubjects(classId) {
        const subjectsList = document.getElementById('subjectsList');
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/subjects/${classId}`);
            if (!res.ok) throw new Error('Failed to load subjects');
            
            const subjects = await res.json();
            
            // Clear and populate subjects
            subjectsList.innerHTML = '';
            subjectCount = 0;
            
            if (subjects.length > 0) {
                // Add heading
                const heading = document.createElement('h3');
                heading.style.marginTop = '1.5rem';
                heading.style.marginBottom = '1rem';
                heading.innerHTML = '<i class="fa-solid fa-book"></i> Your Subjects';
                subjectsList.appendChild(heading);
                
                // Create subjects grid
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
                grid.style.gap = '1rem';
                grid.style.marginBottom = '1.5rem';
                
                // Add each subject as a card
                subjects.forEach(subject => {
                    const card = document.createElement('div');
                    card.className = 'subject-card';
                    card.style.background = 'rgba(88, 166, 255, 0.1)';
                    card.style.border = '1px solid rgba(88, 166, 255, 0.3)';
                    card.style.borderRadius = '8px';
                    card.style.padding = '1rem';
                    card.style.transition = '0.3s';
                    
                    card.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
                            <i class="fa-solid fa-subject" style="color: var(--accent); font-size: 1.2rem;"></i>
                            <h4 style="margin: 0; font-size: 1rem;">${subject.name || subject}</h4>
                        </div>
                        <input type="number" 
                               class="input-field subj-auto-marks" 
                               data-subject="${subject.name || subject}" 
                               placeholder="Marks (0-100)" 
                               min="0" max="100"
                               style="margin: 0;">
                    `;
                    
                    card.addEventListener('mouseenter', () => {
                        card.style.background = 'rgba(88, 166, 255, 0.2)';
                        card.style.borderColor = 'rgba(88, 166, 255, 0.5)';
                    });
                    card.addEventListener('mouseleave', () => {
                        card.style.background = 'rgba(88, 166, 255, 0.1)';
                        card.style.borderColor = 'rgba(88, 166, 255, 0.3)';
                    });
                    
                    grid.appendChild(card);
                });
                
                subjectsList.appendChild(grid);
                
                // Hide add subject button
                document.getElementById('addSubjectBtn').style.display = 'none';
            } else {
                // No subjects found, show manual entry
                const msg = document.createElement('p');
                msg.textContent = 'No subjects found. Add them manually below.';
                msg.style.color = 'var(--text-muted)';
                msg.style.textAlign = 'center';
                subjectsList.appendChild(msg);
            }
        } catch (err) {
            console.error('Error loading subjects:', err);
            // Fallback: show manual entry
            const msg = document.createElement('p');
            msg.textContent = 'Could not load subjects automatically. Add them manually below.';
            msg.style.color = 'var(--warning)';
            subjectsList.appendChild(msg);
        }
    }

    // ==========================================
    // SELECTION LOGIC (Phase 2 & 2.5)
    // ==========================================
    const typeSelect = document.getElementById('typeSelect');
    const instituteSelect = document.getElementById('instituteSelect');
    const classSelect = document.getElementById('classSelect');

    const authTypeSelect = document.getElementById('authTypeSelect');
    const authInstituteSelect = document.getElementById('authInstituteSelect');
    const authClassSelect = document.getElementById('authClassSelect');

    function setupSelectionListeners() {
        typeSelect.addEventListener('change', loadInstitutes);
        instituteSelect.addEventListener('change', loadClasses);
        classSelect.addEventListener('change', loadSubjects);
        
        authTypeSelect.addEventListener('change', loadAuthInstitutes);
        authInstituteSelect.addEventListener('change', loadAuthClasses);
    }

    async function loadInstitutes() {
        const type = typeSelect.value;
        instituteSelect.innerHTML = '<option value="">Select Institute</option>';
        instituteSelect.disabled = !type;
        classSelect.innerHTML = '<option value="">Select Class / Field</option>';
        classSelect.disabled = true;
        
        if (!type) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/institutes?type=${type}`);
            const institutes = await res.json();
            institutes.forEach(inst => {
                const opt = document.createElement('option');
                opt.value = inst.institute_id;
                opt.textContent = inst.name;
                instituteSelect.appendChild(opt);
            });
        } catch (e) { console.error("Error loading institutes:", e); }
    }

    async function loadClasses() {
        const instId = instituteSelect.value;
        classSelect.innerHTML = '<option value="">Select Class / Field</option>';
        classSelect.disabled = !instId;
        if (!instId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${instId}`);
            const classes = await res.json();
            classes.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls.class_id;
                opt.textContent = cls.name;
                classSelect.appendChild(opt);
            });
        } catch (e) { console.error("Error loading classes:", e); }
    }

    async function loadSubjects() {
        const classId = classSelect.value;
        if (!classId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/subjects/${classId}`);
            const subjects = await res.json();
            
            subjectsList.innerHTML = '';
            subjectCount = 0;
            if (subjects.length > 0) {
                subjects.forEach(sub => addSubjectRow(sub.name));
            } else {
                addSubjectRow();
            }
        } catch (e) { console.error("Error loading subjects:", e); }
    }

    async function loadAuthInstitutes() {
        const type = authTypeSelect.value;
        authInstituteSelect.innerHTML = '<option value="">Select Institute</option>';
        authInstituteSelect.disabled = !type;
        authClassSelect.innerHTML = '<option value="">Select Class</option>';
        authClassSelect.disabled = true;
        if (!type) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/institutes?type=${type}`);
            const institutes = await res.json();
            institutes.forEach(inst => {
                const opt = document.createElement('option');
                opt.value = inst.institute_id;
                opt.textContent = inst.name;
                authInstituteSelect.appendChild(opt);
            });
        } catch (e) { console.error("Error loading institutes:", e); }
    }

    async function loadAuthClasses() {
        const instId = authInstituteSelect.value;
        authClassSelect.innerHTML = '<option value="">Select Class</option>';
        authClassSelect.disabled = !instId;
        if (!instId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/classes/${instId}`);
            const classes = await res.json();
            classes.forEach(cls => {
                const opt = document.createElement('option');
                opt.value = cls.class_id;
                opt.textContent = cls.name;
                authClassSelect.appendChild(opt);
            });
        } catch (e) { console.error("Error loading classes:", e); }
    }

    function initSelectionData() {
        setupSelectionListeners();
    }

    function initAuthSelectionData() {
        setupSelectionListeners();
    }

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
    let subjectCount = 0;
    const subjectsList = document.getElementById('subjectsList');
    addSubjectRow();
    document.getElementById('addSubjectBtn').addEventListener('click', () => addSubjectRow());
    
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        
        if (userEmail) StorageHelper.setItem('userEmail', userEmail); // save for analytics

        const subjects = [];
        let isValid = true;
        
        // Collect from manual subject rows (if any)
        const rows = document.querySelectorAll('.subject-row');
        rows.forEach(row => {
            const name = row.querySelector('.subj-name').value.trim();
            const marks = parseInt(row.querySelector('.subj-marks').value.trim(), 10);
            if (!name || isNaN(marks) || marks < 0 || marks > 100) isValid = false;
            else subjects.push({ name, marks });
        });
        
        // Collect from auto-loaded subject cards (from profile selection)
        const cards = document.querySelectorAll('.subj-auto-marks');
        cards.forEach(input => {
            const name = input.getAttribute('data-subject');
            const marks = parseInt(input.value.trim(), 10);
            if (name && !isNaN(marks) && marks >= 0 && marks <= 100) {
                subjects.push({ name, marks });
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
                body: JSON.stringify({ user_name: userName, user_email: userEmail, subjects })
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
        document.getElementById('aiFeedbackContent').textContent = feedback;
    }

    // 3. Analytics Logic
    let myChart = null;
    async function loadAnalytics() {
        const userId = localStorage.getItem('userId');
        if(!userId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/history/${userId}`);
            const data = await response.json();
            if(data.performance && data.performance.length > 0) renderAnalytics(data.performance);
        } catch(e) { console.error(e); }
    }

    function renderAnalytics(performanceRecords) {
        // Group by subject and find unique attempts (by created_at)
        const attemptsMap = {}; 
        performanceRecords.forEach(r => {
            const time = new Date(r.created_at).toLocaleDateString();
            if(!attemptsMap[time]) attemptsMap[time] = {};
            const sName = r.subjects ? r.subjects.name : 'Unknown';
            attemptsMap[time][sName] = r.marks;
        });

        const dates = Object.keys(attemptsMap).sort((a,b) => new Date(a) - new Date(b));
        const subjects = [...new Set(performanceRecords.map(r => r.subjects ? r.subjects.name : 'Unknown'))];
        
        const datasets = subjects.map((sub, idx) => {
            const colors = ['#58a6ff', '#3fb950', '#f85149', '#d29922', '#9b51e0'];
            return {
                label: sub,
                data: dates.map(d => attemptsMap[d][sub] || null),
                borderColor: colors[idx % colors.length],
                tension: 0.3,
                fill: false,
                spanGaps: true
            };
        });

        const ctx = document.getElementById('performanceChart').getContext('2d');
        if(myChart) myChart.destroy();
        
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: datasets
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { 
                    y: { beginAtZero: true, max: 100, ticks: {color: '#e6edf3'} }, 
                    x: { ticks: {color: '#e6edf3'} } 
                }, 
                plugins: { 
                    legend: { labels: { color: '#e6edf3' } } 
                } 
            }
        });

        // Textual comparison logic (simplified for Phase 3)
        document.getElementById('compareStats').innerHTML = `Tracking progress across ${dates.length} attempts and ${subjects.length} subjects. Look at the lines to see your growth!`;
    }

    // 4. Countdown Timer & Goals Logic (Phase 4)
    let timerInterval = null;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let focusMins = 0;
    let sessions = 0;

    const display = document.getElementById('timerDisplay');
    const status = document.getElementById('timerStatus');
    const btnStart = document.getElementById('startTimerBtn');
    const btnPause = document.getElementById('pauseTimerBtn');
    const btnReset = document.getElementById('resetTimerBtn');
    const btnBreak = document.getElementById('breakTimerBtn');

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
            document.body.style.background = "#010409"; // darker in focus
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
                    focusMins += 25;
                    document.getElementById('totalFocusMins').textContent = focusMins;
                    document.getElementById('sessionsCompleted').textContent = sessions;
                    saveStudySession(25); // Save to DB
                    alert("Focus session completed! Great work.");
                    setTimer(5 * 60, "Break Time!");
                }
            }, 1000);
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            status.textContent = "Paused";
            btnStart.classList.remove('hidden');
            btnPause.classList.add('hidden');
            document.body.style.background = "linear-gradient(135deg, #0d1117 0%, #010409 100%)";
        }
    }

    function setTimer(minutes, textStatus) {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = minutes * 60;
        status.textContent = textStatus;
        document.body.style.background = "linear-gradient(135deg, #0d1117 0%, #010409 100%)";
        btnStart.classList.remove('hidden');
        btnPause.classList.add('hidden');
        updateDisplay();
    }

    btnStart.addEventListener('click', toggleTimer);
    btnPause.addEventListener('click', toggleTimer);
    btnReset.addEventListener('click', () => setTimer(25, "Ready to Focus"));
    btnBreak.addEventListener('click', () => setTimer(5, "Break Time!"));

    // Goals Management
    const goalsList = document.getElementById('goalsList');
    const newGoalInput = document.getElementById('newGoalInput');
    const addGoalBtn = document.getElementById('addGoalBtn');

    async function loadGoals() {
        const userId = localStorage.getItem('userId');
        if(!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/goals/${userId}`);
            const goals = await res.json();
            goalsList.innerHTML = '';
            goals.forEach(goal => renderGoal(goal));
        } catch(e) { console.error(e); }
    }

    function renderGoal(goal) {
        const li = document.createElement('li');
        li.className = 'goal-item';
        li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${goal.goal_text}</span>`;
        goalsList.appendChild(li);
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
            const newGoal = await res.json();
            renderGoal(newGoal);
            newGoalInput.value = '';
        } catch(e) { console.error(e); }
        finally { addGoalBtn.disabled = false; }
    });

    // ==========================================
    // AI CHATBOT FUNCTIONS
    // ==========================================
    
    const chatbotBtn = document.getElementById('chatbotBtn');
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
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');

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

    // Check existing session
    if (StorageHelper.getItem('userId')) {
        authOverlay.classList.add('hidden');
        document.getElementById('userName').value = StorageHelper.getItem('userName') || '';
        document.getElementById('userEmail').value = localStorage.getItem('userEmail') || '';
        initSelectionData(); 
        loadGoals(); // Load Phase 4 data
    }
});

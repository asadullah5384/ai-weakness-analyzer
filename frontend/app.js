    // API Configuration
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000' 
        : ''; // Same domain on Vercel, paths already start with /api

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
    document.getElementById('addSubjectBtn').addEventListener('click', addSubjectRow);
    
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        
        if (userEmail) localStorage.setItem('userEmail', userEmail); // save for analytics

        const subjects = [];
        const rows = document.querySelectorAll('.subject-row');
        let isValid = true;
        
        rows.forEach(row => {
            const name = row.querySelector('.subj-name').value.trim();
            const marks = parseInt(row.querySelector('.subj-marks').value.trim(), 10);
            if (!name || isNaN(marks) || marks < 0 || marks > 100) isValid = false;
            else subjects.push({ name, marks });
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
            if(data.user_id) localStorage.setItem('userId', data.user_id); // Save for analytics
            displayResults(data);
        } catch (error) {
            console.error(error);
            alert("Error: Backend is unreachable.");
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

    function addSubjectRow() {
        subjectCount++;
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.innerHTML = `
            <input type="text" placeholder="Subject (e.g., Math)" class="input-field subj-name">
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
        
        data.results.forEach(res => {
            const tag = document.createElement('div');
            tag.className = 'subject-tag';
            tag.innerHTML = `<span>${res.name}</span> <strong>${res.marks}</strong>`;
            cols[res.category].appendChild(tag);
        });

        // Some Groq models return markdown, so we parse basic bold
        let feedback = data.ai_feedback || "Analyzing feedback...";
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
        // Simple heuristic: latest inputs.
        // Backend returns records ordered by creation in Supabase usually.
        const subjectsMap = {};
        performanceRecords.forEach(r => {
            const sName = r.subjects ? r.subjects.name : 'Unknown';
            if(!subjectsMap[sName]) subjectsMap[sName] = [];
            subjectsMap[sName].push(r.marks);
        });

        let labels = Object.keys(subjectsMap);
        let latestMarks = labels.map(l => subjectsMap[l][subjectsMap[l].length - 1]);
        let previousMarks = labels.map(l => subjectsMap[l].length > 1 ? subjectsMap[l][subjectsMap[l].length - 2] : 0);

        const ctx = document.getElementById('performanceChart').getContext('2d');
        if(myChart) myChart.destroy();
        
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Previous Attempt', data: previousMarks, backgroundColor: 'rgba(88, 166, 255, 0.4)' },
                    { label: 'Current Attempt', data: latestMarks, backgroundColor: '#58a6ff' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, ticks: {color: '#e6edf3'} }, x: { ticks: {color: '#e6edf3'} } }, plugins: { legend: { labels: { color: '#e6edf3' } } } }
        });

        // Textual comparison
        let cmpText = `Based on your history across ${labels.length} subjects:<br><br>`;
        let improved = 0, declined = 0;
        labels.forEach((l, i) => {
            if(subjectsMap[l].length > 1) {
                let diff = latestMarks[i] - previousMarks[i];
                if(diff > 0) { improved++; cmpText += `• <span style="color:var(--success)"><b>${l}</b>: +${diff} marks</span><br>`; }
                else if(diff < 0) { declined++; cmpText += `• <span style="color:var(--danger)"><b>${l}</b>: ${diff} marks</span><br>`; }
            }
        });
        if(improved === 0 && declined === 0) cmpText += "Not enough history to compare yet. Analyze multiple times with the same email!";
        document.getElementById('compareStats').innerHTML = cmpText;
    }

    // 4. Pomodoro Logic
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
                    alert("Focus session completed!");
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
});

System Architecture — AI Weakness Analyzer
Overview
This system is a web-based student performance analyzer built using React (frontend), FastAPI (backend), Supabase (database), and GROQ/AI for personalized feedback. It provides users with a way to input subjects and marks, analyze performance, and receive actionable suggestions.
---
Components
1. Frontend (React)
Purpose:
Provide a user interface for data input, results display, and analytics.
Responsibilities:
Input forms for subjects and marks
Display categorized results (Weak / Average / Strong)
Show improvement suggestions and progress charts
Optional: motivational messages
Interaction:
Sends user input to FastAPI backend via HTTP requests
Receives processed results and AI-generated feedback
---
2. Backend (FastAPI)
Purpose:
Core application logic and data processing
Handles API requests from the frontend
Responsibilities:
Receive and validate input data from frontend
Perform performance analysis (Weak / Average / Strong)
Generate suggestions (rule-based or via AI)
Interface with Supabase to store/retrieve user performance
Interact with AI service using GROQ for feedback
Interaction:
Receives requests from frontend
Processes data and interacts with Supabase and AI service
Sends processed results back to frontend
---
3. Database (Supabase)
Purpose:
Store persistent data such as user performance history
Responsibilities:
Save user profiles and performance data
Enable progress tracking and historical comparisons
Interaction:
FastAPI backend queries and updates data in Supabase
---
4. API Layer
Purpose:
Facilitate communication between frontend, backend, and AI service
Responsibilities:
Handle HTTP requests from frontend
Forward data to FastAPI backend
Return processed data or AI feedback to frontend
---
5. AI Component (GROQ)
Purpose:
Provide personalized, human-like feedback to students
Responsibilities:
Receive structured student data from backend
Generate actionable feedback and suggestions
Interaction:
Backend sends student data to GROQ AI
Receives AI-generated feedback
Backend sends feedback to frontend for display
---
6. External Services (Optional)
Examples:
Charting libraries (Chart.js, Recharts) for performance visualization
Notification services (email/SMS reminders)
Hosting platforms (Vercel, Netlify)
Interaction:
Called by frontend or backend as needed for enhanced features
---
Component Interaction Flow
User interacts with React frontend (inputs marks, submits form)
Frontend sends data to FastAPI backend via API
Backend validates and analyzes the data
Sends request to GROQ AI if AI feedback is enabled
Stores/retrieves data in Supabase
Backend sends results and feedback to frontend
Frontend displays categorized results, suggestions, charts, and optional messages
---
Summary Table
Component	Tech	Responsibilities	Interaction
Frontend	React	UI, forms, display	HTTP requests to FastAPI
Backend	FastAPI	Core logic, analysis, AI calls	Frontend, Supabase, AI
Database	Supabase	Persistent storage	Backend queries
API Layer	FastAPI	Communication bridge	Frontend ↔ Backend ↔ AI
AI	GROQ	Personalized feedback	Backend calls AI API
External Services	Chart.js, notifications	Visuals, reminders	Frontend/backend calls
---
Note: This architecture ensures modularity, scalability, and clean separation of responsibilities. The system can be enhanced later with gamification, advanced analytics, or AI chat features.
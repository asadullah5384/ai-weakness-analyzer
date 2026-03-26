Database Design — AI Weakness Analyzer
Overview
This database design uses Supabase (PostgreSQL) to store user data, performance records, suggestions, and analytics logs. The schema is modular to support scalability and analytics.
---
Tables
1. Users Table
Stores basic information about each user.
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
---
2. Institutes Table
Stores different educational organization types.
```sql
CREATE TABLE institutes (
    institute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('School', 'College', 'University')),
    created_at TIMESTAMP DEFAULT NOW()
);
```

3. Classes Table
Linked to institutes.
```sql
CREATE TABLE classes (
    class_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(institute_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

4. Subjects Table
Stores the list of subjects tracked by the app.
```sql
CREATE TABLE subjects (
    subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE(class_id, name)
);
```
---
5. Topics Table
Granular topics within a subject.
```sql
CREATE TABLE topics (
    topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

6. Performance Records Table
Stores marks entered by users for specific subjects and topics.
```sql
CREATE TABLE performance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    marks INT CHECK (marks >= 0 AND marks <= 100),
    category VARCHAR(20), -- Weak / Average / Strong
    created_at TIMESTAMP DEFAULT NOW()
);
```
Relationship: Many-to-One from `performance_records` → `users` and `subjects`.
---
7. Study Sessions Table (Pomodoro)
Tracking focus time.
```sql
CREATE TABLE study_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    duration_minutes INT DEFAULT 25,
    completed_at TIMESTAMP DEFAULT NOW()
);
```

8. Goals Table
Personalized goal tracking.
```sql
CREATE TABLE goals (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    goal_text TEXT,
    target_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

9. Suggestions Table
Stores generated improvement suggestions for each user and subject.
```sql
CREATE TABLE suggestions (
    suggestion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(subject_id),
    suggestion_text TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```
Relationship: Linked to `users` and optionally linked to `subjects`.
---
5. Analytics / Logs Table
Stores actions, system events, or AI feedback for auditing and tracking progress.
```sql
CREATE TABLE analytics_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action_type VARCHAR(50), -- e.g., 'analysis', 'login', 'feedback'
    action_details JSONB, -- detailed info about the action
    created_at TIMESTAMP DEFAULT NOW()
);
```
Purpose: Track user activity and system performance for reporting.
---
Relationships Diagram (Logical)
Institutes 1---* Classes
Classes 1---* Subjects
Subjects 1---* Topics
Subjects 1---* Performance Records
Topics 0---* Performance Records
Users 1---* Performance Records
Users 1---* Study Sessions
Users 1---* Goals
Users 1---* Suggestions
Users 1---* Analytics Logs
---
Notes
`UUID` is used for primary keys for uniqueness and security.
`category` in performance records is derived based on marks (<50: Weak, 50-75: Average, >75: Strong).
AI-generated suggestions are flagged with `is_ai_generated = TRUE`.
JSONB in `analytics_logs` allows storing flexible details like AI response content or UI events.
Cascading deletes ensure consistency: deleting a user removes related performance, suggestions, and logs.
This schema supports easy extension for future features like gamification, progress tracking, or advanced analytics.
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
2. Subjects Table
Stores the list of subjects tracked by the app.
```sql
CREATE TABLE subjects (
    subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);
```
---
3. Performance Records Table
Stores marks entered by users for specific subjects.
```sql
CREATE TABLE performance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE CASCADE,
    marks INT CHECK (marks >= 0 AND marks <= 100),
    category VARCHAR(20), -- Weak / Average / Strong
    created_at TIMESTAMP DEFAULT NOW()
);
```
Relationship: Many-to-One from `performance_records` → `users` and `subjects`.
---
4. Suggestions Table
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
Users 1---* Performance Records
Subjects 1---* Performance Records
Users 1---* Suggestions
Subjects 1---* Suggestions (optional)
Users 1---* Analytics Logs
---
Notes
`UUID` is used for primary keys for uniqueness and security.
`category` in performance records is derived based on marks (<50: Weak, 50-75: Average, >75: Strong).
AI-generated suggestions are flagged with `is_ai_generated = TRUE`.
JSONB in `analytics_logs` allows storing flexible details like AI response content or UI events.
Cascading deletes ensure consistency: deleting a user removes related performance, suggestions, and logs.
This schema supports easy extension for future features like gamification, progress tracking, or advanced analytics.
# Database Schema Design

## Overview

Comprehensive database schema for the personalized learning platform using PostgreSQL with proper relationships, indexes, and constraints.

## Core Tables

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### User Preferences Table

```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    timezone_auto BOOLEAN DEFAULT true,
    privacy_level VARCHAR(20) DEFAULT 'standard',
    data_sharing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Assessment System Tables

### Assessment Types Table

```sql
CREATE TABLE assessment_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(10) DEFAULT '1.0',
    question_count INTEGER NOT NULL,
    estimated_time INTEGER NOT NULL, -- minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO assessment_types (id, name, description, question_count, estimated_time) VALUES
('personality', 'Personality Assessment', 'Big Five personality traits analysis', 50, 10),
('learning-style', 'Learning Style Assessment', 'VAK and multiple intelligence analysis', 40, 8),
('motivation', 'Motivation Analysis', 'Self-determination theory based analysis', 25, 5);
```

### Assessment Questions Table

```sql
CREATE TABLE assessment_questions (
    id VARCHAR(50) PRIMARY KEY,
    assessment_type VARCHAR(50) REFERENCES assessment_types(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- 'likert', 'multiple_choice', 'ranking'
    category VARCHAR(50),
    subcategory VARCHAR(50),
    scale_min INTEGER,
    scale_max INTEGER,
    scale_labels JSONB,
    options JSONB, -- for multiple choice questions
    is_reverse_scored BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assessment_questions_type ON assessment_questions(assessment_type);
CREATE INDEX idx_assessment_questions_category ON assessment_questions(category);
```

### Assessment Sessions Table

```sql
CREATE TABLE assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) REFERENCES assessment_types(id),
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER,
    answered_questions INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assessment_sessions_user ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_type ON assessment_sessions(assessment_type);
CREATE INDEX idx_assessment_sessions_status ON assessment_sessions(status);
```

### Assessment Responses Table

```sql
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES assessment_questions(id),
    response_value JSONB NOT NULL,
    response_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(session_id, question_id)
);

CREATE INDEX idx_assessment_responses_session ON assessment_responses(session_id);
```

### Assessment Results Table

```sql
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) REFERENCES assessment_types(id),
    raw_scores JSONB NOT NULL,
    normalized_scores JSONB NOT NULL,
    percentiles JSONB,
    interpretation JSONB NOT NULL,
    confidence_scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, assessment_type)
);

CREATE INDEX idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_type ON assessment_results(assessment_type);
```

### Comprehensive Profiles Table

```sql
CREATE TABLE comprehensive_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    personality_result_id UUID REFERENCES assessment_results(id),
    learning_style_result_id UUID REFERENCES assessment_results(id),
    motivation_result_id UUID REFERENCES assessment_results(id),
    overall_recommendations JSONB,
    ai_coach_profile TEXT,
    learning_plan JSONB,
    personality_type VARCHAR(50),
    learning_preferences JSONB,
    strengths JSONB,
    growth_areas JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Health Tracking Tables

### Health Checks Table

```sql
CREATE TABLE health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    condition VARCHAR(20) NOT NULL, -- 'excellent', 'good', 'normal', 'poor', 'bad'
    sleep_hours DECIMAL(3,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    stress_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    exercise_done BOOLEAN DEFAULT false,
    exercise_type VARCHAR(50),
    exercise_duration INTEGER, -- minutes
    mood JSONB, -- array of mood descriptors
    meals JSONB, -- breakfast, lunch, dinner booleans
    water_intake INTEGER, -- glasses
    note TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, DATE(recorded_at))
);

CREATE INDEX idx_health_checks_user ON health_checks(user_id);
CREATE INDEX idx_health_checks_recorded_at ON health_checks(recorded_at);
CREATE INDEX idx_health_checks_condition ON health_checks(condition);
```

### Health Insights Table

```sql
CREATE TABLE health_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    overall_trend VARCHAR(20) NOT NULL, -- 'improving', 'stable', 'declining'
    summary_stats JSONB NOT NULL,
    patterns JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    alerts JSONB,
    ai_summary TEXT,
    ai_advice TEXT,
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    UNIQUE(user_id, period, date_range_start, date_range_end)
);

CREATE INDEX idx_health_insights_user ON health_insights(user_id);
CREATE INDEX idx_health_insights_period ON health_insights(period);
CREATE INDEX idx_health_insights_expires_at ON health_insights(expires_at);
```

## Task Management Tables

### Tasks Table

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'goal', 'plan', 'phase', 'module', 'lesson', 'activity', 'task', 'subtask'
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'blocked', 'review', 'completed', 'archived'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    actual_duration INTEGER, -- minutes
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    tags JSONB,
    metadata JSONB,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### Task Dependencies Table

```sql
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    target_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(30) DEFAULT 'finish_to_start', -- 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
    is_optional BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(source_task_id, target_task_id),
    CHECK (source_task_id != target_task_id)
);

CREATE INDEX idx_task_dependencies_source ON task_dependencies(source_task_id);
CREATE INDEX idx_task_dependencies_target ON task_dependencies(target_task_id);
```

### Task Progress Logs Table

```sql
CREATE TABLE task_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    previous_progress INTEGER,
    new_progress INTEGER NOT NULL,
    time_spent INTEGER, -- minutes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_progress_logs_task ON task_progress_logs(task_id);
CREATE INDEX idx_task_progress_logs_user ON task_progress_logs(user_id);
CREATE INDEX idx_task_progress_logs_created_at ON task_progress_logs(created_at);
```

## AI Coach Tables

### AI Conversations Table

```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated_at ON ai_conversations(updated_at);
```

### AI Messages Table

```sql
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    metadata JSONB, -- suggestions, tips, etc.
    tokens_used INTEGER,
    response_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
```

### AI Coach Profiles Table

```sql
CREATE TABLE ai_coach_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    coaching_style VARCHAR(100),
    communication_preferences JSONB,
    personalization_data JSONB,
    interaction_history JSONB,
    effectiveness_metrics JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Learning Path Tables

### Learning Paths Table

```sql
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    estimated_duration INTEGER, -- hours
    prerequisites JSONB,
    learning_objectives JSONB,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_category ON learning_paths(category);
CREATE INDEX idx_learning_paths_difficulty ON learning_paths(difficulty_level);
CREATE INDEX idx_learning_paths_public ON learning_paths(is_public);
```

### User Learning Paths Table

```sql
CREATE TABLE user_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'paused'
    progress_percentage INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(user_id, learning_path_id)
);

CREATE INDEX idx_user_learning_paths_user ON user_learning_paths(user_id);
CREATE INDEX idx_user_learning_paths_status ON user_learning_paths(status);
```

## Analytics Tables

### User Activity Logs Table

```sql
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
```

### Learning Analytics Table

```sql
CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20),
    context JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_analytics_user ON learning_analytics(user_id);
CREATE INDEX idx_learning_analytics_type ON learning_analytics(metric_type);
CREATE INDEX idx_learning_analytics_recorded_at ON learning_analytics(recorded_at);
```

## Notification Tables

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'reminder', 'achievement', 'system', 'social'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## File Management Tables

### Files Table

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at);
```

## Session Management Tables

### User Sessions Table

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## Views for Common Queries

### User Dashboard View

```sql
CREATE VIEW user_dashboard_stats AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
    COUNT(DISTINCT hc.id) as health_check_count,
    AVG(CASE WHEN hc.condition = 'excellent' THEN 5
             WHEN hc.condition = 'good' THEN 4
             WHEN hc.condition = 'normal' THEN 3
             WHEN hc.condition = 'poor' THEN 2
             WHEN hc.condition = 'bad' THEN 1
             END) as avg_health_condition,
    COUNT(DISTINCT ar.id) as completed_assessments,
    MAX(hc.recorded_at) as last_health_check,
    MAX(t.updated_at) as last_task_update
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
LEFT JOIN health_checks hc ON u.id = hc.user_id AND hc.recorded_at >= NOW() - INTERVAL '30 days'
LEFT JOIN assessment_results ar ON u.id = ar.user_id
GROUP BY u.id, u.first_name, u.last_name;
```

### Task Hierarchy View

```sql
CREATE VIEW task_hierarchy AS
WITH RECURSIVE task_tree AS (
    -- Base case: root tasks (no parent)
    SELECT
        id,
        user_id,
        parent_id,
        title,
        type,
        status,
        priority,
        0 as level,
        ARRAY[id] as path,
        id::text as sort_path
    FROM tasks
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: child tasks
    SELECT
        t.id,
        t.user_id,
        t.parent_id,
        t.title,
        t.type,
        t.status,
        t.priority,
        tt.level + 1,
        tt.path || t.id,
        tt.sort_path || '.' || t.id::text
    FROM tasks t
    JOIN task_tree tt ON t.parent_id = tt.id
)
SELECT * FROM task_tree;
```

## Triggers and Functions

### Update Timestamps Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_checks_updated_at BEFORE UPDATE ON health_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... apply to other tables as needed
```

### Task Progress Update Trigger

```sql
CREATE OR REPLACE FUNCTION log_task_progress_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status OR OLD.progress_percentage != NEW.progress_percentage THEN
        INSERT INTO task_progress_logs (
            task_id,
            user_id,
            previous_status,
            new_status,
            previous_progress,
            new_progress
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status,
            OLD.progress_percentage,
            NEW.progress_percentage
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER task_progress_change_log
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_progress_change();
```

## Data Retention Policies

### Cleanup Old Sessions

```sql
-- Delete expired sessions daily
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ language 'plpgsql';
```

### Archive Old Activity Logs

```sql
-- Archive activity logs older than 1 year
CREATE OR REPLACE FUNCTION archive_old_activity_logs()
RETURNS void AS $$
BEGIN
    -- Move to archive table (create if needed)
    INSERT INTO user_activity_logs_archive
    SELECT * FROM user_activity_logs
    WHERE created_at < NOW() - INTERVAL '1 year';

    -- Delete from main table
    DELETE FROM user_activity_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ language 'plpgsql';
```

This comprehensive database schema provides a solid foundation for your personalized learning platform with proper relationships, indexes, and data integrity constraints.

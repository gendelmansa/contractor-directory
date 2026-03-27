-- Field Management App Schema
-- Extends existing contractors table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- OPERATORS (Business owners/managers)
-- ============================================
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTRACTOR PROFILES (Extended profile)
-- ============================================
CREATE TABLE contractor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
    skills TEXT[], -- array of skill tags
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_date DATE,
    scheduled_time TEXT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- JOB ASSIGNMENTS (Contractor to Job)
-- ============================================
CREATE TABLE job_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    contractor_id UUID REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
    UNIQUE(job_id, contractor_id)
);

-- ============================================
-- JOB NOTES (Contractor uploads)
-- ============================================
CREATE TABLE job_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES job_assignments(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'issue', 'completion', 'question')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOB NOTE ATTACHMENTS (Images/Files)
-- ============================================
CREATE TABLE job_note_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES job_notes(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_operators_user ON operators(user_id);
CREATE INDEX idx_contractor_profiles_operator ON contractor_profiles(operator_id);
CREATE INDEX idx_contractor_profiles_user ON contractor_profiles(user_id);
CREATE INDEX idx_jobs_operator ON jobs(operator_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled ON jobs(scheduled_date);
CREATE INDEX idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_contractor ON job_assignments(contractor_id);
CREATE INDEX idx_job_notes_assignment ON job_notes(assignment_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- OPERATORS: Users can only see their own operator profile
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own operator" ON operators
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own operator" ON operators
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own operator" ON operators
    FOR UPDATE USING (user_id = auth.uid());

-- CONTRACTOR PROFILES: 
-- - Operators see contractors they manage
-- - Contractors see their own profile

ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators see their contractors" ON contractor_profiles
    FOR SELECT USING (
        operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    );

CREATE POLICY "Contractors see own profile" ON contractor_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Operators can manage contractors" ON contractor_profiles
    FOR ALL USING (
        operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    );

CREATE POLICY "Contractors can update own profile" ON contractor_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- JOBS: Operators see their jobs, assigned contractors see theirs

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators see their jobs" ON jobs
    FOR SELECT USING (
        operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    );

CREATE POLICY "Operators manage jobs" ON jobs
    FOR ALL USING (
        operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    );

-- Contractors can see assigned jobs via job_assignments
CREATE POLICY "Contractors see assigned jobs" ON jobs
    FOR SELECT USING (
        id IN (
            SELECT job_id FROM job_assignments 
            WHERE contractor_id IN (
                SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- JOB ASSIGNMENTS: Similar access control

ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators see their assignments" ON job_assignments
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM jobs WHERE operator_id IN (
                SELECT id FROM operators WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Contractors see their assignments" ON job_assignments
    FOR SELECT USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Operators manage assignments" ON job_assignments
    FOR ALL USING (
        job_id IN (
            SELECT id FROM jobs WHERE operator_id IN (
                SELECT id FROM operators WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Contractors update own assignments" ON job_assignments
    FOR UPDATE USING (
        contractor_id IN (
            SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
        )
    );

-- JOB NOTES: Access via assignments

ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see notes on their assignments" ON job_notes
    FOR SELECT USING (
        assignment_id IN (
            SELECT id FROM job_assignments WHERE 
                job_id IN (
                    SELECT id FROM jobs WHERE operator_id IN (
                        SELECT id FROM operators WHERE user_id = auth.uid()
                    )
                )
                OR contractor_id IN (
                    SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                )
        )
    );

CREATE POLICY "Contractors create notes" ON job_notes
    FOR INSERT WITH CHECK (
        assignment_id IN (
            SELECT id FROM job_assignments WHERE 
            contractor_id IN (
                SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Operators manage notes" ON job_notes
    FOR ALL USING (
        assignment_id IN (
            SELECT id FROM job_assignments WHERE 
            job_id IN (
                SELECT id FROM jobs WHERE operator_id IN (
                    SELECT id FROM operators WHERE user_id = auth.uid()
                )
            )
        )
    );

-- JOB NOTE ATTACHMENTS: Inherit from job_notes

ALTER TABLE job_note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see attachments on their notes" ON job_note_attachments
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM job_notes WHERE 
            assignment_id IN (
                SELECT id FROM job_assignments WHERE 
                    job_id IN (
                        SELECT id FROM jobs WHERE operator_id IN (
                            SELECT id FROM operators WHERE user_id = auth.uid()
                        )
                    )
                    OR contractor_id IN (
                        SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                    )
            )
        )
    );

CREATE POLICY "Users create attachments on their notes" ON job_note_attachments
    FOR INSERT WITH CHECK (
        note_id IN (
            SELECT id FROM job_notes WHERE 
            assignment_id IN (
                SELECT id FROM job_assignments WHERE 
                    job_id IN (
                        SELECT id FROM jobs WHERE operator_id IN (
                            SELECT id FROM operators WHERE user_id = auth.uid()
                        )
                    )
                    OR contractor_id IN (
                        SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
                    )
            )
        )
    );
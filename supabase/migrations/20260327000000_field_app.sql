-- Field Management App Schema
-- Created: 2026-03-27

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- OPERATORS (Business owners/managers)
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTRACTOR PROFILES
CREATE TABLE IF NOT EXISTS contractor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    skills TEXT[],
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
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

-- JOB ASSIGNMENTS
CREATE TABLE IF NOT EXISTS job_assignments (
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

-- JOB NOTES
CREATE TABLE IF NOT EXISTS job_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES job_assignments(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'issue', 'completion', 'question')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_operators_user ON operators(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_operator ON contractor_profiles(operator_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user ON contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_operator ON jobs(operator_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_contractor ON job_assignments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_assignment ON job_notes(assignment_id);

-- ROW LEVEL SECURITY - Allow all for now (can be refined later)
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to do everything (MVP)
CREATE POLICY "allow_all_operators" ON operators FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_contractors" ON contractor_profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_jobs" ON jobs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_assignments" ON job_assignments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_notes" ON job_notes FOR ALL USING (auth.uid() IS NOT NULL);

-- Auth trigger to create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role') = 'operator' THEN
    INSERT INTO public.operators (user_id, company_name, contact_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
      COALESCE(NEW.raw_user_meta_data->>'contact_name', 'Owner'),
      NEW.email
    );
  ELSIF (NEW.raw_user_meta_data->>'role') = 'contractor' THEN
    INSERT INTO public.contractor_profiles (user_id, skills, is_active)
    VALUES (NEW.id, ARRAY[]::TEXT[], true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
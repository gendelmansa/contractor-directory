-- RBAC Design for Field Manager App
-- Migration: Add Admin role with proper access control

-- ============================================
-- STEP 1: Add role column to operators table
-- ============================================

ALTER TABLE operators ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'operator' 
    CHECK (role IN ('admin', 'operator', 'contractor'));

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_operators_role ON operators(role);
CREATE INDEX IF NOT EXISTS idx_operators_user_role ON operators(user_id, role);

-- ============================================
-- STEP 2: Create organization (tenant) table for multi-tenancy
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link operators to organizations
ALTER TABLE operators ADD COLUMN IF NOT EXISTS organization_id UUID 
    REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_operators_org ON operators(organization_id);

-- ============================================
-- STEP 3: Add role to user metadata via trigger
-- ============================================

-- Function to sync role to user metadata
CREATE OR REPLACE FUNCTION sync_user_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role, 'organization_id', NEW.organization_id)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on operators table
DROP TRIGGER IF EXISTS trigger_sync_role ON operators;
CREATE TRIGGER trigger_sync_role
    AFTER INSERT OR UPDATE OF role, organization_id
    ON operators
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role_to_metadata();

-- ============================================
-- STEP 4: Create custom job fields table (Admin only)
-- ============================================

CREATE TABLE IF NOT EXISTS custom_job_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
    field_label TEXT NOT NULL,
    placeholder TEXT,
    options JSONB, -- for select/multiselect: ["opt1", "opt2"]
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_job_fields_org ON custom_job_fields(organization_id);

-- Enable RLS
ALTER TABLE custom_job_fields ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Update RLS Policies
-- ============================================

-- Drop old operators policies and replace with RBAC

-- ADMIN: Can see all operators in their organization (or all if super admin)
DROP POLICY IF EXISTS "Users can see own operator" ON operators;
DROP POLICY IF EXISTS "Users can insert own operator" ON operators;
DROP POLICY IF EXISTS "Users can update own operator" ON operators;

-- Admin: Full access within organization
CREATE POLICY "Admins see org operators" ON operators
    FOR SELECT USING (
        role = 'admin' AND 
        organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Admins manage org operators" ON operators
    FOR ALL USING (
        role = 'admin' AND 
        organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
    );

-- Operator: Only see/update own record
CREATE POLICY "Operators see own record" ON operators
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Operators update own record" ON operators
    FOR UPDATE USING (user_id = auth.uid());

-- Operator: Can create contractor records (contractor role)
CREATE POLICY "Operators can create contractors" ON operators
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND role = 'contractor' AND 
        organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
    );

-- ============================================
-- CONTRACTOR PROFILES - RBAC Update
-- ============================================

DROP POLICY IF EXISTS "Operators see their contractors" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors see own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Operators can manage contractors" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;

-- Admin: See all contractors in org
CREATE POLICY "Admins see org contractors" ON contractor_profiles
    FOR SELECT USING (
        operator_id IN (
            SELECT id FROM operators 
            WHERE organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
            AND role IN ('admin', 'operator')
        )
    );

-- Admin: Full management
CREATE POLICY "Admins manage org contractors" ON contractor_profiles
    FOR ALL USING (
        operator_id IN (
            SELECT id FROM operators 
            WHERE organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
            AND role IN ('admin', 'operator')
        )
    );

-- Operator: See contractors they added
CREATE POLICY "Operators see their contractors" ON contractor_profiles
    FOR SELECT USING (
        operator_id IN (
            SELECT id FROM operators WHERE user_id = auth.uid() AND role = 'operator'
        )
    );

-- Operator: Manage their contractors
CREATE POLICY "Operators manage their contractors" ON contractor_profiles
    FOR ALL USING (
        operator_id IN (
            SELECT id FROM operators WHERE user_id = auth.uid() AND role = 'operator'
        )
    );

-- Contractor: See own profile only
CREATE POLICY "Contractors see self" ON contractor_profiles
    FOR SELECT USING (user_id = auth.uid());

-- Contractor: Update own profile
CREATE POLICY "Contractors update self" ON contractor_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- JOBS - RBAC Update
-- ============================================

DROP POLICY IF EXISTS "Operators see their jobs" ON jobs;
DROP POLICY IF EXISTS "Operators manage jobs" ON jobs;
DROP POLICY IF EXISTS "Contractors see assigned jobs" ON jobs;

-- Admin: See ALL jobs in organization
CREATE POLICY "Admins see all org jobs" ON jobs
    FOR SELECT USING (
        operator_id IN (
            SELECT id FROM operators 
            WHERE organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
        )
    );

CREATE POLICY "Admins manage all org jobs" ON jobs
    FOR ALL USING (
        operator_id IN (
            SELECT id FROM operators 
            WHERE organization_id = (SELECT organization_id FROM operators WHERE user_id = auth.uid() LIMIT 1)
        )
    );

-- Operator: See/manage own jobs only
CREATE POLICY "Operators see own jobs" ON jobs
    FOR SELECT USING (
        operator_id IN (
            SELECT id FROM operators WHERE user_id = auth.uid() AND role = 'operator'
        )
    );

CREATE POLICY "Operators manage own jobs" ON jobs
    FOR ALL USING (
        operator_id IN (
            SELECT id FROM operators WHERE user_id = auth.uid() AND role = 'operator'
        )
    );

-- Contractor: See assigned jobs
CREATE POLICY "Contractors see assigned jobs" ON jobs
    FOR SELECT USING (
        id IN (
            SELECT job_id FROM job_assignments 
            WHERE contractor_id IN (
                SELECT id FROM contractor_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- ============================================
-- CUSTOM JOB FIELDS - Admin only
-- ============================================

ALTER TABLE custom_job_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage custom fields" ON custom_job_fields
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM operators 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- Helper functions for RBAC checks
-- ============================================

-- Get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM operators WHERE user_id = user_uuid LIMIT 1),
        'contractor' -- default if no operator record
    );
$$ LANGUAGE sql STABLE;

-- Get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id(user_uuid UUID)
RETURNS UUID AS $$
    SELECT organization_id FROM operators WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM operators 
        WHERE user_id = user_uuid AND role = 'admin'
    );
$$ LANGUAGE sql STABLE;

-- Check if user can manage operator (admin only)
CREATE OR REPLACE FUNCTION can_manage_operator(admin_id UUID, target_operator_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM operators o1
        JOIN operators o2 ON o1.organization_id = o2.organization_id
        WHERE o1.user_id = admin_id 
            AND o1.role = 'admin'
            AND o2.id = target_operator_id
    );
$$ LANGUAGE sql STABLE;
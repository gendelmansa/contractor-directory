-- Multi-Tenant Migration for Field Manager App
-- Adds organizations table and migration approach

-- ============================================
-- NEW: ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for URLs: acme-construction
    logo_url TEXT,
    settings JSONB DEFAULT '{}', -- customizable org settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MIGRATE EXISTING OPERATORS TO ORGANIZATIONS
-- ============================================
-- Each existing operator becomes its own organization
-- This is a one-time migration step

INSERT INTO organizations (id, name, slug, created_at, updated_at)
SELECT 
    id, 
    company_name, 
    LOWER(REGEXP_REPLACE(company_name, '[^a-z0-9]+', '-', 'g')),
    created_at,
    updated_at
FROM operators;

-- ============================================
-- ADD organization_id TO EXISTING TABLES
-- ============================================

-- Add organization_id to operators
ALTER TABLE operators ADD COLUMN organization_id UUID 
    REFERENCES organizations(id) ON DELETE CASCADE;

-- Populate from existing operator.id (since 1:1 mapping)
UPDATE operators SET organization_id = id;

-- Make NOT NULL after population
ALTER TABLE operators ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to contractor_profiles
ALTER TABLE contractor_profiles ADD COLUMN organization_id UUID 
    REFERENCES organizations(id) ON DELETE CASCADE;

-- Populate via operator relationship
UPDATE contractor_profiles cp
SET organization_id = o.organization_id
FROM operators o
WHERE cp.operator_id = o.id;

ALTER TABLE contractor_profiles ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to jobs
ALTER TABLE jobs ADD COLUMN organization_id UUID 
    REFERENCES organizations(id) ON DELETE CASCADE;

-- Populate via operator relationship
UPDATE jobs j
SET organization_id = o.organization_id
FROM operators o
WHERE j.operator_id = o.id;

ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;

-- ============================================
-- NEW: ORGANIZATION MEMBERS (replaces user_id link)
-- ============================================
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'contractor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'invited', 'disabled')),
    invitation_token UUID,
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Index for lookups
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- ============================================
-- NEW: CONTRACTOR INVITATIONS
-- ============================================
CREATE TABLE contractor_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'contractor',
    token UUID DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractor_invitations_token ON contractor_invitations(token);
CREATE INDEX idx_contractor_invitations_email ON contractor_invitations(email);

-- ============================================
-- REMOVE OLD DIRECT LINKS (after migration)
-- ============================================
-- operators: keep user_id but now via organization_members
-- contractor_profiles: keep user_id for direct login, link via org_members

-- ============================================
-- NEW RLS POLICIES FOR ORGANIZATIONS
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can see their organizations
CREATE POLICY "Members see their organizations" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active')
    );

-- Only owners can modify organizations
CREATE POLICY "Owners manage organizations" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- ============================================
-- NEW RLS FOR ORGANIZATION MEMBERS
-- ============================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Users can see their own memberships
CREATE POLICY "Members see org memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

-- Org owners can manage members
CREATE POLICY "Owners manage members" ON organization_members
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users can create membership via invitation
CREATE POLICY "Users join via invitation" ON organization_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        (invited_by IS NOT NULL AND status = 'pending')
    );

-- ============================================
-- UPDATED RLS FOR OPERATORS (now uses org)
-- ============================================

DROP POLICY IF EXISTS "Users can see own operator" ON operators;
DROP POLICY IF EXISTS "Users can insert own operator" ON operators;
DROP POLICY IF EXISTS "Users can update own operator" ON operators;

CREATE POLICY "Members see operators in their org" ON operators
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins manage operators" ON operators
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- UPDATED RLS FOR CONTRACTOR_PROFILES
-- ============================================

DROP POLICY IF EXISTS "Operators see their contractors" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors see own profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Operators can manage contractors" ON contractor_profiles;
DROP POLICY IF EXISTS "Contractors can update own profile" ON contractor_profiles;

CREATE POLICY "Members see contractors in their org" ON contractor_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins manage contractors" ON contractor_profiles
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- UPDATED RLS FOR JOBS
-- ============================================

DROP POLICY IF EXISTS "Operators see their jobs" ON jobs;
DROP POLICY IF EXISTS "Operators manage jobs" ON jobs;
DROP POLICY IF EXISTS "Contractors see assigned jobs" ON jobs;

CREATE POLICY "Members see jobs in their org" ON jobs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins manage jobs" ON jobs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Similar updates for job_assignments, job_notes, job_note_attachments

-- ============================================
-- UPDATED CONTRACTORS (public search stays separate)
-- ============================================
-- The public contractors table stays global (no organization_id)
-- This is for the contractor directory, not field management

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's current organization context
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS UUID AS $$
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Check if user has role in current org
CREATE OR REPLACE FUNCTION user_has_org_role(target_role TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND organization_id = current_organization_id()
        AND role = target_role
    );
$$ LANGUAGE sql STABLE;

-- Get all organizations for a user
CREATE OR REPLACE FUNCTION user_organizations()
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    role TEXT
) AS $$
    SELECT o.id, o.name, o.name, om.role
    FROM organizations o
    JOIN organization_members om ON o.id = om.organization_id
    WHERE om.user_id = auth.uid() AND om.status = 'active';
$$ LANGUAGE sql;
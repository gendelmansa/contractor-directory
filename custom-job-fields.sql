-- Custom Job Fields for Field Manager App

-- ============================================
-- CUSTOM JOB FIELDS
-- ============================================
CREATE TABLE custom_job_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
    placeholder TEXT,
    options TEXT[] DEFAULT '{}',
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(operator_id, field_name)
);

-- Index for fetching fields by operator
CREATE INDEX idx_custom_job_fields_operator ON custom_job_fields(operator_id);
CREATE INDEX idx_custom_job_fields_display_order ON custom_job_fields(display_order);

-- RLS for custom_job_fields
ALTER TABLE custom_job_fields ENABLE ROW LEVEL SECURITY;

-- Operators can see and manage their own fields
CREATE POLICY "Operators manage their custom fields" ON custom_job_fields
    FOR ALL USING (
        operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
    );

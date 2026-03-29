# Multi-Tenant Architecture for Field Manager App

## Current State
- Single organization: all operators in one pool
- Operators linked directly to `auth.users(id)`
- RLS policies check `user_id = auth.uid()` directly

## Target State
- Multiple organizations, each with own admin + operators + contractors
- Organization-level data isolation
- Role-based access within each org

---

## Schema Changes

### 1. New Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Core org entity (id, name, slug, settings) |
| `organization_members` | Links users to orgs with roles (owner, admin, member, contractor) |
| `contractor_invitations` | Email-based invite system with tokens |

### 2. Modified Tables

| Table | Change |
|-------|--------|
| `operators` | Add `organization_id` FK (NOT NULL) |
| `contractor_profiles` | Add `organization_id` FK (NOT NULL) |
| `jobs` | Add `organization_id` FK (NOT NULL) |
| `job_assignments` | Inherits via jobs |
| `job_notes` | Inherits via job_assignments |

### 3. Preserved (Global)
- `contractors` - Public contractor directory stays global (not org-specific)

---

## Data Separation Strategy

### Isolation Mechanism
1. **Foreign Keys**: All org-specific tables have `organization_id` NOT NULL
2. **RLS Policies**: Check membership via `organization_members` table
3. **Cascade Deletes**: Org deletion removes all related data

### RLS Pattern
```sql
-- Example: Jobs policy
CREATE POLICY "Members see jobs in their org" ON jobs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );
```

### Query Helper
```sql
SELECT current_organization_id(); -- Returns user's active org
SELECT user_has_org_role('admin'); -- Check role in current org
```

---

## How Operators Join/Create Orgs

### Scenario A: Create New Organization
1. User signs up → creates operator profile (existing flow)
2. **New**: Auto-create `organizations` record + `organization_members` entry with `owner` role
3. User becomes org owner automatically

### Scenario B: Join Existing Organization
1. Admin generates invite link (via `contractor_invitations`)
2. Contractor clicks link → sign up/login → membership created with `contractor` role
3. Can also be added directly by admin (no invite needed)

### Scenario C: Switch Between Orgs
- User can be member of multiple orgs
- UI selects "active" org (stored in session or query param)
- All queries filter by active org

---

## Role Assignment Within Org

| Role | Permissions |
|------|-------------|
| `owner` | Full control, delete org, transfer ownership |
| `admin` | Manage members, jobs, contractors |
| `member` | View jobs, assigned work |
| `contractor` | View assigned jobs, update progress, add notes |

Role stored in `organization_members.role`, not in individual tables.

---

## Migration Approach

### Phase 1: Add Tables (backward compatible)
1. Create `organizations` table
2. Create `organization_members` table
3. Create `contractor_invitations` table

### Phase 2: Populate & Add Columns
1. Create org for each existing operator (1:1 migration)
2. Add `organization_id` to operators/contractor_profiles/jobs
3. Populate from operator relationship
4. Add initial memberships (owner = original operator user)

### Phase 3: Update RLS (backward compatible)
1. Add new RLS policies checking org membership
2. Keep old policies temporarily for rollback
3. Test thoroughly

### Phase 4: Remove Deprecated
1. Remove direct `user_id` checks from policies
2. (Optional) Remove `user_id` from operators if no longer needed

### Phase 5: Add Org Switching
1. Add UI for org switcher
2. Add `current_organization_id()` helper usage in queries

---

## Key Design Decisions

1. **organization_id on all org-scoped tables** - Explicit FK ensures data integrity, simplifies RLS
2. **organization_members junction table** - Flexible many:many user↔org with roles
3. **Slug for org URLs** - Clean URLs like `/org/acme-construction/dashboard`
4. **Preserve public contractors table** - Not org-scoped, stays global for directory
5. **Cascade delete** - Deleting org cleans up all related data

---

## Files

- `multi-tenant-migration.sql` - Full migration script
- `schema-field-app.sql` - Original schema (reference)
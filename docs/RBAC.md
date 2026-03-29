# RBAC Design Report - Field Manager App

## 1. RBAC Permission Matrix

| Permission | Admin | Operator | Contractor |
|------------|-------|----------|------------|
| **Users** ||||
| Create operator | ✅ | ❌ | ❌ |
| View all operators in org | ✅ | ❌ | ❌ |
| Update/delete operators | ✅ | ❌ | ❌ |
| Manage own profile | ✅ | ✅ | ✅ |
| **Contractors** ||||
| View all contractors in org | ✅ | Own only | Self only |
| Create contractors | ✅ | ✅ | ❌ |
| Update/delete contractors | ✅ | Own only | Self only |
| **Jobs** ||||
| View all jobs in org | ✅ | Own only | Assigned only |
| Create jobs | ✅ | ✅ | ❌ |
| Update/delete any job | ✅ | Own only | Assigned only |
| Assign contractors | ✅ | ✅ | ❌ |
| **Custom Fields** ||||
| Create custom job fields | ✅ | ❌ | ❌ |
| View/update custom fields | ✅ | ❌ | ❌ |
| **Data** ||||
| Export org data | ✅ | ❌ | ❌ |
| View all org reports | ✅ | Own only | ❌ |

## 2. Database Changes Required

### New Tables
1. **`organizations`** - Multi-tenant support
   - `id` (UUID, PK)
   - `name` (TEXT)
   - `slug` (TEXT, UNIQUE)
   - `plan` (TEXT: free/pro/enterprise)

2. **`custom_job_fields`** - Admin-only custom fields
   - `id` (UUID, PK)
   - `organization_id` (UUID, FK → organizations)
   - `field_name`, `field_type`, `field_label`, `options`, etc.

### Schema Updates
1. **`operators` table** - Add:
   - `role` (TEXT: admin/operator/contractor, NOT NULL, default 'operator')
   - `organization_id` (UUID, FK → organizations)

2. **Indexes** for performance:
   - `idx_operators_role`
   - `idx_operators_user_role`
   - `idx_operators_org`
   - `idx_custom_job_fields_org`

### User Metadata Sync
- Trigger: `sync_user_role_to_metadata()` - automatically syncs role to `auth.users.raw_user_meta_data`

## 3. RLS Policy Updates

### Operators Table
| Policy | Condition |
|--------|-----------|
| Admins see org operators | `role = 'admin' AND organization_id = user_org` |
| Admins manage org operators | Same as above + ALL |
| Operators see own record | `user_id = auth.uid()` |
| Operators update own record | Same |

### Contractor Profiles
| Policy | Condition |
|--------|-----------|
| Admins see org contractors | `operator_id IN (SELECT ... WHERE role IN ('admin','operator'))` |
| Admins manage org contractors | ALL + same condition |
| Operators see their contractors | `operator_id IN (SELECT ... WHERE user_id = auth.uid() AND role = 'operator')` |
| Contractors see self | `user_id = auth.uid()` |

### Jobs
| Policy | Condition |
|--------|-----------|
| Admins see all org jobs | `operator_id IN (SELECT ... organization_id = user_org)` |
| Operators see own jobs | `operator_id IN (SELECT ... WHERE user_id = auth.uid() AND role = 'operator')` |
| Contractors see assigned jobs | `job_id IN (SELECT job_id FROM job_assignments WHERE contractor_id = own_profile)` |

### Custom Job Fields
- **Admin only** - Full CRUD within their organization

## 4. Helper Functions (for application logic)

```sql
-- Get user's role
get_user_role(user_uuid) → TEXT

-- Get user's organization ID
get_user_org_id(user_uuid) → UUID

-- Check if user is admin
is_admin(user_uuid) → BOOLEAN

-- Check if admin can manage specific operator
can_manage_operator(admin_id, target_operator_id) → BOOLEAN
```

## 5. Multi-Tenancy Isolation

- **Organization-level**: All queries filter by `organization_id`
- **Admin access**: Limited to their organization (not cross-tenant)
- **Data isolation**: RLS policies enforce org boundaries automatically

## 6. Implementation Notes

1. Run migration: `migrations/20260327_rbac.sql`
2. Default existing operators to `role = 'operator'`
3. Create organization record for existing data before enabling RBAC
4. Test admin role creation (first admin should be created via service_role)
5. Frontend needs role-aware UI - hide admin-only features from operators/contractors
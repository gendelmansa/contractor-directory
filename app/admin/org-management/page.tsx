'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, getUserRole } from '@/lib/auth';

interface Member {
  id: string;
  user_id: string;
  email: string;
  role: string;
  status: string;
  joined_at: string;
  users?: {
    id: string;
    email: string;
    created_at: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

interface Stats {
  totalOperators: number;
  totalContractors: number;
  totalJobs: number;
}

export default function OrgManagementPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOperators: 0, totalContractors: 0, totalJobs: 0 });
  
  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ link?: string; userExists?: boolean; error?: string } | null>(null);
  
  // UI state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login/';
        return;
      }
      setUser(user);
      
      const role = getUserRole(user);
      if (role !== 'admin') {
        alert('Access denied. Admin role required.');
        window.location.href = '/dashboard/';
        return;
      }
      setIsAdmin(true);
      
      // Get user's organization
      const { data: operator } = await supabase
        .from('operators')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!operator?.organization_id) {
        alert('No organization found. Please contact support.');
        window.location.href = '/dashboard/';
        return;
      }
      
      loadOrgData(supabase, operator.organization_id, user.id);
    };
    checkUser();
  }, []);

  const loadOrgData = async (supabase: any, orgId: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/org-management/members?userId=${userId}&orgId=${orgId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load organization');
      }
      
      setOrganization(data.organization);
      setMembers(data.members || []);
      setInvitations(data.invitations || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading org data:', error);
      alert('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !organization) return;
    
    setInviting(true);
    setInviteResult(null);
    
    try {
      const response = await fetch('/api/admin/org-management/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          inviterUserId: user.id,
          inviterOrgId: organization.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }
      
      setInviteResult({
        link: data.inviteLink,
        userExists: data.userExists
      });
      
      // Show toast notification
      if (data.userExists) {
        setToast({ message: `${inviteEmail.trim()} has been added to the organization.`, type: 'success' });
      } else {
        setToast({ message: `Invitation sent to ${inviteEmail.trim()}. They will receive an email to join ${organization.name}.`, type: 'success' });
      }
      setTimeout(() => setToast(null), 5000);
      
      // Refresh data
      const supabase = getSupabaseClient();
      const { data: operator } = await supabase
        .from('operators')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (operator?.organization_id) {
        loadOrgData(supabase, operator.organization_id, user.id);
      }
      
      // Reset form
      setInviteEmail('');
      setInviteRole('operator');
      
    } catch (error: any) {
      setInviteResult({ error: error.message });
      setToast({ message: 'Failed to send invite. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!organization || !user) return;
    
    setActionLoading(memberId);
    try {
      const response = await fetch('/api/admin/org-management/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateRole',
          memberId,
          newRole,
          orgId: organization.id,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }
      
      // Update local state
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setEditingMemberId(null);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    if (!organization || !user) return;
    if (!confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'disable' : 'enable'} this member?`)) return;
    
    setActionLoading(memberId);
    try {
      const response = await fetch('/api/admin/org-management/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          memberId,
          newStatus,
          orgId: organization.id,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }
      
      // Update local state
      setMembers(members.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!organization || !user) return;
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the organization?`)) return;
    
    setActionLoading(memberId);
    try {
      const response = await fetch('/api/admin/org-management/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          memberId,
          orgId: organization.id,
          userId: user.id
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }
      
      // Update local state
      setMembers(members.filter(m => m.id !== memberId));
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login/';
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      active: { background: '#dcfce7', color: '#166534' },
      pending: { background: '#fef3c7', color: '#92400e' },
      invited: { background: '#e0e7ff', color: '#3730a3' },
      disabled: { background: '#fef2f2', color: '#991b1b' }
    };
    return styles[status] || { background: '#f3f4f6', color: '#64748b' };
  };

  const getRoleBadgeStyle = (role: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      owner: { background: '#fdf4ff', color: '#a21caf' },
      admin: { background: '#e0e7ff', color: '#3730a3' },
      operator: { background: '#dbeafe', color: '#1e40af' },
      contractor: { background: '#d1fae5', color: '#065f46' }
    };
    return styles[role] || { background: '#f3f4f6', color: '#64748b' };
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
        <div style={{ color: '#64748b' }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', 
        padding: '1rem 1.25rem', 
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '700' }}>🏢 Organization Management</h1>
            {organization && (
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.25rem' }}>{organization.name}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => window.location.href = '/admin/job-fields/'}
              style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Job Fields
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/'}
              style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={signOut}
              style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Toast notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            background: toast.type === 'success' ? '#dcfce7' : '#fef2f2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            {toast.message}
          </div>
        )}

        {/* Organization Info */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1rem' }}>
            Organization Settings
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Organization Name</div>
              <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{organization?.name || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Plan</div>
              <div style={{ fontWeight: '600', color: '#1e3a5f', textTransform: 'capitalize' }}>{organization?.plan || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Operators</div>
              <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{stats.totalOperators}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Contractors</div>
              <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{stats.totalContractors}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Jobs</div>
              <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{stats.totalJobs}</div>
            </div>
          </div>
        </div>

        {/* Invite User Section */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f' }}>
              Invite New Member
            </h2>
            <button 
              onClick={() => { setShowInviteForm(!showInviteForm); setInviteResult(null); }}
              style={{ 
                padding: '0.5rem 1rem', 
                background: showInviteForm ? '#f3f4f6' : 'linear-gradient(135deg, #1e3a5f, #2d5a87)', 
                color: showInviteForm ? '#374151' : 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {showInviteForm ? 'Cancel' : '+ Invite'}
            </button>
          </div>

          {showInviteForm && (
            <form onSubmit={handleInvite}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '10px', 
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <select 
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    style={{ 
                      padding: '0.875rem', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '10px', 
                      fontSize: '0.875rem',
                      minWidth: '130px'
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="contractor">Contractor</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={inviting}
                style={{ 
                  width: '100%',
                  padding: '0.875rem', 
                  background: inviting ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #2d5a87)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: inviting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                {inviting ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </form>
          )}

          {inviteResult && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              borderRadius: '10px',
              background: inviteResult.error ? '#fef2f2' : '#dcfce7',
              color: inviteResult.error ? '#991b1b' : '#166534'
            }}>
              {inviteResult.error ? (
                <div style={{ fontWeight: '500' }}>❌ {inviteResult.error}</div>
              ) : (
                <div>
                  {inviteResult.userExists ? (
                    <div style={{ fontWeight: '500' }}>✅ Member added! They have an account and can now access the organization.</div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>✅ Invitation sent!</div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Share this link with the invitee:</div>
                      <div style={{ 
                        background: 'white', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                        cursor: 'pointer',
                        border: '1px solid #e5e7eb'
                      }} onClick={() => {
                        navigator.clipboard.writeText(inviteResult.link || '');
                        alert('Link copied to clipboard!');
                      }}>
                        {inviteResult.link}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
                        Click to copy • Link expires in 7 days
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1rem' }}>
              Pending Invitations ({invitations.length})
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {invitations.map((inv) => (
                <div key={inv.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1e3a5f' }}>{inv.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {inv.role} • Sent {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: '#e0e7ff', 
                    color: '#3730a3', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem'
                  }}>
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1rem' }}>
            Organization Members ({members.length})
          </h2>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
              No members yet. Invite someone to get started.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {members.map((member) => {
                const statusStyle = getStatusBadgeStyle(member.status);
                const roleStyle = getRoleBadgeStyle(member.role);
                
                return (
                  <div key={member.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: member.status === 'disabled' ? '1px solid #fecaca' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '0.25rem' }}>
                        {member.email}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: roleStyle.background, 
                          color: roleStyle.color, 
                          borderRadius: '6px', 
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {member.role}
                        </span>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: statusStyle.background, 
                          color: statusStyle.color, 
                          borderRadius: '6px', 
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {member.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {member.role !== 'owner' && (
                        <>
                          {editingMemberId === member.id ? (
                            <>
                              <select 
                                value={editingRole}
                                onChange={e => handleRoleChange(member.id, e.target.value)}
                                disabled={actionLoading === member.id}
                                style={{ 
                                  padding: '0.5rem', 
                                  border: '1px solid #e5e7eb', 
                                  borderRadius: '6px', 
                                  fontSize: '0.75rem'
                                }}
                              >
                                <option value="admin">Admin</option>
                                <option value="operator">Operator</option>
                                <option value="contractor">Contractor</option>
                              </select>
                              <button 
                                onClick={() => setEditingMemberId(null)}
                                style={{ 
                                  padding: '0.5rem', 
                                  background: '#f3f4f6', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => { setEditingMemberId(member.id); setEditingRole(member.role); }}
                              disabled={actionLoading === member.id}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: '#f0f4f8', 
                                color: '#1e3a5f', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              Change Role
                            </button>
                          )}
                          
                          {member.status === 'disabled' ? (
                            <button 
                              onClick={() => handleStatusChange(member.id, 'active')}
                              disabled={actionLoading === member.id}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: '#dcfce7', 
                                color: '#166534', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              Enable
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(member.id, 'disabled')}
                              disabled={actionLoading === member.id}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: '#fef2f2', 
                                color: '#dc2626', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              Disable
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleRemoveMember(member.id, member.email)}
                            disabled={actionLoading === member.id}
                            style={{ 
                              padding: '0.5rem 0.75rem', 
                              background: '#dc2626', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {member.role === 'owner' && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Owner (cannot modify)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
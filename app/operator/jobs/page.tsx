'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/auth';

interface Job {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: string;
  priority: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_hours: number | null;
  notes: string | null;
  organization_id: string;
  operator_id: string;
  created_at: string;
}

interface Contractor {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  skills: string[];
  bio: string | null;
  is_active: boolean;
  organization_id: string;
}

interface Assignment {
  id: string;
  job_id: string;
  contractor_id: string;
  status: string;
  progress_percent: number;
  contractor: Contractor;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';
type SortType = 'date' | 'priority' | 'status';

export default function OperatorJobsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [operatorRole, setOperatorRole] = useState<string | null>(null);
  
  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Filters & Sorting
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  
  // Modals & UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    scheduled_date: '',
    scheduled_time: '',
    priority: 'normal',
    estimated_hours: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = getSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      window.location.href = '/login';
      return;
    }
    
    setUser(authUser);
    
    // Get operator profile with organization_id and role
    const { data: operator } = await supabase
      .from('operators')
      .select('id, organization_id, role')
      .eq('user_id', authUser.id)
      .single();
    
    if (!operator) {
      window.location.href = '/login';
      return;
    }
    
    if (operator.role !== 'operator' && operator.role !== 'admin') {
      alert('Access denied. Operators only.');
      window.location.href = '/dashboard';
      return;
    }
    
    setOperatorId(operator.id);
    setOrganizationId(operator.organization_id);
    setOperatorRole(operator.role);
    
    await loadData(supabase, operator.organization_id);
  };

  const loadData = async (supabase: any, orgId: string) => {
    try {
      // Load all jobs for this organization
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('organization_id', orgId)
        .order('scheduled_date', { ascending: true });
      setJobs(jobsData || []);
      
      // Load contractors for this organization
      const { data: contractorData } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true);
      setContractors(contractorData || []);
      
      // Load all assignments for jobs in this org
      const jobIds = (jobsData || []).map((j: Job) => j.id);
      if (jobIds.length > 0) {
        const { data: assignmentData } = await supabase
          .from('job_assignments')
          .select(`
            *,
            contractor:contractor_profiles(*)
          `)
          .in('job_id', jobIds);
        setAssignments(assignmentData || []);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Stats calculation
  const stats = {
    pending: jobs.filter(j => j.status === 'pending').length,
    active: jobs.filter(j => j.status === 'in_progress').length,
    completedThisMonth: jobs.filter(j => {
      if (j.status !== 'completed') return false;
      const now = new Date();
      const jobDate = new Date(j.created_at);
      return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.scheduled_date || 0).getTime() - new Date(b.scheduled_date || 0).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
    } else {
      return a.status.localeCompare(b.status);
    }
  });

  // Get assignments for a job
  const getJobAssignments = (jobId: string) => {
    return assignments.filter(a => a.job_id === jobId);
  };

  // Get unassigned contractors for a job
  const getUnassignedContractors = (jobId: string) => {
    const assignedIds = getJobAssignments(jobId).map(a => a.contractor_id);
    return contractors.filter(c => !assignedIds.includes(c.id));
  };

  // Create job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !operatorId) return;
    
    setFormSubmitting(true);
    setFormError('');
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase.from('jobs').insert({
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        priority: formData.priority,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        notes: formData.notes || null,
        status: 'pending',
        organization_id: organizationId,
        operator_id: operatorId
      });
      
      if (error) throw error;
      
      // Reset form and close modal
      setFormData({
        title: '', description: '', address: '', city: '', state: '', zip_code: '',
        scheduled_date: '', scheduled_time: '', priority: 'normal', estimated_hours: '', notes: ''
      });
      setShowCreateModal(false);
      
      // Reload data
      await loadData(supabase, organizationId);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit job
  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    setFormSubmitting(true);
    setFormError('');
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          priority: formData.priority,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
          notes: formData.notes || null
        })
        .eq('id', selectedJob.id);
      
      if (error) throw error;
      
      setShowEditModal(false);
      setSelectedJob(null);
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId: string) => {
    const supabase = getSupabaseClient();
    
    try {
      // Delete assignments first
      await supabase.from('job_assignments').delete().eq('job_id', jobId);
      
      // Delete job
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      
      if (error) throw error;
      
      setDeleteConfirmJob(null);
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      alert('Error deleting job: ' + err.message);
    }
  };

  // Assign contractor
  const handleAssignContractor = async (jobId: string, contractorId: string) => {
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase.from('job_assignments').insert({
        job_id: jobId,
        contractor_id: contractorId,
        status: 'assigned',
        progress_percent: 0
      });
      
      if (error) throw error;
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      alert('Error assigning contractor: ' + err.message);
    }
  };

  // Unassign contractor
  const handleUnassignContractor = async (assignmentId: string) => {
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase.from('job_assignments').delete().eq('id', assignmentId);
      
      if (error) throw error;
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      alert('Error unassigning contractor: ' + err.message);
    }
  };

  // Update job status (quick actions)
  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) throw error;
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Update assignment progress
  const handleUpdateProgress = async (assignmentId: string, progress: number) => {
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase
        .from('job_assignments')
        .update({ 
          progress_percent: progress,
          status: progress === 100 ? 'completed' : 'in_progress'
        })
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      // Also update job status if completed
      if (progress === 100) {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
          await supabase.from('jobs').update({ status: 'completed' }).eq('id', assignment.job_id);
        }
      }
      
      await loadData(supabase, organizationId!);
    } catch (err: any) {
      alert('Error updating progress: ' + err.message);
    }
  };

  // Open edit modal with job data
  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description || '',
      address: job.address || '',
      city: job.city || '',
      state: job.state || '',
      zip_code: job.zip_code || '',
      scheduled_date: job.scheduled_date || '',
      scheduled_time: job.scheduled_time || '',
      priority: job.priority || 'normal',
      estimated_hours: job.estimated_hours?.toString() || '',
      notes: job.notes || ''
    });
    setFormError('');
    setShowEditModal(true);
  };

  // Open detail modal
  const openDetailModal = (job: Job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'normal': return '#2563eb';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
      case 'completed': return { bg: '#d1fae5', text: '#065f46' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Job Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Manage and assign jobs to contractors</p>
        </div>
        <button 
          onClick={signOut} 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Sign Out
        </button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending Jobs</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.active}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Active Jobs</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedThisMonth}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completed This Month</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Filter */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>Filter:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as FilterType)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="all">All Jobs</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Sort */}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.5rem' }}>Sort:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortType)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="date">By Date</option>
                <option value="priority">By Priority</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
          
          {/* Create Button */}
          <button 
            onClick={() => { setFormError(''); setShowCreateModal(true); }}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            + Create New Job
          </button>
        </div>

        {/* Jobs List */}
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {filteredJobs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No jobs found</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Create First Job
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Job Details</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Scheduled</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Contractor</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const jobAssignments = getJobAssignments(job.id);
                  const unassigned = getUnassignedContractors(job.id);
                  const statusColors = getStatusColor(job.status);
                  
                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{job.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.description || 'No description'}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '3px', 
                            background: getPriorityColor(job.priority) + '20',
                            color: getPriorityColor(job.priority),
                            fontWeight: '500'
                          }}>
                            {job.priority?.toUpperCase()}
                          </span>
                          {job.estimated_hours && (
                            <span style={{ fontSize: '0.7rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                              {job.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <div>{job.address}</div>
                        <div style={{ color: '#6b7280' }}>
                          {job.city}{job.city && job.state ? ', ' : ''}{job.state} {job.zip_code}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <div>{job.scheduled_date || 'Not set'}</div>
                        <div style={{ color: '#6b7280' }}>{job.scheduled_time || ''}</div>
                      </td>
                      <td style={{ padding: '1rem', minWidth: '150px' }}>
                        {jobAssignments.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {jobAssignments.map(a => (
                              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  background: '#dbeafe', 
                                  borderRadius: '4px', 
                                  fontSize: '0.75rem'
                                }}>
                                  {a.contractor?.name || a.contractor?.email?.split('@')[0] || 'Contractor'}
                                </span>
                                <div style={{ width: '60px', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                                  <div style={{ 
                                    width: `${a.progress_percent}%`, 
                                    height: '100%', 
                                    background: a.progress_percent === 100 ? '#10b981' : '#2563eb',
                                    borderRadius: '2px'
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem',
                          background: statusColors.bg,
                          color: statusColors.text,
                          fontWeight: '500'
                        }}>
                          {job.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button 
                            onClick={() => openDetailModal(job)}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#f3f4f6', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            View
                          </button>
                          {job.status === 'pending' && unassigned.length > 0 && (
                            <select 
                              onChange={(e) => e.target.value && handleAssignContractor(job.id, e.target.value)}
                              style={{ 
                                padding: '0.25rem', 
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db'
                              }}
                              defaultValue=""
                            >
                              <option value="">Assign...</option>
                              {unassigned.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name || c.email?.split('@')[0] || 'Contractor'}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Contractors Reference */}
        <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Available Contractors ({contractors.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {contractors.map(c => (
              <div key={c.id} style={{ 
                padding: '0.75rem', 
                background: '#f9fafb', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{c.name || 'Unknown'}</div>
                {c.email && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.email}</div>}
                {c.skills && c.skills.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {c.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.1rem 0.3rem', 
                        background: '#dbeafe', 
                        color: '#1e40af',
                        borderRadius: '3px'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {contractors.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem', gridColumn: '1 / -1', textAlign: 'center', padding: '1rem' }}>
                No contractors in your organization yet
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            width: '100%', 
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Job</h2>
            
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  placeholder="Job title"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  placeholder="Job description"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Street Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  placeholder="123 Main St"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>City</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    placeholder="Detroit"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>State</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    placeholder="MI"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>ZIP</label>
                  <input 
                    type="text" 
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    placeholder="48201"
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Scheduled Date</label>
                  <input 
                    type="date" 
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Scheduled Time</label>
                  <input 
                    type="time" 
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Estimated Hours</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    placeholder="2.5"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  placeholder="Additional notes for the contractor"
                />
              </div>
              
              {formError && (
                <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    opacity: formSubmitting ? 0.7 : 1
                  }}
                >
                  {formSubmitting ? 'Creating...' : 'Create Job'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#9ca3af', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            width: '100%', 
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Job</h2>
            
            <form onSubmit={handleEditJob}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Street Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>City</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>State</label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>ZIP</label>
                  <input 
                    type="text" 
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Scheduled Date</label>
                  <input 
                    type="date" 
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Scheduled Time</label>
                  <input 
                    type="time" 
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Estimated Hours</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              
              {formError && (
                <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    opacity: formSubmitting ? 0.7 : 1
                  }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setSelectedJob(null); }}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#9ca3af', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showDetailModal && selectedJob && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            width: '100%', 
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedJob.title}</h2>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem',
                background: getStatusColor(selectedJob.status).bg,
                color: getStatusColor(selectedJob.status).text,
                fontWeight: '500'
              }}>
                {selectedJob.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ fontSize: '0.875rem' }}>{selectedJob.description || 'No description provided'}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Location</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  {selectedJob.address && <div>{selectedJob.address}</div>}
                  {(selectedJob.city || selectedJob.state || selectedJob.zip_code) && (
                    <div>{[selectedJob.city, selectedJob.state, selectedJob.zip_code].filter(Boolean).join(', ')}</div>
                  )}
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Schedule</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  {selectedJob.scheduled_date || 'Not scheduled'}
                  {selectedJob.scheduled_time && <span> at {selectedJob.scheduled_time}</span>}
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Priority</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  background: getPriorityColor(selectedJob.priority) + '20',
                  color: getPriorityColor(selectedJob.priority),
                  fontWeight: '500'
                }}>
                  {selectedJob.priority?.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Estimated Hours</h3>
                <p style={{ fontSize: '0.875rem' }}>{selectedJob.estimated_hours ? `${selectedJob.estimated_hours} hours` : 'Not specified'}</p>
              </div>
            </div>
            
            {selectedJob.notes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>Notes</h3>
                <p style={{ fontSize: '0.875rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>{selectedJob.notes}</p>
              </div>
            )}
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem' }}>Assigned Contractors</h3>
              {(() => {
                const jobAssignments = getJobAssignments(selectedJob.id);
                if (jobAssignments.length === 0) {
                  return <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No contractors assigned yet</p>;
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {jobAssignments.map(a => (
                      <div key={a.id} style={{ 
                        padding: '1rem', 
                        background: '#f9fafb', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                            {a.contractor?.name || a.contractor?.email?.split('@')[0] || 'Contractor'}
                          </div>
                          {a.contractor?.email && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.contractor.email}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '80px', height: '6px', background: '#e5e7eb', borderRadius: '3px' }}>
                              <div style={{ 
                                width: `${a.progress_percent}%`, 
                                height: '100%', 
                                background: a.progress_percent === 100 ? '#10b981' : '#2563eb',
                                borderRadius: '3px'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', minWidth: '30px' }}>{a.progress_percent}%</span>
                          </div>
                          <button 
                            onClick={() => handleUnassignContractor(a.id)}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#fee2e2', 
                              color: '#dc2626',
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            {/* Quick Actions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedJob.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateJobStatus(selectedJob.id, 'in_progress')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Start Job
                  </button>
                )}
                {getJobAssignments(selectedJob.id).length > 0 && (
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        const assignment = getJobAssignments(selectedJob.id)[0];
                        handleUpdateProgress(assignment.id, parseInt(e.target.value));
                      }
                    }}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                    defaultValue=""
                  >
                    <option value="">Update Progress...</option>
                    <option value="25">25%</option>
                    <option value="50">50%</option>
                    <option value="75">75%</option>
                    <option value="100">Complete (100%)</option>
                  </select>
                )}
                {selectedJob.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateJobStatus(selectedJob.id, 'completed')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => { setShowDetailModal(false); openEditModal(selectedJob); }}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit Job
              </button>
              <button 
                onClick={() => setDeleteConfirmJob(selectedJob.id)}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  background: '#fee2e2', 
                  color: '#dc2626', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button 
                onClick={() => { setShowDetailModal(false); setSelectedJob(null); }}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  background: '#e5e7eb', 
                  color: '#374151', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmJob && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1001,
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            width: '100%', 
            maxWidth: '400px'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Confirm Delete</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleDeleteJob(deleteConfirmJob)}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  background: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteConfirmJob(null)}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  background: '#e5e7eb', 
                  color: '#374151', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
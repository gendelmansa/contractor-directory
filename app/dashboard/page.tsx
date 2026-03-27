'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/auth';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduled_date: string;
  scheduled_time: string;
}

interface Contractor {
  id: string;
  user_id: string;
  skills: string[];
  bio: string;
  is_active: boolean;
}

interface Assignment {
  id: string;
  job_id: string;
  contractor_id: string;
  progress_percent: number;
  status: string;
  job: Job;
  contractor: Contractor;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', address: '', scheduled_date: '', scheduled_time: '', priority: 'normal' });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      
      // Get operator profile
      const { data: operator } = await supabase
        .from('operators')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!operator) {
        window.location.href = '/login';
        return;
      }

      // Load data
      loadDashboard(supabase, operator.id);
    };
    checkUser();
  }, []);

  const loadDashboard = async (supabase: any, operatorId: string) => {
    try {
      // Get contractors
      const { data: contractorData } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('operator_id', operatorId);
      setContractors(contractorData || []);

      // Get jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('operator_id', operatorId)
        .order('scheduled_date', { ascending: true });
      setJobs(jobsData || []);

      // Get assignments with job and contractor details
      const { data: assignmentData } = await supabase
        .from('job_assignments')
        .select(`
          *,
          job:jobs(*),
          contractor:contractor_profiles(*)
        `)
        .in('job_id', (jobsData || []).map((j: Job) => j.id));

      setAssignments(assignmentData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();

    const { data: operator } = await supabase
      .from('operators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!operator) return;

    const { error } = await supabase.from('jobs').insert({
      operator_id: operator.id,
      ...newJob,
      status: 'pending'
    });

    if (!error) {
      setShowNewJob(false);
      setNewJob({ title: '', description: '', address: '', scheduled_date: '', scheduled_time: '', priority: 'normal' });
      loadDashboard(supabase, operator.id);
    }
  };

  const assignJob = async (jobId: string, contractorId: string) => {
    const supabase = getSupabaseClient();
    await supabase.from('job_assignments').insert({ job_id: jobId, contractor_id: contractorId, status: 'assigned' });
    loadDashboard(supabase, user.id);
  };

  const updateProgress = async (assignmentId: string, progress: number) => {
    const supabase = getSupabaseClient();
    await supabase.from('job_assignments').update({ progress_percent: progress }).eq('id', assignmentId);
    loadDashboard(supabase, user.id);
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const activeJobs = assignments.filter(a => a.status !== 'completed');
  const completedJobs = assignments.filter(a => a.status === 'completed');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📋 Operator Dashboard</h1>
        <button onClick={signOut} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{activeJobs.length}</div>
            <div style={{ color: '#6b7280' }}>Active Jobs</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{completedJobs.length}</div>
            <div style={{ color: '#6b7280' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{contractors.length}</div>
            <div style={{ color: '#6b7280' }}>Contractors</div>
          </div>
        </div>

        {/* New Job Button */}
        <button onClick={() => setShowNewJob(true)} style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '2rem' }}>+ New Job</button>

        {/* New Job Form Modal */}
        {showNewJob && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create New Job</h2>
              <form onSubmit={createJob}>
                <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <textarea placeholder="Description" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input placeholder="Address" value={newJob.address} onChange={e => setNewJob({...newJob, address: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="date" value={newJob.scheduled_date} onChange={e => setNewJob({...newJob, scheduled_date: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="time" value={newJob.scheduled_time} onChange={e => setNewJob({...newJob, scheduled_time: e.target.value})} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <select value={newJob.priority} onChange={e => setNewJob({...newJob, priority: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Create</button>
                  <button type="button" onClick={() => setShowNewJob(false)} style={{ flex: 1, padding: '0.5rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Queue */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Job Queue</h2>
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          {activeJobs.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No active jobs</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Job</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Contractor</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Progress</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '500' }}>{a.job?.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.job?.description?.slice(0, 50)}...</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {a.contractor ? (
                        <span style={{ padding: '0.25rem 0.5rem', background: '#dbeafe', borderRadius: '4px', fontSize: '0.75rem' }}>Contractor</span>
                      ) : (
                        <select onChange={(e) => e.target.value && assignJob(a.job_id, e.target.value)} style={{ padding: '0.25rem', fontSize: '0.75rem' }}>
                          <option value="">Assign...</option>
                          {contractors.map(c => <option key={c.id} value={c.id}>{c.user_id.slice(0, 8)}...</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e5e7eb', borderRadius: '3px' }}>
                          <div style={{ width: `${a.progress_percent}%`, height: '100%', background: a.progress_percent === 100 ? '#10b981' : '#2563eb', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem' }}>{a.progress_percent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: a.job?.status === 'in_progress' ? '#fef3c7' : '#d1fae5', color: a.job?.status === 'in_progress' ? '#92400e' : '#065f46' }}>
                        {a.job?.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {a.job?.scheduled_date} {a.job?.scheduled_time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Unassigned Jobs */}
        {jobs.filter(j => !assignments.find(a => a.job_id === j.id)).length > 0 && (
          <>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '2rem 0 1rem' }}>Unassigned Jobs</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {jobs.filter(j => !assignments.find(a => a.job_id === j.id)).map(j => (
                <div key={j.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{j.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{j.scheduled_date}</div>
                  </div>
                  <select onChange={(e) => e.target.value && assignJob(j.id, e.target.value)} style={{ padding: '0.5rem' }}>
                    <option value="">Assign contractor...</option>
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.user_id.slice(0, 8)}...</option>)}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
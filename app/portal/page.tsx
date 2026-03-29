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
  estimated_hours: number;
}

interface Assignment {
  id: string;
  job_id: string;
  contractor_id: string;
  progress_percent: number;
  status: string;
  job: Job;
}

interface JobNote {
  id: string;
  content: string;
  note_type: string;
  created_at: string;
}

export default function PortalPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notes, setNotes] = useState<Record<string, JobNote[]>>({});
  const [user, setUser] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<Assignment | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showNoProfile, setShowNoProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      loadPortal(supabase, user.id);
    };
    checkUser();
  }, []);

  const loadPortal = async (supabase: any, userId: string) => {
    try {
      // Get contractor profile
      const { data: contractor } = await supabase
        .from('contractor_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!contractor) {
        // No profile yet - show empty state with option to create
        setLoading(false);
        setShowNoProfile(true);
        return;
      }

      // Get assignments with job details
      const { data: assignmentData } = await supabase
        .from('job_assignments')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('contractor_id', contractor.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      setAssignments(assignmentData || []);

      // Load notes for each assignment
      if (assignmentData) {
        const notesMap: Record<string, JobNote[]> = {};
        for (const a of assignmentData) {
          const { data: notesData } = await supabase
            .from('job_notes')
            .select('*')
            .eq('assignment_id', a.id)
            .order('created_at', { ascending: false });
          notesMap[a.id] = notesData || [];
        }
        setNotes(notesMap);
      }
    } catch (error) {
      console.error('Error loading portal:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (assignmentId: string, progress: number) => {
    const supabase = getSupabaseClient();
    await supabase.from('job_assignments').update({ 
      progress_percent: progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'assigned'
    }).eq('id', assignmentId);
    loadPortal(supabase, user.id);
    const assignment = assignments.find(a => a.id === assignmentId);
    setToast({ message: progress === 100 ? 'Job completed!' : `Progress updated to ${progress}%`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const startJob = async (assignmentId: string) => {
    const supabase = getSupabaseClient();
    await supabase.from('job_assignments').update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    }).eq('id', assignmentId);
    
    // Also update job status
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', assignment.job_id);
    }
    
    loadPortal(supabase, user.id);
    setToast({ message: 'Job started!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const completeJob = async (assignmentId: string) => {
    const supabase = getSupabaseClient();
    await supabase.from('job_assignments').update({ 
      status: 'completed',
      progress_percent: 100,
      completed_at: new Date().toISOString()
    }).eq('id', assignmentId);

    // Update job status
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      await supabase.from('jobs').update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', assignment.job_id);
    }
    
    loadPortal(supabase, user.id);
    setToast({ message: 'Job marked as complete!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !newNote.trim()) return;

    const supabase = getSupabaseClient();
    await supabase.from('job_notes').insert({
      assignment_id: selectedJob.id,
      content: newNote,
      note_type: 'general'
    });

    setNewNote('');
    setShowNoteForm(false);
    loadPortal(supabase, user.id);
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  if (showNoProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🔧 Contractor Portal</h1>
          <button onClick={signOut} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button>
        </header>
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>No Profile Found</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              You don't have a contractor profile yet. Please contact your operator to be added to their team.
            </p>
            <button onClick={signOut} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </main>
      </div>
    );
  }

  const activeJobs = assignments.filter(a => a.job?.status !== 'completed');
  const completedJobs = assignments.filter(a => a.job?.status === 'completed');

  // Filter based on tab
  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🔧 Contractor Portal</h1>
        <button onClick={signOut} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}>
            {toast.message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'active' ? '#2563eb' : '#e5e7eb',
              color: activeTab === 'active' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Active ({activeJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'completed' ? '#2563eb' : '#e5e7eb',
              color: activeTab === 'completed' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Completed ({completedJobs.length})
          </button>
        </div>

        {/* Jobs based on tab */}
        {displayedJobs.length === 0 ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
            {activeTab === 'active' ? 'No active jobs assigned to you.' : 'No completed jobs yet.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {displayedJobs.map((a) => (
              <div key={a.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${a.status === 'in_progress' ? '#10b981' : '#2563eb'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{a.job?.title}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{a.job?.description}</p>
                    {a.job?.address && (
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📍 {a.job?.address}, {a.job?.city}, {a.job?.state} {a.job?.zip_code}</p>
                    )}
                    {a.job?.scheduled_date && (
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>📅 {a.job?.scheduled_date} {a.job?.scheduled_time}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', background: a.status === 'in_progress' ? '#d1fae5' : '#dbeafe', color: a.status === 'in_progress' ? '#065f46' : '#1e40af' }}>
                      {a.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>Progress</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{a.progress_percent}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
                    <div style={{ width: `${a.progress_percent}%`, height: '100%', background: a.progress_percent === 100 ? '#10b981' : '#2563eb', borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {a.status === 'assigned' && (
                    <button onClick={() => startJob(a.id)} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Start Job
                    </button>
                  )}
                  <button onClick={() => setSelectedJob(a)} style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Update Progress
                  </button>
                  <button onClick={() => { setSelectedJob(a); setShowNoteForm(true); }} style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add Note
                  </button>
                  {a.progress_percent > 0 && (
                    <button onClick={() => completeJob(a.id)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Mark Complete
                    </button>
                  )}
                </div>

                {/* Notes Preview */}
                {notes[a.id]?.length > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>Recent Notes:</div>
                    {notes[a.id].slice(0, 2).map(n => (
                      <div key={n.id} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        • {n.content.slice(0, 60)}...
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress Update Modal */}
        {selectedJob && !showNoteForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Update Progress</h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>{selectedJob.job?.title}</p>
              
              <div style={{ marginBottom: '1rem' }}>
                {[0, 25, 50, 75, 100].map(p => (
                  <button
                    key={p}
                    onClick={() => { updateProgress(selectedJob.id, p); setSelectedJob(null); }}
                    style={{ display: 'block', width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: selectedJob.progress_percent === p ? '#2563eb' : '#f3f4f6', color: selectedJob.progress_percent === p ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {p === 0 ? 'Not Started' : p === 100 ? 'Complete' : `${p}% - In Progress`}
                  </button>
                ))}
              </div>
              
              <button onClick={() => setSelectedJob(null)} style={{ width: '100%', padding: '0.5rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteForm && selectedJob && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Add Note</h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{selectedJob.job?.title}</p>
              
              <form onSubmit={addNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Describe what you did, issues found, or completion details..."
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}>Add Note</button>
                  <button type="button" onClick={() => { setShowNoteForm(false); setNewNote(''); }} style={{ flex: 1, padding: '0.75rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
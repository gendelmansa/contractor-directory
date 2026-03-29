'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, getUserRole } from '@/lib/auth';

interface CustomField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  placeholder: string;
  options: string[];
  is_required: boolean;
  display_order: number;
  created_at: string;
}

type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';

export default function JobFieldsPage() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text' as FieldType,
    placeholder: '',
    options: '',
    is_required: false,
    display_order: 0
  });

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
      if (role !== 'operator') {
        window.location.href = '/dashboard/';
        return;
      }

      loadFields(supabase);
    };
    checkUser();
  }, []);

  const loadFields = async (supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('custom_job_fields')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.field_name.trim()) {
      newErrors.field_name = 'Field name is required';
    } else if (!/^[a-z_][a-z0-9_]*$/.test(formData.field_name)) {
      newErrors.field_name = 'Use lowercase letters, numbers, and underscores only';
    } else if (fields.some(f => f.field_name === formData.field_name && f.id !== editingField?.id)) {
      newErrors.field_name = 'Field name already exists';
    }

    if (!formData.field_label.trim()) {
      newErrors.field_label = 'Display label is required';
    }

    if ((formData.field_type === 'select' || formData.field_type === 'multiselect') && !formData.options.trim()) {
      newErrors.options = 'Options are required for select fields';
    }

    if ((formData.field_type === 'select' || formData.field_type === 'multiselect') && formData.options.trim()) {
      try {
        JSON.parse(formData.options);
      } catch {
        newErrors.options = 'Options must be valid JSON array';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const supabase = getSupabaseClient();
    
    let options: string[] = [];
    if (formData.field_type === 'select' || formData.field_type === 'multiselect') {
      try {
        options = JSON.parse(formData.options);
      } catch {
        return;
      }
    }

    const fieldData = {
      field_name: formData.field_name.trim(),
      field_label: formData.field_label.trim(),
      field_type: formData.field_type,
      placeholder: formData.placeholder.trim() || null,
      options,
      is_required: formData.is_required,
      display_order: formData.display_order
    };

    try {
      if (editingField) {
        const { error } = await supabase
          .from('custom_job_fields')
          .update(fieldData)
          .eq('id', editingField.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_job_fields')
          .insert(fieldData);
        if (error) throw error;
      }

      resetForm();
      loadFields(supabase);
    } catch (error) {
      console.error('Error saving field:', error);
      setErrors({ submit: 'Failed to save field. Please try again.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field? This will also remove data from jobs using this field.')) return;

    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from('custom_job_fields')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadFields(supabase);
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const startEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type as FieldType,
      placeholder: field.placeholder || '',
      options: field.options.length > 0 ? JSON.stringify(field.options) : '',
      is_required: field.is_required,
      display_order: field.display_order
    });
    setShowForm(true);
    setErrors({});
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      placeholder: '',
      options: '',
      is_required: false,
      display_order: fields.length
    });
    setErrors({});
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/login/';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      boolean: 'Yes/No',
      select: 'Dropdown',
      multiselect: 'Multi-select'
    };
    return labels[type] || type;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '700' }}>⚙️ Custom Job Fields</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => window.location.href = '/admin/org-management/'}
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
              Organization
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
              ← Dashboard
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

      <main style={{ padding: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Description */}
        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '0.5rem' }}>
            Custom Job Fields
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Add custom fields to capture additional information on jobs. Fields appear when creating or editing jobs.
          </p>
        </div>

        {/* Add Field Button */}
        <button 
          onClick={() => { setFormData({ ...formData, display_order: fields.length }); setShowForm(true); }}
          style={{ 
            width: '100%',
            padding: '0.875rem', 
            background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}
        >
          + Add Custom Field
        </button>

        {/* Fields List */}
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '0.75rem' }}>
          Existing Fields ({fields.length})
        </h2>

        {fields.length === 0 ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            No custom fields yet. Click "Add Custom Field" to create one.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {fields.map((field) => (
              <div key={field.id} style={{ 
                background: 'white', 
                padding: '1rem', 
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a5f' }}>{field.field_label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{field.field_name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => startEdit(field)}
                      style={{ 
                        padding: '0.375rem 0.75rem', 
                        background: '#f0f4f8', 
                        color: '#1e3a5f', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(field.id)}
                      style={{ 
                        padding: '0.375rem 0.75rem', 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: '#e0e7ff', 
                    color: '#3730a3', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem'
                  }}>
                    {getTypeLabel(field.field_type)}
                  </span>
                  {field.is_required && (
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem'
                    }}>
                      Required
                    </span>
                  )}
                  {field.placeholder && (
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: '#f3f4f6', 
                      color: '#64748b', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem'
                    }}>
                      {field.placeholder}
                    </span>
                  )}
                  {field.options.length > 0 && (
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: '#dcfce7', 
                      color: '#166534', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem'
                    }}>
                      {field.options.length} options
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Field Modal */}
      {showForm && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 200
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '450px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e3a5f' }}>
              {editingField ? 'Edit Field' : 'Add Custom Field'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                  Field Name *
                </label>
                <input 
                  value={formData.field_name}
                  onChange={e => setFormData({...formData, field_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  placeholder="e.g., property_size"
                  style={{ width: '100%', padding: '0.875rem', border: errors.field_name ? '2px solid #dc2626' : '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} 
                />
                {errors.field_name && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.field_name}</div>}
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Internal name (lowercase, no spaces)</div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                  Display Label *
                </label>
                <input 
                  value={formData.field_label}
                  onChange={e => setFormData({...formData, field_label: e.target.value})}
                  placeholder="e.g., Property Size"
                  style={{ width: '100%', padding: '0.875rem', border: errors.field_label ? '2px solid #dc2626' : '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} 
                />
                {errors.field_label && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.field_label}</div>}
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                  Field Type
                </label>
                <select 
                  value={formData.field_type}
                  onChange={e => setFormData({...formData, field_type: e.target.value as FieldType})}
                  style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Yes/No (Checkbox)</option>
                  <option value="select">Dropdown (Single)</option>
                  <option value="multiselect">Multi-select</option>
                </select>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                  Placeholder Text
                </label>
                <input 
                  value={formData.placeholder}
                  onChange={e => setFormData({...formData, placeholder: e.target.value})}
                  placeholder="e.g., Enter property size"
                  style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} 
                />
              </div>

              {(formData.field_type === 'select' || formData.field_type === 'multiselect') && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                    Options (JSON Array) *
                  </label>
                  <textarea 
                    value={formData.options}
                    onChange={e => setFormData({...formData, options: e.target.value})}
                    placeholder='["Option 1", "Option 2", "Option 3"]'
                    rows={3}
                    style={{ width: '100%', padding: '0.875rem', border: errors.options ? '2px solid #dc2626' : '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'monospace' }} 
                  />
                  {errors.options && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.options}</div>}
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Enter as JSON array, e.g., ["Small", "Medium", "Large"]</div>
                </div>
              )}

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.375rem' }}>
                  Display Order
                </label>
                <input 
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  min="0"
                  style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} 
                />
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={e => setFormData({...formData, is_required: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="is_required" style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Required field (must be filled to save job)
                </label>
              </div>

              {errors.submit && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {errors.submit}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, 
                    padding: '0.875rem', 
                    background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px',
                    fontWeight: '600'
                  }}
                >
                  {editingField ? 'Save Changes' : 'Add Field'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ 
                    flex: 1, 
                    padding: '0.875rem', 
                    background: '#f3f4f6', 
                    border: 'none', 
                    borderRadius: '10px',
                    fontWeight: '600',
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

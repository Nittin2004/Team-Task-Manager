import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', members: [], status: 'Active' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') fetchUsers();
  }, [user]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '', members: [], status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (e, project) => {
    e.preventDefault(); e.stopPropagation();
    setEditProject(project);
    setForm({ 
      name: project.name, 
      description: project.description, 
      members: project.members.map((m) => m._id), 
      status: project.status 
    });
    setShowModal(true);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects((p) => p.filter((pr) => pr._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f, members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      if (editProject) {
        const res = await API.put(`/projects/${editProject._id}`, form);
        setProjects((p) => p.map((pr) => (pr._id === editProject._id ? res.data : pr)));
        toast.success('Project updated');
      } else {
        const res = await API.post('/projects', form);
        setProjects((p) => [res.data, ...p]);
        toast.success('Project created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="main-content fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState 
          icon="📁" 
          title="No projects yet" 
          description={user?.role === 'Admin' ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'} 
        />
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              userRole={user?.role} 
              onEdit={openEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="What is this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {editProject && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>On Hold</option><option>Completed</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Team Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
              {users.map((u) => (
                <label key={u._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer', 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  background: form.members.includes(u._id) ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)', 
                  border: `1px solid ${form.members.includes(u._id) ? 'var(--accent)' : 'var(--border)'}`, 
                  transition: 'all 0.2s' 
                }}>
                  <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ accentColor: 'var(--accent)' }} />
                  <div className="nav-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{u.name[0]}</div>
                  <span style={{ fontSize: 14 }}>{u.name}</span>
                  <span className={`nav-badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-member'}`} style={{ marginLeft: 'auto' }}>{u.role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editProject ? 'Update' : 'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

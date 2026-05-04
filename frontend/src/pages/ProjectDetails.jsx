import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, User } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const COLS = ['To Do', 'In Progress', 'Done'];

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', status: 'To Do', priority: 'Medium', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(projRes.data.members || []);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const openCreate = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', assignee: '', status: 'To Do', priority: 'Medium', dueDate: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(null);
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      assignee: task.assignee?._id || '', status: task.status,
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((t) => t.filter((tk) => tk._id !== taskId));
      setSelectedTask(null);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      if (selectedTask?._id === taskId) setSelectedTask(res.data);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editTask) {
        const res = await API.put(`/tasks/${editTask._id}`, taskForm);
        setTasks((prev) => prev.map((t) => (t._id === editTask._id ? res.data : t)));
        toast.success('Task updated');
      } else {
        const res = await API.post(`/tasks/project/${id}`, taskForm);
        setTasks((prev) => [res.data, ...prev]);
        toast.success('Task created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const isOverdue = (due, status) => due && status !== 'Done' && new Date(due) < new Date();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!project) return <div className="main-content"><EmptyState title="Not Found" description="Project not found." icon="❓" /></div>;

  return (
    <div className="main-content fade-up">
      <div className="page-header">
        <div>
          <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Badge variant={project.status}>{project.status}</Badge>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Task</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Team:</span>
          {members.map((m) => (
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 20, padding: '4px 12px 4px 6px', border: '1px solid var(--border)' }}>
              <div className="nav-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{m.name[0]}</div>
              <span style={{ fontSize: 13 }}>{m.name}</span>
              <Badge variant={m.role}>{m.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="kanban-board">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div key={col} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">
                  <Badge variant={col} style={{ fontSize: 11 }}>{col}</Badge>
                </span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No tasks</div>
                )}
                {colTasks.map((task) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    isKanban={true} 
                    onClick={() => setSelectedTask(task)} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={selectedTask?.title}>
        {selectedTask && (
          <>
            {selectedTask.description && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{selectedTask.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 90 }}>Status</span>
                <select className="status-select" value={selectedTask.status}
                  onChange={(e) => handleStatusChange(selectedTask._id, e.target.value)}>
                  <option>To Do</option><option>In Progress</option><option>Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 90 }}>Priority</span>
                <Badge variant={selectedTask.priority}>{selectedTask.priority}</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 90 }}>Assignee</span>
                <span style={{ fontSize: 14 }}>{selectedTask.assignee ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} />{selectedTask.assignee.name}</span> : 'Unassigned'}</span>
              </div>
              {selectedTask.dueDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 90 }}>Due Date</span>
                  <span style={{ fontSize: 14, color: isOverdue(selectedTask.dueDate, selectedTask.status) ? 'var(--red)' : 'var(--text-primary)' }}>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            {user?.role === 'Admin' && (
              <div className="modal-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedTask._id)}>Delete</button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selectedTask)}>Edit</button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Create/Edit Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title" value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Task details..." value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option>To Do</option><option>In Progress</option><option>Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-select" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              style={{ colorScheme: 'dark' }} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

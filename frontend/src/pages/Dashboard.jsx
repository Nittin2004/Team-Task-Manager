import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, LayoutDashboard, Calendar } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusClass = { 'To Do': 'status-todo', 'In Progress': 'status-progress', 'Done': 'status-done' };
const priorityClass = { 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done') return false;
  return new Date(dueDate) < new Date();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          API.get('/tasks'),
          API.get('/projects'),
        ]);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const todo = tasks.filter((t) => t.status === 'To Do').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const done = tasks.filter((t) => t.status === 'Done').length;
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  const filtered = activeTab === 'All' ? tasks
    : activeTab === 'Overdue' ? tasks.filter((t) => isOverdue(t.dueDate, t.status))
    : tasks.filter((t) => t.status === activeTab);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="main-content fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's an overview of your work</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple"><LayoutDashboard size={20} /></div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow"><Clock size={20} /></div>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><CheckCircle2 size={20} /></div>
          <div className="stat-value">{done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertCircle size={20} /></div>
          <div className="stat-value">{overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">My Tasks</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{tasks.length} total</span>
        </div>
        <div className="tabs">
          {['All', 'To Do', 'In Progress', 'Done', 'Overdue'].map((tab) => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <div className="empty-title">No tasks here</div>
            <div className="empty-desc">Tasks assigned to you will appear here.</div>
          </div>
        ) : (
          <div className="tasks-list">
            {filtered.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-card-left">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className="task-project">
                      📁 <Link to={`/projects/${task.project?._id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {task.project?.name}
                      </Link>
                    </span>
                    {task.dueDate && (
                      <span className={`task-due${isOverdue(task.dueDate, task.status) ? ' overdue' : ''}`}>
                        <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task.dueDate, task.status) && ' · Overdue'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-card-right">
                  <span className={`status-badge ${priorityClass[task.priority]}`}>{task.priority}</span>
                  <select className="status-select" value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                <div className="project-name">{project.name}</div>
                <div className="project-desc">{project.description || 'No description'}</div>
                <div className="project-footer">
                  <div className="project-members">
                    {project.members?.slice(0, 4).map((m) => (
                      <div key={m._id} className="member-avatar" title={m.name}>{m.name?.[0]?.toUpperCase()}</div>
                    ))}
                  </div>
                  <span className={`status-badge status-${project.status?.toLowerCase().replace(' ', '')}`}>{project.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

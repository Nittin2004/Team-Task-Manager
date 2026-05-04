import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, LayoutDashboard } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';

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
        <StatCard icon={LayoutDashboard} value={tasks.length} label="Total Tasks" variant="purple" />
        <StatCard icon={Clock} value={inProgress} label="In Progress" variant="yellow" />
        <StatCard icon={CheckCircle2} value={done} label="Completed" variant="green" />
        <StatCard icon={AlertCircle} value={overdue} label="Overdue" variant="red" />
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
          <EmptyState icon="✓" title="No tasks here" description="Tasks assigned to you will appear here." />
        ) : (
          <div className="tasks-list">
            {filtered.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onStatusChange={handleStatusChange} 
              />
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
              <ProjectCard 
                key={project._id} 
                project={project} 
                userRole={user?.role} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

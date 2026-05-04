import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="nav-logo">
          <div className="nav-logo-icon">
            <FolderKanban size={18} color="#fff" />
          </div>
          <span>TaskFlow</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <FolderKanban size={16} /> Projects
          </NavLink>
          {user?.role === 'Admin' && (
            <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Users size={16} /> Team
            </NavLink>
          )}
        </div>

        <div className="nav-right">
          <span className={`nav-badge ${user?.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
            {user?.role}
          </span>
          <div className="nav-user">
            <div className="nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="nav-name">{user?.name}</span>
          </div>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

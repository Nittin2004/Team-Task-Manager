import { useEffect, useState } from 'react';
import { Users as UsersIcon, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'Admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="main-content">
        <EmptyState 
          icon="🚫" 
          title="Access Denied" 
          description="Only administrators can view the full team list." 
        />
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const memberCount = users.filter(u => u.role === 'Member').length;

  return (
    <div className="main-content fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage your organization's members and their roles</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon={UsersIcon} 
          value={users.length} 
          label="Total Members" 
          variant="purple" 
        />
        <StatCard 
          icon={ShieldCheck} 
          value={adminCount} 
          label="Admins" 
          variant="green" 
        />
        <StatCard 
          icon={UserCheck} 
          value={memberCount} 
          label="Members" 
          variant="blue" 
        />
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All Members</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{users.length} total</span>
        </div>

        {users.length === 0 ? (
          <EmptyState 
            icon={<UsersIcon size={48} />} 
            title="No users found" 
            description="There are no other users registered in the system yet." 
          />
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                    <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                    <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="nav-avatar">{u.name[0]?.toUpperCase()}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name} {u._id === currentUser._id && <span style={{ color: 'var(--accent)', fontWeight: 400, fontSize: 12 }}>(You)</span>}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                          <Mail size={14} /> {u.email}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Badge variant={u.role}>{u.role}</Badge>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green)' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover { background: rgba(255,255,255,0.02); }
      `}} />
    </div>
  );
}

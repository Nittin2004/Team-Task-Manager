import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Badge from './Badge';

export default function ProjectCard({ 
  project, 
  userRole, 
  onEdit, 
  onDelete 
}) {
  const isAdmin = userRole === 'Admin';

  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-card-header">
        <div style={{ flex: 1 }}>
          <div className="project-name">{project.name}</div>
          <div className="project-desc">
            {project.description || 'No description provided.'}
          </div>
        </div>
        {isAdmin && onEdit && onDelete && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
            <button 
              className="btn btn-secondary btn-sm btn-icon" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(e, project); }} 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              className="btn btn-danger btn-sm btn-icon" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e, project._id); }} 
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      <div className="project-footer">
        <div className="project-members" title={project.members?.map(m => m.name).join(', ')}>
          <Users size={14} color="var(--text-secondary)" style={{ marginRight: 6 }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Badge variant={project.status}>{project.status}</Badge>
      </div>
    </Link>
  );
}

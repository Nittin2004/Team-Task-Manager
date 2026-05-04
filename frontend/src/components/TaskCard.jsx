import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import Badge from './Badge';

export default function TaskCard({ 
  task, 
  onStatusChange, 
  onClick, 
  isKanban = false,
  showProject = true 
}) {
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Done') return false;
    return new Date(dueDate) < new Date();
  };

  const overdue = isOverdue(task.dueDate, task.status);

  if (isKanban) {
    return (
      <div className="kanban-task" onClick={onClick}>
        <div className="kanban-task-title">{task.title}</div>
        {task.description && (
          <p style={{ 
            fontSize: 12, 
            color: 'var(--text-secondary)', 
            marginBottom: 10, 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {task.description}
          </p>
        )}
        <div className="kanban-task-footer">
          <Badge>{task.priority}</Badge>
          {task.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="nav-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                {task.assignee.name[0]}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {task.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unassigned</span>
          )}
        </div>
        {task.dueDate && (
          <div style={{ 
            marginTop: 8, 
            fontSize: 11, 
            color: overdue ? 'var(--red)' : 'var(--text-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4 
          }}>
            <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
            {overdue && ' · Overdue'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="task-card">
      <div className="task-card-left">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {showProject && task.project && (
            <span className="task-project">
              📁 <Link to={`/projects/${task.project._id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                {task.project.name}
              </Link>
            </span>
          )}
          {task.dueDate && (
            <span className={`task-due ${overdue ? 'overdue' : ''}`}>
              <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
              {overdue && ' · Overdue'}
            </span>
          )}
        </div>
      </div>
      <div className="task-card-right">
        <Badge>{task.priority}</Badge>
        {onStatusChange && (
          <select 
            className="status-select" 
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        )}
      </div>
    </div>
  );
}

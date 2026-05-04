import React from 'react';

const variantMap = {
  // Statuses
  'To Do': 'status-todo',
  'In Progress': 'status-progress',
  'Done': 'status-done',
  'Active': 'status-active',
  'Completed': 'status-completed',
  'On Hold': 'status-hold',
  // Priorities
  'High': 'priority-high',
  'Medium': 'priority-medium',
  'Low': 'priority-low',
  // Roles
  'Admin': 'badge-admin',
  'Member': 'badge-member'
};

export default function Badge({ children, variant, className = '' }) {
  // Use explicit variant or try to map from children text
  const badgeClass = variantMap[variant] || variantMap[children] || 'status-todo';
  
  // Roles use nav-badge class in existing CSS, others use status-badge
  const baseClass = (variant === 'Admin' || variant === 'Member' || children === 'Admin' || children === 'Member') 
    ? 'nav-badge' 
    : 'status-badge';

  return (
    <span className={`${baseClass} ${badgeClass} ${className}`}>
      {children}
    </span>
  );
}

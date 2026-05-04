import React from 'react';

export default function EmptyState({ icon, title, description, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{description}</div>
      {children && <div style={{ marginTop: 20 }}>{children}</div>}
    </div>
  );
}

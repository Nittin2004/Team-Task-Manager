import React from 'react';

export default function StatCard({ icon: Icon, value, label, variant = 'purple', className = '' }) {
  return (
    <div className={`stat-card ${variant} ${className}`}>
      <div className={`stat-icon ${variant}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

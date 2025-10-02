import React from 'react';

export function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-value">{stats.total_pathogens_detected}</div>
        <div className="stat-label">Pathogens Detected</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.alerts_triggered_today}</div>
        <div className="stat-label">Alerts Today</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.risk_reduction}</div>
        <div className="stat-label">Risk Reduction</div>
      </div>
    </div>
  );
}
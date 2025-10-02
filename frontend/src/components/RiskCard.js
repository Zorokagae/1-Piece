import React from 'react';

export function RiskCard({ location }) {
  const getRiskColor = (score) => {
    if (score >= 80) return '#e74c3c'; // Red
    if (score >= 60) return '#f39c12'; // Orange
    if (score >= 40) return '#f1c40f'; // Yellow
    return '#2ecc71'; // Green
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const riskColor = getRiskColor(location.risk_score);
  const riskLevel = getRiskLevel(location.risk_score);

  return (
    <div className="risk-card" style={{ borderLeft: `4px solid ${riskColor}` }}>
      <div className="risk-card-header">
        <h4>{location.name}</h4>
        <span className="risk-score" style={{ color: riskColor }}>
          {Math.round(location.risk_score)}%
        </span>
      </div>
      <div className="risk-level">
        <span className="risk-badge" style={{ backgroundColor: riskColor }}>
          {riskLevel}
        </span>
      </div>
      <div className="risk-card-footer">
        <span className="location-id">{location.id}</span>
        <button className="details-btn">View Details</button>
      </div>
    </div>
  );
}
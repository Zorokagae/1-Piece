import React from 'react';

export function AlertList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return <div className="no-alerts">No recent alerts</div>;
  }

  return (
    <div className="alert-list">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert-item ${alert.status.toLowerCase()}`}>
          <div className="alert-header">
            <span className="alert-location">{alert.location}</span>
            <span className="alert-time">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="alert-message">{alert.message}</div>
          {alert.status === 'ACTIVE' && (
            <div className="alert-actions">
              <button className="action-btn">Acknowledge</button>
              <button className="action-btn">View Details</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
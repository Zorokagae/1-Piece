import React, { useState } from 'react';
import { RiskCard } from './RiskCard';
import { AlertList } from './AlertList';
import { StatsPanel } from './StatsPanel';

export function Dashboard({ data, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (!data) return <div>No data available</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Microbiome Shield Dashboard</h2>
        <button 
          className="refresh-btn" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <StatsPanel stats={data.stats} />

      <div className="dashboard-grid">
        <div className="locations-section">
          <h3>Location Risk Levels</h3>
          <div className="risk-cards-container">
            {data.locations.map(location => (
              <RiskCard 
                key={location.id} 
                location={location} 
              />
            ))}
          </div>
        </div>

        <div className="alerts-section">
          <h3>Recent Alerts</h3>
          <AlertList alerts={data.alerts} />
        </div>
      </div>
    </div>
  );
}
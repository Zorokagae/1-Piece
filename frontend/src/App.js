import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RiskMap } from './components/RiskMap';
import { ARView } from './components/ARView';
import { dashboardAPI } from './services/api';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getData();
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Initializing 1-PIECE Microbiome Shield...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <h1>1-PIECE</h1>
          <span className="subtitle">Predictive Microbiome Shield</span>
        </div>
        <nav className="app-nav">
          <button 
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeView === 'risk-map' ? 'active' : ''}
            onClick={() => setActiveView('risk-map')}
          >
            Risk Map
          </button>
          <button 
            className={activeView === 'ar-view' ? 'active' : ''}
            onClick={() => setActiveView('ar-view')}
          >
            AR View
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === 'dashboard' && (
          <Dashboard data={dashboardData} onRefresh={fetchDashboardData} />
        )}
        {activeView === 'risk-map' && (
          <RiskMap locations={dashboardData.locations} />
        )}
        {activeView === 'ar-view' && (
          <ARView />
        )}
      </main>
    </div>
  );
}

export default App;
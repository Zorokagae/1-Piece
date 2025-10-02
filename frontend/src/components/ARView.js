import React, { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';

export function ARView() {
  const [alerts, setAlerts] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    // Simulate AR view with recent alerts
    const fetchAlerts = async () => {
      try {
        const response = await alertAPI.trigger(85, "OR3", "MRSA");
        setAlerts([response.data.alert]);
      } catch (error) {
        console.error('Error fetching alerts for AR:', error);
      }
    };

    fetchAlerts();
  }, []);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  return (
    <div className="ar-view">
      <h3>AR View - Risk Visualization</h3>
      
      <div className="ar-controls">
        <button 
          className={`camera-toggle ${cameraActive ? 'active' : ''}`}
          onClick={toggleCamera}
        >
          {cameraActive ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>

      <div className="ar-container">
        {cameraActive ? (
          <div className="ar-scene">
            {/* This would be replaced with actual AR.js implementation */}
            <div className="mock-ar-view">
              <div className="ar-overlay">
                {alerts.map(alert => (
                  <div key={alert.id} className="ar-alert">
                    <div className="ar-alert-icon">⚠️</div>
                    <div className="ar-alert-text">
                      <strong>{alert.location}</strong>
                      <div>{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="ar-placeholder">
            <p>Click "Start Camera" to activate AR view</p>
            <p>This would overlay risk alerts on real-world camera feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
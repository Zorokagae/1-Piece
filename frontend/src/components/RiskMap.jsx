import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Enhanced Risk Map Component
 * Displays an interactive facility risk map with improved visualization and features
 */
export function RiskMap({ locations = [], onLocationClick, showControls = true }) {
  // State management
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [isAnimated, setIsAnimated] = useState(true);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [mapView, setMapView] = useState('grid'); // 'grid', 'scatter', 'cluster'
  const [searchQuery, setSearchQuery] = useState('');

  // Risk level thresholds and configurations
  const RISK_LEVELS = {
    CRITICAL: { min: 80, color: '#e74c3c', label: 'Critical', priority: 4 },
    HIGH: { min: 60, color: '#f39c12', label: 'High', priority: 3 },
    MEDIUM: { min: 40, color: '#f1c40f', label: 'Medium', priority: 2 },
    LOW: { min: 0, color: '#2ecc71', label: 'Low', priority: 1 }
  };

  /**
   * Enhanced risk color determination with gradient support
   */
  const getRiskColor = useCallback((score, includeGradient = false) => {
    if (includeGradient) {
      // Create a gradient based on risk score
      const hue = ((100 - score) * 120) / 100; // Red to Green
      const saturation = 70 + (score / 100) * 30; // More vibrant at higher risk
      const lightness = 50;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    if (score >= RISK_LEVELS.CRITICAL.min) return RISK_LEVELS.CRITICAL.color;
    if (score >= RISK_LEVELS.HIGH.min) return RISK_LEVELS.HIGH.color;
    if (score >= RISK_LEVELS.MEDIUM.min) return RISK_LEVELS.MEDIUM.color;
    return RISK_LEVELS.LOW.color;
  }, []);

  /**
   * Get risk level label
   */
  const getRiskLevel = useCallback((score) => {
    if (score >= RISK_LEVELS.CRITICAL.min) return 'CRITICAL';
    if (score >= RISK_LEVELS.HIGH.min) return 'HIGH';
    if (score >= RISK_LEVELS.MEDIUM.min) return 'MEDIUM';
    return 'LOW';
  }, []);

  /**
   * Calculate position with better distribution algorithm
   */
  const calculatePosition = useCallback((index, total, viewType = 'scatter') => {
    if (viewType === 'grid') {
      // Grid layout
      const cols = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const spacing = 80 / cols;
      return {
        left: `${10 + col * spacing}%`,
        top: `${15 + row * spacing}%`
      };
    } else if (viewType === 'cluster') {
      // Cluster by risk level
      const riskLevel = getRiskLevel(locations[index]?.risk_score || 0);
      const levelIndex = Object.keys(RISK_LEVELS).indexOf(riskLevel);
      const angle = (index * 2 * Math.PI) / total + levelIndex * Math.PI / 2;
      const radius = 25 + (levelIndex * 10);
      return {
        left: `${50 + radius * Math.cos(angle)}%`,
        top: `${50 + radius * Math.sin(angle)}%`
      };
    } else {
      // Scatter layout with better distribution
      const golden_angle = 137.5;
      const angle = index * golden_angle * (Math.PI / 180);
      const radius = Math.sqrt(index / total) * 35;
      return {
        left: `${50 + radius * Math.cos(angle)}%`,
        top: `${50 + radius * Math.sin(angle)}%`
      };
    }
  }, [locations, getRiskLevel]);

  /**
   * Filter and search locations
   */
  const filteredLocations = useMemo(() => {
    let filtered = [...locations];

    // Apply risk level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(location => {
        const level = getRiskLevel(location.risk_score);
        return level === filterLevel;
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.id.toString().includes(searchQuery)
      );
    }

    return filtered;
  }, [locations, filterLevel, searchQuery, getRiskLevel]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    if (!locations.length) return null;

    const scores = locations.map(l => l.risk_score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    const riskDistribution = {
      critical: locations.filter(l => l.risk_score >= RISK_LEVELS.CRITICAL.min).length,
      high: locations.filter(l => l.risk_score >= RISK_LEVELS.HIGH.min && l.risk_score < RISK_LEVELS.CRITICAL.min).length,
      medium: locations.filter(l => l.risk_score >= RISK_LEVELS.MEDIUM.min && l.risk_score < RISK_LEVELS.HIGH.min).length,
      low: locations.filter(l => l.risk_score < RISK_LEVELS.MEDIUM.min).length
    };

    return {
      average: average.toFixed(1),
      max: max.toFixed(1),
      min: min.toFixed(1),
      total: locations.length,
      distribution: riskDistribution
    };
  }, [locations]);

  /**
   * Handle location click
   */
  const handleLocationClick = useCallback((location, event) => {
    event.stopPropagation();
    setSelectedLocation(location);
    if (onLocationClick) {
      onLocationClick(location);
    }
  }, [onLocationClick]);

  /**
   * Handle map click (deselect)
   */
  const handleMapClick = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setSelectedLocation(null);
      }
      // Navigate through locations with arrow keys
      if (selectedLocation && filteredLocations.length > 0) {
        const currentIndex = filteredLocations.findIndex(l => l.id === selectedLocation.id);
        let newIndex = currentIndex;
        
        if (e.key === 'ArrowRight') {
          newIndex = (currentIndex + 1) % filteredLocations.length;
        } else if (e.key === 'ArrowLeft') {
          newIndex = (currentIndex - 1 + filteredLocations.length) % filteredLocations.length;
        }
        
        if (newIndex !== currentIndex) {
          setSelectedLocation(filteredLocations[newIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedLocation, filteredLocations]);

  /**
   * Auto-refresh simulation (optional)
   */
  useEffect(() => {
    if (!isAnimated) return;

    const interval = setInterval(() => {
      // Simulate risk score updates
      // This would typically come from props update
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isAnimated]);

  return (
    <div className="risk-map enhanced">
      {/* Header with controls */}
      <div className="risk-map-header">
        <h3>
          Facility Risk Map
          {statistics && (
            <span className="map-stats">
              ({statistics.total} locations, Avg: {statistics.average}%)
            </span>
          )}
        </h3>
        
        {showControls && (
          <div className="risk-map-controls">
            {/* Search */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search locations"
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
              aria-label="Filter by risk level"
            >
              <option value="all">All Levels</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>

            {/* View mode toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${mapView === 'scatter' ? 'active' : ''}`}
                onClick={() => setMapView('scatter')}
                title="Scatter View"
                aria-label="Scatter view"
              >
                ⚬
              </button>
              <button
                className={`view-btn ${mapView === 'grid' ? 'active' : ''}`}
                onClick={() => setMapView('grid')}
                title="Grid View"
                aria-label="Grid view"
              >
                ⚏
              </button>
              <button
                className={`view-btn ${mapView === 'cluster' ? 'active' : ''}`}
                onClick={() => setMapView('cluster')}
                title="Cluster View"
                aria-label="Cluster view"
              >
                ⚭
              </button>
            </div>

            {/* Animation toggle */}
            <button
              className={`animation-toggle ${isAnimated ? 'active' : ''}`}
              onClick={() => setIsAnimated(!isAnimated)}
              title={isAnimated ? 'Disable animations' : 'Enable animations'}
              aria-label="Toggle animations"
            >
              {isAnimated ? '⏸' : '▶'}
            </button>
          </div>
        )}
      </div>

      {/* Risk statistics bar */}
      {statistics && (
        <div className="risk-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Critical</span>
            <span className="stat-value critical">{statistics.distribution.critical}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High</span>
            <span className="stat-value high">{statistics.distribution.high}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Medium</span>
            <span className="stat-value medium">{statistics.distribution.medium}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Low</span>
            <span className="stat-value low">{statistics.distribution.low}</span>
          </div>
        </div>
      )}

      {/* Main map container */}
      <div 
        className={`facility-map ${mapView} ${isAnimated ? 'animated' : ''}`}
        onClick={handleMapClick}
        role="application"
        aria-label="Interactive risk map"
      >
        {/* Background grid overlay */}
        <div className="map-grid-overlay" aria-hidden="true" />

        {/* Location markers */}
        {filteredLocations.map((location, index) => {
          const position = calculatePosition(index, filteredLocations.length, mapView);
          const riskLevel = getRiskLevel(location.risk_score);
          const isSelected = selectedLocation?.id === location.id;
          const isHovered = hoveredLocation?.id === location.id;

          return (
            <div
              key={location.id}
              className={`facility-location ${riskLevel.toLowerCase()} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                backgroundColor: getRiskColor(location.risk_score, true),
                left: position.left,
                top: position.top,
                zIndex: isSelected ? 100 : location.risk_score,
                transform: isSelected ? 'scale(1.5)' : 'scale(1)',
              }}
              onClick={(e) => handleLocationClick(location, e)}
              onMouseEnter={() => setHoveredLocation(location)}
              onMouseLeave={() => setHoveredLocation(null)}
              role="button"
              tabIndex={0}
              aria-label={`${location.name} - Risk: ${Math.round(location.risk_score)}%`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleLocationClick(location, e);
                }
              }}
            >
              {/* Enhanced tooltip */}
              <div className="location-tooltip enhanced">
                <div className="tooltip-header">
                  <strong>{location.name}</strong>
                  <span className={`risk-badge ${riskLevel.toLowerCase()}`}>
                    {riskLevel}
                  </span>
                </div>
                <div className="tooltip-content">
                  <div className="tooltip-row">
                    <span className="tooltip-label">Risk Score:</span>
                    <span className="tooltip-value">{Math.round(location.risk_score)}%</span>
                  </div>
                  <div className="tooltip-row">
                    <span className="tooltip-label">ID:</span>
                    <span className="tooltip-value">{location.id}</span>
                  </div>
                  {location.lastUpdated && (
                    <div className="tooltip-row">
                      <span className="tooltip-label">Updated:</span>
                      <span className="tooltip-value">{location.lastUpdated}</span>
                    </div>
                  )}
                </div>
                <div className="tooltip-arrow" />
              </div>

              {/* Pulse animation for high-risk locations */}
              {location.risk_score >= RISK_LEVELS.HIGH.min && isAnimated && (
                <div className="pulse-ring" aria-hidden="true" />
              )}
            </div>
          );
        })}

        {/* Selected location info panel */}
        {selectedLocation && (
          <div className="selected-location-panel">
            <button
              className="close-panel"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
              }}
              aria-label="Close panel"
            >
              ×
            </button>
            <h4>{selectedLocation.name}</h4>
            <div className="panel-content">
              <div className="risk-score-display">
                <div 
                  className="risk-score-circle"
                  style={{
                    background: `conic-gradient(
                      ${getRiskColor(selectedLocation.risk_score)} ${selectedLocation.risk_score * 3.6}deg,
                      #e0e0e0 0deg
                    )`
                  }}
                >
                  <span className="score-text">
                    {Math.round(selectedLocation.risk_score)}%
                  </span>
                </div>
              </div>
              <div className="panel-details">
                <p><strong>Risk Level:</strong> {getRiskLevel(selectedLocation.risk_score)}</p>
                <p><strong>Location ID:</strong> {selectedLocation.id}</p>
                {selectedLocation.description && (
                  <p><strong>Description:</strong> {selectedLocation.description}</p>
                )}
                {selectedLocation.lastIncident && (
                  <p><strong>Last Incident:</strong> {selectedLocation.lastIncident}</p>
                )}
              </div>
              {onLocationClick && (
                <button
                  className="view-details-btn"
                  onClick={() => onLocationClick(selectedLocation)}
                >
                  View Full Details →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredLocations.length === 0 && (
          <div className="map-empty-state">
            <span className="empty-icon">📍</span>
            <p>No locations found matching your criteria</p>
            {searchQuery && (
              <button
                className="reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setFilterLevel('all');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="map-legend enhanced">
        <div className="legend-title">Risk Levels</div>
        <div className="legend-items">
          {Object.entries(RISK_LEVELS).map(([key, level]) => (
            <div
              key={key}
              className={`legend-item ${filterLevel === key ? 'active' : ''}`}
              onClick={() => setFilterLevel(filterLevel === key ? 'all' : key)}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${level.label} risk`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setFilterLevel(filterLevel === key ? 'all' : key);
                }
              }}
            >
              <div 
                className="legend-color"
                style={{ backgroundColor: level.color }}
              >
                {statistics && (
                  <span className="legend-count">
                    {statistics.distribution[key.toLowerCase()] || 0}
                  </span>
                )}
              </div>
              <div className="legend-text">
                <span className="legend-label">{level.label}</span>
                <span className="legend-range">
                  {key === 'LOW' ? '<40%' : `${level.min}%+`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional info or actions */}
      <div className="map-footer">
        <div className="map-info">
          <span className="info-icon">ℹ</span>
          <span className="info-text">
            Click on locations for details. Use keyboard arrows to navigate.
          </span>
        </div>
        <div className="map-actions">
          <button className="export-btn" aria-label="Export map data">
            📊 Export Data
          </button>
          <button className="fullscreen-btn" aria-label="Fullscreen view">
            ⛶ Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}

// Default props
RiskMap.defaultProps = {
  locations: [],
  onLocationClick: null,
  showControls: true
};

// Export for use in other components
export default RiskMap;
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Aside from '../component/Aside';
import '../style/result.css';

function ResultPgae() {
  const navigate = useNavigate();
  const { isLoaded, extractedData, fileName } = useSelector(state => state.isLoaded);
  const [activeTab, setActiveTab] = useState('handlungsfelder');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedMeasures, setExpandedMeasures] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedIndicators, setExpandedIndicators] = useState({});

  useEffect(() => {
    if (!isLoaded || !extractedData) {
      navigate('/ai');
    }
  }, [isLoaded, extractedData, navigate]);

  if (!extractedData) {
    return <div>Loading...</div>;
  }

  const { action_fields = [], projects = [], indicators = [], measures = [] } = extractedData;

  // Count direct connections from action field
  const getChildCounts = (actionFieldId, actionFieldTitle) => {
    // Get connections from this action field
    const actionField = action_fields.find(af => af.id === actionFieldId);
    const directConnections = actionField?.connections || [];

    // Count direct connections by type
    const projectCount = directConnections
      .filter(c => c.target_id.startsWith('proj_'))
      .length;

    const measureCount = directConnections
      .filter(c => c.target_id.startsWith('msr_'))
      .length;

    const indicatorCount = directConnections
      .filter(c => c.target_id.startsWith('ind_'))
      .length;

    return {
      projects: projectCount,
      measures: measureCount,
      indicators: indicatorCount
    };
  };

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleMeasure = (id) => {
    setExpandedMeasures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleProject = (id) => {
    setExpandedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleIndicator = (id) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper function to get project's parent action field
  const getProjectParentActionField = (project) => {
    // First check if parent_action_field_name exists
    if (project.content.parent_action_field_name) {
      return project.content.parent_action_field_name;
    }

    // Otherwise, find parent from incoming connections
    const incomingConnections = [];

    // Check all action fields for connections to this project
    action_fields.forEach(af => {
      (af.connections || []).forEach(conn => {
        if (conn.target_id === project.id) {
          incomingConnections.push({
            title: af.content.title,
            confidence: conn.confidence_score
          });
        }
      });
    });

    // If we have incoming connections from action fields, use the one with highest confidence
    if (incomingConnections.length > 0) {
      // Sort by confidence score (highest first)
      incomingConnections.sort((a, b) => b.confidence - a.confidence);
      return incomingConnections[0].title;
    }

    return 'N/A';
  };

  // Helper function to group consecutive page quotes
  const groupConsecutivePageQuotes = (sources) => {
    if (!sources || sources.length === 0) return [];

    // Group sources by quote text
    const quoteGroups = {};
    sources.forEach(source => {
      const quote = source.quote;
      if (!quoteGroups[quote]) {
        quoteGroups[quote] = [];
      }
      quoteGroups[quote].push(source.page_number);
    });

    // Process each quote group
    const groupedSources = [];
    Object.entries(quoteGroups).forEach(([quote, pages]) => {
      // Sort pages numerically
      const sortedPages = pages.sort((a, b) => a - b);

      // Group consecutive pages
      const pageRanges = [];
      let rangeStart = sortedPages[0];
      let rangeEnd = sortedPages[0];

      for (let i = 1; i < sortedPages.length; i++) {
        if (sortedPages[i] === rangeEnd + 1) {
          // Consecutive page, extend the range
          rangeEnd = sortedPages[i];
        } else {
          // Not consecutive, save current range and start new one
          pageRanges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
          rangeStart = sortedPages[i];
          rangeEnd = sortedPages[i];
        }
      }
      // Don't forget the last range
      pageRanges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);

      groupedSources.push({
        pages: pageRanges.join(', '),
        quote: quote
      });
    });

    return groupedSources;
  };

  // Navigate to a specific entity by clicking on a connection
  const navigateToEntity = (entityId) => {
    // Determine entity type from ID prefix
    let targetTab = '';
    let expandFunction = null;

    if (entityId.startsWith('af_')) {
      targetTab = 'handlungsfelder';
      expandFunction = () => setExpandedCards(prev => ({ ...prev, [entityId]: true }));
    } else if (entityId.startsWith('proj_')) {
      targetTab = 'projects';
      expandFunction = () => setExpandedProjects(prev => ({ ...prev, [entityId]: true }));
    } else if (entityId.startsWith('ind_')) {
      targetTab = 'indicators';
      expandFunction = () => setExpandedIndicators(prev => ({ ...prev, [entityId]: true }));
    } else if (entityId.startsWith('msr_')) {
      targetTab = 'measures';
      expandFunction = () => setExpandedMeasures(prev => ({ ...prev, [entityId]: true }));
    }

    if (targetTab) {
      // Switch to the appropriate tab
      setActiveTab(targetTab);

      // Expand the target entity
      if (expandFunction) {
        expandFunction();
      }

      // Scroll to the element after a short delay to allow tab switch
      setTimeout(() => {
        const element = document.getElementById(entityId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight animation
          element.classList.add('highlight-animation');
          setTimeout(() => {
            element.classList.remove('highlight-animation');
          }, 2000);
        }
      }, 100);
    }
  };

  // Get all connections for an action field (both incoming and outgoing)
  const getActionFieldConnections = (actionFieldId) => {
    const connections = {
      projects: [],
      indicators: [],
      measures: [],
      otherActionFields: []
    };

    // Get the action field
    const actionField = action_fields.find(af => af.id === actionFieldId);
    if (!actionField) return connections;

    // Outgoing connections from this action field
    (actionField.connections || []).forEach(conn => {
      if (conn.target_id.startsWith('proj_')) {
        const project = projects.find(p => p.id === conn.target_id);
        if (project) {
          connections.projects.push({
            ...project,
            confidence: conn.confidence_score,
            direction: 'outgoing'
          });
        }
      } else if (conn.target_id.startsWith('ind_')) {
        const indicator = indicators.find(i => i.id === conn.target_id);
        if (indicator) {
          connections.indicators.push({
            ...indicator,
            confidence: conn.confidence_score,
            direction: 'outgoing'
          });
        }
      } else if (conn.target_id.startsWith('msr_')) {
        const measure = measures.find(m => m.id === conn.target_id);
        if (measure) {
          connections.measures.push({
            ...measure,
            confidence: conn.confidence_score,
            direction: 'outgoing'
          });
        }
      } else if (conn.target_id.startsWith('af_')) {
        const otherAF = action_fields.find(af => af.id === conn.target_id);
        if (otherAF) {
          connections.otherActionFields.push({
            ...otherAF,
            confidence: conn.confidence_score,
            direction: 'outgoing'
          });
        }
      }
    });

    // Find projects that have this action field as parent
    projects
      .filter(p => p.content.parent_action_field_name === actionField.content.title)
      .forEach(project => {
        if (!connections.projects.find(p => p.id === project.id)) {
          connections.projects.push({
            ...project,
            confidence: 1.0,
            direction: 'child'
          });
        }
      });

    // Find incoming connections from other action fields
    action_fields.forEach(af => {
      if (af.id !== actionFieldId) {
        (af.connections || []).forEach(conn => {
          if (conn.target_id === actionFieldId) {
            connections.otherActionFields.push({
              ...af,
              confidence: conn.confidence_score,
              direction: 'incoming'
            });
          }
        });
      }
    });

    return connections;
  };

  const renderHandlungsfelder = () => {
    // Identify the root Handlungsfeld (one with only outgoing connections to other AFs)
    const isRootHandlungsfeld = (field) => {
      // Check if this field has many outgoing connections to other AFs
      const outgoingToAFs = (field.connections || []).filter(conn =>
        conn.target_id.startsWith('af_')
      ).length;

      // Check if any other AF connects to this one
      const hasIncomingFromAFs = action_fields.some(af =>
        af.id !== field.id &&
        (af.connections || []).some(conn => conn.target_id === field.id)
      );

      // Root has many outgoing connections and no incoming from other AFs
      return outgoingToAFs > 10 && !hasIncomingFromAFs;
    };

    const filteredFields = action_fields.filter(field =>
      field.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.content.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort to put root first
    const sortedFields = [...filteredFields].sort((a, b) => {
      const aIsRoot = isRootHandlungsfeld(a);
      const bIsRoot = isRootHandlungsfeld(b);
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;
      return 0;
    });

    return (
      <div className="handlungsfelder-container">
        <div className="section-header">
          <h2>Alle übergeordneten Handlungsfelder</h2>
          <button className="add-btn">+ Handlungsfeld</button>
        </div>

        <div className="cards-grid">
          {sortedFields.map(field => {
            const counts = getChildCounts(field.id, field.content.title);
            const isExpanded = expandedCards[field.id];
            const isRoot = isRootHandlungsfeld(field);

            return (
              <div key={field.id} id={field.id} className={`field-card ${isExpanded ? 'expanded' : ''} ${isRoot ? 'root-handlungsfeld' : ''}`}>
                <div className="card-header" onClick={() => toggleCard(field.id)}>
                  <input type="checkbox" className="field-checkbox" onClick={e => e.stopPropagation()} />
                  {isRoot ? (
                    <div className="card-title-wrapper">
                      <span className="root-badge">
                        <i className="fas fa-crown"></i>
                        Übergeordnetes Handlungsfeld
                      </span>
                      <h3>{field.content.title}</h3>
                    </div>
                  ) : (
                    <h3>{field.content.title}</h3>
                  )}
                  <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">Indikatoren:</span>
                    <span className="stat-value">{counts.indicators}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Projekte & Maßnahmen:</span>
                    <span className="stat-value">{counts.projects + counts.measures}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-details">
                    <p className="description">{field.content.description}</p>
                    <div className="source-pages">
                      Seiten: {field.content.source_pages?.join(', ') || 'N/A'}
                    </div>

                    {/* Connections Section */}
                    <div className="connections-section">
                      <h4>Verbindungen</h4>
                      {(() => {
                        const connections = getActionFieldConnections(field.id);
                        return (
                          <div className="connections-grid">
                            {connections.otherActionFields.length > 0 && (
                              <div className="connection-group">
                                <h5>Verknüpfte Handlungsfelder ({connections.otherActionFields.length})</h5>
                                <div className="connection-list">
                                  {connections.otherActionFields.map(af => (
                                    <div
                                      key={af.id}
                                      className={`connection-item ${af.direction} clickable`}
                                      onClick={() => navigateToEntity(af.id)}
                                    >
                                      <span className="connection-direction">
                                        {af.direction === 'incoming' ? '← ' : af.direction === 'outgoing' ? '→ ' : ''}
                                      </span>
                                      <span className="connection-name">{af.content.title}</span>
                                      <span className="connection-confidence">{Math.round(af.confidence * 100)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {connections.projects.length > 0 && (
                              <div className="connection-group">
                                <h5>Projekte ({connections.projects.length})</h5>
                                <div className="connection-list">
                                  {connections.projects.map(proj => (
                                    <div
                                      key={proj.id}
                                      className={`connection-item ${proj.direction} clickable`}
                                      onClick={() => navigateToEntity(proj.id)}
                                    >
                                      <span className="connection-direction">
                                        {proj.direction === 'child' ? '↳ ' : '→ '}
                                      </span>
                                      <span className="connection-name">{proj.content.title}</span>
                                      <span className="connection-confidence">
                                        {proj.direction === 'child' ? 'Child' : `${Math.round(proj.confidence * 100)}%`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {connections.indicators.length > 0 && (
                              <div className="connection-group">
                                <h5>Indikatoren ({connections.indicators.length})</h5>
                                <div className="connection-list">
                                  {connections.indicators.map(ind => (
                                    <div
                                      key={ind.id}
                                      className="connection-item outgoing clickable"
                                      onClick={() => navigateToEntity(ind.id)}
                                    >
                                      <span className="connection-direction">→ </span>
                                      <span className="connection-name">{ind.content.title}</span>
                                      <span className="connection-confidence">{Math.round(ind.confidence * 100)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {connections.measures.length > 0 && (
                              <div className="connection-group">
                                <h5>Maßnahmen ({connections.measures.length})</h5>
                                <div className="connection-list">
                                  {connections.measures.map(msr => (
                                    <div
                                      key={msr.id}
                                      className="connection-item outgoing clickable"
                                      onClick={() => navigateToEntity(msr.id)}
                                    >
                                      <span className="connection-direction">→ </span>
                                      <span className="connection-name">{msr.content.title}</span>
                                      <span className="connection-confidence">{Math.round(msr.confidence * 100)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIndicators = () => {
    const filteredIndicators = indicators.filter(ind =>
      ind.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.content.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to check if a value is numeric
    const isNumericValue = (value) => {
      if (!value) return false;
      // Remove common units and check if numeric
      const cleaned = value.toString().replace(/[%€$,\s]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    };

    // Helper function to parse numeric value
    const parseNumericValue = (value) => {
      if (!value) return 0;
      const cleaned = value.toString().replace(/[%€$,\s]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // Helper function to filter valid data points for graphing
    const filterValidDataPoints = (dataPoints) => {
      if (!dataPoints || dataPoints.length === 0) return [];

      return dataPoints.filter(d => {
        // Must have valid year and numeric value
        const hasValidYear = d.year && d.year !== 'N/A' && !isNaN(parseInt(d.year));
        const hasNumericValue = isNumericValue(d.value);
        return hasValidYear && hasNumericValue;
      });
    };

    // Helper function to get qualitative data points
    const getQualitativeDataPoints = (dataPoints) => {
      if (!dataPoints || dataPoints.length === 0) return [];

      return dataPoints.filter(d => {
        // Either has invalid year or non-numeric value
        const hasInvalidYear = !d.year || d.year === 'N/A' || isNaN(parseInt(d.year));
        const hasNonNumericValue = !isNumericValue(d.value);
        return hasInvalidYear || hasNonNumericValue;
      });
    };

    // Helper function to create SVG line graph
    const createLineGraph = (dataPoints, isTarget = false) => {
      const validPoints = filterValidDataPoints(dataPoints);
      if (validPoints.length === 0) return null;

      // Sort by year
      const sorted = [...validPoints].sort((a, b) => parseInt(a.year) - parseInt(b.year));

      // Find min/max for scaling
      const values = sorted.map(d => parseNumericValue(d.value));
      const years = sorted.map(d => parseInt(d.year));
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      // Create points for SVG
      const points = sorted.map((d, i) => {
        const year = parseInt(d.year);
        const value = parseNumericValue(d.value);

        const x = years.length > 1
          ? 10 + (180 * ((year - minYear) / (maxYear - minYear || 1)))
          : 100; // Center if single point
        const y = values.length > 1 && maxValue !== minValue
          ? 90 - (70 * ((value - minValue) / (maxValue - minValue)))
          : 50; // Middle if single point or all same value
        return `${x},${y}`;
      }).join(' ');

      return points;
    };

    return (
      <div className="indicators-container">
        <div className="section-header">
          <h2>Indikatoren</h2>
          <button className="add-btn">+ Indikator</button>
        </div>

        <div className="indicators-grid">
          {filteredIndicators.map(indicator => {
            const isExpanded = expandedIndicators[indicator.id];
            const connections = getIndicatorConnections(indicator.id);
            const totalConnections = connections.outgoing.length + connections.incoming.length;
            const actualValues = indicator.content.actual_values || [];
            const targetValues = indicator.content.target_values || [];

            // Separate numeric and qualitative data
            const validActualValues = filterValidDataPoints(actualValues);
            const validTargetValues = filterValidDataPoints(targetValues);
            const qualitativeActualValues = getQualitativeDataPoints(actualValues);
            const qualitativeTargetValues = getQualitativeDataPoints(targetValues);

            const hasMultipleActual = validActualValues.length > 1;
            const hasMultipleTarget = validTargetValues.length > 1;
            const hasNumericData = validActualValues.length > 0 || validTargetValues.length > 0;
            const hasQualitativeData = qualitativeActualValues.length > 0 || qualitativeTargetValues.length > 0;
            const hasData = actualValues.length > 0 || targetValues.length > 0;

            // Get latest valid values for progress calculation
            const latestActual = validActualValues[validActualValues.length - 1];
            const latestTarget = validTargetValues[validTargetValues.length - 1];

            // Calculate progress only for numeric values
            let progress = 0;
            let canShowProgress = false;
            if (latestTarget && latestActual && isNumericValue(latestTarget.value) && isNumericValue(latestActual.value)) {
              const actualNum = parseNumericValue(latestActual.value);
              const targetNum = parseNumericValue(latestTarget.value);
              if (targetNum > 0) {
                progress = (actualNum / targetNum) * 100;
                canShowProgress = true;
              }
            }

            return (
              <div key={indicator.id} id={indicator.id} className={`indicator-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="indicator-header" onClick={() => toggleIndicator(indicator.id)}>
                  <input type="checkbox" className="indicator-checkbox" onClick={e => e.stopPropagation()} />
                  <h3>{indicator.content.title}</h3>
                  <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">ID:</span>
                    <span className="stat-value">{indicator.id}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Verbindungen:</span>
                    <span className="stat-value">{totalConnections}</span>
                  </div>
                </div>

                <div className="indicator-content">
                  {hasData ? (
                    <div className="chart-area">
                      {/* Show graph only if we have valid numeric data with multiple points */}
                      {hasNumericData && (hasMultipleActual || hasMultipleTarget) ? (
                        <div className="real-chart">
                          <svg viewBox="0 0 240 120" className="data-graph">
                            {(() => {
                              // Calculate data ranges for axis labels
                              const allValidData = [...validActualValues, ...validTargetValues];
                              const years = allValidData.map(d => parseInt(d.year)).filter(y => !isNaN(y));
                              const values = allValidData.map(d => parseNumericValue(d.value));

                              const minYear = Math.min(...years);
                              const maxYear = Math.max(...years);
                              const minValue = Math.min(...values);
                              const maxValue = Math.max(...values);
                              const midValue = (minValue + maxValue) / 2;

                              // Format value with unit
                              const formatValue = (val) => {
                                const rounded = Math.round(val * 10) / 10;
                                return indicator.content.unit ? `${rounded}${indicator.content.unit}` : rounded.toString();
                              };

                              return (
                                <>
                                  {/* Grid lines */}
                                  <line x1="35" y1="90" x2="215" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                                  <line x1="35" y1="50" x2="215" y2="50" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
                                  <line x1="35" y1="10" x2="215" y2="10" stroke="#e5e7eb" strokeWidth="1" />

                                  {/* Y-axis labels */}
                                  <text x="30" y="13" textAnchor="end" fontSize="10" fill="#6b7280">
                                    {formatValue(maxValue)}
                                  </text>
                                  <text x="30" y="53" textAnchor="end" fontSize="10" fill="#6b7280">
                                    {formatValue(midValue)}
                                  </text>
                                  <text x="30" y="93" textAnchor="end" fontSize="10" fill="#6b7280">
                                    {formatValue(minValue)}
                                  </text>

                                  {/* X-axis labels */}
                                  {years.length > 0 && (
                                    <>
                                      <text x="35" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">
                                        {minYear}
                                      </text>
                                      {maxYear !== minYear && (
                                        <>
                                          {maxYear - minYear > 2 && (
                                            <text x="125" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">
                                              {Math.round((minYear + maxYear) / 2)}
                                            </text>
                                          )}
                                          <text x="215" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">
                                            {maxYear}
                                          </text>
                                        </>
                                      )}
                                    </>
                                  )}

                                  {/* Update line positions to match new coordinate system */}
                                  {hasMultipleActual && (() => {
                                    const points = validActualValues
                                      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
                                      .map(d => {
                                        const year = parseInt(d.year);
                                        const value = parseNumericValue(d.value);
                                        const x = years.length > 1
                                          ? 35 + (180 * ((year - minYear) / (maxYear - minYear || 1)))
                                          : 125;
                                        const y = values.length > 1 && maxValue !== minValue
                                          ? 90 - (80 * ((value - minValue) / (maxValue - minValue)))
                                          : 50;
                                        return `${x},${y}`;
                                      }).join(' ');

                                    return (
                                      <polyline
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                        points={points}
                                      />
                                    );
                                  })()}

                                  {/* Target values line */}
                                  {hasMultipleTarget && (() => {
                                    const points = validTargetValues
                                      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
                                      .map(d => {
                                        const year = parseInt(d.year);
                                        const value = parseNumericValue(d.value);
                                        const x = years.length > 1
                                          ? 35 + (180 * ((year - minYear) / (maxYear - minYear || 1)))
                                          : 125;
                                        const y = values.length > 1 && maxValue !== minValue
                                          ? 90 - (80 * ((value - minValue) / (maxValue - minValue)))
                                          : 50;
                                        return `${x},${y}`;
                                      }).join(' ');

                                    return (
                                      <polyline
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        strokeDasharray="5,3"
                                        points={points}
                                      />
                                    );
                                  })()}
                                </>
                              );
                            })()}

                            {/* Single numeric points */}
                            {!hasMultipleActual && validActualValues.length === 1 && (
                              <>
                                <circle cx="125" cy="50" r="6" fill="#10b981" />
                                <text x="125" y="38" textAnchor="middle" fontSize="12" fill="#10b981" fontWeight="600">
                                  {validActualValues[0].value}
                                </text>
                              </>
                            )}
                            {!hasMultipleTarget && validTargetValues.length === 1 && (
                              <>
                                <circle cx="125" cy="50" r="6" fill="#3b82f6" />
                                <text x="125" y={validActualValues.length === 1 ? "70" : "38"} textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="600">
                                  {validTargetValues[0].value}
                                </text>
                              </>
                            )}
                          </svg>

                          <div className="chart-legend">
                            {validActualValues.length > 0 && (
                              <span className="legend-item">
                                <span className="legend-dot actual"></span> Ist-Wert
                              </span>
                            )}
                            {validTargetValues.length > 0 && (
                              <span className="legend-item">
                                <span className="legend-dot target"></span> Ziel-Wert
                              </span>
                            )}
                          </div>
                        </div>
                      ) : hasNumericData && validActualValues.length === 1 && validTargetValues.length === 0 ? (
                        /* Show single numeric value prominently */
                        <div className="single-value-display">
                          <div className="value-box actual">
                            <span className="value-label">Aktuell</span>
                            <span className="value-number">
                              {validActualValues[0].value}
                              {indicator.content.unit && (
                                <span className="value-unit"> {indicator.content.unit}</span>
                              )}
                            </span>
                            {validActualValues[0].year && (
                              <span className="value-year">({validActualValues[0].year})</span>
                            )}
                          </div>
                        </div>
                      ) : hasNumericData && validTargetValues.length === 1 && validActualValues.length === 0 ? (
                        /* Show single target value prominently */
                        <div className="single-value-display">
                          <div className="value-box target">
                            <span className="value-label">Ziel</span>
                            <span className="value-number">
                              {validTargetValues[0].value}
                              {indicator.content.unit && (
                                <span className="value-unit"> {indicator.content.unit}</span>
                              )}
                            </span>
                            {validTargetValues[0].year && (
                              <span className="value-year">({validTargetValues[0].year})</span>
                            )}
                          </div>
                        </div>
                      ) : hasNumericData ? (
                        /* Show both single values */
                        <div className="single-value-display">
                          {latestActual && (
                            <div className="value-box actual">
                              <span className="value-label">Aktuell</span>
                              <span className="value-number">
                                {latestActual.value}
                                {indicator.content.unit && (
                                  <span className="value-unit"> {indicator.content.unit}</span>
                                )}
                              </span>
                              {latestActual.year && (
                                <span className="value-year">({latestActual.year})</span>
                              )}
                            </div>
                          )}
                          {latestTarget && (
                            <div className="value-box target">
                              <span className="value-label">Ziel</span>
                              <span className="value-number">
                                {latestTarget.value}
                                {indicator.content.unit && (
                                  <span className="value-unit"> {indicator.content.unit}</span>
                                )}
                              </span>
                              {latestTarget.year && (
                                <span className="value-year">({latestTarget.year})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Show qualitative data as styled text */
                        <div className="qualitative-display">
                          {qualitativeActualValues.length > 0 && (
                            <div className="qualitative-section">
                              <h5 className="qualitative-label">Ist-Wert</h5>
                              {qualitativeActualValues.map((val, idx) => (
                                <div key={idx} className="qualitative-item">
                                  {val.year && val.year !== 'N/A' && (
                                    <span className="qualitative-year">{val.year}:</span>
                                  )}
                                  <span className="qualitative-value">{val.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {qualitativeTargetValues.length > 0 && (
                            <div className="qualitative-section">
                              <h5 className="qualitative-label">Ziel-Wert</h5>
                              {qualitativeTargetValues.map((val, idx) => (
                                <div key={idx} className="qualitative-item">
                                  {val.year && val.year !== 'N/A' && (
                                    <span className="qualitative-year">{val.year}:</span>
                                  )}
                                  <span className="qualitative-value">{val.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress bar only if we have valid numeric values */}
                      {canShowProgress && (
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                            />
                          </div>
                          <div className="progress-value">{Math.round(progress)}% erreicht</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>Keine Daten verfügbar</p>
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="indicator-details">
                    <div className="detail-section">
                      <h4>Beschreibung</h4>
                      <p>{indicator.content.description || 'Keine Beschreibung verfügbar'}</p>
                    </div>

                    {indicator.content.measurement_frequency && (
                      <div className="detail-info">
                        <strong>Messfrequenz:</strong> {indicator.content.measurement_frequency}
                      </div>
                    )}

                    {indicator.content.data_source && (
                      <div className="detail-info">
                        <strong>Datenquelle:</strong> {indicator.content.data_source}
                      </div>
                    )}

                    {indicator.content.notes && (
                      <div className="detail-info">
                        <strong>Hinweise:</strong> {indicator.content.notes}
                      </div>
                    )}

                    {/* Show all data points */}
                    {(actualValues.length > 0 || targetValues.length > 0) && (
                      <div className="data-points-section">
                        <h4>Datenpunkte</h4>
                        <div className="data-points-grid">
                          {actualValues.length > 0 && (
                            <div className="data-points-column">
                              <h5>Ist-Werte</h5>
                              {actualValues.map((val, idx) => (
                                <div key={idx} className="data-point">
                                  <span className="year">{val.year || 'N/A'}:</span>
                                  <span className="value">{val.value} {indicator.content.unit}</span>
                                  {val.note && <span className="note">({val.note})</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {targetValues.length > 0 && (
                            <div className="data-points-column">
                              <h5>Ziel-Werte</h5>
                              {targetValues.map((val, idx) => (
                                <div key={idx} className="data-point">
                                  <span className="year">{val.year || 'N/A'}:</span>
                                  <span className="value">{val.value} {indicator.content.unit}</span>
                                  {val.note && <span className="note">({val.note})</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show connections */}
                    {(connections.incoming.length > 0 || connections.outgoing.length > 0) && (
                      <div className="indicator-connections">
                        <h4>Verbindungen</h4>

                        {connections.incoming.length > 0 && (
                          <div className="connection-section">
                            <h5>Eingehende Verbindungen ({connections.incoming.length})</h5>
                            <div className="connection-list horizontal">
                              {connections.incoming.map((conn, idx) => (
                                <div
                                  key={`incoming-${idx}`}
                                  className="connection-chip incoming clickable"
                                  onClick={() => navigateToEntity(conn.source_id)}
                                >
                                  <span className="connection-direction">← </span>
                                  <span className="entity-type">{conn.source_type}</span>
                                  <span className="entity-name">{conn.source_title}</span>
                                  <span className="confidence-badge">
                                    {Math.round(conn.confidence_score * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {connections.outgoing.length > 0 && (
                          <div className="connection-section">
                            <h5>Ausgehende Verbindungen ({connections.outgoing.length})</h5>
                            <div className="connection-list horizontal">
                              {connections.outgoing.map(conn => {
                                let connectedEntity = null;
                                let entityType = '';

                                if (conn.target_id.startsWith('proj_')) {
                                  connectedEntity = projects.find(p => p.id === conn.target_id);
                                  entityType = 'Projekt';
                                } else if (conn.target_id.startsWith('af_')) {
                                  connectedEntity = action_fields.find(af => af.id === conn.target_id);
                                  entityType = 'Handlungsfeld';
                                } else if (conn.target_id.startsWith('msr_')) {
                                  connectedEntity = measures.find(m => m.id === conn.target_id);
                                  entityType = 'Maßnahme';
                                } else if (conn.target_id.startsWith('ind_')) {
                                  connectedEntity = indicators.find(i => i.id === conn.target_id);
                                  entityType = 'Indikator';
                                }

                                return connectedEntity && (
                                  <div
                                    key={conn.target_id}
                                    className="connection-chip outgoing clickable"
                                    onClick={() => navigateToEntity(conn.target_id)}
                                  >
                                    <span className="connection-direction">→ </span>
                                    <span className="entity-type">{entityType}</span>
                                    <span className="entity-name">{connectedEntity.content.title}</span>
                                    <span className="confidence-badge">
                                      {Math.round(conn.confidence_score * 100)}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show sources */}
                    {indicator.sources && indicator.sources.length > 0 && (
                      <div className="indicator-sources">
                        <h4>Quellen</h4>
                        {groupConsecutivePageQuotes(indicator.sources).map((source, idx) => (
                          <div key={idx} className="source-quote">
                            <span className="page-ref">Seite{source.pages.includes(',') || source.pages.includes('-') ? 'n' : ''} {source.pages}:</span>
                            <blockquote>"{source.quote}"</blockquote>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const filteredProjects = projects.filter(proj =>
      proj.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.content.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="projects-container">
        <div className="section-header">
          <h2>Projekte</h2>
          <button className="add-btn">+ Projekt</button>
        </div>

        <div className="cards-grid">
          {filteredProjects.map(project => {
            const isExpanded = expandedProjects[project.id];
            const connections = getProjectConnections(project.id);
            const totalConnections = connections.outgoing.length + connections.incoming.length;

            return (
              <div key={project.id} id={project.id} className={`field-card project-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="card-header" onClick={() => toggleProject(project.id)}>
                  <input type="checkbox" className="field-checkbox" onClick={e => e.stopPropagation()} />
                  <h3>{project.content.title}</h3>
                  <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">Handlungsfeld:</span>
                    <span className="stat-value">{getProjectParentActionField(project)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Verbindungen:</span>
                    <span className="stat-value">{totalConnections}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-details">
                    <p className="description">{project.content.description || 'Keine Beschreibung verfügbar'}</p>

                    <div className="source-pages">
                      Seiten: {project.content.source_pages?.join(', ') || 'N/A'}
                    </div>

                    {/* Metadata */}
                    {(project.content.implementation_status || project.content.timeline || project.content.budget || project.content.responsible_department) && (
                      <div className="metadata-section">
                        {project.content.implementation_status && (
                          <div className="metadata-item">
                            <strong>Status:</strong> {project.content.implementation_status}
                          </div>
                        )}
                        {project.content.timeline && (
                          <div className="metadata-item">
                            <strong>Zeitplan:</strong> {project.content.timeline}
                          </div>
                        )}
                        {project.content.budget && (
                          <div className="metadata-item">
                            <strong>Budget:</strong> {project.content.budget}
                          </div>
                        )}
                        {project.content.responsible_department && (
                          <div className="metadata-item">
                            <strong>Verantwortlich:</strong> {project.content.responsible_department}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Connections Section */}
                    <div className="connections-section">
                      <h4>Verbindungen</h4>
                      <div className="connections-grid">
                        {/* Incoming Connections */}
                        {connections.incoming.length > 0 && (
                          <div className="connection-group">
                            <h5>Eingehende Verbindungen ({connections.incoming.length})</h5>
                            <div className="connection-list">
                              {connections.incoming.map((conn, idx) => (
                                <div
                                  key={`incoming-${idx}`}
                                  className="connection-item incoming clickable"
                                  onClick={() => navigateToEntity(conn.source_id)}
                                >
                                  <span className="connection-direction">← </span>
                                  <span className="connection-name">{conn.source_title}</span>
                                  <span className="connection-type">({conn.source_type})</span>
                                  <span className="connection-confidence">{Math.round(conn.confidence_score * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outgoing Connections */}
                        {connections.outgoing.length > 0 && (
                          <div className="connection-group">
                            <h5>Ausgehende Verbindungen ({connections.outgoing.length})</h5>
                            <div className="connection-list">
                              {connections.outgoing.map(conn => {
                                let connectedEntity = null;
                                let entityType = '';

                                if (conn.target_id.startsWith('ind_')) {
                                  connectedEntity = indicators.find(i => i.id === conn.target_id);
                                  entityType = 'Indikator';
                                } else if (conn.target_id.startsWith('proj_')) {
                                  connectedEntity = projects.find(p => p.id === conn.target_id);
                                  entityType = 'Projekt';
                                } else if (conn.target_id.startsWith('af_')) {
                                  connectedEntity = action_fields.find(af => af.id === conn.target_id);
                                  entityType = 'Handlungsfeld';
                                } else if (conn.target_id.startsWith('msr_')) {
                                  connectedEntity = measures.find(m => m.id === conn.target_id);
                                  entityType = 'Maßnahme';
                                }

                                return connectedEntity && (
                                  <div
                                    key={conn.target_id}
                                    className="connection-item outgoing clickable"
                                    onClick={() => navigateToEntity(conn.target_id)}
                                  >
                                    <span className="connection-direction">→ </span>
                                    <span className="connection-name">{connectedEntity.content.title}</span>
                                    <span className="connection-type">({entityType})</span>
                                    <span className="connection-confidence">{Math.round(conn.confidence_score * 100)}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Sources */}
                    {project.sources && project.sources.length > 0 && (
                      <div className="sources-section">
                        <h4>Quellen</h4>
                        {groupConsecutivePageQuotes(project.sources).map((source, idx) => (
                          <div key={idx} className="source-quote">
                            <span className="page-ref">Seite{source.pages.includes(',') || source.pages.includes('-') ? 'n' : ''} {source.pages}:</span>
                            <blockquote>"{source.quote}"</blockquote>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getProjectConnections = (projectId) => {
    const outgoing = projects.find(p => p.id === projectId)?.connections || [];

    // Find incoming connections from all entity types
    const incoming = [];

    // From action fields
    action_fields.forEach(af => {
      (af.connections || []).forEach(conn => {
        if (conn.target_id === projectId) {
          incoming.push({
            source_id: af.id,
            source_title: af.content.title,
            source_type: 'Handlungsfeld',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From other projects
    projects.forEach(proj => {
      if (proj.id !== projectId) {
        (proj.connections || []).forEach(conn => {
          if (conn.target_id === projectId) {
            incoming.push({
              source_id: proj.id,
              source_title: proj.content.title,
              source_type: 'Projekt',
              confidence_score: conn.confidence_score
            });
          }
        });
      }
    });

    // From indicators
    indicators.forEach(ind => {
      (ind.connections || []).forEach(conn => {
        if (conn.target_id === projectId) {
          incoming.push({
            source_id: ind.id,
            source_title: ind.content.title,
            source_type: 'Indikator',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From measures
    measures.forEach(msr => {
      (msr.connections || []).forEach(conn => {
        if (conn.target_id === projectId) {
          incoming.push({
            source_id: msr.id,
            source_title: msr.content.title,
            source_type: 'Maßnahme',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    return { outgoing, incoming };
  };

  const getIndicatorConnections = (indicatorId) => {
    const outgoing = indicators.find(i => i.id === indicatorId)?.connections || [];

    // Find incoming connections from all entity types
    const incoming = [];

    // From action fields
    action_fields.forEach(af => {
      (af.connections || []).forEach(conn => {
        if (conn.target_id === indicatorId) {
          incoming.push({
            source_id: af.id,
            source_title: af.content.title,
            source_type: 'Handlungsfeld',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From projects
    projects.forEach(proj => {
      (proj.connections || []).forEach(conn => {
        if (conn.target_id === indicatorId) {
          incoming.push({
            source_id: proj.id,
            source_title: proj.content.title,
            source_type: 'Projekt',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From other indicators
    indicators.forEach(ind => {
      if (ind.id !== indicatorId) {
        (ind.connections || []).forEach(conn => {
          if (conn.target_id === indicatorId) {
            incoming.push({
              source_id: ind.id,
              source_title: ind.content.title,
              source_type: 'Indikator',
              confidence_score: conn.confidence_score
            });
          }
        });
      }
    });

    // From measures
    measures.forEach(msr => {
      (msr.connections || []).forEach(conn => {
        if (conn.target_id === indicatorId) {
          incoming.push({
            source_id: msr.id,
            source_title: msr.content.title,
            source_type: 'Maßnahme',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    return { outgoing, incoming };
  };

  const getMeasureConnections = (measureId) => {
    const outgoing = measures.find(m => m.id === measureId)?.connections || [];

    // Find incoming connections from all entity types
    const incoming = [];

    // From action fields
    action_fields.forEach(af => {
      (af.connections || []).forEach(conn => {
        if (conn.target_id === measureId) {
          incoming.push({
            source_id: af.id,
            source_title: af.content.title,
            source_type: 'Handlungsfeld',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From projects
    projects.forEach(proj => {
      (proj.connections || []).forEach(conn => {
        if (conn.target_id === measureId) {
          incoming.push({
            source_id: proj.id,
            source_title: proj.content.title,
            source_type: 'Projekt',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From indicators
    indicators.forEach(ind => {
      (ind.connections || []).forEach(conn => {
        if (conn.target_id === measureId) {
          incoming.push({
            source_id: ind.id,
            source_title: ind.content.title,
            source_type: 'Indikator',
            confidence_score: conn.confidence_score
          });
        }
      });
    });

    // From other measures
    measures.forEach(msr => {
      if (msr.id !== measureId) {
        (msr.connections || []).forEach(conn => {
          if (conn.target_id === measureId) {
            incoming.push({
              source_id: msr.id,
              source_title: msr.content.title,
              source_type: 'Maßnahme',
              confidence_score: conn.confidence_score
            });
          }
        });
      }
    });

    return { outgoing, incoming };
  };

  const renderMeasures = () => {
    const filteredMeasures = measures.filter(measure =>
      measure.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measure.content.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="measures-container">
        <div className="section-header">
          <h2>Maßnahmen</h2>
          <button className="add-btn">+ Maßnahme</button>
        </div>

        <div className="cards-grid">
          {filteredMeasures.map(measure => {
            const isExpanded = expandedMeasures[measure.id];
            const connections = getMeasureConnections(measure.id);
            const totalConnections = connections.outgoing.length + connections.incoming.length;

            return (
              <div key={measure.id} id={measure.id} className={`field-card measure-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="card-header" onClick={() => toggleMeasure(measure.id)}>
                  <input type="checkbox" className="field-checkbox" onClick={e => e.stopPropagation()} />
                  <h3>{measure.content.title}</h3>
                  <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">ID:</span>
                    <span className="stat-value">{measure.id}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Verbindungen:</span>
                    <span className="stat-value">{totalConnections}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-details">
                    <p className="description">{measure.content.description || 'Keine Beschreibung verfügbar'}</p>

                    <div className="source-pages">
                      Seiten: {measure.content.source_pages?.join(', ') || 'N/A'}
                    </div>

                    {/* Metadata */}
                    {(measure.content.implementation_status || measure.content.timeline || measure.content.responsible_department) && (
                      <div className="metadata-section">
                        {measure.content.implementation_status && (
                          <div className="metadata-item">
                            <strong>Status:</strong> {measure.content.implementation_status}
                          </div>
                        )}
                        {measure.content.timeline && (
                          <div className="metadata-item">
                            <strong>Zeitplan:</strong> {measure.content.timeline}
                          </div>
                        )}
                        {measure.content.responsible_department && (
                          <div className="metadata-item">
                            <strong>Verantwortlich:</strong> {measure.content.responsible_department}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Connections Section */}
                    <div className="connections-section">
                      <h4>Verbindungen</h4>
                      <div className="connections-grid">
                        {connections.incoming.length > 0 && (
                          <div className="connection-group">
                            <h5>Eingehende Verbindungen ({connections.incoming.length})</h5>
                            <div className="connection-list">
                              {connections.incoming.map((conn, idx) => (
                                <div
                                  key={`incoming-${idx}`}
                                  className="connection-item incoming clickable"
                                  onClick={() => navigateToEntity(conn.source_id)}
                                >
                                  <span className="connection-direction">← </span>
                                  <span className="connection-name">{conn.source_title}</span>
                                  <span className="connection-type">({conn.source_type})</span>
                                  <span className="connection-confidence">{Math.round(conn.confidence_score * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {connections.outgoing.length > 0 && (
                          <div className="connection-group">
                            <h5>Ausgehende Verbindungen ({connections.outgoing.length})</h5>
                            <div className="connection-list">
                              {connections.outgoing.map(conn => {
                                let connectedEntity = null;
                                let entityType = '';

                                if (conn.target_id.startsWith('ind_')) {
                                  connectedEntity = indicators.find(i => i.id === conn.target_id);
                                  entityType = 'Indikator';
                                } else if (conn.target_id.startsWith('proj_')) {
                                  connectedEntity = projects.find(p => p.id === conn.target_id);
                                  entityType = 'Projekt';
                                } else if (conn.target_id.startsWith('af_')) {
                                  connectedEntity = action_fields.find(af => af.id === conn.target_id);
                                  entityType = 'Handlungsfeld';
                                } else if (conn.target_id.startsWith('msr_')) {
                                  connectedEntity = measures.find(m => m.id === conn.target_id);
                                  entityType = 'Maßnahme';
                                }

                                return connectedEntity && (
                                  <div
                                    key={conn.target_id}
                                    className="connection-item outgoing clickable"
                                    onClick={() => navigateToEntity(conn.target_id)}
                                  >
                                    <span className="connection-direction">→ </span>
                                    <span className="connection-name">{connectedEntity.content.title}</span>
                                    <span className="connection-type">({entityType})</span>
                                    <span className="connection-confidence">{Math.round(conn.confidence_score * 100)}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sources */}
                    {measure.sources && measure.sources.length > 0 && (
                      <div className="sources-section">
                        <h4>Quellen</h4>
                        {groupConsecutivePageQuotes(measure.sources).map((source, idx) => (
                          <div key={idx} className="source-quote">
                            <span className="page-ref">Seite{source.pages.includes(',') || source.pages.includes('-') ? 'n' : ''} {source.pages}:</span>
                            <blockquote>"{source.quote}"</blockquote>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="layout">
      <Aside />
      <main className="result-main">
        <div className="result-header">
          <div className="header-info">
            <h1>Extraktionsergebnisse</h1>
            <p className="file-info">Datei: {fileName}</p>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-number">{action_fields.length}</span>
              <span className="stat-label">Handlungsfelder</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{projects.length}</span>
              <span className="stat-label">Projekte</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{indicators.length}</span>
              <span className="stat-label">Indikatoren</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{measures.length}</span>
              <span className="stat-label">Maßnahmen</span>
            </div>
          </div>
        </div>

        <div className="result-controls">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'handlungsfelder' ? 'active' : ''}`}
              onClick={() => setActiveTab('handlungsfelder')}
            >
              Handlungsfelder
            </button>
            <button
              className={`tab ${activeTab === 'indicators' ? 'active' : ''}`}
              onClick={() => setActiveTab('indicators')}
            >
              Indikatoren
            </button>
            <button
              className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projekte
            </button>
            <button
              className={`tab ${activeTab === 'measures' ? 'active' : ''}`}
              onClick={() => setActiveTab('measures')}
            >
              Maßnahmen
            </button>
          </div>

          <div className="search-filter">
            <input
              type="text"
              placeholder="Suchbegriff eingeben..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="filter-btn">Filter</button>
          </div>
        </div>

        <div className="result-content">
          {activeTab === 'handlungsfelder' && renderHandlungsfelder()}
          {activeTab === 'indicators' && renderIndicators()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'measures' && renderMeasures()}
        </div>
      </main>
    </div>
  );
}

export default ResultPgae;
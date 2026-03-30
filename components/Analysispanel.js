// components/AnalysisPanel.js
import { useState, useEffect } from 'react';

const AnalysisPanel = ({ data, visible }) => {
  if (!visible) return null;

  const getSignalColor = (signal) => {
    if (signal === 'BUY') return '#2ecc71';
    if (signal === 'SELL') return '#e74c3c';
    return '#f39c12';
  };

  const getTrendColor = (trend) => {
    return trend === 'UP' ? '#2ecc71' : '#e74c3c';
  };

  return (
    <div style={styles.panel}>
      <div style={styles.content}>
        <div style={styles.row}>
          <div style={styles.item}>
            <div style={styles.label}>Signal</div>
            <div style={{ ...styles.value, color: getSignalColor(data.signal) }}>
              {data.signal}
            </div>
          </div>
          <div style={styles.item}>
            <div style={styles.label}>Trend</div>
            <div style={{ ...styles.value, color: getTrendColor(data.trend) }}>
              {data.trend}
            </div>
          </div>
          <div style={styles.item}>
            <div style={styles.label}>Confidence</div>
            <div style={styles.value}>{data.confidence}%</div>
          </div>
        </div>
        <div style={styles.explanation}>
          <div style={styles.label}>Analysis</div>
          <div>{data.explanation}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid #333',
    padding: '1rem',
    zIndex: 1000,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  item: {
    flex: 1,
    minWidth: '100px',
    textAlign: 'center',
  },
  label: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: '#aaa',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  explanation: {
    background: '#1e1e1e',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
};

export default AnalysisPanel;

import React, { useState } from 'react'
import './Dashboard.css'

interface DashboardProps {
  userName?: string
}

export default function Dashboard({ userName }: { userName?: string }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {userName || 'User'}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your benchmarks today.</p>
        </div>
        <div className="header-actions">
          <select 
            className="time-range-selector"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn-primary">
            <span>📊</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">📊</div>
              <span className="stat-trend trend-up">+12%</span>
            </div>
            <div className="stat-value">24</div>
            <div className="stat-label">Active Benchmarks</div>
          </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">📁</div>
            <span className="stat-trend trend-up">+8%</span>
          </div>
          <div className="stat-value">156</div>
          <div className="stat-label">Total Teardowns</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">🔍</div>
            <span className="stat-trend trend-down">-3%</span>
          </div>
          <div className="stat-value">89</div>
          <div className="stat-label">Comparisons</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">👥</div>
            <span className="stat-trend trend-up">+15%</span>
          </div>
          <div className="stat-value">1,234</div>
          <div className="stat-label">Team Members</div>
        </div>
      </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Cost Analysis</h2>
              <div className="chart-actions">
                <button className="chart-action-btn">📥 Export</button>
                <button className="chart-action-btn">⚙️</button>
              </div>
            </div>
            <div className="chart-placeholder">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: '70%', background: '#4299e1' }}></div>
                <div className="chart-bar" style={{ height: '85%', background: '#48bb78' }}></div>
                <div className="chart-bar" style={{ height: '60%', background: '#ed8936' }}></div>
                <div className="chart-bar" style={{ height: '90%', background: '#9f7aea' }}></div>
                <div className="chart-bar" style={{ height: '75%', background: '#f56565' }}></div>
                <div className="chart-bar" style={{ height: '80%', background: '#38b2ac' }}></div>
              </div>
              <div className="chart-labels">
                <span>Engine</span>
                <span>Transmission</span>
                <span>Suspension</span>
                <span>Brakes</span>
                <span>Electronics</span>
                <span>Interior</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Category Distribution</h2>
              <div className="chart-actions">
                <button className="chart-action-btn">📥 Export</button>
                <button className="chart-action-btn">⚙️</button>
              </div>
            </div>
            <div className="chart-placeholder">
              <div className="pie-chart">
                <div className="pie-slice" style={{ background: '#4299e1', transform: 'rotate(0deg) skewY(-30deg)' }}></div>
                <div className="pie-slice" style={{ background: '#48bb78', transform: 'rotate(60deg) skewY(-30deg)' }}></div>
                <div className="pie-slice" style={{ background: '#ed8936', transform: 'rotate(120deg) skewY(-30deg)' }}></div>
                <div className="pie-slice" style={{ background: '#9f7aea', transform: 'rotate(180deg) skewY(-30deg)' }}></div>
                <div className="pie-slice" style={{ background: '#f56565', transform: 'rotate(240deg) skewY(-30deg)' }}></div>
                <div className="pie-slice" style={{ background: '#38b2ac', transform: 'rotate(300deg) skewY(-30deg)' }}></div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#4299e1' }}></span>
                  <span>Engine (25%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#48bb78' }}></span>
                  <span>Transmission (20%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#ed8936' }}></span>
                  <span>Suspension (18%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <button className="view-all-btn">View All →</button>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon" style={{ background: '#ebf8ff', color: '#2b6cb0' }}>📊</div>
            <div className="activity-content">
              <div className="activity-title">New benchmark created: 2.0L Turbo Diesel Engine</div>
              <div className="activity-meta">2 hours ago • by Rajesh Kumar</div>
            </div>
            <div className="activity-status success">Completed</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ background: '#f0fdf4', color: '#22543d' }}>🔍</div>
            <div className="activity-content">
              <div className="activity-title">Comparison completed: Bosch vs Denso Fuel Injectors</div>
              <div className="activity-meta">5 hours ago • by Priya Sharma</div>
            </div>
            <div className="activity-status success">Completed</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ background: '#fef3c7', color: '#92400e' }}>📁</div>
            <div className="activity-content">
              <div className="activity-title">Teardown analysis: BMW B58 Engine</div>
              <div className="activity-meta">1 day ago • by Amit Patel</div>
            </div>
            <div className="activity-status processing">In Progress</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon" style={{ background: '#f3f4f6', color: '#4b5563' }}>📷</div>
            <div className="activity-content">
              <div className="activity-title">Photos uploaded: Mercedes-Benz 9G-Tronic Transmission</div>
              <div className="activity-meta">2 days ago • by Sneha Reddy</div>
            </div>
            <div className="activity-status success">Completed</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <a href="#" className="action-btn">
            <div className="action-icon" style={{ color: '#2b6cb0' }}>➕</div>
            <span className="action-text">New Benchmark</span>
          </a>

          <a href="#" className="action-btn">
            <div className="action-icon" style={{ color: '#48bb78' }}>�</div>
            <span className="action-text">Start Comparison</span>
          </a>

          <a href="#" className="action-btn">
            <div className="action-icon" style={{ color: '#dd6b20' }}>📄</div>
            <span className="action-text">Generate Report</span>
          </a>

          <a href="#" className="action-btn">
            <div className="action-icon" style={{ color: '#805ad5' }}>📷</div>
            <span className="action-text">Upload Photos</span>
          </a>

          <a href="#" className="action-btn">
            <div className="action-icon" style={{ color: '#e53e3e' }}>🔍</div>
            <span className="action-text">Advanced Search</span>
          </a>
        </div>
      </div>
    </div>
  )
}

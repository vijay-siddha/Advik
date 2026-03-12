import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
  <div className="dashboard-root">
    {/* Header */}
    <header className="header">
      <div className="header-left">
        <button className="menu-btn">☰</button>
        <div className="logo-text">ADVIK BENCHMARKING</div>
      </div>
      <div className="header-right">
        <div className="search-box">
          <input type="text" placeholder="Search benchmarks, products..." />
          <span className="search-icon">🔍</span>
        </div>
        <button className="icon-btn">
          🔔
          <span className="badge">3</span>
        </button>
        <div className="user-profile">
          <div className="avatar">RK</div>
          <span>Rajesh Kumar ▼</span>
        </div>
      </div>
    </header>

    {/* Sidebar */}
    <nav className="sidebar">
      <button className="nav-item active" onClick={() => navigate('/dashboard')}>
        <span className="nav-icon">🏠</span>
        Dashboard
      </button>
      <button className="nav-item" onClick={() => navigate('/benchmarks')}>
        <span className="nav-icon">📊</span>
        Benchmarks
      </button>
      <button className="nav-item" onClick={() => navigate('/projects')}>
        <span className="nav-icon">📁</span>
        Projects
      </button>
      <button className="nav-item" onClick={() => navigate('/compare')}>
        <span className="nav-icon">🔍</span>
        Comparisons
      </button>
      <button className="nav-item" onClick={() => navigate('/reports')}>
        <span className="nav-icon">📄</span>
        Reports
      </button>
      <button className="nav-item" onClick={() => navigate('/media')}>
        <span className="nav-icon">📷</span>
        Media Library
      </button>
      <button className="nav-item" onClick={() => navigate('/settings')}>
        <span className="nav-icon">⚙️</span>
        Settings
      </button>
    </nav>

    {/* Main Content */}
    <main className="main-content">
      <div className="breadcrumb">
        Home / <span>Dashboard</span>
      </div>

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
            <div className="stat-icon orange">🏆</div>
            <span className="stat-trend trend-up">+24%</span>
          </div>
          <div className="stat-value">8</div>
          <div className="stat-label">Projects This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">📈</div>
            <span className="stat-trend trend-up">+5%</span>
          </div>
          <div className="stat-value">₹12.4M</div>
          <div className="stat-label">Avg. Benchmark Cost</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Cost Analysis Trend (Last 6 Months)</h3>
            <select className="chart-filter" title="Time range filter">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="mock-chart">
            <div className="chart-bar" style={{height: '60%'}}>
              <span className="bar-value">₹8.5M</span>
              <span className="bar-label">Aug</span>
            </div>
            <div className="chart-bar" style={{height: '75%'}}>
              <span className="bar-value">₹10.2M</span>
              <span className="bar-label">Sep</span>
            </div>
            <div className="chart-bar" style={{height: '55%'}}>
              <span className="bar-value">₹7.8M</span>
              <span className="bar-label">Oct</span>
            </div>
            <div className="chart-bar" style={{height: '85%'}}>
              <span className="bar-value">₹11.5M</span>
              <span className="bar-label">Nov</span>
            </div>
            <div className="chart-bar" style={{height: '70%'}}>
              <span className="bar-value">₹9.8M</span>
              <span className="bar-label">Dec</span>
            </div>
            <div className="chart-bar" style={{height: '90%'}}>
              <span className="bar-value">₹12.4M</span>
              <span className="bar-label">Jan</span>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Category Distribution</h3>
          </div>
          <div style={{padding: '20px'}}>
            <div style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px'}}>🔧 Engine</span>
                <span style={{fontWeight: 600}}>35%</span>
              </div>
              <div style={{height: '8px', background: '#e2e8f0', borderRadius: '4px'}}>
                <div style={{width: '35%', height: '100%', background: '#2b6cb0', borderRadius: '4px'}}></div>
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px'}}>⚙️ Transmission</span>
                <span style={{fontWeight: 600}}>25%</span>
              </div>
              <div style={{height: '8px', background: '#e2e8f0', borderRadius: '4px'}}>
                <div style={{width: '25%', height: '100%', background: '#38a169', borderRadius: '4px'}}></div>
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px'}}>🔩 Suspension</span>
                <span style={{fontWeight: 600}}>20%</span>
              </div>
              <div style={{height: '8px', background: '#e2e8f0', borderRadius: '4px'}}>
                <div style={{width: '20%', height: '100%', background: '#dd6b20', borderRadius: '4px'}}></div>
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px'}}>⚡ Electrical</span>
                <span style={{fontWeight: 600}}>12%</span>
              </div>
              <div style={{height: '8px', background: '#e2e8f0', borderRadius: '4px'}}>
                <div style={{width: '12%', height: '100%', background: '#805ad5', borderRadius: '4px'}}></div>
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontSize: '14px'}}>🛑 Braking</span>
                <span style={{fontWeight: 600}}>8%</span>
              </div>
              <div style={{height: '8px', background: '#e2e8f0', borderRadius: '4px'}}>
                <div style={{width: '8%', height: '100%', background: '#e53e3e', borderRadius: '4px'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="activity-card">
          <h3 className="section-title">🔔 Recent Activity</h3>

          <div className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <div className="activity-text">New teardown completed: <strong>Engine X-2024</strong></div>
              <div className="activity-time">2 hours ago • by Amit Patel</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-dot" style={{background: '#38a169'}}></div>
            <div className="activity-content">
              <div className="activity-text">BOM updated: <strong>Transmission T-8</strong></div>
              <div className="activity-time">5 hours ago • by Priya Sharma</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-dot" style={{background: '#dd6b20'}}></div>
            <div className="activity-content">
              <div className="activity-text">Report generated: <strong>Project Alpha Q4</strong></div>
              <div className="activity-time">Yesterday • by Rajesh Kumar</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-dot" style={{background: '#805ad5'}}></div>
            <div className="activity-content">
              <div className="activity-text">New project created: <strong>EV Powertrain Analysis</strong></div>
              <div className="activity-time">2 days ago • by Management</div>
            </div>
          </div>

          <a href="#" className="view-all">View All Activity →</a>
        </div>

        <div className="actions-card">
          <h3 className="section-title">⚡ Quick Actions</h3>

          <button className="action-btn" onClick={() => navigate('/benchmarks')}>
            <div className="action-icon icon-blue">➕</div>
            <span className="action-text">New Benchmark</span>
          </button>

          <button className="action-btn" onClick={() => navigate('/compare')}>
            <div className="action-icon icon-green">📊</div>
            <span className="action-text">Compare Products</span>
          </button>

          <button className="action-btn" onClick={() => navigate('/reports')}>
            <div className="action-icon icon-orange">📄</div>
            <span className="action-text">Generate Report</span>
          </button>

          <button className="action-btn" onClick={() => navigate('/media')}>
            <div className="action-icon icon-purple">📷</div>
            <span className="action-text">Upload Photos</span>
          </button>

          <button className="action-btn" onClick={() => navigate('/advanced-search')}>
            <div className="action-icon icon-red">🔍</div>
            <span className="action-text">Advanced Search</span>
          </button>
        </div>
      </div>
    </main>
  </div>
  );
}

export default Dashboard;

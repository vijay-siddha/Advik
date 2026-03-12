import React from "react";
import { useNavigate } from "react-router-dom";
import "./BenchmarkDetail.css";

const BenchmarkDetail = () => {
  const navigate = useNavigate();
  return (
  <div className="benchmark-root">
    {/* Header */}
    <header className="header">
      <div className="header-left">
        <button className="menu-btn">☰</button>
        <div className="logo-text">ADVIK BENCHMARKING</div>
      </div>
      <div className="header-right">
        <div className="search-box">
          <input type="text" placeholder="Search benchmarks..." />
          <span className="search-icon">🔍</span>
        </div>
        <button className="icon-btn">🔔<span className="badge">3</span></button>
        <div className="user-profile">
          <div className="avatar">RK</div>
          <span>Rajesh Kumar ▼</span>
        </div>
      </div>
    </header>
    {/* Sidebar */}
    <nav className="sidebar">
      <button className="nav-item" onClick={() => navigate('/dashboard')}>
        <span className="nav-icon">🏠</span>Dashboard
      </button>
      <button className="nav-item active" onClick={() => navigate('/benchmarks')}>
        <span className="nav-icon">📊</span>Benchmarks
      </button>
      <button className="nav-item" onClick={() => navigate('/projects')}>
        <span className="nav-icon">📁</span>Projects
      </button>
      <button className="nav-item" onClick={() => navigate('/compare')}>
        <span className="nav-icon">🔍</span>Comparisons
      </button>
      <button className="nav-item" onClick={() => navigate('/reports')}>
        <span className="nav-icon">📄</span>Reports
      </button>
      <button className="nav-item" onClick={() => navigate('/media')}>
        <span className="nav-icon">📷</span>Media Library
      </button>
      <button className="nav-item" onClick={() => navigate('/settings')}>
        <span className="nav-icon">⚙️</span>Settings
      </button>
    </nav>
    {/* Main Content */}
    <main className="main-content">
      <div className="breadcrumb">
        Home / Benchmarks / <span>2.0L Turbo Diesel Engine</span>
      </div>
      <div className="product-header">
        <div className="header-top">
          <div className="product-title-section">
            <div className="product-image-gallery">
              <div className="main-image">🔧</div>
              <div className="thumbnail-stack">
                <div className="thumb active">🔧</div>
                <div className="thumb">⚙️</div>
                <div className="thumb">🔩</div>
                <div className="add-photo">➕</div>
              </div>
            </div>
            <div className="product-info">
              <h1>2.0L Turbo Diesel Engine</h1>
              <div className="product-meta">
                <div className="meta-item"><strong>BMT-2024-TDI</strong></div>
                <div className="meta-item">Bosch</div>
                <div className="meta-item">2024</div>
                <div className="meta-item">185 kg</div>
                <div className="meta-item">₹4.25L</div>
              </div>
              <span className="status-badge">🟢 Active Benchmark</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">✏️ Edit</button>
            <button className="btn btn-secondary">📄 Report</button>
            <button className="btn btn-primary">🔗 Share</button>
          </div>
        </div>
        <div className="score-grid">
          <div className="score-card">
            <div className="score-label">Overall Score</div>
            <div className="score-value">8.7</div>
            <div className="score-bar">
              <div className="score-fill green" style={{width: '87%'}}></div>
            </div>
          </div>
          <div className="score-card">
            <div className="score-label">Cost Efficiency</div>
            <div className="score-value">7.5</div>
            <div className="score-bar">
              <div className="score-fill blue" style={{width: '75%'}}></div>
            </div>
          </div>
          <div className="score-card">
            <div className="score-label">Quality</div>
            <div className="score-value">9.2</div>
            <div className="score-bar">
              <div className="score-fill green" style={{width: '92%'}}></div>
            </div>
          </div>
          <div className="score-card">
            <div className="score-label">Performance</div>
            <div className="score-value">9.0</div>
            <div className="score-bar">
              <div className="score-fill purple" style={{width: '90%'}}></div>
            </div>
          </div>
          <div className="score-card">
            <div className="score-label">NVH Rating</div>
            <div className="score-value">8.5</div>
            <div className="score-bar">
              <div className="score-fill orange" style={{width: '85%'}}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="tabs-section">
        <div className="tabs-header">
          <div className="tab active">
            <span>📋</span> Specifications
          </div>
          <div className="tab">
            <span>📦</span> Bill of Materials
          </div>
          <div className="tab">
            <span>⚙️</span> Manufacturing
          </div>
          <div className="tab">
            <span>💰</span> Cost Analysis
          </div>
          <div className="tab">
            <span>📸</span> Media & Docs
          </div>
          <div className="tab">
            <span>🥽</span> AR/VR View
          </div>
        </div>
        <div className="tab-content">
          <div className="specs-grid">
            <div className="spec-card">
              <div className="spec-title">Physical Weight</div>
              <div className="spec-value">185 kg</div>
              <div className="spec-detail">Total dry weight without fluids</div>
            </div>
            <div className="spec-card">
              <div className="spec-title">Dimensions (L×W×H)</div>
              <div className="spec-value">650×480×720</div>
              <div className="spec-detail">mm - Compact inline configuration</div>
            </div>
            <div className="spec-card">
              <div className="spec-title">Total Cost</div>
              <div className="spec-value">₹4.25L</div>
              <div className="spec-detail">Estimated manufacturing cost</div>
            </div>
            <div className="spec-card" style={{borderLeftColor: '#48bb78'}}>
              <div className="spec-title">Displacement</div>
              <div className="spec-value">1,968 cc</div>
              <div className="spec-detail">2.0L inline-4 configuration</div>
            </div>
            <div className="spec-card" style={{borderLeftColor: '#ed8936'}}>
              <div className="spec-title">Power Output</div>
              <div className="spec-value">190 hp</div>
              <div className="spec-detail">@ 4,000 rpm (140 kW)</div>
            </div>
            <div className="spec-card" style={{borderLeftColor: '#9f7aea'}}>
              <div className="spec-title">Torque</div>
              <div className="spec-value">400 Nm</div>
              <div className="spec-detail">@ 1,750-2,500 rpm</div>
            </div>
          </div>
          <div style={{marginTop: 30, padding: 25, background: '#f7fafc', borderRadius: 12}}>
            <h3 style={{fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#2d3748'}}>Performance Metrics</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20}}>
              <div>
                <div style={{fontSize: 13, color: '#718096'}}>0-100 km/h</div>
                <div style={{fontSize: 22, fontWeight: 700, color: '#2d3748'}}>7.8s</div>
                <div style={{fontSize: 13, color: '#718096'}}>Tested with full load</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: '#718096'}}>Top Speed</div>
                <div style={{fontSize: 22, fontWeight: 700, color: '#2d3748'}}>220 km/h</div>
                <div style={{fontSize: 13, color: '#718096'}}>Electronically limited</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: '#718096'}}>Fuel Efficiency</div>
                <div style={{fontSize: 22, fontWeight: 700, color: '#2d3748'}}>18.5 km/l</div>
                <div style={{fontSize: 13, color: '#718096'}}>Combined cycle</div>
              </div>
              <div>
                <div style={{fontSize: 13, color: '#718096'}}>Emissions</div>
                <div style={{fontSize: 22, fontWeight: 700, color: '#2d3748'}}>120 g/km</div>
                <div style={{fontSize: 13, color: '#718096'}}>CO₂ (WLTP)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{marginTop: 25, background: 'white', borderRadius: 16, padding: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
        <div className="bom-header">
          <h2 className="bom-title">📦 Bill of Materials</h2>
          <div className="bom-actions">
            <button className="btn btn-secondary">📥 Import</button>
            <button className="btn btn-secondary">📤 Export</button>
            <button className="btn btn-primary">➕ Add Item</button>
          </div>
        </div>
        <div className="bom-summary">
          <div className="summary-box">
            <div className="summary-label">Total Items</div>
            <div className="summary-value">47</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">Total Cost</div>
            <div className="summary-value">₹4.25L</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">Total Weight</div>
            <div className="summary-value">185 kg</div>
          </div>
          <div className="summary-box">
            <div className="summary-label">Assembly Time</div>
            <div className="summary-value">4.5 hrs</div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item #</th>
              <th>Component</th>
              <th>Qty</th>
              <th>Material</th>
              <th>Weight</th>
              <th>Cost</th>
              <th>Make/Buy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="item-number">ENG-001</td>
              <td><strong>Engine Block Assembly</strong></td>
              <td>1</td>
              <td>Aluminum Alloy</td>
              <td>45.2 kg</td>
              <td><strong>₹85,000</strong></td>
              <td><span className="make-buy make">MAKE</span></td>
            </tr>
            <tr>
              <td className="item-number">ENG-002</td>
              <td><strong>Cylinder Head</strong></td>
              <td>1</td>
              <td>Cast Iron</td>
              <td>28.5 kg</td>
              <td><strong>₹62,000</strong></td>
              <td><span className="make-buy make">MAKE</span></td>
            </tr>
            <tr>
              <td className="item-number">ENG-003</td>
              <td><strong>Crankshaft</strong></td>
              <td>1</td>
              <td>Forged Steel</td>
              <td>18.3 kg</td>
              <td><strong>₹45,000</strong></td>
              <td><span className="make-buy buy">BUY</span></td>
            </tr>
            <tr>
              <td className="item-number">ENG-004</td>
              <td><strong>Turbocharger Unit</strong></td>
              <td>1</td>
              <td>Aluminum</td>
              <td>7.2 kg</td>
              <td><strong>₹38,000</strong></td>
              <td><span className="make-buy buy">BUY</span></td>
            </tr>
            <tr className="total-row">
              <td colSpan={7}>Total values shown above are for illustration only.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
);
};

export default BenchmarkDetail;

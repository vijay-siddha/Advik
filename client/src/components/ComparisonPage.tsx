
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ComparisonPage.css";

const ComparisonPage = () => {
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
      <button className="nav-item" onClick={() => navigate('/benchmarks')}>
        <span className="nav-icon">📊</span>Benchmarks
      </button>
      <button className="nav-item" onClick={() => navigate('/projects')}>
        <span className="nav-icon">📁</span>Projects
      </button>
      <button className="nav-item active" onClick={() => navigate('/compare')}>
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
        Home / <span>Comparative Analysis</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">📊 Product Comparison</h1>
        <button className="btn-primary">
          <span>📄</span>
          Generate Report
        </button>
      </div>
      {/* Product Selection */}
      <div className="selection-panel">
        <div className="panel-title">Select Products to Compare (3 Selected)</div>
        <div className="selected-products">
          <div className="product-chip bosch">
            <span>🔧</span>
            <div>
              <div>Bosch 2.0L TDI</div>
              <div className="product-chip-desc">₹4.25L • 185kg • 190hp</div>
            </div>
            <span className="remove">×</span>
          </div>
          <div className="product-chip vw">
            <span>🔧</span>
            <div>
              <div>VW 2.0L TDI</div>
              <div className="product-chip-desc">₹4.65L • 195kg • 177hp</div>
            </div>
            <span className="remove">×</span>
          </div>
          <div className="product-chip toyota">
            <span>🔧</span>
            <div>
              <div>Toyota 2.0L D4D</div>
              <div className="product-chip-desc">₹4.10L • 188kg • 170hp</div>
            </div>
            <span className="remove">×</span>
          </div>
          <button className="add-product-btn">
            <span>+</span>
            Add Product (Max 4)
          </button>
        </div>
      </div>
      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">📈 Performance Radar</div>
          <div className="radar-container">
            <div className="radar-chart">
              <div className="radar-bg"></div>
              <div className="radar-bg"></div>
              <div className="radar-bg"></div>
              <div className="radar-bg"></div>
              <div className="radar-axis rotate-0"></div>
              <div className="radar-axis rotate-60"></div>
              <div className="radar-axis rotate-120"></div>
              <div className="radar-axis rotate-180"></div>
              <div className="radar-axis rotate-240"></div>
              <div className="radar-axis rotate-300"></div>
            </div>
            <div className="radar-legend">
              <div className="legend-item">
                <div className="legend-color legend-bosch"></div>
                <span>Bosch TDI</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-vw"></div>
                <span>VW TDI</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-toyota"></div>
                <span>Toyota D4D</span>
              </div>
            </div>
          </div>
          <div className="radar-labels">
            <span className="radar-label">Cost</span>
            <span className="radar-label">Quality</span>
            <span className="radar-label">Performance</span>
            <span className="radar-label">NVH</span>
            <span className="radar-label">Efficiency</span>
            <span className="radar-label">Durability</span>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">💰 Cost Comparison</div>
          <div className="bar-chart">
            <div className="bar-group">
              <div className="bars">
                <div className="bar bar-bosch bar-h-91"></div>
                <div className="bar bar-vw bar-h-100"></div>
                <div className="bar bar-toyota bar-h-88"></div>
              </div>
              <span className="bar-label">Total Cost</span>
            </div>
            <div className="bar-group">
              <div className="bars">
                <div className="bar bar-bosch bar-h-95"></div>
                <div className="bar bar-vw bar-h-100"></div>
                <div className="bar bar-toyota bar-h-96"></div>
              </div>
              <span className="bar-label">Weight</span>
            </div>
            <div className="bar-group">
              <div className="bars">
                <div className="bar bar-bosch bar-h-100"></div>
                <div className="bar bar-vw bar-h-93"></div>
                <div className="bar bar-toyota bar-h-89"></div>
              </div>
              <span className="bar-label">Power</span>
            </div>
          </div>
        </div>
      </div>
      {/* Comparison Table */}
      <div className="comparison-table-container">
        <div className="chart-title">📋 Detailed Comparison (3 Products)</div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Bosch 2.0L TDI</th>
              <th>VW 2.0L TDI</th>
              <th>Toyota 2.0L D4D</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="metric-name">Total Cost</td>
              <td>₹4,25,000</td>
              <td>₹4,65,000</td>
              <td className="winner">₹4,10,000</td>
              <td>🏆 Toyota</td>
            </tr>
            <tr>
              <td className="metric-name">Weight</td>
              <td className="winner">185 kg</td>
              <td>195 kg</td>
              <td>188 kg</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">Power Output</td>
              <td className="winner">190 hp</td>
              <td>177 hp</td>
              <td>170 hp</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">Torque</td>
              <td className="winner">400 Nm</td>
              <td>380 Nm</td>
              <td>360 Nm</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">Fuel Efficiency</td>
              <td className="winner">22 km/l</td>
              <td>20 km/l</td>
              <td>21 km/l</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">NVH Score</td>
              <td>8.5/10</td>
              <td className="winner">8.8/10</td>
              <td>8.3/10</td>
              <td>🏆 VW</td>
            </tr>
            <tr>
              <td className="metric-name">Quality Score</td>
              <td className="winner">9.2/10</td>
              <td>8.9/10</td>
              <td>8.7/10</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">Assembly Time</td>
              <td className="winner">4.5 hrs</td>
              <td>5.2 hrs</td>
              <td>4.8 hrs</td>
              <td>🏆 Bosch</td>
            </tr>
            <tr>
              <td className="metric-name">DFMA Score</td>
              <td className="winner">8.2/10</td>
              <td>7.5/10</td>
              <td>7.8/10</td>
              <td>🏆 Bosch</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* AI Insights */}
      <div className="insights-panel">
        <div className="insights-title">
          <span>💡</span>
          AI-Powered Insights (3-Product Analysis)
        </div>
        <div className="insight-item">
          <span className="insight-icon">🏆</span>
          <div className="insight-text">
            <strong>Bosch engine leads in 6 out of 9 metrics</strong>, including power, torque, fuel efficiency, and manufacturing efficiency. Toyota offers the lowest cost but sacrifices performance.
          </div>
        </div>
        <div className="insight-item">
          <span className="insight-icon">💰</span>
          <div className="insight-text">
            <strong>Cost analysis:</strong> Toyota is cheapest at ₹4.10L, Bosch is middle at ₹4.25L, VW is most expensive at ₹4.65L. Bosch offers best value with only 3.6% cost premium over Toyota but 11.8% more power.
          </div>
        </div>
        <div className="insight-item">
          <span className="insight-icon">⚖️</span>
          <div className="insight-text">
            <strong>Weight comparison:</strong> Bosch is lightest (185kg), Toyota is +3kg (188kg), VW is heaviest (+10kg). Weight advantage gives Bosch better power-to-weight ratio.
          </div>
        </div>
        <div className="insight-item">
          <span className="insight-icon">🎯</span>
          <div className="insight-text">
            <strong>Strategic recommendation:</strong> Choose <strong>Bosch</strong> for performance & efficiency, <strong>Toyota</strong> for cost-sensitive applications, <strong>VW</strong> only for NVH-critical luxury segments.
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};

export default ComparisonPage;

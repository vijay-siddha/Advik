
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BenchmarkLibrary.css";

const demoData = [
  {
    icon: "🔧",
    name: "2.0L Turbo Diesel Engine",
    desc: "BMT-2024-TDI • 190hp",
    category: { label: "Engine", icon: "🔧", style: {} },
    manufacturer: "Bosch",
    year: "2024",
    cost: "₹4,25,000",
    weight: "185 kg",
    status: { label: "Active", icon: "🟢", className: "status-active" },
  },
  {
    icon: "⚙️",
    name: "8-Speed Automatic Transmission",
    desc: "8HP-50 • RWD",
    category: { label: "Transmission", icon: "⚙️", style: { background: "#f0fff4", color: "#22543d" } },
    manufacturer: "ZF Friedrichshafen",
    year: "2023",
    cost: "₹3,85,000",
    weight: "95 kg",
    status: { label: "Active", icon: "🟢", className: "status-active" },
  },
  {
    icon: "🔩",
    name: "MacPherson Strut Suspension",
    desc: "MP-2024-E • Electric Vehicle",
    category: { label: "Suspension", icon: "🔩", style: { background: "#fffaf0", color: "#7c2d12" } },
    manufacturer: "Denso",
    year: "2024",
    cost: "₹1,25,000",
    weight: "45 kg",
    status: { label: "Draft", icon: "🟡", className: "status-draft" },
    checked: true,
  },
  {
    icon: "🔄",
    name: "Electric Power Steering System",
    desc: "EPS-2023-H • High Torque",
    category: { label: "Steering", icon: "🔄", style: { background: "#faf5ff", color: "#553c9a" } },
    manufacturer: "NSK Ltd",
    year: "2023",
    cost: "₹85,000",
    weight: "12 kg",
    status: { label: "Active", icon: "🟢", className: "status-active" },
  },
  {
    icon: "🛑",
    name: "Disc Brake Assembly - Front",
    desc: "DBA-320mm • Ventilated",
    category: { label: "Braking", icon: "🛑", style: { background: "#fed7d7", color: "#742a2a" } },
    manufacturer: "Brembo",
    year: "2024",
    cost: "₹45,000",
    weight: "8.5 kg",
    status: { label: "Archived", icon: "🔴", className: "status-archived" },
  },
  {
    icon: "❄️",
    name: "HVAC Compressor - Electric",
    desc: "HVCC-2023 • 800V System",
    category: { label: "HVAC", icon: "❄️", style: { background: "#e6fffa", color: "#234e52" } },
    manufacturer: "Sanden Holdings",
    year: "2023",
    cost: "₹65,000",
    weight: "6.2 kg",
    status: { label: "Active", icon: "🟢", className: "status-active" },
  },
  {
    icon: "🔋",
    name: "12V Li-Ion Battery Pack",
    desc: "LFP-12V-50Ah • Automotive",
    category: { label: "Electrical", icon: "🔋", style: { background: "#fef5e7", color: "#744210" } },
    manufacturer: "CATL",
    year: "2024",
    cost: "₹28,000",
    weight: "4.8 kg",
    status: { label: "Active", icon: "🟢", className: "status-active" },
  },
];

const BenchmarkLibrary = () => {
  const navigate = useNavigate();
  // For demo, use index as id for navigation
  const handleView = (idx: number) => {
    navigate(`/benchmarks/${idx + 1}`);
  };
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
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <span className="nav-icon">🏠</span>
          Dashboard
        </button>
        <button className="nav-item active" onClick={() => navigate('/benchmarks')}>
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
          Home / <span>Benchmark Library</span>
        </div>

        <div className="page-header">
          <h1 className="page-title">📊 Benchmark Library</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={() => navigate('/compare')}>
              <span>🔍</span>
              Compare Products
            </button>
            <button className="btn-primary">
              <span>➕</span>
              New Benchmark
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Category:</span>
            <select className="filter-select" title="Category">
              <option>All Categories</option>
              <option>Engine</option>
              <option>Transmission</option>
              <option>Suspension</option>
              <option>Braking</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Year:</span>
            <select className="filter-select" title="Year">
              <option>All Years</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Manufacturer:</span>
            <select className="filter-select" title="Manufacturer">
              <option>All Manufacturers</option>
              <option>Bosch</option>
              <option>Denso</option>
              <option>ZF</option>
            </select>
          </div>

          <div className="search-filter">
            <input type="text" placeholder="🔍 Search by name, model, or component..." />
          </div>

          <div className="view-toggle">
            <button className="view-btn active">☰ List</button>
            <button className="view-btn">⊞ Grid</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="checkbox" />
                </th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Year</th>
                <th>Cost</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoData.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      defaultChecked={!!item.checked}
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <div className="product-img">{item.icon}</div>
                      <div className="product-info">
                        <h4>{item.name}</h4>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="category-badge"
                      style={item.category.style}
                    >
                      {item.category.icon} {item.category.label}
                    </span>
                  </td>
                  <td>{item.manufacturer}</td>
                  <td>{item.year}</td>
                  <td>
                    <strong>{item.cost}</strong>
                  </td>
                  <td>{item.weight}</td>
                  <td>
                    <span
                      className={`status-badge ${item.status.className}`}
                    >
                      {item.status.icon} {item.status.label}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-icon-btn"
                        title="View"
                        onClick={() => handleView(idx)}
                      >
                        👁
                      </button>
                      <button className="action-icon-btn" title="Edit">
                        ✏️
                      </button>
                      <button className="action-icon-btn" title="Delete">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-bar">
            <div className="bulk-actions">
              <button className="btn-secondary">📊 Compare Selected</button>
              <button className="btn-secondary">📦 Bulk Actions ▼</button>
            </div>

            <div className="pagination">
              <button className="page-btn">←</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn">...</button>
              <button className="page-btn">12</button>
              <button className="page-btn">→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BenchmarkLibrary;

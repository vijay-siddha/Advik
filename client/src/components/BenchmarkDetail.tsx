import React, { useState } from 'react'
import './BenchmarkDetail.css'

interface BenchmarkDetailProps {
  benchmarkId?: string
  onEdit?: () => void
  onReport?: () => void
  onShare?: () => void
  onBack?: () => void
}

export default function BenchmarkDetail({ 
  benchmarkId = 'BMT-2024-TDI', 
  onEdit, 
  onReport, 
  onShare, 
  onBack 
}: BenchmarkDetailProps) {
  const [activeTab, setActiveTab] = useState('specifications')
  const [activeImage, setActiveImage] = useState(0)

  const benchmarkData = {
    id: benchmarkId,
    name: '2.0L Turbo Diesel Engine',
    manufacturer: 'Bosch',
    model: 'BMT-2024-TDI',
    year: 2024,
    origin: 'Germany',
    category: 'Engine',
    status: 'active',
    overallScore: 8.7,
    costEfficiency: 7.5,
    quality: 9.2,
    performance: 9.0,
    nvhRating: 8.5,
    specifications: {
      physicalWeight: { value: '185 kg', detail: 'Total dry weight without fluids' },
      dimensions: { value: '650×480×720', detail: 'mm - Compact inline configuration' },
      totalCost: { value: '₹4.25L', detail: 'Estimated manufacturing cost' },
      displacement: { value: '1,968 cc', detail: '2.0L inline-4 configuration' },
      powerOutput: { value: '190 hp', detail: '@ 4,000 rpm (140 kW)' },
      torque: { value: '400 Nm', detail: '@ 1,750-2,500 rpm' }
    },
    performanceMetrics: {
      fuelEfficiency: { value: '22 km/l', note: 'Combined cycle' },
      emissions: { value: 'Euro 6d', note: 'Compliant' },
      noiseLevel: { value: '68 dB', note: '@ idle' },
      vibration: { value: '2.1 mm/s', note: 'RMS' }
    },
    billOfMaterials: [
      { id: 'ENG-001', name: 'Engine Block Assembly', qty: 1, material: 'Aluminum Alloy', weight: '45.2 kg', cost: '₹85,000', makeBuy: 'make' },
      { id: 'ENG-002', name: 'Cylinder Head', qty: 1, material: 'Cast Iron', weight: '28.5 kg', cost: '₹62,000', makeBuy: 'make' },
      { id: 'ENG-003', name: 'Crankshaft', qty: 1, material: 'Forged Steel', weight: '18.3 kg', cost: '₹45,000', makeBuy: 'buy' },
      { id: 'ENG-004', name: 'Turbocharger Unit', qty: 1, material: 'Mixed Materials', weight: '8.5 kg', cost: '₹78,000', makeBuy: 'buy' },
      { id: 'ENG-005', name: 'Fuel Injection System', qty: 1, material: 'Steel/Aluminum', weight: '6.2 kg', cost: '₹52,000', makeBuy: 'buy' },
      { id: 'ENG-006', name: 'Piston Assembly', qty: 4, material: 'Aluminum Alloy', weight: '2.8 kg', cost: '₹18,000', makeBuy: 'make' },
      { id: 'ENG-007', name: 'Connecting Rod', qty: 4, material: 'Forged Steel', weight: '3.2 kg', cost: '₹15,000', makeBuy: 'make' },
      { id: 'ENG-008', name: 'Camshaft', qty: 2, material: 'Cast Iron', weight: '4.5 kg', cost: '₹22,000', makeBuy: 'make' },
      { id: 'ENG-009', name: 'Timing Chain Kit', qty: 1, material: 'Steel', weight: '1.8 kg', cost: '₹8,500', makeBuy: 'buy' },
      { id: 'ENG-010', name: 'Oil Pan', qty: 1, material: 'Steel', weight: '4.2 kg', cost: '₹6,000', makeBuy: 'make' }
    ],
    images: ['🔧', '📷', '📹', '📐']
  }

  const tabs = [
    { id: 'specifications', label: '📋 Specifications', icon: '📋' },
    { id: 'bom', label: '📦 Bill of Materials', icon: '📦' },
    { id: 'manufacturing', label: '⚙️ Manufacturing', icon: '⚙️' },
    { id: 'cost', label: '💰 Cost Analysis', icon: '💰' },
    { id: 'media', label: '📸 Media & Docs', icon: '📸' },
    { id: 'ar', label: '🥽 AR/VR View', icon: '🥽' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'green'
    if (score >= 8) return 'blue'
    if (score >= 7) return 'orange'
    return 'red'
  }

  const getScoreWidth = (score: number) => {
    return Math.min(score * 10, 100)
  }

  const totalWeight = benchmarkData.billOfMaterials.reduce((sum, item) => sum + parseFloat(item.weight), 0)
  const totalCost = benchmarkData.billOfMaterials.reduce((sum, item) => {
    const cost = item.cost.replace('₹', '').replace(',', '')
    return sum + parseFloat(cost)
  }, 0)
  const makeCount = benchmarkData.billOfMaterials.filter(item => item.makeBuy === 'make').length
  const buyCount = benchmarkData.billOfMaterials.filter(item => item.makeBuy === 'buy').length

  return (
    <div className="benchmark-detail">
      {/* Product Header */}
      <div className="product-header">
          <div className="header-top">
            <div className="product-title-section">
              <div className="product-image-gallery">
                <div className="main-image">🔧</div>
                <div className="thumbnail-stack">
                  {benchmarkData.images.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumb ${index === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      {img}
                    </div>
                  ))}
                  <div className="add-photo">+</div>
                </div>
              </div>
              <div className="product-info">
                <h1>{benchmarkData.name}</h1>
                <div className="product-meta">
                  <div className="meta-item">
                    <span>🏢</span>
                    <strong>Manufacturer:</strong> {benchmarkData.manufacturer}
                  </div>
                  <div className="meta-item">
                    <span>🔢</span>
                    <strong>Model:</strong> {benchmarkData.model}
                  </div>
                  <div className="meta-item">
                    <span>📅</span>
                    <strong>Year:</strong> {benchmarkData.year}
                  </div>
                  <div className="meta-item">
                    <span>🌍</span>
                    <strong>Origin:</strong> {benchmarkData.origin}
                  </div>
                  <div className="meta-item">
                    <span>🏷️</span>
                    <strong>Category:</strong> {benchmarkData.category}
                  </div>
                </div>
                <span className="status-badge">🟢 Active Benchmark</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={onEdit}>✏️ Edit</button>
              <button className="btn btn-secondary" onClick={onReport}>📄 Report</button>
              <button className="btn btn-primary" onClick={onShare}>🔗 Share</button>
            </div>
          </div>

          {/* Score Grid */}
          <div className="score-grid">
            <div className="score-card">
              <div className="score-label">Overall Score</div>
              <div className="score-value">{benchmarkData.overallScore}</div>
              <div className="score-bar">
                <div 
                  className={`score-fill ${getScoreColor(benchmarkData.overallScore)}`} 
                  style={{ width: `${getScoreWidth(benchmarkData.overallScore)}%` }}
                ></div>
              </div>
            </div>
            <div className="score-card">
              <div className="score-label">Cost Efficiency</div>
              <div className="score-value">{benchmarkData.costEfficiency}</div>
              <div className="score-bar">
                <div 
                  className={`score-fill ${getScoreColor(benchmarkData.costEfficiency)}`} 
                  style={{ width: `${getScoreWidth(benchmarkData.costEfficiency)}%` }}
                ></div>
              </div>
            </div>
            <div className="score-card">
              <div className="score-label">Quality</div>
              <div className="score-value">{benchmarkData.quality}</div>
              <div className="score-bar">
                <div 
                  className={`score-fill ${getScoreColor(benchmarkData.quality)}`} 
                  style={{ width: `${getScoreWidth(benchmarkData.quality)}%` }}
                ></div>
              </div>
            </div>
            <div className="score-card">
              <div className="score-label">Performance</div>
              <div className="score-value">{benchmarkData.performance}</div>
              <div className="score-bar">
                <div 
                  className={`score-fill ${getScoreColor(benchmarkData.performance)}`} 
                  style={{ width: `${getScoreWidth(benchmarkData.performance)}%` }}
                ></div>
              </div>
            </div>
            <div className="score-card">
              <div className="score-label">NVH Rating</div>
              <div className="score-value">{benchmarkData.nvhRating}</div>
              <div className="score-bar">
                <div 
                  className={`score-fill ${getScoreColor(benchmarkData.nvhRating)}`} 
                  style={{ width: `${getScoreWidth(benchmarkData.nvhRating)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-section">
          <div className="tabs-header">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </div>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'specifications' && (
              <div className="specs-grid">
                {Object.entries(benchmarkData.specifications).map(([key, spec]: [string, any]) => (
                  <div key={key} className="spec-card" style={{ borderLeftColor: key === 'displacement' ? '#48bb78' : key === 'powerOutput' ? '#ed8936' : key === 'torque' ? '#9f7aea' : undefined }}>
                    <div className="spec-title">{spec.value.split(' ')[0]}</div>
                    <div className="spec-value">{spec.value}</div>
                    <div className="spec-detail">{spec.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bom' && (
              <div>
                <div style={{ marginTop: '30px', padding: '25px', background: '#f7fafc', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#2d3748' }}>Performance Metrics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {Object.entries(benchmarkData.performanceMetrics).map(([key, metric]: [string, any]) => (
                      <div key={key}>
                        <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>{metric.value.split(' ')[0]}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#2d3748' }}>{metric.value}</div>
                        <div style={{ fontSize: '13px', color: '#48bb78' }}>{metric.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manufacturing' && (
              <div style={{ marginTop: '25px', background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
                    <div className="summary-value">{benchmarkData.billOfMaterials.length}</div>
                  </div>
                  <div className="summary-box">
                    <div className="summary-label">Total Cost</div>
                    <div className="summary-value">₹{(totalCost / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="summary-box">
                    <div className="summary-label">Total Weight</div>
                    <div className="summary-value">{totalWeight.toFixed(2)} kg</div>
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
                    {benchmarkData.billOfMaterials.map((item, index) => (
                      <tr key={item.id}>
                        <td className="item-number">{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.qty}</td>
                        <td>{item.material}</td>
                        <td>{item.weight}</td>
                        <td><strong>{item.cost}</strong></td>
                        <td>
                          <span className={`make-buy ${item.makeBuy}`}>
                            {item.makeBuy.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan={4}><strong>TOTAL</strong></td>
                      <td><strong>{totalWeight.toFixed(2)} kg</strong></td>
                      <td><strong>₹{(totalCost / 100000).toFixed(2)}L</strong></td>
                      <td><strong>{makeCount}% Make / {buyCount}% Buy</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'cost' && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                <h3>Cost Analysis</h3>
                <p>Detailed cost breakdown and analysis coming soon...</p>
              </div>
            )}

            {activeTab === 'media' && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                <h3>Media & Documentation</h3>
                <p>Media files and documentation will be available here...</p>
              </div>
            )}

            {activeTab === 'ar' && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                <h3>AR/VR View</h3>
                <p>Interactive 3D view in AR/VR coming soon...</p>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

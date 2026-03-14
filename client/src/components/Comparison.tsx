import React, { useState } from 'react'
import './Comparison.css'

interface Product {
  id: string
  name: string
  code: string
  cost: number
  weight: number
  power: number
  manufacturer: string
  gradient: string
  color: string
  icon: string
}

interface ComparisonMetric {
  name: string
  bosch: string | number
  vw: string | number
  toyota: string | number
  winner: 'bosch' | 'vw' | 'toyota'
}

interface ComparisonProps {
  onGenerateReport?: () => void
  onAddProduct?: () => void
}

export default function Comparison({ onGenerateReport, onAddProduct }: ComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Bosch 2.0L TDI',
      code: 'BMT-2024-TDI',
      cost: 425000,
      weight: 185,
      power: 190,
      manufacturer: 'Bosch',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
      icon: '🔧'
    },
    {
      id: '2',
      name: 'VW 2.0L TDI',
      code: 'VW-2024-TDI',
      cost: 465000,
      weight: 195,
      power: 177,
      manufacturer: 'VW',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f5576c',
      icon: '🔧'
    },
    {
      id: '3',
      name: 'Toyota 2.0L D4D',
      code: 'TOY-2024-D4D',
      cost: 410000,
      weight: 188,
      power: 170,
      manufacturer: 'Toyota',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#00f2fe',
      icon: '🔧'
    }
  ])

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== id))
  }

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`
  }

  const metrics: ComparisonMetric[] = [
    { name: 'Total Cost', bosch: '₹4,25,000', vw: '₹4,65,000', toyota: '₹4,10,000', winner: 'toyota' },
    { name: 'Weight', bosch: '185 kg', vw: '195 kg', toyota: '188 kg', winner: 'bosch' },
    { name: 'Power Output', bosch: '190 hp', vw: '177 hp', toyota: '170 hp', winner: 'bosch' },
    { name: 'Torque', bosch: '400 Nm', vw: '380 Nm', toyota: '360 Nm', winner: 'bosch' },
    { name: 'Fuel Efficiency', bosch: '22 km/l', vw: '20 km/l', toyota: '21 km/l', winner: 'bosch' },
    { name: 'NVH Score', bosch: '8.5/10', vw: '8.8/10', toyota: '8.3/10', winner: 'vw' },
    { name: 'Quality Score', bosch: '9.2/10', vw: '8.9/10', toyota: '8.7/10', winner: 'bosch' },
    { name: 'Assembly Time', bosch: '4.5 hrs', vw: '5.2 hrs', toyota: '4.8 hrs', winner: 'bosch' },
    { name: 'DFMA Score', bosch: '8.2/10', vw: '7.5/10', toyota: '7.8/10', winner: 'bosch' }
  ]

  const getWinnerName = (winner: string) => {
    const product = selectedProducts.find(p => p.manufacturer.toLowerCase() === winner)
    return product?.name || winner
  }

  const getWinnerClass = (metric: ComparisonMetric, product: 'bosch' | 'vw' | 'toyota') => {
    return metric.winner === product ? 'winner' : ''
  }

  const getMaxHeight = (values: number[]) => {
    return Math.max(...values)
  }

  const getBarHeight = (value: number, maxValue: number) => {
    return `${(value / maxValue) * 100}%`
  }

  return (
    <div className="comparison">
      <div className="page-header">
          <h1 className="page-title">📊 Product Comparison</h1>
          <button className="btn-primary" onClick={onGenerateReport}>
            <span>📄</span>
            Generate Report
          </button>
        </div>

        {/* Product Selection */}
        <div className="selection-panel">
          <div className="panel-title">Select Products to Compare ({selectedProducts.length} Selected)</div>
          <div className="selected-products">
            {selectedProducts.map((product) => (
              <div key={product.id} className="product-chip" style={{ background: product.gradient }}>
                <span>{product.icon}</span>
                <div>
                  <div>{product.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    {formatCurrency(product.cost)} • {product.weight}kg • {product.power}hp
                  </div>
                </div>
                <span className="remove" onClick={() => removeProduct(product.id)}>×</span>
              </div>
            ))}
            {selectedProducts.length < 4 && (
              <button className="add-product-btn" onClick={onAddProduct}>
                <span>+</span>
                Add Product (Max 4)
              </button>
            )}
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
                <div className="radar-axis" style={{ transform: 'rotate(0deg)' }}></div>
                <div className="radar-axis" style={{ transform: 'rotate(60deg)' }}></div>
                <div className="radar-axis" style={{ transform: 'rotate(120deg)' }}></div>
                <div className="radar-axis" style={{ transform: 'rotate(180deg)' }}></div>
                <div className="radar-axis" style={{ transform: 'rotate(240deg)' }}></div>
                <div className="radar-axis" style={{ transform: 'rotate(300deg)' }}></div>
              </div>
              <div className="radar-legend">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="legend-item">
                    <div className="legend-color" style={{ background: product.color }}></div>
                    <span>{product.manufacturer} TDI</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
              <span style={{ fontSize: '12px', color: '#718096' }}>Cost</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>Quality</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>Performance</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>NVH</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>Efficiency</span>
              <span style={{ fontSize: '12px', color: '#718096' }}>Durability</span>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">💰 Cost Comparison</div>
            <div className="bar-chart">
              <div className="bar-group">
                <div className="bars">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bar"
                      style={{ 
                        height: getBarHeight(product.cost, getMaxHeight(selectedProducts.map(p => p.cost))),
                        background: product.color 
                      }}
                    >
                      <span className="bar-value">{formatCurrency(product.cost)}</span>
                    </div>
                  ))}
                </div>
                <span className="bar-label">Total Cost</span>
              </div>
              <div className="bar-group">
                <div className="bars">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bar"
                      style={{ 
                        height: getBarHeight(product.weight, getMaxHeight(selectedProducts.map(p => p.weight))),
                        background: product.color 
                      }}
                    >
                      <span className="bar-value">{product.weight}kg</span>
                    </div>
                  ))}
                </div>
                <span className="bar-label">Weight</span>
              </div>
              <div className="bar-group">
                <div className="bars">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bar"
                      style={{ 
                        height: getBarHeight(product.power, getMaxHeight(selectedProducts.map(p => p.power))),
                        background: product.color 
                      }}
                    >
                      <span className="bar-value">{product.power}hp</span>
                    </div>
                  ))}
                </div>
                <span className="bar-label">Power</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="comparison-table-container">
          <div className="chart-title">📋 Detailed Comparison ({selectedProducts.length} Products)</div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Metric</th>
                {selectedProducts.map((product) => (
                  <th key={product.id}>
                    <div className="product-header-cell">
                      <div 
                        className="product-icon" 
                        style={{ 
                          background: product.color === '#667eea' ? '#e0e7ff' : 
                                     product.color === '#f5576c' ? '#fce7f3' : '#cffafe' 
                        }}
                      >
                        {product.icon}
                      </div>
                      <div>{product.name}</div>
                    </div>
                  </th>
                ))}
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index}>
                  <td className="metric-name">{metric.name}</td>
                  <td className={getWinnerClass(metric, 'bosch')}>{metric.bosch}</td>
                  <td className={getWinnerClass(metric, 'vw')}>{metric.vw}</td>
                  <td className={getWinnerClass(metric, 'toyota')}>{metric.toyota}</td>
                  <td>🏆 {getWinnerName(metric.winner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Insights */}
        <div className="insights-panel">
          <div className="insights-title">
            <span>💡</span>
            AI-Powered Insights ({selectedProducts.length}-Product Analysis)
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
              <strong>Cost analysis:</strong> Toyota is cheapest at ₹4.10L, Bosch is middle at ₹4.25L, VW is most expensive at ₹4.65L. Bosch offers the best value with only 3.6% cost premium over Toyota but 11.8% more power.
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
    </div>
  )
}

import React, { useState } from 'react'
import './BenchmarkList.css'

interface BenchmarkItem {
  id: string
  name: string
  code: string
  description: string
  category: string
  categoryIcon: string
  manufacturer: string
  year: number
  cost: number
  weight: number
  status: 'active' | 'draft' | 'archived'
  selected: boolean
}

interface BenchmarkListProps {
  onCreateNew?: () => void
  onView?: (item: BenchmarkItem) => void
  onEdit?: (item: BenchmarkItem) => void
  onDelete?: (item: BenchmarkItem) => void
  onCompare?: (items: BenchmarkItem[]) => void
}

export default function BenchmarkList({ 
  onCreateNew, 
  onView, 
  onEdit, 
  onDelete, 
  onCompare 
}: BenchmarkListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [manufacturerFilter, setManufacturerFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([
    {
      id: '1',
      name: '2.0L Turbo Diesel Engine',
      code: 'BMT-2024-TDI',
      description: '190hp',
      category: 'Engine',
      categoryIcon: '🔧',
      manufacturer: 'Bosch',
      year: 2024,
      cost: 425000,
      weight: 185,
      status: 'active',
      selected: false
    },
    {
      id: '2',
      name: '8-Speed Automatic Transmission',
      code: '8HP-50',
      description: 'RWD',
      category: 'Transmission',
      categoryIcon: '⚙️',
      manufacturer: 'ZF Friedrichshafen',
      year: 2023,
      cost: 385000,
      weight: 95,
      status: 'active',
      selected: false
    },
    {
      id: '3',
      name: 'MacPherson Strut Suspension',
      code: 'MP-2024-E',
      description: 'Electric Vehicle',
      category: 'Suspension',
      categoryIcon: '🔩',
      manufacturer: 'Denso',
      year: 2024,
      cost: 125000,
      weight: 45,
      status: 'draft',
      selected: true
    },
    {
      id: '4',
      name: 'Electric Power Steering System',
      code: 'EPS-2023-H',
      description: 'High Torque',
      category: 'Steering',
      categoryIcon: '🔄',
      manufacturer: 'NSK Ltd',
      year: 2023,
      cost: 85000,
      weight: 12,
      status: 'active',
      selected: false
    },
    {
      id: '5',
      name: 'Disc Brake Assembly - Front',
      code: 'DBA-320mm',
      description: 'Ventilated',
      category: 'Braking',
      categoryIcon: '🛑',
      manufacturer: 'Brembo',
      year: 2024,
      cost: 45000,
      weight: 8.5,
      status: 'archived',
      selected: false
    },
    {
      id: '6',
      name: 'HVAC Compressor - Electric',
      code: 'HVCC-2023',
      description: '800V System',
      category: 'HVAC',
      categoryIcon: '❄️',
      manufacturer: 'Sanden Holdings',
      year: 2023,
      cost: 65000,
      weight: 6.2,
      status: 'active',
      selected: false
    },
    {
      id: '7',
      name: '12V Li-Ion Battery Pack',
      code: 'LFP-12V-50Ah',
      description: 'Automotive',
      category: 'Electrical',
      categoryIcon: '🔋',
      manufacturer: 'CATL',
      year: 2024,
      cost: 28000,
      weight: 4.8,
      status: 'active',
      selected: false
    }
  ])

  const toggleSelection = (id: string) => {
    setBenchmarks(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const toggleAllSelection = () => {
    const allSelected = benchmarks.every(item => item.selected)
    setBenchmarks(prev => 
      prev.map(item => ({ ...item, selected: !allSelected }))
    )
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'draft': return 'status-draft'
      case 'archived': return 'status-archived'
      default: return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢'
      case 'draft': return '🟡'
      case 'archived': return '🔴'
      default: return ''
    }
  }

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      'Engine': { bg: '#ebf8ff', color: '#2b6cb0' },
      'Transmission': { bg: '#f0fff4', color: '#22543d' },
      'Suspension': { bg: '#fffaf0', color: '#7c2d12' },
      'Steering': { bg: '#faf5ff', color: '#553c9a' },
      'Braking': { bg: '#fed7d7', color: '#742a2a' },
      'HVAC': { bg: '#e6fffa', color: '#234e52' },
      'Electrical': { bg: '#fef5e7', color: '#744210' }
    }
    return styles[category] || { bg: '#ebf8ff', color: '#2b6cb0' }
  }

  const selectedCount = benchmarks.filter(item => item.selected).length

  return (
    <div className="benchmark-list">
      <div className="page-header">
          <h1 className="page-title">📊 Benchmark Library</h1>
          <button className="btn-primary" onClick={onCreateNew}>
            <span>➕</span>
            New Benchmark
          </button>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Category:</span>
            <select 
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="engine">Engine</option>
              <option value="transmission">Transmission</option>
              <option value="suspension">Suspension</option>
              <option value="braking">Braking</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Year:</span>
            <select 
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Manufacturer:</span>
            <select 
              className="filter-select"
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
            >
              <option value="all">All Manufacturers</option>
              <option value="bosch">Bosch</option>
              <option value="denso">Denso</option>
              <option value="zf">ZF</option>
            </select>
          </div>

          <div className="search-filter">
            <input 
              type="text" 
              placeholder="🔍 Search by name, model, or component..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    className="checkbox"
                    checked={benchmarks.every(item => item.selected)}
                    onChange={toggleAllSelection}
                  />
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
              {benchmarks.map((item) => {
                const categoryStyle = getCategoryStyle(item.category)
                return (
                  <tr key={item.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="product-img">{item.categoryIcon}</div>
                        <div className="product-info">
                          <h4>{item.name}</h4>
                          <p>{item.code} • {item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="category-badge"
                        style={{ background: categoryStyle.bg, color: categoryStyle.color }}
                      >
                        {item.categoryIcon} {item.category}
                      </span>
                    </td>
                    <td>{item.manufacturer}</td>
                    <td>{item.year}</td>
                    <td><strong>₹{item.cost.toLocaleString('en-IN')}</strong></td>
                    <td>{item.weight} kg</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {getStatusIcon(item.status)} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          className="action-icon-btn" 
                          title="View"
                          onClick={() => onView?.(item)}
                        >
                          👁
                        </button>
                        <button 
                          className="action-icon-btn" 
                          title="Edit"
                          onClick={() => onEdit?.(item)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-icon-btn" 
                          title="Delete"
                          onClick={() => onDelete?.(item)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="pagination-bar">
            <div className="bulk-actions">
              <button 
                className="btn-secondary"
                onClick={() => onCompare?.(benchmarks.filter(item => item.selected))}
                disabled={selectedCount === 0}
              >
                📊 Compare Selected {selectedCount > 0 && `(${selectedCount})`}
              </button>
              <button className="btn-secondary">
                📦 Bulk Actions ▼
              </button>
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
    </div>
  )
}

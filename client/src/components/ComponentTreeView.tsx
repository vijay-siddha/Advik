import { useState } from 'react'

interface Component {
  id: string
  name: string
  parent_id: string | null
  attributes: any
  media: any
  status: string
  created_at: string
  updated_at: string
}

interface ComponentTreeViewProps {
  components: Component[]
  onComponentSelect?: (component: Component) => void
}

interface TreeNode {
  component: Component
  children: TreeNode[]
  level: number
}

export default function ComponentTreeView({ components, onComponentSelect }: ComponentTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Build tree structure from flat list
  const buildTree = (flatComponents: Component[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>()
    const rootNodes: TreeNode[] = []

    // Create all nodes
    flatComponents.forEach(comp => {
      nodeMap.set(comp.id, {
        component: comp,
        children: [],
        level: 0
      })
    })

    // Build hierarchy
    flatComponents.forEach(comp => {
      const node = nodeMap.get(comp.id)!
      if (comp.parent_id && nodeMap.has(comp.parent_id)) {
        const parent = nodeMap.get(comp.parent_id)!
        parent.children.push(node)
        node.level = parent.level + 1
      } else {
        rootNodes.push(node)
      }
    })

    return rootNodes
  }

  const tree = buildTree(components)

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: TreeNode) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.component.id)
    const indent = node.level * 20

    return (
      <div key={node.component.id}>
        <div 
          className="tree-node"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => onComponentSelect?.(node.component)}
        >
          <span 
            className={`tree-toggle ${hasChildren ? 'has-children' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) toggleExpand(node.component.id)
            }}
          >
            {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
          </span>
          <span className="tree-node-name">{node.component.name}</span>
          <span className="tree-node-status">{node.component.status}</span>
          <span className="tree-node-attrs">{Object.keys(node.component.attributes || {}).length} attrs</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="component-tree">
      <div className="tree-header">
        <span>Component Name</span>
        <span>Status</span>
        <span>Attributes</span>
      </div>
      {tree.map(node => renderNode(node))}
    </div>
  )
}

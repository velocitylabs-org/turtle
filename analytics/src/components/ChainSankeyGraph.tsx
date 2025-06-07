import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import debounce from 'just-debounce-it'
import React, { useRef, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react'
import MultiSelect from '@/components/MultiSelect'
import { chains, GraphType, primaryColor } from '@/constants'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

const svgNs = 'http://www.w3.org/2000/svg'

interface ChainFlowData {
  from: string
  to: string
  size: number
}

interface ChainPathGraphProps {
  data: ChainFlowData[] | undefined
  type: GraphType
  selectedChain: string
  setChainUid: (chainUid: string) => void
}

interface Node {
  id: string
  name: string
  x: number
  y: number
  logoURI: string
}

interface Link {
  source: string
  target: string
  value: number
  width: number
  path: string
}

// Helper function to create SVG elements
function createSvgElement(
  tag: string,
  attributes: Record<string, string> = {},
  parent?: SVGElement | HTMLElement,
): SVGElement {
  const element = document.createElementNS(svgNs, tag)

  // Add transition for smooth animations when tag is 'path'
  if (tag === 'path') {
    element.style.transition =
      'd 300ms cubic-bezier(.165, .84, .44, 1), stroke-width 300ms cubic-bezier(.165, .84, .44, 1)'
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  if (parent) {
    parent.appendChild(element)
  }
  return element
}

// Helper function to add right side label (chain name and weight)
function addRightLabel(
  svg: SVGSVGElement,
  node: Node,
  nodeSize: number,
  chainName: string,
  nodeWeight: number,
  type: GraphType,
): void {
  // Create label group for right side
  const labelGroup = createSvgElement(
    'g',
    {
      transform: `translate(${node.x + nodeSize / 2 + 10}, ${node.y - 7})`,
    },
    svg,
  )

  // Chain name text
  createSvgElement(
    'text',
    {
      x: '0',
      y: '0',
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      fill: 'black',
      'font-size': '12px',
      'font-weight': 'bold',
    },
    labelGroup,
  ).textContent = chainName

  // Weight text
  const weightText = createSvgElement(
    'text',
    {
      x: '0',
      y: '15',
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      fill: '#666',
      'font-size': '10px',
    },
    labelGroup,
  )

  // Format weight based on type
  weightText.textContent = type === 'volume' ? `$${formatUSD(nodeWeight)}` : nodeWeight.toString()
}

// Helper function to add left side percentage label
function addPercentageLabel(
  svg: SVGSVGElement,
  node: Node,
  nodeSize: number,
  percentage: number,
): void {
  // Create percentage label group for left side
  const percentLabelGroup = createSvgElement(
    'g',
    {
      transform: `translate(${node.x - nodeSize / 2 - 40}, ${node.y})`,
    },
    svg,
  )

  // Percentage text
  const percentText = createSvgElement(
    'text',
    {
      x: '0',
      y: '0',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: '#666',
      'font-size': '10px',
      'font-weight': 'bold',
    },
    percentLabelGroup,
  )

  // Format percentage: use more decimal places for very small values
  percentText.textContent =
    percentage < 0.01 && percentage > 0 ? `${percentage.toFixed(4)}%` : `${percentage.toFixed(2)}%`
}

// Helper function to create nodes
function createNodes(
  flowData: ChainFlowData[],
  margin: { top: number; right: number; bottom: number; left: number },
  width: number,
  nodeSize: number,
  selectedChain: string,
): { nodes: Node[]; sourceNode: Node; totalHeight: number } {
  const nodes: Node[] = []
  const sourceX = margin.left + nodeSize
  const targetX = width - margin.right - nodeSize * 2 + 10
  const nodePadding = 15

  let totalHeight = margin.top

  // Source node Y position
  const sourceNodeY = Math.max(margin.top + nodeSize, totalHeight + nodeSize / 2)

  // Create virtual source node for path connections
  const sourceId = selectedChain
  const sourceChain = chainsByUid[sourceId]
  const sourceName = sourceChain?.name || sourceId

  const sourceNode = {
    id: sourceId,
    name: sourceName,
    x: sourceX - 20,
    y: sourceNodeY,
    logoURI: '',
  }

  // Reset total height for targets
  totalHeight = Math.max(margin.top + nodeSize, margin.top)

  // Create target nodes
  const targets = Array.from(new Set(flowData.map(d => d.to)))
  targets.forEach(id => {
    const chain = chainsByUid[id]
    const logoURI = chain ? getSrcFromLogo(chain) : ''

    // Ensure the node is well within the visible area
    const nodeY = Math.max(margin.top + nodeSize, totalHeight + nodeSize / 2)

    nodes.push({
      id,
      name: chain?.name || id,
      x: targetX,
      y: nodeY,
      logoURI,
    })
    totalHeight += nodeSize + nodePadding
  })

  return { nodes, sourceNode, totalHeight }
}

// Helper function to create links between nodes
function createLinks(
  flowData: ChainFlowData[],
  nodeMap: Map<string, Node>,
  selectedChain: string,
  maxValue: number,
  nodeSize: number,
  containerWidth?: number,
): Link[] {
  const links: Link[] = []

  flowData.forEach(d => {
    // Only create links from the selected source (with -origin suffix)
    if (d.from !== `${selectedChain}-origin`) return

    const source = nodeMap.get(d.from)! // Our virtual source node
    const target = nodeMap.get(d.to)!

    // Calculate link width - with a minimum of 10px
    const minLinkWidth = 10
    const maxLinkWidth = 40
    const linkWidthScale = maxLinkWidth / maxValue
    const linkWidth = Math.max(minLinkWidth, d.size * linkWidthScale)

    // Calculate control point distance based on container width for more responsive curves
    // This makes the curves adapt to the container width
    const controlPointDistance = containerWidth
      ? Math.min(150, containerWidth * 0.2) // Responsive control point distance
      : 150 // Default if containerWidth not provided

    // Create curved path from source to target with responsive control points
    const path = `
      M ${source.x + controlPointDistance} ${source.y}
      C ${source.x + controlPointDistance + (target.x - source.x - controlPointDistance) / 2} ${source.y},
        ${source.x + controlPointDistance + (target.x - source.x - controlPointDistance) / 2} ${target.y},
        ${target.x - nodeSize / 2} ${target.y}
    `

    links.push({
      source: d.from,
      target: d.to,
      value: d.size,
      width: linkWidth,
      path,
    })
  })

  return links
}

// Helper function to create SVG definitions (defs, clipPath, gradient)
function createSvgDefsElements(svg: SVGSVGElement, nodeSize: number): void {
  // Create a defs section for gradients and clipPath
  const defs = createSvgElement('defs', {}, svg)

  // Create clipPath for nodes
  const clipPath = createSvgElement('clipPath', { id: 'circle-clip' }, defs)
  createSvgElement(
    'circle',
    {
      cx: (nodeSize / 2).toString(),
      cy: (nodeSize / 2).toString(),
      r: (nodeSize / 2).toString(),
    },
    clipPath,
  )

  // Create a gradient for link opacity effect
  const gradient = createSvgElement(
    'linearGradient',
    {
      id: 'linkGradient',
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    },
    defs,
  )

  // Gradient stops
  createSvgElement(
    'stop',
    {
      offset: '0%',
      'stop-color': primaryColor,
      'stop-opacity': '0.5',
    },
    gradient,
  )

  createSvgElement(
    'stop',
    {
      offset: '85%',
      'stop-color': primaryColor,
      'stop-opacity': '0.5',
    },
    gradient,
  )

  createSvgElement(
    'stop',
    {
      offset: '100%',
      'stop-color': primaryColor,
      'stop-opacity': '0',
    },
    gradient,
  )
}

// Helper function to render a node
function renderNode(svg: SVGSVGElement, node: Node, nodeSize: number): void {
  const group = createSvgElement(
    'g',
    {
      transform: `translate(${node.x - nodeSize / 2}, ${node.y - nodeSize / 2})`,
    },
    svg,
  )

  // Node border circle
  const circle = createSvgElement(
    'circle',
    {
      cx: (nodeSize / 2).toString(),
      cy: (nodeSize / 2).toString(),
      r: (nodeSize / 2).toString(),
      fill: 'white',
      stroke: 'black',
      'stroke-width': '1',
    },
    group,
  )

  // Chain logo image
  if (node.logoURI) {
    // Create a group for the image with clip path
    const imageGroup = createSvgElement(
      'g',
      {
        'clip-path': 'url(#circle-clip)',
      },
      group,
    )

    // Add the image
    createSvgElement(
      'image',
      {
        x: '0',
        y: '0',
        width: nodeSize.toString(),
        height: nodeSize.toString(),
        href: node.logoURI,
      },
      imageGroup,
    )
  } else {
    // Fallback if no logo is available
    circle.setAttribute('fill', '#2a2a2a')

    // Add text with the chain name
    createSvgElement(
      'text',
      {
        x: (nodeSize / 2).toString(),
        y: (nodeSize / 2 + 4).toString(), // +4 for vertical centering
        'text-anchor': 'middle',
        fill: 'black',
        'font-size': '10px',
      },
      group,
    ).textContent = node.id.substring(0, 3).toUpperCase()
  }
}

/**
 * ChainSankeyGraph - A component that renders a Sankey diagram visualizing chain data flows
 *
 * This component displays the flow of data between a selected source chain and multiple
 * destination chains, with the width of the links representing the volume or count.
 */
export default function ChainSankeyGraph({
  data,
  type,
  selectedChain,
  setChainUid,
}: ChainPathGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Initialize with a reasonable default width that will be updated in useLayoutEffect
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Add suffix to source chain ID to enable circular dependencies
  const flowData = data?.map(item => ({ ...item, from: `${item.from}-origin` }))

  const chainOptions = chains.map(chain => ({
    value: chain.uid,
    label: chain.name,
    logoURI: getSrcFromLogo(chain),
  }))

  // Calculate dynamic height based on number of destination nodes
  const calculateDynamicHeight = () => {
    // Get minimum height needed for the "No data available" message
    const nodeSize = 28 // Same as in the rendering logic
    const nodePadding = 15 // Same as in the rendering logic
    const topMargin = 60 // Space for the MultiSelect and top margin
    const bottomMargin = 0 // Bottom margin

    if (!flowData || flowData.length === 0) {
      // When no data, use minimum height
      const minHeight = topMargin + bottomMargin
      return Math.max(120, minHeight) // Ensure a minimum height of 120px
    }

    // Get unique destination nodes
    const targets = Array.from(new Set(flowData.map(d => d.to)))
    const nodeCount = targets.length

    // Calculate minimum height needed for all nodes
    const minHeight = topMargin + nodeCount * (nodeSize + nodePadding) + bottomMargin

    // Ensure a minimum height of 120px even for very few nodes
    return Math.max(120, minHeight)
  }

  const dynamicHeight = calculateDynamicHeight()

  // Create a debounced function to update dimensions
  const debouncedUpdateDimensions = useMemo(
    () =>
      debounce(() => {
        if (containerRef.current) {
          // Only update if the width has changed
          const newWidth = containerRef.current.clientWidth
          if (newWidth !== dimensions.width) {
            setDimensions({
              width: newWidth,
              height: dynamicHeight, // Use dynamic height instead of fixed height
            })
          }
        }
      }, 20),
    [dynamicHeight, dimensions.width],
  )

  // Create a resize handler that uses the memoized debounced function
  const handleResize = useCallback(() => {
    debouncedUpdateDimensions()
  }, [debouncedUpdateDimensions])

  // Use useLayoutEffect for initial size calculation to prevent flickering
  useLayoutEffect(() => {
    if (containerRef.current) {
      // Get the initial container width synchronously before the first render
      const containerWidth = containerRef.current.clientWidth
      setDimensions({
        width: containerWidth,
        height: dynamicHeight,
      })
    }
  }, [dynamicHeight])

  // Use useEffect for setting up resize observers after the initial render
  useEffect(() => {
    // Set up ResizeObserver to detect container width changes only
    let resizeObserver: ResizeObserver | null = null
    let previousWidth = containerRef.current?.clientWidth || 0

    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        // Only trigger resize if width has changed
        const newWidth = entries[0].contentRect.width
        if (newWidth !== previousWidth) {
          previousWidth = newWidth
          handleResize()
        }
      })
      resizeObserver.observe(containerRef.current)
    }

    // Also listen for window resize events as a fallback
    const handleWindowResize = () => {
      const newWidth = containerRef.current?.clientWidth || 0
      if (newWidth !== previousWidth) {
        previousWidth = newWidth
        handleResize()
      }
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      // Clean up
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [handleResize]) // handleResize already has dynamicHeight as a dependency

  useEffect(() => {
    // Don't render if no data, no SVG ref, or if dimensions haven't been set yet
    if (!flowData || !svgRef.current || dimensions.width === 0) return

    // Clear previous graph
    const svg = svgRef.current
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    if (flowData?.length === 0) return

    // Setup dimensions and constants
    const width = dimensions.width - 30
    const height = dimensions.height
    const margin = { top: 5, right: 50, bottom: 20, left: 0 }
    const nodeSize = 28

    // Calculate max value for link width scaling
    let maxValue = 0
    flowData.forEach(d => {
      maxValue = Math.max(maxValue, d.size)
    })

    // Create nodes and source node
    const { nodes, sourceNode, totalHeight } = createNodes(
      flowData,
      margin,
      width,
      nodeSize,
      selectedChain,
    )

    // Adjust SVG height if needed
    const requiredHeight = totalHeight + margin.bottom
    if (requiredHeight > height) {
      svg.setAttribute('height', requiredHeight.toString())
    }

    // Create node map and links
    const nodeMap = new Map<string, Node>()
    nodes.forEach(node => nodeMap.set(node.id, node))
    nodeMap.set(`${selectedChain}-origin`, sourceNode)

    const links = createLinks(flowData, nodeMap, selectedChain, maxValue, nodeSize, width)

    // Create SVG elements
    createSvgDefsElements(svg, nodeSize)

    // Render links
    links.forEach(link => {
      createSvgElement(
        'path',
        {
          d: link.path,
          stroke: 'url(#linkGradient)',
          'stroke-width': link.width.toString(),
          fill: 'none',
        },
        svg,
      )
    })

    // Calculate total weight for percentage calculation
    const totalWeight = flowData.reduce((sum, d) => sum + d.size, 0)

    // Render nodes and labels
    nodes.forEach(node => {
      renderNode(svg, node, nodeSize)

      // Add labels for destination nodes
      // We need to check if this is a target node (not the source node with -origin suffix)
      if (node.id !== `${selectedChain}-origin`) {
        const nodeLink = links.find(link => link.target === node.id)
        if (nodeLink) {
          const nodeWeight = nodeLink.value
          const percentage = (nodeWeight / totalWeight) * 100
          const chain = chainsByUid[node.id]
          const chainName = chain ? chain.name : node.id

          addRightLabel(svg, node, nodeSize, chainName, nodeWeight, type)
          addPercentageLabel(svg, node, nodeSize, percentage)
        }
      }
    })
  }, [flowData, dimensions, type, selectedChain])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${dynamicHeight}px`,
        position: 'relative',
        transition: 'height 300ms cubic-bezier(.165, .84, .44, 1)',
      }}
    >
      <div className="absolute flex" style={{ left: '20px', top: '13px', zIndex: 10 }}>
        <div className="w-[150px]">
          <MultiSelect
            options={chainOptions}
            selected={[selectedChain]}
            onChange={val => {
              if (Array.isArray(val) && val.length > 0) {
                setChainUid(val[0])
              }
            }}
            placeholder="Source chain"
            singleSelect
            preventEmpty
            showBadges={false}
          />
        </div>
        {(!flowData || flowData.length === 0) && (
          <div className="ml-3 flex items-center rounded-md px-3 py-1 text-sm font-medium text-muted-foreground">
            ⚠️ No data available. Please select another chain.
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dynamicHeight}
        style={{ transition: 'height 300ms cubic-bezier(.165, .84, .44, 1)' }}
      />
    </div>
  )
}

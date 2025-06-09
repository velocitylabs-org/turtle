import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import React, { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import MultiSelect from '@/components/MultiSelect'
import { chains, GraphType, primaryColor } from '@/constants'
import useIsMobile from '@/hooks/useMobile'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

const svgNs = 'http://www.w3.org/2000/svg'
const hoverColor = '#00CC20'
const easeOutQuart = 'cubic-bezier(.165, .84, .44, 1)'

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

// Renders a Sankey graph visualizing flow between blockchain chains
export default function ChainSankeyGraph({
  data,
  type,
  selectedChain,
  setChainUid,
}: ChainPathGraphProps) {
  const isMobile = useIsMobile()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const flowData = data?.map(item => ({ ...item, from: `${item.from}-origin` }))

  const chainOptions = chains.map(chain => ({
    value: chain.uid,
    label: chain.name,
    logoURI: getSrcFromLogo(chain),
  }))

  const dynamicHeight = useMemo(() => {
    const nodeSize = 28
    const nodePadding = 15
    const topMargin = 60
    const bottomMargin = 0
    const baseMinHeight = 120 // 120 is the min height if there is no item to show

    if (!flowData || flowData.length === 0) {
      const minHeight = topMargin + bottomMargin
      return Math.max(baseMinHeight, minHeight)
    }

    const targets = Array.from(new Set(flowData.map(d => d.to)))
    const nodeCount = targets.length
    const minHeight = topMargin + nodeCount * (nodeSize + nodePadding) + bottomMargin

    return Math.max(baseMinHeight, minHeight)
  }, [flowData])

  useLayoutEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      setDimensions({
        width: containerWidth,
        height: dynamicHeight,
      })
    }
  }, [dynamicHeight])

  // Monitor and update graph when container width changes to ensure a responsive layout
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null
    let previousWidth = containerRef.current?.clientWidth || 0

    function handleResize() {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth
        if (newWidth !== dimensions.width) {
          setDimensions({
            width: newWidth,
            height: dynamicHeight,
          })
        }
      }
    }

    const handleWindowResize = () => {
      const newWidth = containerRef.current?.clientWidth || 0
      if (newWidth !== previousWidth) {
        previousWidth = newWidth
        handleResize()
      }
    }

    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        const newWidth = entries[0].contentRect.width
        if (newWidth !== previousWidth) {
          previousWidth = newWidth
          handleResize()
        }
      })
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleWindowResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!flowData || !svgRef.current || dimensions.width === 0) return

    const svg = svgRef.current
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    if (flowData?.length === 0) return

    const width = dimensions.width - 30
    const height = dimensions.height
    const margin = isMobile
      ? { top: 5, right: 15, bottom: 0, left: -10 }
      : { top: 5, right: 50, bottom: 20, left: 0 }
    const nodeSize = 28
    let maxValue = 0
    flowData.forEach(d => {
      maxValue = Math.max(maxValue, d.size)
    })

    const { nodes, sourceNode, totalHeight } = createNodes(
      flowData,
      margin,
      width,
      nodeSize,
      selectedChain,
    )

    const requiredHeight = totalHeight + margin.bottom
    if (requiredHeight > height) {
      svg.setAttribute('height', requiredHeight.toString())
    }
    const nodeMap = new Map<string, Node>()
    nodes.forEach(node => nodeMap.set(node.id, node))
    nodeMap.set(`${selectedChain}-origin`, sourceNode)
    const links = createLinks(flowData, nodeMap, selectedChain, maxValue, nodeSize, width)
    createSvgDefsElements(svg, nodeSize)

    const pathElements = new Map<string, SVGElement>()
    links.forEach(link => {
      const path = createSvgElement(
        'path',
        {
          d: link.path,
          stroke: 'url(#linkGradient)',
          'stroke-width': link.width.toString(),
          fill: 'none',
        },
        svg,
      )

      pathElements.set(link.target, path)
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke', 'url(#hoverLinkGradient)')
        svg.appendChild(path)
      })
      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke', 'url(#linkGradient)')
      })
    })
    const totalWeight = flowData.reduce((sum, d) => sum + d.size, 0)
    function applyHoverEffect(
      percentText: SVGElement,
      nameText: SVGElement,
      weightText: SVGElement,
      rightLabelGroup: SVGElement,
    ) {
      percentText.setAttribute('font-size', '14px')
      percentText.setAttribute('fill', hoverColor)
      svg.appendChild(percentText.parentElement as unknown as SVGElement)

      nameText.setAttribute('font-size', '14px')
      nameText.setAttribute('font-weight', '900')
      weightText.setAttribute('font-size', '12px')
      svg.appendChild(rightLabelGroup)
    }
    function removeHoverEffect(
      percentText: SVGElement,
      nameText: SVGElement,
      weightText: SVGElement,
    ) {
      percentText.setAttribute('font-size', '12px')
      percentText.setAttribute('fill', '#666')

      nameText.setAttribute('font-size', '12px')
      nameText.setAttribute('font-weight', 'bold')
      weightText.setAttribute('font-size', '10px')
    }

    nodes.forEach(node => {
      const nodeGroup = renderNode(svg, node, nodeSize)

      if (node.id !== `${selectedChain}-origin`) {
        const nodeLink = links.find(link => link.target === node.id)
        if (nodeLink) {
          const nodeWeight = nodeLink.value
          const percentage = (nodeWeight / totalWeight) * 100
          const chain = chainsByUid[node.id]
          const chainName = chain ? chain.name : node.id

          const {
            nameText,
            weightText,
            group: rightLabelGroup,
          } = addRightLabel(svg, node, nodeSize, chainName, nodeWeight, type)
          const { text: percentText } = addPercentageLabel(svg, node, nodeSize, percentage)
          nodeGroup.addEventListener('mouseenter', () => {
            applyHoverEffect(percentText, nameText, weightText, rightLabelGroup)
          })
          nodeGroup.addEventListener('mouseleave', () => {
            removeHoverEffect(percentText, nameText, weightText)
          })
          const pathElement = pathElements.get(node.id)
          if (pathElement) {
            pathElement.addEventListener('mouseenter', () => {
              applyHoverEffect(percentText, nameText, weightText, rightLabelGroup)
            })
            pathElement.addEventListener('mouseleave', () => {
              removeHoverEffect(percentText, nameText, weightText)
            })
          }
        }
      }
    })
  }, [flowData, dimensions, type, selectedChain, isMobile])

  return (
    <div className="overflow-x-scroll">
      <div
        ref={containerRef}
        className="full-width relative min-w-[450px]"
        style={{
          height: `${dynamicHeight}px`,
          transition: `height 300ms ${easeOutQuart}`,
        }}
      >
        <div
          className="absolute flex"
          style={{ left: isMobile ? '0' : '20px', top: '13px', zIndex: 10 }}
        >
          <div style={{ width: isMobile ? '145px' : '150px' }}>
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
          style={{ transition: `height 300ms ${easeOutQuart}` }}
        />
      </div>
    </div>
  )
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

// Creates an SVG element with the specified attributes and optionally appends it to a parent element
function createSvgElement(
  tag: string,
  attributes: Record<string, string> = {},
  parent?: SVGElement | HTMLElement,
): SVGElement {
  const element = document.createElementNS(svgNs, tag)
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  if (parent) {
    parent.appendChild(element)
  }
  return element
}

// Adds a label to the right side of a node showing the chain name and its weight
function addRightLabel(
  svg: SVGSVGElement,
  node: Node,
  nodeSize: number,
  chainName: string,
  nodeWeight: number,
  type: GraphType,
): { group: SVGElement; nameText: SVGElement; weightText: SVGElement } {
  const labelGroup = createSvgElement(
    'g',
    {
      transform: `translate(${node.x + nodeSize / 2 + 10}, ${node.y - 7})`,
      style: 'z-index: 10',
    },
    svg,
  )

  const nameText = createSvgElement(
    'text',
    {
      x: '0',
      y: '0',
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      fill: 'black',
      'font-size': '12px',
      'font-weight': 'bold',
      style: `transition: font-size 300ms ${easeOutQuart}, font-weight 300ms ${easeOutQuart}`,
    },
    labelGroup,
  )
  nameText.textContent = chainName

  const weightText = createSvgElement(
    'text',
    {
      x: '0',
      y: '15',
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      fill: '#666',
      'font-size': '10px',
      style: `transition: font-size 300ms ${easeOutQuart}`,
    },
    labelGroup,
  )
  weightText.textContent = type === 'volume' ? `$${formatUSD(nodeWeight)}` : nodeWeight.toString()
  return { group: labelGroup, nameText, weightText }
}

// Adds a percentage label to the left side of a node showing its proportion of the total flow
function addPercentageLabel(
  svg: SVGSVGElement,
  node: Node,
  nodeSize: number,
  percentage: number,
): { group: SVGElement; text: SVGElement } {
  const percentLabelGroup = createSvgElement(
    'g',
    {
      transform: `translate(${node.x - nodeSize / 2 - 40}, ${node.y})`,
      style: 'z-index: 10',
    },
    svg,
  )
  const percentText = createSvgElement(
    'text',
    {
      x: '0',
      y: '0',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: '#666',
      'font-size': '12px',
      'font-weight': 'bold',
      style: `transition: font-size 300ms ${easeOutQuart}`,
    },
    percentLabelGroup,
  )

  percentText.textContent = formatPercentage(percentage)
  percentLabelGroup.addEventListener('mouseenter', () => {
    percentText.setAttribute('font-size', '14px')
    percentText.setAttribute('fill', hoverColor)
    svg.appendChild(percentLabelGroup)
  })
  percentLabelGroup.addEventListener('mouseleave', () => {
    percentText.setAttribute('font-size', '12px')
    percentText.setAttribute('fill', '#666')
  })

  return { group: percentLabelGroup, text: percentText }
}

// Creates and positions node objects for the graph based on flow data
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
  const sourceNodeY = Math.max(margin.top + nodeSize, totalHeight + nodeSize / 2)
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

  totalHeight = Math.max(margin.top + nodeSize, margin.top)
  const targets = Array.from(new Set(flowData.map(d => d.to)))
  targets.forEach(id => {
    const chain = chainsByUid[id]
    const logoURI = chain ? getSrcFromLogo(chain) : ''
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

// Creates connection paths between nodes representing data flow between chains
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
    if (d.from !== `${selectedChain}-origin`) return

    const source = nodeMap.get(d.from)!
    const target = nodeMap.get(d.to)!

    const minLinkWidth = 10
    const maxLinkWidth = 40
    const linkWidthScale = maxLinkWidth / maxValue
    const linkWidth = Math.max(minLinkWidth, d.size * linkWidthScale)

    const controlPointDistance = containerWidth ? Math.min(150, containerWidth * 0.2) : 150

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

// Creates SVG definition elements like gradients and clip paths used by the graph
function createSvgDefsElements(svg: SVGSVGElement, nodeSize: number): void {
  const defs = createSvgElement('defs', {}, svg)
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

  const hoverGradient = createSvgElement(
    'linearGradient',
    {
      id: 'hoverLinkGradient',
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    },
    defs,
  )

  createSvgElement(
    'stop',
    {
      offset: '0%',
      'stop-color': hoverColor,
      'stop-opacity': '0.5',
    },
    hoverGradient,
  )

  createSvgElement(
    'stop',
    {
      offset: '85%',
      'stop-color': hoverColor,
      'stop-opacity': '0.5',
    },
    hoverGradient,
  )

  createSvgElement(
    'stop',
    {
      offset: '100%',
      'stop-color': hoverColor,
      'stop-opacity': '0',
    },
    hoverGradient,
  )
}

// Creates and renders a visual node in the graph with hover effects and appropriate styling
function renderNode(svg: SVGSVGElement, node: Node, nodeSize: number): SVGElement {
  const group = createSvgElement(
    'g',
    {
      transform: `translate(${node.x - nodeSize / 2}, ${node.y - nodeSize / 2})`,
    },
    svg,
  )
  const circle = createSvgElement(
    'circle',
    {
      cx: (nodeSize / 2).toString(),
      cy: (nodeSize / 2).toString(),
      r: (nodeSize / 2).toString(),
      fill: 'white',
      stroke: '#000',
      'stroke-width': '1',
      style: `transition: stroke 300ms ${easeOutQuart}, stroke-width 300ms ${easeOutQuart}`,
    },
    group,
  )

  group.addEventListener('mouseenter', () => {
    circle.setAttribute('stroke', hoverColor)
    circle.setAttribute('stroke-width', '2')
    svg.appendChild(group)
  })

  group.addEventListener('mouseleave', () => {
    circle.setAttribute('stroke', '#666')
    circle.setAttribute('stroke-width', '1')
  })

  if (node.logoURI) {
    const imageGroup = createSvgElement(
      'g',
      {
        'clip-path': 'url(#circle-clip)',
      },
      group,
    )

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
    circle.setAttribute('fill', '#2a2a2a')

    createSvgElement(
      'text',
      {
        x: (nodeSize / 2).toString(),
        y: (nodeSize / 2 + 4).toString(),
        'text-anchor': 'middle',
        fill: 'black',
        'font-size': '10px',
      },
      group,
    ).textContent = node.id.substring(0, 3).toUpperCase()
  }

  return group
}

function formatPercentage(percentage: number): string {
  if (percentage % 1 === 0) {
    return `${percentage}%`
  }

  if (percentage < 0.01 && percentage > 0) {
    return `${percentage.toFixed(4)}%`
  }

  return `${percentage.toFixed(2)}%`
}

import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import React, { useRef, useEffect, useState } from 'react'
import MultiSelect from '@/components/MultiSelect'
import { chains, GraphType } from '@/constants'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

interface ChainFlowData {
  from: string;
  to: string;
  size: number;
}

interface ChainPathGraphProps {
  data: ChainFlowData[] | undefined;
  type: GraphType;
  selectedChain: string;
  setChainUid: (chainUid: string) => void;
}

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  logoURI: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
  width: number;
  path: string;
}

export default function ChainPathsGraph({ data: flowData, type, selectedChain, setChainUid }: ChainPathGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const chainOptions = chains.map(chain => ({
    value: chain.uid,
    label: chain.name,
    logoURI: getSrcFromLogo(chain),
  }))

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 500,
        });
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!flowData || flowData.length === 0 || !svgRef.current) return;

    // Clear previous graph
    const svg = svgRef.current;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Calculate dimensions with extra top padding
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 5, right: 20, bottom: 20, left: 70 };

    // Define node size constants
    const nodeSize = 28; // Width and height of node images

    // Extract unique node IDs
    const nodeIds = Array.from(new Set(flowData.flatMap(d => [d.from, d.to])));

    // Calculate total flow values
    const nodeFlows = new Map<string, { in: number, out: number }>();
    nodeIds.forEach(id => nodeFlows.set(id, { in: 0, out: 0 }));

    flowData.forEach(d => {
      const sourceFlow = nodeFlows.get(d.from)!;
      sourceFlow.out += d.size;

      const targetFlow = nodeFlows.get(d.to)!;
      targetFlow.in += d.size;
    });

    // Create nodes
    const nodes: Node[] = [];
    const sourceX = margin.left + nodeSize;
    const targetX = width - margin.right - nodeSize * 2;
    // Reduced padding between nodes
    const nodePadding = 15; // Further reduced padding between nodes

    let totalHeight = margin.top;
    let maxValue = 0;

    flowData.forEach(d => {
      maxValue = Math.max(maxValue, d.size);
    });

    // Source node Y position for reference - ensure it's well within visible area
    const sourceNodeY = Math.max(margin.top + nodeSize, totalHeight + nodeSize / 2);

    // Create a virtual source node for path connections only (won't be rendered)
    const sourceId = selectedChain;
    const sourceChain = chainsByUid[sourceId];
    const sourceName = sourceChain?.name || sourceId;

    // This is a virtual node that won't be rendered but will be used for path connections
    const sourceNode = {
      id: sourceId,
      name: sourceName,
      x: sourceX - 20, // Move the virtual source node more to the left
      y: sourceNodeY,
      logoURI: ''
    };

    // Reset total height for targets - start from a safe margin
    totalHeight = Math.max(margin.top + nodeSize, margin.top);

    // Create target nodes
    const targets = Array.from(new Set(flowData.map(d => d.to)));
    targets.forEach((id) => {
      const chain = chainsByUid[id];
      const logoURI = chain ? getSrcFromLogo(chain) : '';

      // Ensure the first node is well within the visible area
      const nodeY = Math.max(margin.top + nodeSize, totalHeight + nodeSize / 2);

      nodes.push({
        id,
        name: chain?.name || id,
        x: targetX,
        y: nodeY,
        logoURI
      });
      totalHeight += nodeSize + nodePadding;
    });

    // Check if totalHeight exceeds available height and adjust if necessary
    const requiredHeight = totalHeight + margin.bottom;
    if (requiredHeight > height) {
      // Adjust the SVG height
      svg.setAttribute('height', requiredHeight.toString());
    }

    // Create links
    const links: Link[] = [];
    const nodeMap = new Map<string, Node>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    // Add the source node to the nodeMap (but not to the node array for rendering)
    nodeMap.set(sourceId, sourceNode);

    flowData.forEach(d => {
      // Only create links from the selected source
      if (d.from !== selectedChain) return;

      const source = nodeMap.get(d.from)!; // Our virtual source node
      const target = nodeMap.get(d.to)!;

      // Calculate link width - with a minimum of 10px
      const minLinkWidth = 10;
      const maxLinkWidth = 40;
      const linkWidthScale = maxLinkWidth / maxValue;
      const linkWidth = Math.max(minLinkWidth, d.size * linkWidthScale);

      // Start the path from where the MultiSelect would be
      const path = `
        M ${source.x + 150} ${source.y}
        C ${source.x + 150 + (target.x - source.x - 150) / 2} ${source.y},
          ${source.x + 150 + (target.x - source.x - 150) / 2} ${target.y},
          ${target.x - nodeSize/2} ${target.y}
      `;

      links.push({
        source: d.from,
        target: d.to,
        value: d.size,
        width: linkWidth,
        path,
      });
    });

    // Create a defs section for gradients and clipPath
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Create clipPath for nodes
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', 'circle-clip');
    const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipCircle.setAttribute('cx', (nodeSize/2).toString());
    clipCircle.setAttribute('cy', (nodeSize/2).toString());
    clipCircle.setAttribute('r', (nodeSize/2).toString());
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);

    // Create a gradient for link opacity effect
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'linkGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    // Start with full opacity
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00FF29');
    stop1.setAttribute('stop-opacity', '0.5');

    // Keep opacity until 85% of the path
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '85%');
    stop2.setAttribute('stop-color', '#00FF29');
    stop2.setAttribute('stop-opacity', '0.5');

    // Fade to transparent at the end
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#00FF29');
    stop3.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    svg.appendChild(defs);

    // Render links first (so they appear behind nodes)
    links.forEach(link => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', link.path);
      path.setAttribute('stroke', 'url(#linkGradient)');
      path.setAttribute('stroke-width', link.width.toString());
      path.setAttribute('fill', 'none');

      svg.appendChild(path);
    });

    // Render nodes
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x - nodeSize/2}, ${node.y - nodeSize/2})`);

      // Node border circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', (nodeSize/2).toString());
      circle.setAttribute('cy', (nodeSize/2).toString());
      circle.setAttribute('r', (nodeSize/2).toString());
      circle.setAttribute('fill', 'white');
      circle.setAttribute('stroke', 'black');
      circle.setAttribute('stroke-width', '1');

      // Chain logo image
      if (node.logoURI) {
        // Create a group for the image
        const imageGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        imageGroup.setAttribute('clip-path', 'url(#circle-clip)');

        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', nodeSize.toString());
        image.setAttribute('height', nodeSize.toString());
        image.setAttribute('href', node.logoURI);

        imageGroup.appendChild(image);
        group.appendChild(circle); // Add border first
        group.appendChild(imageGroup); // Then add an image
      } else {
        // Fallback if no logo is available
        circle.setAttribute('fill', '#2a2a2a');
        group.appendChild(circle);

        // Add text with the chain name
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (nodeSize/2).toString());
        text.setAttribute('y', (nodeSize/2 + 4).toString()); // +4 for vertical centering
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'black');
        text.setAttribute('font-size', '10px');
        text.textContent = node.id.substring(0, 3).toUpperCase();
        group.appendChild(text);
      }

      svg.appendChild(group);
    });

  }, [flowData, dimensions, type, selectedChain]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px', position: 'relative' }}>
      <div
        className="w-[150px] absolute"
        style={{
          left: '20px',
          top: '13px',
          zIndex: 10
        }}
      >
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
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ maxWidth: '100%', marginLeft: '-70px' }}
      />
    </div>
  );
}

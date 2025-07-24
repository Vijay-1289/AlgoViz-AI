import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import * as d3 from "d3";
import { AlgorithmResponse, AlgorithmStep } from "@/services/geminiService";

interface VisualizationAreaProps {
  algorithmData: AlgorithmResponse;
}

export const VisualizationArea = ({ algorithmData }: VisualizationAreaProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const { title, explanation, complexity, steps, sampleData } = algorithmData;

  useEffect(() => {
    if (!svgRef.current || !steps.length) return;

    // Initialize D3 visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Get current step data
    const currentStepData = steps[currentStep];
    const data = currentStepData?.data || sampleData;
    const highlights = currentStepData?.highlights || [];
    
    // Data type detection
    const isArrayOfNumbers = Array.isArray(data) && typeof data[0] === 'number';
    const isArrayOfObjects = Array.isArray(data) && typeof data[0] === 'object' && data[0] !== null;
    const is2DArray = Array.isArray(data) && Array.isArray(data[0]);
    const isGraphAlgorithm = isArrayOfObjects && 'id' in data[0];

    // Detect tree structure (binary tree, segment tree, etc.)
    function isTree(node) {
      return node && (node.left || node.right || node.children);
    }
    function isTrie(node) {
      return node && node.children && typeof node.children === 'object' && !Array.isArray(node.children);
    }
    function isBoard(data) {
      return is2DArray && data.length > 0 && data[0].length > 0 && typeof data[0][0] === 'number';
    }
    function isBitArray(data) {
      return isArrayOfNumbers && data.every(n => Number.isInteger(n) && n >= 0 && n <= 0xFFFFFFFF);
    }

    // Helper: generate circular node positions for any n
    function getNodePositions(n, width, height, radius = 150, centerX = width/2, centerY = height/2) {
      return Array.from({length: n}, (_, i) => {
        const angle = (2 * Math.PI * i) / n;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    }

    if (isGraphAlgorithm) {
      // Render graph visualization for algorithms like Dijkstra
      const nodeRadius = 30;
      const nodePositions = getNodePositions(data.length, width, height);

      // Try to infer edges if not provided (for Dijkstra, use a simple chain or none)
      // Optionally, you can update your prompt to return explicit edges
      let edges = [];
      if (data.length === 4) {
        // Default Dijkstra fallback
        edges = [
          { from: 0, to: 1, weight: 4 },
          { from: 0, to: 2, weight: 2 },
          { from: 1, to: 3, weight: 3 },
          { from: 2, to: 3, weight: 1 }
        ];
      } else if (data.length > 1) {
        // Simple chain for generic graphs
        edges = Array.from({length: data.length - 1}, (_, i) => ({ from: i, to: i + 1, weight: 1 }));
      }

      // Draw edges (connections between nodes)
      edges.forEach(edge => {
        const fromPos = nodePositions[edge.from];
        const toPos = nodePositions[edge.to];
        if (!fromPos || !toPos) return;
        svg.append("line")
          .attr("x1", fromPos.x)
          .attr("y1", fromPos.y)
          .attr("x2", toPos.x)
          .attr("y2", toPos.y)
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 2);
        // Add edge weight labels
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        svg.append("text")
          .attr("x", midX)
          .attr("y", midY - 5)
          .attr("text-anchor", "middle")
          .attr("fill", "hsl(var(--muted-foreground))")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(edge.weight);
      });

      // Draw nodes
      data.forEach((node: any, i: number) => {
        const pos = nodePositions[i];
        if (!pos) return; // Defensive: skip if no position
        const isHighlighted = node && highlights && node.id !== undefined && highlights.includes(node.id);
        const isVisited = node && node.visited;
        // Node circle
        svg.append("circle")
          .attr("cx", pos.x)
          .attr("cy", pos.y)
          .attr("r", nodeRadius)
          .attr("fill", () => {
            if (isHighlighted) return "hsl(var(--step-active))";
            if (isVisited) return "hsl(var(--step-complete))";
            return "hsl(var(--primary))";
          })
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 2)
          .style("opacity", 0.9);
        // Node ID
        svg.append("text")
          .attr("x", pos.x)
          .attr("y", pos.y - 5)
          .attr("text-anchor", "middle")
          .attr("fill", "hsl(var(--primary-foreground))")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(node.id !== undefined ? node.id : i);
        // Distance label
        const distanceText = node.distance === undefined ? '' : (node.distance === Infinity ? "∞" : node.distance.toString());
        if (distanceText) {
          svg.append("text")
            .attr("x", pos.x)
            .attr("y", pos.y + 10)
            .attr("text-anchor", "middle")
            .attr("fill", "hsl(var(--primary-foreground))")
            .attr("font-size", "12px")
            .text(distanceText);
        }
      });
      return;
    }

    // Render array visualization for sorting/searching algorithms
    if (isArrayOfNumbers) {
      const xScale = d3.scaleBand()
        .domain(data.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.1);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data) || 100])
        .range([height - margin.bottom, margin.top]);
      // Create bars with animations
      svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => xScale(i.toString()) || 0)
        .attr("y", height - margin.bottom)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", (_, i) => {
          if (highlights.includes(i)) {
            return currentStepData?.action === "swap" ? "hsl(var(--step-complete))" : "hsl(var(--step-active))";
          }
          return "hsl(var(--primary))";
        })
        .attr("stroke", "hsl(var(--border))")
        .attr("stroke-width", 1)
        .style("opacity", 0.9)
        .transition()
        .duration(500)
        .attr("y", d => yScale(d))
        .attr("height", d => height - margin.bottom - yScale(d));
      // Add value labels
      svg.selectAll(".label")
        .data(data)
        .join("text")
        .attr("class", "label")
        .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
        .attr("y", height - margin.bottom + 15)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--foreground))")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .text(d => d)
        .style("opacity", 0)
        .transition()
        .delay(300)
        .duration(300)
        .style("opacity", 1);
      return;
    }

    // Render 2D array (dynamic programming table)
    if (is2DArray) {
      const cellSize = 40;
      const table = data;
      const numRows = table.length;
      const numCols = Math.max(...table.map(row => row.length));
      // Draw cells
      table.forEach((row, i) => {
        row.forEach((cell, j) => {
          svg.append("rect")
            .attr("x", margin.left + j * cellSize)
            .attr("y", margin.top + i * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", highlights && highlights.some(([hi, hj]) => hi === i && hj === j) ? "hsl(var(--step-active))" : "hsl(var(--primary))")
            .attr("stroke", "hsl(var(--border))")
            .attr("stroke-width", 1);
          svg.append("text")
            .attr("x", margin.left + j * cellSize + cellSize / 2)
            .attr("y", margin.top + i * cellSize + cellSize / 2 + 5)
            .attr("text-anchor", "middle")
            .attr("fill", "hsl(var(--foreground))")
            .attr("font-size", "14px")
            .text(cell);
        });
      });
      return;
    }

    // Render generic array of objects as a table
    if (isArrayOfObjects) {
      const keys = Object.keys(data[0]);
      const numRows = data.length;
      const numCols = keys.length;
      // Calculate cell size dynamically
      const cellPadding = 8;
      const cellWidth = Math.max(60, Math.floor((width - margin.left - margin.right) / numCols));
      const cellHeight = Math.max(32, Math.floor((height - margin.top - margin.bottom) / (numRows + 1)));
      // Draw header
      keys.forEach((key, j) => {
        svg.append("rect")
          .attr("x", margin.left + j * cellWidth)
          .attr("y", margin.top)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .attr("fill", "#2ecc40") // green header
          .attr("stroke", "hsl(var(--border))")
          .attr("stroke-width", 1);
        svg.append("text")
          .attr("x", margin.left + j * cellWidth + cellWidth / 2)
          .attr("y", margin.top + cellHeight / 2 + 6)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .text(key);
      });
      // Draw rows
      data.forEach((row, i) => {
        keys.forEach((key, j) => {
          const isHeader = i === -1;
          const isEvenRow = i % 2 === 0;
          let cellColor = isEvenRow ? "#5a2ca0" : "#3d1a6e";
          if (typeof row[key] === 'boolean') cellColor = row[key] ? "#2ecc40" : "#e74c3c";
          svg.append("rect")
            .attr("x", margin.left + j * cellWidth)
            .attr("y", margin.top + (i + 1) * cellHeight)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("fill", cellColor)
            .attr("stroke", "hsl(var(--border))")
            .attr("stroke-width", 1);
          svg.append("text")
            .attr("x", margin.left + j * cellWidth + cellWidth / 2)
            .attr("y", margin.top + (i + 1) * cellHeight + cellHeight / 2 + 6)
            .attr("text-anchor", "middle")
            .attr("fill", typeof row[key] === 'boolean' ? '#fff' : '#fff')
            .attr("font-size", "17px")
            .attr("font-weight", typeof row[key] === 'boolean' ? 'bold' : 'normal')
            .text(row[key]);
        });
      });
      return;
    }

    // Tree visualization (binary tree, segment tree, etc.)
    if (isArrayOfObjects && isTree(data[0])) {
      // Assume data[0] is the root node
      const root = data[0];
      // Convert tree to D3 hierarchy
      function toD3Tree(node) {
        if (!node) return null;
        let children = [];
        if (node.left) children.push(node.left);
        if (node.right) children.push(node.right);
        if (node.children && Array.isArray(node.children)) children = node.children;
        return {
          name: node.value !== undefined ? node.value : node.key || node.id || '',
          ...node,
          children: children.map(toD3Tree).filter(Boolean)
        };
      }
      const d3Tree = d3.hierarchy(toD3Tree(root));
      const treeLayout = d3.tree().size([width - 100, height - 100]);
      const treeData = treeLayout(d3Tree);
      // Draw links
      treeData.links().forEach(link => {
        svg.append('line')
          .attr('x1', link.source.x + 50)
          .attr('y1', link.source.y + 50)
          .attr('x2', link.target.x + 50)
          .attr('y2', link.target.y + 50)
          .attr('stroke', 'hsl(var(--border))')
          .attr('stroke-width', 2);
      });
      // Draw nodes
      treeData.descendants().forEach((d, i) => {
        svg.append('circle')
          .attr('cx', d.x + 50)
          .attr('cy', d.y + 50)
          .attr('r', 20)
          .attr('fill', highlights && highlights.includes(i) ? 'hsl(var(--step-active))' : 'hsl(var(--primary))')
          .attr('stroke', 'hsl(var(--border))')
          .attr('stroke-width', 2);
        svg.append('text')
          .attr('x', d.x + 50)
          .attr('y', d.y + 55)
          .attr('text-anchor', 'middle')
          .attr('fill', 'hsl(var(--foreground))')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(d.data.name);
      });
      return;
    }

    // Trie visualization
    if (isArrayOfObjects && isTrie(data[0])) {
      // Render trie as a tree, but label edges with characters
      // For simplicity, treat children as an object: {char: childNode}
      function toD3Trie(node, label = '') {
        if (!node) return null;
        const children = Object.entries(node.children || {}).map(([char, child]) => toD3Trie(child, char)).filter(Boolean);
        return {
          name: node.value !== undefined ? node.value : node.key || node.id || '',
          edgeLabel: label,
          ...node,
          children
        };
      }
      const root = data[0];
      const d3Trie = d3.hierarchy(toD3Trie(root));
      const treeLayout = d3.tree().size([width - 100, height - 100]);
      const treeData = treeLayout(d3Trie);
      // Draw links with edge labels
      treeData.links().forEach(link => {
        svg.append('line')
          .attr('x1', link.source.x + 50)
          .attr('y1', link.source.y + 50)
          .attr('x2', link.target.x + 50)
          .attr('y2', link.target.y + 50)
          .attr('stroke', 'hsl(var(--border))')
          .attr('stroke-width', 2);
        svg.append('text')
          .attr('x', (link.source.x + link.target.x) / 2 + 50)
          .attr('y', (link.source.y + link.target.y) / 2 + 40)
          .attr('text-anchor', 'middle')
          .attr('fill', 'hsl(var(--accent))')
          .attr('font-size', '12px')
          .text(link.target.data.edgeLabel || '');
      });
      // Draw nodes
      treeData.descendants().forEach((d, i) => {
        svg.append('circle')
          .attr('cx', d.x + 50)
          .attr('cy', d.y + 50)
          .attr('r', 20)
          .attr('fill', highlights && highlights.includes(i) ? 'hsl(var(--step-active))' : 'hsl(var(--primary))')
          .attr('stroke', 'hsl(var(--border))')
          .attr('stroke-width', 2);
        svg.append('text')
          .attr('x', d.x + 50)
          .attr('y', d.y + 55)
          .attr('text-anchor', 'middle')
          .attr('fill', 'hsl(var(--foreground))')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(d.data.name);
      });
      return;
    }

    // Board/Backtracking visualization (N-Queens, Sudoku, etc.)
    if (isBoard(data)) {
      const cellSize = Math.min((width - margin.left - margin.right) / data[0].length, (height - margin.top - margin.bottom) / data.length);
      data.forEach((row, i) => {
        row.forEach((cell, j) => {
          svg.append('rect')
            .attr('x', margin.left + j * cellSize)
            .attr('y', margin.top + i * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', cell === 1 ? 'hsl(var(--step-active))' : 'hsl(var(--primary))')
            .attr('stroke', 'hsl(var(--border))')
            .attr('stroke-width', 1);
          if (cell !== 0) {
            svg.append('text')
              .attr('x', margin.left + j * cellSize + cellSize / 2)
              .attr('y', margin.top + i * cellSize + cellSize / 2 + 5)
              .attr('text-anchor', 'middle')
              .attr('fill', 'hsl(var(--foreground))')
              .attr('font-size', '18px')
              .attr('font-weight', 'bold')
              .text(cell === 1 ? 'Q' : cell);
          }
        });
      });
      return;
    }

    // Bit manipulation visualization
    if (isBitArray(data)) {
      const bitStrings = data.map(n => n.toString(2).padStart(32, '0'));
      const cellSize = 18;
      bitStrings.forEach((bits, i) => {
        [...bits].forEach((bit, j) => {
          svg.append('rect')
            .attr('x', margin.left + j * cellSize)
            .attr('y', margin.top + i * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', bit === '1' ? 'hsl(var(--step-active))' : 'hsl(var(--primary))')
            .attr('stroke', 'hsl(var(--border))')
            .attr('stroke-width', 1);
          svg.append('text')
            .attr('x', margin.left + j * cellSize + cellSize / 2)
            .attr('y', margin.top + i * cellSize + cellSize / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'hsl(var(--foreground))')
            .attr('font-size', '12px')
            .text(bit);
        });
      });
      return;
    }

  }, [currentStep, steps, sampleData]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      const id = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, steps.length]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleStepForward = () => {
    if (steps && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleShowSolution = () => {
    if (currentStep === steps.length - 1) return;
    setIsPlaying(true);
    // If already playing, do nothing (let the normal auto-play logic handle it)
  };

  return (
    <div className="w-full space-y-6">
      {/* Visualization Canvas */}
      <Card className="p-6 bg-gradient-card border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Algorithm Visualization</h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
              {title}
            </span>
            <span className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full">
              {complexity}
            </span>
          </div>
        </div>
        
        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <svg
            ref={svgRef}
            className="w-full h-auto max-h-96 border border-border/20 rounded bg-card/20"
          />
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4 bg-gradient-card border-border/30">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStepBack}
            disabled={currentStep === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePlay}
            className="bg-gradient-hero hover:opacity-90"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStepForward}
            disabled={!steps.length || currentStep >= steps.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleShowSolution}
            disabled={currentStep === steps.length - 1 || isPlaying}
            className="ml-4 bg-accent text-white font-bold"
          >
            Show Solution
          </Button>
        </div>
        
        {steps.length > 0 && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        )}
      </Card>

      {/* Current Step Details */}
      {steps.length > 0 && (
        <Card className="p-6 bg-gradient-card border-border/30">
          <h3 className="text-lg font-semibold mb-4">Current Step</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-primary">{steps[currentStep]?.title}</h4>
              <p className="text-muted-foreground mt-1">{steps[currentStep]?.description}</p>
            </div>
            {steps[currentStep]?.code && (
              <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                <code className="text-sm font-mono text-accent">{steps[currentStep].code}</code>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Solution Summary Panel (only on last step) */}
      {currentStep === steps.length - 1 && (
        <Card className="p-6 bg-gradient-card border-accent/50 border-2">
          <h3 className="text-lg font-bold mb-2 text-accent">Solution Summary</h3>
          <div className="text-base text-foreground">
            {/* Try to summarize the result for common algorithms */}
            {Array.isArray(steps[currentStep]?.data) && steps[currentStep]?.data.length > 0 && typeof steps[currentStep].data[0] === 'object' ? (
              <>
                <div className="mb-2 font-semibold">Final State:</div>
                <pre className="bg-background/80 rounded p-2 text-sm overflow-x-auto">
                  {JSON.stringify(steps[currentStep].data, null, 2)}
                </pre>
              </>
            ) : Array.isArray(steps[currentStep]?.data) ? (
              <>
                <div className="mb-2 font-semibold">Final Array:</div>
                <pre className="bg-background/80 rounded p-2 text-sm overflow-x-auto">
                  {JSON.stringify(steps[currentStep].data)}
                </pre>
              </>
            ) : (
              <div>No explicit solution data available.</div>
            )}
          </div>
        </Card>
      )}

      {/* Algorithm Explanation */}
      <Card className="p-6 bg-gradient-card border-border/30">
        <h3 className="text-lg font-semibold mb-4">AI Explanation</h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      </Card>
    </div>
  );
};
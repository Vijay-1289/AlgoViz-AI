import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import * as d3 from "d3";

interface VisualizationAreaProps {
  algorithm?: string;
  explanation?: string;
  steps?: any[];
}

export const VisualizationArea = ({ algorithm, explanation, steps }: VisualizationAreaProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize D3 visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Sample data for demonstration (replace with actual algorithm data)
    const sampleData = [64, 34, 25, 12, 22, 11, 90];
    
    const xScale = d3.scaleBand()
      .domain(sampleData.map((_, i) => i.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sampleData) || 0])
      .range([height - margin.bottom, margin.top]);

    // Create bars
    svg.selectAll(".bar")
      .data(sampleData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => xScale(i.toString()) || 0)
      .attr("y", d => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(d))
      .attr("fill", "hsl(var(--primary))")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-width", 1)
      .style("opacity", 0.8);

    // Add value labels
    svg.selectAll(".label")
      .data(sampleData)
      .join("text")
      .attr("class", "label")
      .attr("x", (_, i) => (xScale(i.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(var(--foreground))")
      .attr("font-size", "12px")
      .text(d => d);

  }, [algorithm, currentStep]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
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

  return (
    <div className="w-full space-y-6">
      {/* Visualization Canvas */}
      <Card className="p-6 bg-gradient-card border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Algorithm Visualization</h3>
          {algorithm && (
            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
              {algorithm}
            </span>
          )}
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
            disabled={!steps || currentStep >= steps.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        
        {steps && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        )}
      </Card>

      {/* Algorithm Explanation */}
      {explanation && (
        <Card className="p-6 bg-gradient-card border-border/30">
          <h3 className="text-lg font-semibold mb-4">AI Explanation</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
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

    // Add step title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(var(--foreground))")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(currentStepData?.title || `Step ${currentStep + 1}`);

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
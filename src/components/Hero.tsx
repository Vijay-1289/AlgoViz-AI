import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Brain, Zap } from "lucide-react";
import heroImage from "@/assets/hero-algorithm.jpg";
import { toast } from "sonner";

export const Hero = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) {
      toast("Please enter an algorithm to explore!");
      return;
    }
    toast(`Analyzing "${query}" with Gemini AI...`);
    // TODO: Implement Gemini API integration
  };

  const exampleQueries = [
    "How does Merge Sort work?",
    "Explain Dijkstra's Algorithm",
    "What is Binary Search?",
    "Show me Quick Sort steps"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with hero image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Algorithm Learning</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
          AlgoViz AI
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Interactive Algorithm Explainer
        </p>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Ask any algorithm question in natural language and watch as Gemini AI explains it with beautiful, 
          step-by-step visualizations powered by D3.js
        </p>

        {/* Search interface */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Ask about any algorithm... (e.g., 'How does Quick Sort work?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
              />
            </div>
            <Button 
              onClick={handleSearch}
              size="lg"
              className="h-14 px-8 bg-gradient-hero hover:opacity-90 transition-opacity"
            >
              <Play className="w-5 h-5 mr-2" />
              Visualize
            </Button>
          </div>
        </div>

        {/* Example queries */}
        <div className="mb-12">
          <p className="text-sm text-muted-foreground mb-4">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="px-4 py-2 text-sm bg-card/30 hover:bg-card/50 border border-border/30 rounded-lg transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-gradient-card border border-border/30">
            <Brain className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Explanations</h3>
            <p className="text-sm text-muted-foreground">
              Gemini AI breaks down complex algorithms into easy-to-understand steps
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-card border border-border/30">
            <Zap className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Interactive Visualizations</h3>
            <p className="text-sm text-muted-foreground">
              Watch algorithms come to life with animated D3.js visualizations
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-card border border-border/30">
            <Play className="w-8 h-8 text-visualization mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Step-by-Step Control</h3>
            <p className="text-sm text-muted-foreground">
              Play, pause, and replay algorithm steps at your own pace
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
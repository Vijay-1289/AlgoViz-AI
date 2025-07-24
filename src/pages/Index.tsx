import { useState } from "react";
import { Hero } from "@/components/Hero";
import { VisualizationArea } from "@/components/VisualizationArea";
import { AlgorithmResponse } from "@/services/geminiService";

const Index = () => {
  const [algorithmData, setAlgorithmData] = useState<AlgorithmResponse | null>(null);

  const handleAlgorithmExplained = (data: AlgorithmResponse) => {
    setAlgorithmData(data);
    // Scroll to visualization section
    setTimeout(() => {
      document.getElementById('visualization')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero onAlgorithmExplained={handleAlgorithmExplained} />
      
      {/* Visualization Section - Shows when algorithm is explained */}
      {algorithmData && (
        <section id="visualization" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <VisualizationArea algorithmData={algorithmData} />
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;

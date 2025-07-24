import { useState } from "react";
import { Hero } from "@/components/Hero";
import { VisualizationArea } from "@/components/VisualizationArea";

const Index = () => {
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />
      
      {/* Visualization Section - Shows when algorithm is selected */}
      {currentAlgorithm && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <VisualizationArea 
              algorithm={currentAlgorithm}
              explanation={explanation}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;

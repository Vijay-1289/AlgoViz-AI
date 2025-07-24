import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Brain, Zap, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-algorithm.jpg";
import { toast } from "sonner";
import { geminiService } from "@/services/geminiService";
import { useRef } from "react";

const ALGORITHM_GROUPS = [
  {
    label: "Sorting Algorithms",
    options: [
      "Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort", "Counting Sort", "Radix Sort", "Bucket Sort", "TimSort", "IntroSort", "Shell Sort", "Comb Sort", "Cocktail Shaker Sort", "Bitonic Sort"
    ]
  },
  {
    label: "Searching Algorithms",
    options: [
      "Linear Search", "Binary Search", "Ternary Search", "Jump Search", "Exponential Search", "Interpolation Search"
    ]
  },
  {
    label: "Divide and Conquer",
    options: [
      "Merge Sort", "Quick Sort", "Binary Search", "Closest Pair of Points", "Karatsuba Multiplication", "Strassen’s Matrix Multiplication"
    ]
  },
  {
    label: "Graph Algorithms",
    options: [
      "BFS", "DFS", "Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "A* Algorithm", "Prim’s Algorithm", "Kruskal’s Algorithm", "Topological Sorting", "Tarjan’s Algorithm", "Kosaraju’s Algorithm", "Union-Find"
    ]
  },
  {
    label: "Greedy Algorithms",
    options: [
      "Huffman Coding", "Fractional Knapsack", "Activity Selection", "Job Sequencing with Deadlines", "Minimum Spanning Tree", "Dijkstra’s Algorithm"
    ]
  },
  {
    label: "Dynamic Programming",
    options: [
      "0/1 Knapsack", "Longest Common Subsequence", "Longest Increasing Subsequence", "Matrix Chain Multiplication", "Floyd-Warshall", "Edit Distance", "Subset Sum", "Coin Change", "Rod Cutting", "Egg Dropping Puzzle", "DP on Trees", "Bitmask DP", "Digit DP"
    ]
  },
  {
    label: "Tree & Binary Tree Algorithms",
    options: [
      "Tree Traversals", "Level Order Traversal", "Binary Search Tree operations", "Lowest Common Ancestor", "Segment Tree", "Fenwick Tree", "AVL Tree", "Red-Black Tree", "Trie", "Euler Tour", "Tree DP"
    ]
  },
  {
    label: "String Algorithms",
    options: [
      "KMP", "Rabin-Karp", "Z-Algorithm", "Trie", "Suffix Array", "Suffix Tree", "Longest Palindromic Substring", "Aho-Corasick Algorithm", "Manacher’s Algorithm"
    ]
  },
  {
    label: "Backtracking Algorithms",
    options: [
      "N-Queens Problem", "Sudoku Solver", "Rat in a Maze", "Hamiltonian Path", "Subset/Permutation Generation"
    ]
  },
  {
    label: "Bit Manipulation Algorithms",
    options: [
      "Count Set Bits", "Check Power of Two", "XOR-based Problems", "Gray Code", "Bitmasking Subsets"
    ]
  },
  {
    label: "Miscellaneous & Advanced",
    options: [
      "Hashing Techniques", "Sliding Window", "Two Pointers", "Prefix Sum", "Difference Array", "Binary Lifting", "Mo's Algorithm", "Heavy-Light Decomposition", "Centroid Decomposition", "K-D Tree"
    ]
  }
];

function filterAlgorithms(input) {
  if (!input) return [];
  const lower = input.toLowerCase();
  return ALGORITHM_GROUPS.flatMap(group =>
    group.options.filter(opt => opt.toLowerCase().includes(lower)).map(opt => ({ group: group.label, name: opt }))
  );
}

interface HeroProps {
  onAlgorithmExplained: (data: any) => void;
}

export const Hero = ({ onAlgorithmExplained }: HeroProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast("Please enter an algorithm to explore!");
      return;
    }
    
    setIsLoading(true);
    toast("Analyzing with Gemini AI...");
    
    try {
      const result = await geminiService.explainAlgorithm(query);
      onAlgorithmExplained(result);
      toast.success(`${result.title} explanation ready!`);
    } catch (error) {
      console.error('Error explaining algorithm:', error);
      toast.error("Failed to explain algorithm. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    const matches = filterAlgorithms(val);
    setDropdown(matches);
    setShowDropdown(!!val && matches.length > 0);
  };

  const handleSelect = (alg) => {
    setQuery(alg);
    setShowDropdown(false);
    inputRef.current?.focus();
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
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              ref={inputRef}
              placeholder="Ask about any algorithm... (e.g., 'How does Quick Sort work?')"
              value={query}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-card border border-border/30 rounded shadow-lg z-20 max-h-60 overflow-y-auto text-left">
                {dropdown.map((alg, idx) => (
                  <div
                    key={alg.group + alg.name + idx}
                    className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-sm"
                    onClick={() => handleSelect(alg.name)}
                  >
                    <span className="font-semibold text-primary">{alg.name}</span>
                    <span className="ml-2 text-muted-foreground">({alg.group})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            size="lg"
            className="h-14 px-8 bg-gradient-hero hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Analyzing...' : 'Visualize'}
          </Button>
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
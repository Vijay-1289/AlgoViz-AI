import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBS8Jwi3HcQuQYLT3Ll7s4IoPVbbozEn6o';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AlgorithmStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  data?: any[];
  highlights?: number[];
  action?: string;
}

export interface AlgorithmResponse {
  title: string;
  explanation: string;
  complexity: string;
  steps: AlgorithmStep[];
  sampleData: any[];
}

export const geminiService = {
  async explainAlgorithm(query: string): Promise<AlgorithmResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        You are an expert algorithm teacher. For the query: "${query}"
        
        Please provide a structured response in the following JSON format:
        {
          "title": "Algorithm Name",
          "explanation": "Brief overview of what this algorithm does and when to use it",
          "complexity": "Time and space complexity (e.g., O(n log n) time, O(1) space)",
          "steps": [
            {
              "step": 1,
              "title": "Step title",
              "description": "Detailed description of what happens in this step",
              "code": "Optional code snippet",
              "data": [array of numbers to visualize],
              "highlights": [indices of elements being compared/moved],
              "action": "compare|swap|merge|partition|etc"
            }
          ],
          "sampleData": [initial array of numbers for visualization]
        }
        
        Focus on popular algorithms like:
        - Sorting: Bubble Sort, Merge Sort, Quick Sort, Insertion Sort
        - Search: Binary Search, Linear Search
        - Graph: DFS, BFS, Dijkstra's Algorithm
        - Dynamic Programming: Fibonacci, Knapsack
        
        Provide 5-8 detailed steps that can be animated. Use simple number arrays (6-8 elements) for visualization.
        Make sure the JSON is valid and complete.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const algorithmData = JSON.parse(jsonMatch[0]);
      return algorithmData;
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback response for demonstration
      return {
        title: "Bubble Sort",
        explanation: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        complexity: "O(n²) time, O(1) space",
        steps: [
          {
            step: 1,
            title: "Initialize",
            description: "Start with the unsorted array",
            data: [64, 34, 25, 12, 22, 11, 90],
            highlights: [],
            action: "initialize"
          },
          {
            step: 2,
            title: "Compare first pair",
            description: "Compare adjacent elements 64 and 34",
            data: [64, 34, 25, 12, 22, 11, 90],
            highlights: [0, 1],
            action: "compare"
          },
          {
            step: 3,
            title: "Swap elements",
            description: "Since 64 > 34, swap them",
            data: [34, 64, 25, 12, 22, 11, 90],
            highlights: [0, 1],
            action: "swap"
          }
        ],
        sampleData: [64, 34, 25, 12, 22, 11, 90]
      };
    }
  }
};
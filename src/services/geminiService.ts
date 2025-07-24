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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
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
        
        Focus on the specific algorithm mentioned in the query. If it's:
        - Sorting algorithms (Bubble Sort, Merge Sort, Quick Sort, Insertion Sort): Use array visualization
        - Search algorithms (Binary Search, Linear Search): Use array with target highlighting
        - Graph algorithms (DFS, BFS, Dijkstra): Use simple graph representation with numbered nodes
        - Dynamic Programming: Use appropriate data structure visualization
        
        For graph algorithms like Dijkstra, use this format:
        - "data": represent as array of objects [{"id": 0, "distance": 0, "visited": false}, {"id": 1, "distance": Infinity, "visited": false}]
        - "highlights": array of node IDs currently being processed
        
        Provide 5-8 detailed steps that can be animated. Make sure the JSON is valid and complete.
        Return ONLY the JSON, no additional text.
      `;
      
      console.log('Calling Gemini API for query:', query);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Raw Gemini response:', text);
      
      // Extract JSON from response - look for content between first { and last }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON structure found in response');
      }
      
      const jsonText = text.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON:', jsonText);
      
      const algorithmData = JSON.parse(jsonText);
      console.log('Parsed algorithm data:', algorithmData);
      
      // Validate the response has required fields
      if (!algorithmData.title || !algorithmData.steps || !Array.isArray(algorithmData.steps)) {
        throw new Error('Invalid response structure from Gemini');
      }
      
      return algorithmData;
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Return algorithm-specific fallback based on the query
      if (query.toLowerCase().includes('dijkstra')) {
        return {
          title: "Dijkstra's Shortest Path Algorithm",
          explanation: "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. It works by maintaining a set of unvisited nodes and continuously selecting the node with the minimum distance.",
          complexity: "O((V + E) log V) time, O(V) space",
          steps: [
            {
              step: 1,
              title: "Initialize",
              description: "Set distance to start node as 0, all others as infinity",
              data: [
                {"id": 0, "distance": 0, "visited": false},
                {"id": 1, "distance": Infinity, "visited": false},
                {"id": 2, "distance": Infinity, "visited": false},
                {"id": 3, "distance": Infinity, "visited": false}
              ],
              highlights: [0],
              action: "initialize"
            },
            {
              step: 2,
              title: "Select minimum",
              description: "Select unvisited node with minimum distance (node 0)",
              data: [
                {"id": 0, "distance": 0, "visited": true},
                {"id": 1, "distance": Infinity, "visited": false},
                {"id": 2, "distance": Infinity, "visited": false},
                {"id": 3, "distance": Infinity, "visited": false}
              ],
              highlights: [0],
              action: "select"
            },
            {
              step: 3,
              title: "Update neighbors",
              description: "Update distances to neighbors of node 0",
              data: [
                {"id": 0, "distance": 0, "visited": true},
                {"id": 1, "distance": 4, "visited": false},
                {"id": 2, "distance": 2, "visited": false},
                {"id": 3, "distance": Infinity, "visited": false}
              ],
              highlights: [1, 2],
              action: "update"
            }
          ],
          sampleData: [
            {"id": 0, "distance": 0, "visited": false},
            {"id": 1, "distance": Infinity, "visited": false},
            {"id": 2, "distance": Infinity, "visited": false},
            {"id": 3, "distance": Infinity, "visited": false}
          ]
        };
      } else if (query.toLowerCase().includes('merge sort')) {
        return {
          title: "Merge Sort",
          explanation: "Merge Sort is a divide-and-conquer algorithm that divides the array into halves, sorts them separately, and then merges them back together.",
          complexity: "O(n log n) time, O(n) space",
          steps: [
            {
              step: 1,
              title: "Initial Array",
              description: "Start with unsorted array",
              data: [38, 27, 43, 3, 9, 82, 10],
              highlights: [],
              action: "initialize"
            },
            {
              step: 2,
              title: "Divide",
              description: "Divide array into two halves",
              data: [38, 27, 43, 3, 9, 82, 10],
              highlights: [0, 1, 2],
              action: "divide"
            }
          ],
          sampleData: [38, 27, 43, 3, 9, 82, 10]
        };
      }
      
      // Default fallback for any other algorithm
      return {
        title: "Algorithm Visualization",
        explanation: "Unable to connect to Gemini AI. Please check your internet connection and try again.",
        complexity: "N/A",
        steps: [
          {
            step: 1,
            title: "Connection Error",
            description: "Could not fetch algorithm explanation from Gemini AI",
            data: [1, 2, 3, 4, 5],
            highlights: [],
            action: "error"
          }
        ],
        sampleData: [1, 2, 3, 4, 5]
      };
    }
  }
};
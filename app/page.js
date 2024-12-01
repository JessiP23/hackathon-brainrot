'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import Select from "react-select";

const DynamicEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), { ssr: false });

// Language options
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" }
];

// Default code templates for each language
const defaultCodeTemplates = {
  python: "# Write your solution here\n",
  javascript: "// Write your solution here\n",
  java: "// Write your solution here\npublic class Solution {\n    public void solve() {\n        \n    }\n}\n",
  cpp: "// Write your solution here\n#include <iostream>\n\nusing namespace std;\n\n"
};

// Function to format AI responses
const formatAIResponse = (text) => {
  // Step 1: Remove unwanted characters
  let cleanedText = text.replace(/[*\\]/g, ''); // Remove unwanted characters like asterisks, slashes, etc.

  // Step 2: Split the text into lines
  const lines = cleanedText.split('\n');

  // Step 3: Process each line with special rules for patterns
  let isCodeBlock = false;
  const formattedLines = lines.map(line => {
    if (line.trim().startsWith('```')) {
      // Toggle the code block flag and return the line as-is
      isCodeBlock = !isCodeBlock;
      return line.trim();
    }

    if (isCodeBlock) return line; // Keep lines in code blocks as-is

    // Ensure "Instructions" and "Example" start a new paragraph
    if (line.includes('Instructions') || line.includes('Example')) {
      return `\n${line.trim()}`; // Add a newline before these keywords
    }

    // Ensure numbered lists start on a new line
    return line.replace(/(\d+\.\s)/g, '\n$1'); // Add newline before each numbered item
  });

  // Step 4: Join lines while ensuring proper spacing
  const formattedText = formattedLines.join('\n').replace(/\n{2,}/g, '\n\n'); // Limit multiple newlines to 2

  // Step 5: Split text into paragraphs outside code blocks
  const paragraphs = [];
  if (!isCodeBlock) {
    const sentences = formattedText.split(/(?<=\.)\s/); // Split by periods followed by space
    const midIndex = Math.ceil(sentences.length / 2);

    // Create two paragraphs from sentences
    paragraphs.push(sentences.slice(0, midIndex).join(' '));
    paragraphs.push(sentences.slice(midIndex).join(' '));
  } else {
    paragraphs.push(formattedText);
  }

  // Return the formatted response with clear separation
  return paragraphs.join('\n\n');
};

export default function Home() {
  const [dataStructure, setDataStructure] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState(languageOptions[0]);
  const [solution, setSolution] = useState(defaultCodeTemplates[language.value]);
  const [feedback, setFeedback] = useState("");
  const [editorTheme, setEditorTheme] = useState("light");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to generate a problem
  const generateProblem = async () => {
    try {

      if (!dataStructure || !difficulty) {
        setProblem("Please select a data structure and difficulty.");
        return;
      }

      const response = await axios.post("http://127.0.0.1:5000/generate-problem", {
        dataStructure,
        difficulty,
      });
      setProblem(formatAIResponse(response.data.problem));
      setFeedback(""); // Clear previous feedback
    } catch (error) {
      console.error("Error generating problem:", error);
      setProblem("Error generating problem. Please try again.");
    }
  };

  // Function to submit solution
  const submitSolution = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/submit-solution", {
        problem,
        solution,
        language: language.value
      });
      setFeedback(formatAIResponse(response.data.feedback));
    } catch (error) {
      console.error("Error submitting solution:", error);
      setFeedback("Error submitting solution. Please try again.");
    }
  };

  // Handle language change
  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setSolution(defaultCodeTemplates[selectedLanguage.value]);
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-5 text-center text-gray-800">Data Structures Mentor</h1>

          <div className="mb-5 text-gray-800">
            <label htmlFor="data-structure" className="block mb-2">Select Data Structure:</label>
            <select
              id="data-structure"
              value={dataStructure}
              onChange={(e) => setDataStructure(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">--Select--</option>
              <option value="Stack">Stack</option>
              <option value="Queue">Queue</option>
              <option value="Linked List">Linked List</option>
              <option value="Binary Tree">Binary Tree</option>
            </select>
          </div>

          <div className="mb-5 text-gray-800">
            <label htmlFor="difficulty" className="block mb-2">Select Difficulty:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">--Select--</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button 
            onClick={generateProblem}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Generate Problem
          </button>

          {problem && (
            <div className="mt-5 text-gray-800">
              <h2 className="text-xl font-bold mb-2">Problem:</h2>
              <p className="bg-gray-100 p-3 rounded">{problem}</p>
            </div>
          )}

          <div className="mt-5 text-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Solution:</h2>
              <div className="flex items-center space-x-2">
                <label>Language:</label>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  options={languageOptions}
                  className="w-40"
                />
              </div>
            </div>
            
            <DynamicEditor
              height="300px"
              language={language.value}
              theme={editorTheme}
              value={solution}
              onChange={(value) => setSolution(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
            
            <button 
              onClick={submitSolution}
              className="w-full bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600 transition-colors"
            >
              Submit Solution
            </button>
          </div>

          {feedback && (
            <div className="mt-5 text-gray-800">
              <h2 className="text-xl font-bold mb-2">Feedback:</h2>
              <p className="bg-gray-100 p-3 rounded">{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


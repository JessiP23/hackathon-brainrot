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
  // Remove unwanted characters like asterisks, slashes, and backslashes
  let formattedText = text.replace(/[*\\]/g, '');

  // Split text into lines and clean up each line
  let lines = formattedText
    .split('\n')
    .map(line => line.trim()) // Trim whitespace from each line
    .filter(line => line.length > 0); // Remove empty lines

  // Join the cleaned lines with a double newline for better readability
  formattedText = lines.join('\n\n');

  // Optionally, fix specific patterns (if needed, such as markdown artifacts)
  formattedText = formattedText.replace(/`/g, ''); // Remove backticks if present

  return formattedText;
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


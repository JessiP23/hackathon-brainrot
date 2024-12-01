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

// object store to cache hints
const hintCache = {};

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

  // Step 3: Process each line to identify and preserve code blocks
  let isCodeBlock = false;
  const formattedLines = lines.map(line => {
    if (line.trim().startsWith('```')) {
      // Toggle the code block flag and return the line as-is
      isCodeBlock = !isCodeBlock;
      return line.trim();
    }
    return isCodeBlock ? line : line.trim(); // Keep lines in code blocks as-is
  });

  // Step 4: Join lines while ensuring proper spacing
  const formattedText = formattedLines.join('\n');

  // Step 5: Split text into paragraphs with special handling for "Instructions" and "Example"
  const paragraphs = [];
  const instructionsExampleRegex = /(Instructions|Example)/i;
  
  // Check for "Instructions" or "Example" and split accordingly
  if (instructionsExampleRegex.test(formattedText)) {
    const splitText = formattedText.split(instructionsExampleRegex);
    for (let i = 0; i < splitText.length; i++) {
      if (instructionsExampleRegex.test(splitText[i])) {
        paragraphs.push(splitText[i].trim());
        if (i + 1 < splitText.length) {
          paragraphs.push(splitText[i + 1].trim());
          i++; // Skip next element as it has been added
        }
      } else {
        if (splitText[i].trim()) {
          paragraphs.push(splitText[i].trim());
        }
      }
    }
  } else {
    paragraphs.push(formattedText);
  }

  // Step 6: Format numbered options
  const finalParagraphs = paragraphs.map(paragraph => {
    // Split numbered options and format them
    const numberedOptionsRegex = /(\d+\.\s)/g;
    return paragraph.split(numberedOptionsRegex).map((part, index) => {
      if (index > 0 && part.trim()) {
        return `${part.trim()}`; // Return the option
      }
      return part; // Return the rest of the text
    }).join('\n');
  });

  // Return the formatted response with clear separation
  return finalParagraphs.join('\n\n');
};

export default function Home() {
  const [dataStructure, setDataStructure] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState(languageOptions[0]);
  const [solution, setSolution] = useState(defaultCodeTemplates[language.value]);
  const [feedback, setFeedback] = useState("");
  const [hints, setHints] = useState([]);
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

  // Function to fetch hints dynamically
  const fetchHints = async (currentCode) => {
    if (hintCache[currentCode]) {
      setHints(hintCache[currentCode]);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/get-hints", {
        problem,
        currentCode,
      });

      const fetchedHints = response.data.hints;
      hintCache[currentCode] = fetchedHints; // Cache the hints
      console.log("Fetched hints:", fetchedHints);
      setHints(fetchedHints);
    } catch (error) {
      console.error("Error fetching hints:", error);
    }
  };

  const handleCodeChange = (value) => {
    const currentCode = value || "";
    setSolution(currentCode);
    fetchHints(currentCode);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 flex items-center justify-center">
    <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <h1 className="text-3xl font-extrabold text-center text-white tracking-tight">
          Data Structures Mentor
        </h1>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="data-structure" className="block text-sm font-medium text-slate-700 mb-2">
              Select Data Structure
            </label>
            <select
              id="data-structure"
              value={dataStructure}
              onChange={(e) => setDataStructure(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            >
              <option value="">--Select--</option>
              <option value="Stack">Stack</option>
              <option value="Queue">Queue</option>
              <option value="Linked List">Linked List</option>
              <option value="Binary Tree">Binary Tree</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-2">
              Select Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            >
              <option value="">--Select--</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateProblem}
          className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Generate Problem
        </button>

        {problem && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Problem:</h2>
            <p className="text-slate-700">{problem}</p>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Solution:</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-700">Language:</label>
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
            className="w-full bg-green-600 text-white py-3 rounded-md mt-4 hover:bg-green-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Submit Solution
          </button>
        </div>

        {hints.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Hints:</h2>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              {hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 shadow-inner">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Feedback:</h2>
            <p className="text-slate-700">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}


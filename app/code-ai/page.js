'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';
import Select from "react-select";

// Dynamic element calling the IDE editor
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
    let cleanedText = text.replace(/[*\\]/g, '');
    const lines = cleanedText.split('\n');
    let isCodeBlock = false;
    const formattedLines = lines.map(line => {
      if (line.trim().startsWith('\`\`\`')) {
        isCodeBlock = !isCodeBlock;
        return line.trim();
      }
      return isCodeBlock ? line : line.trim();
    });

    // Split text into paragraphs based on empty lines
    const formattedText = formattedLines.join('\n');
    const paragraphs = [];
    const instructionsExampleRegex = /(Instructions|Example)/i;
    
    if (instructionsExampleRegex.test(formattedText)) {
      const splitText = formattedText.split(instructionsExampleRegex);
      for (let i = 0; i < splitText.length; i++) {
        if (instructionsExampleRegex.test(splitText[i])) {
          paragraphs.push(splitText[i].trim());
          if (i + 1 < splitText.length) {
            paragraphs.push(splitText[i + 1].trim());
            i++;
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
  
    // Add line breaks after numbered options
    const finalParagraphs = paragraphs.map(paragraph => {
      const numberedOptionsRegex = /(\d+\.\s)/g;
      return paragraph.split(numberedOptionsRegex).map((part, index) => {
        if (index > 0 && part.trim()) {
          return `${part.trim()}`;
        }
        return part;
      }).join('\n');
    });
  
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
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState("light");
  const [aiSolution, setAiSolution] = useState("");
  const [showAISolutionModal, setShowAISolutionModal] = useState(false);
  const [funnyQuote, setFunnyQuote] = useState("");
  const [rubberDuckMode, setRubberDuckMode] = useState(false);
  const [coffeeLevel, setCoffeeLevel] = useState(100);
  const [typoCount, setTypoCount] = useState(0);
  const [dancingCharacters, setDancingCharacters] = useState(false);
  const [memeMode, setMemeMode] = useState(false);
  const [codingStreak, setCodingStreak] = useState(0);
  const [randomBug, setRandomBug] = useState(null);
  const [aiPersonality, setAiPersonality] = useState('normal');
  const [confettiMode, setConfettiMode] = useState(false);
  const [brainrotMode, setBrainrotMode] = useState(false);
  const [brainrotLevel, setBrainrotLevel] = useState(0);
  const [randomThought, setRandomThought] = useState("");

  useEffect(() => {
    setIsClient(true);

    // Set up interval for random thoughts in brainrot mode
    let thoughtInterval;
    if (brainrotMode) {
      thoughtInterval = setInterval(() => {
        setRandomThought(generateRandomThought());
      }, 5000);
    }
    return () => clearInterval(thoughtInterval);
  }, [brainrotMode]);


  // Function to toggle theme from light to dark
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  }

  // Function to get AI solution
  const getAISolution = async () => {
    try {
      // Call the API backend to get AI solution
      const response = await axios.post("http://127.0.0.1:5000/get-ai-solution", {
        problem,
        language: language.value
      });
      setAiSolution(formatAIResponse(response.data.solution));
      setShowAISolutionModal(true);
    } catch (error) {
      console.error("Error getting AI solution:", error);
      setAiSolution("Error getting AI solution. Please try again.");
      setShowAISolutionModal(true);
    }
  };

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


  // Handle language change
  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setSolution(defaultCodeTemplates[selectedLanguage.value]);
  };

  const toggleRubberDuckMode = () => {
    setRubberDuckMode(!rubberDuckMode);
  };

  const drinkCoffee = () => {
    setCoffeeLevel(prevLevel => Math.min(prevLevel + 20, 100));
  };

  const toggleMemeMode = () => {
    setMemeMode(!memeMode);
  };

  const incrementCodingStreak = () => {
    setCodingStreak(prevStreak => prevStreak + 1);
  };

  const generateRandomBug = () => {
    const bugs = ['🐛', '🐞', '🦟', '🕷️', '🦗'];
    const randomBug = bugs[Math.floor(Math.random() * bugs.length)];
    setRandomBug(randomBug);
    setTimeout(() => setRandomBug(null), 3000);
  };

  const changeAiPersonality = () => {
    const personalities = ['normal', 'sassy', 'pirate', 'shakespearean', 'valley-girl'];
    const currentIndex = personalities.indexOf(aiPersonality);
    const nextIndex = (currentIndex + 1) % personalities.length;
    setAiPersonality(personalities[nextIndex]);
  };

  const toggleConfettiMode = () => {
    setConfettiMode(!confettiMode);
  };

  const toggleBrainrotMode = () => {
    setBrainrotMode(!brainrotMode);
    if (!brainrotMode) {
      setBrainrotLevel(0);
    }
  };

  const generateRandomThought = () => {
    const thoughts = [
      "Is mayonnaise an instrument?",
      "Why don't we just take the bugs and push them somewhere else?",
      "I wonder if my code dreams when I'm not running it...",
      "What if semicolons are just periods doing handstands?",
      "Do arrays start at 0 because they're afraid of commitment?",
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  };

  const handleEditorChange = (value, event) => {
    setSolution(value || "");
    // Count typos (simplified: count words less than 3 characters)
    const words = value.split(/\s+/);
    const typos = words.filter(word => word.length < 3).length;
    setTypoCount(typos);

    // Reduce coffee level as you type
    setCoffeeLevel(prevLevel => Math.max(prevLevel - 1, 0));

    incrementCodingStreak();

    if (Math.random() < 0.1) {
        generateRandomBug();
    }

    // Debounce the fetchHints call to avoid too many requests
    clearTimeout(window.hintTimer);
    window.hintTimer = setTimeout(() => fetchHints(value), 1000);

    if (brainrotMode) {
        setBrainrotLevel(prevLevel => Math.min(prevLevel + 1, 100));
        if (Math.random() < 0.1) {
          const brainrotCode = applyBrainrot(value);
          setSolution(brainrotCode);
        }
      }
  };

  const applyBrainrot = (code) => {
    const brainrotEffects = [
      (c) => c.replace(/\bif\b/g, 'when_the_stars_align'),
      (c) => c.replace(/\bfor\b/g, 'do_the_loop_de_loop'),
      (c) => c.replace(/\bfunction\b/g, 'magic_spell'),
      (c) => c.replace(/\breturn\b/g, 'yeet'),
      (c) => c.replace(/\bconsole\.log\b/g, 'scream_into_the_void'),
    ];
    return brainrotEffects[Math.floor(Math.random() * brainrotEffects.length)](code);
  };

  const toggleDancingCharacters = () => {
    setDancingCharacters(!dancingCharacters);
  };
  

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className={`min-h-screen ${theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
        : 'bg-gradient-to-br from-gray-900 to-gray-800'} 
        transition-colors duration-300 flex flex-col`}>
        <header className="w-full p-4 flex justify-between items-center bg-opacity-90 backdrop-blur-md fixed top-0 z-10">
        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
          Bubbles AI
        </h1>
        <div className="flex items-center space-x-4">
          <button onClick={toggleRubberDuckMode} className="p-2 bg-yellow-400 rounded-full">
            🦆
          </button>
          <button onClick={drinkCoffee} className="p-2 bg-brown-600 rounded-full">
            ☕
          </button>
          <button onClick={toggleDancingCharacters} className="p-2 bg-purple-600 rounded-full">
            💃
          </button>
          <button onClick={toggleMemeMode} className="p-2 bg-green-400 rounded-full">
            😂
          </button>
          <button onClick={changeAiPersonality} className="p-2 bg-blue-400 rounded-full">
            🎭
          </button>
          <button onClick={toggleConfettiMode} className="p-2 bg-pink-400 rounded-full">
            🎉
          </button>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${
              theme === 'light' 
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={toggleBrainrotMode} className="p-2 bg-red-400 rounded-full">
            🧠
          </button>
        </div>
      </header>
  
        <main className="flex flex-1 mt-16">
          <div className={`w-1/3 p-6 border-r overflow-y-auto ${
            theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-gray-800 border-gray-700'
          }`}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="data-structure" className={`block text-sm font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                  } mb-2`}>
                    Data Structure
                  </label>
                  <select
                    id="data-structure"
                    value={dataStructure}
                    onChange={(e) => setDataStructure(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm transition duration-200 ${
                      theme === 'light'
                      ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-400 focus:border-indigo-400'
                    }`}
                  >
                    <option value="">--Select--</option>
                    <option value="Stack">Stack</option>
                    <option value="Queue">Queue</option>
                    <option value="Linked List">Linked List</option>
                    <option value="Binary Tree">Binary Tree</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="difficulty" className={`block text-sm font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                  } mb-2`}>
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm transition duration-200 ${
                      theme === 'light'
                      ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-400 focus:border-indigo-400'
                    }`}
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
                className={`w-full py-3 rounded-md transition-colors duration-300 ${
                  theme === 'light'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                Generate Problem
              </button>
  
              {problem && (
                <div className={`rounded-md p-4 ${
                  theme === 'light'
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-gray-700 border border-gray-600'
                }`}>
                  <h2 className={`text-lg font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>Problem:</h2>
                  <p className={theme === 'light' ? 'text-gray-700' : 'text-gray-200'}>{problem}</p>
                </div>
              )}
            </div>
          </div>
  
          <div className={`w-2/3 p-6 overflow-y-auto ${
            theme === 'light' 
            ? 'bg-gray-50' 
            : 'bg-gray-900'
          }`}>
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className={`text-lg font-semibold ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>Solution:</h2>
                <div className="flex items-center space-x-2">
                  <label className={`text-sm ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>Language:</label>
                  <Select
                    value={language}
                    onChange={handleLanguageChange}
                    options={languageOptions}
                    className={`text-sm w-40 ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-800'
                    }`}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: theme === 'light' ? 'white' : '#374151',
                        borderColor: theme === 'light' ? '#d1d5db' : '#4b5563',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? theme === 'light'
                            ? '#e5e7eb'
                            : '#4b5563'
                          : theme === 'light'
                            ? 'transparent'
                            : '#374151', // Set background color for unselected options in dark mode
                        color: theme === 'light' ? '#111827' : '#f3f4f6',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: theme === 'light' ? '#111827' : '#f3f4f6',
                      }),
                    }}
                  />
                </div>
              </div>
              
              <DynamicEditor
                height="400px"
                language={language.value}
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                value={solution}
                onChange={(value) => setSolution(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
              
              <div className="flex space-x-4">
                <button 
                  onClick={submitSolution}
                  className={`flex-1 py-3 rounded-md transition-colors duration-300 ${
                    theme === 'light'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  Submit Solution
                </button>
                
                <button 
                  onClick={getAISolution}
                  className={`flex-1 py-3 rounded-md transition-colors duration-300 ${
                    theme === 'light'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }`}
                >
                  Get AI Solution
                </button>
              </div>
  
              {hints.length > 0 && (
                <div className={`rounded-md p-4 ${
                  theme === 'light'
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-gray-700 border border-gray-600'
                }`}>
                  <h2 className={`text-lg font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>Hints:</h2>
                  <ul className={`list-disc pl-5 space-y-1 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
  
              {feedback && (
                <div className={`rounded-md p-4 ${
                  theme === 'light'
                  ? 'bg-gray-50 border border-gray-200'
                  : 'bg-gray-700 border border-gray-600'
                }`}>
                  <h2 className={`text-lg font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-800' : 'text-white'
                  }`}>Feedback:</h2>
                  <p className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{feedback}</p>
                </div>
              )}
  
              {showAISolutionModal && (
                <div 
                  className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${
                    theme === 'light' ? 'bg-opacity-30' : 'bg-opacity-70'
                  }`}
                  onClick={() => setShowAISolutionModal(false)}
                >
                  <div 
                    className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 ${
                      theme === 'light'
                      ? 'bg-white shadow-2xl'
                      : 'bg-gray-800 shadow-2xl'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className={`text-2xl font-bold ${
                        theme === 'light' ? 'text-gray-800' : 'text-white'
                      }`}>AI Solution</h2>
                      <button 
                        onClick={() => setShowAISolutionModal(false)}
                        className={`px-4 py-2 rounded ${
                          theme === 'light'
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                    <div className={`${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      <p className="whitespace-pre-wrap">{aiSolution}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="p-4 text-center">
        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {funnyQuote}
        </p>
        <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Coffee Level: {coffeeLevel}% | Typo Count: {typoCount} | Coding Streak: {codingStreak} 🔥
        </p>
        <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          AI Personality: {aiPersonality.charAt(0).toUpperCase() + aiPersonality.slice(1)}
        </p>
        <p className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Brainrot Level: {brainrotLevel}% | Random Thought: {randomThought}
        </p>
      </footer>

      {rubberDuckMode && (
        <div className="fixed bottom-4 right-4 text-6xl animate-bounce">
          🦆
        </div>
      )}

      {dancingCharacters && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl">
          <span className="animate-dance inline-block">🕺</span>
          <span className="animate-dance inline-block" style={{animationDelay: '0.1s'}}>💃</span>
          <span className="animate-dance inline-block" style={{animationDelay: '0.2s'}}>🕺</span>
          <span className="animate-dance inline-block" style={{animationDelay: '0.3s'}}>💃</span>
        </div>
      )}

      {memeMode && (
        <div className="fixed top-20 left-4 text-4xl animate-pulse">
          {['🤔', '🧐', '🤓', '😎', '🤯'][Math.floor(Math.random() * 5)]}
        </div>
      )}

      {randomBug && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 text-4xl animate-wiggle">
          {randomBug}
        </div>
      )}

      {confettiMode && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute w-full h-full overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              >
                {['🎉', '🎊', '✨', '🌟', '🍾'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>
      )}

{brainrotMode && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute w-full h-full overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float text-3xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 5}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              >
                {['🧠', '💭', '🤪', '🥴', '🤯'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
  );
}

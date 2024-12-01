'use client'

import React, { useState } from "react";
import axios from "axios";
import "./app.css";

export default function Home() {
  const [dataStructure, setDataStructure] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [feedback, setFeedback] = useState("");

  // Function to generate a problem
  const generateProblem = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-problem", {
        dataStructure,
        difficulty,
      });
      setProblem(response.data.problem);
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
      });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error("Error submitting solution:", error);
      setFeedback("Error submitting solution. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-5 text-center">Data Structures Mentor</h1>

          <div className="mb-5">
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

          <div className="mb-5">
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
            <div className="mt-5">
              <h2 className="text-xl font-bold mb-2">Problem:</h2>
              <p className="bg-gray-100 p-3 rounded">{problem}</p>
            </div>
          )}

          <div className="mt-5">
            <h2 className="text-xl font-bold mb-2">Solution:</h2>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Write your solution here..."
              className="w-full p-2 border rounded h-40"
            ></textarea>
            <button 
              onClick={submitSolution}
              className="w-full bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600 transition-colors"
            >
              Submit Solution
            </button>
          </div>

          {feedback && (
            <div className="mt-5">
              <h2 className="text-xl font-bold mb-2">Feedback:</h2>
              <p className="bg-gray-100 p-3 rounded">{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


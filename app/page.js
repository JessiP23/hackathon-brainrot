'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <header className="p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          CodeCraft AI
        </h1>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-extrabold mb-4">Elevate Your Coding Skills</h2>
          <p className="text-xl text-gray-300">
            Experience the future of coding practice with AI-powered problem generation and feedback
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl font-bold mb-4">Key Features</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Dynamic problem generation based on data structure and difficulty
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Interactive code editor with multi-language support
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                AI-powered solution feedback and hints
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Dark/Light theme toggle for comfortable coding
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`
function generateProblem() {
  // AI generates a coding problem
  // based on selected parameters
}

function submitSolution() {
  // User's code is evaluated
  // Feedback is provided
}

function getAISolution() {
  // AI generates an optimal solution
  // for learning purposes
}
                `}</code>
              </pre>
            </div>
            <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              AI-Powered
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to level up your coding skills?</h3>
          <Link href="/code-ai">
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-8 rounded-full hover:from-purple-600 hover:to-pink-700 transition duration-300">
            Start Coding Now
          </button>
          </Link>
        </motion.div>
      </main>

      <footer className="mt-12 text-center text-gray-500 pb-6">
        <p>&copy; 2023 CodeCraft AI. All rights reserved.</p>
      </footer>
    </div>
  )
}


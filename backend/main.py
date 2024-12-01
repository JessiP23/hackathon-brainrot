from flask import Flask, request, jsonify
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from flask_cors import CORS

# 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

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Initialize Groq LLM
groq_api_key = os.getenv("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")
llm = ChatGroq(api_key='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')

# LangChain setup
problem_template = """
Generate a {difficulty} data structure problem involving {data_structure}.
Provide a clear problem description with instructions and constraints.
"""
problem_prompt = PromptTemplate.from_template(problem_template)
problem_chain = problem_prompt | llm | StrOutputParser()

evaluation_template = """
Evaluate the following solution:

Problem: {problem}
Solution: {solution}

Provide a detailed feedback response, including:
1. If the solution is correct or not.
2. Suggestions for improvement.
3. Time and space complexity analysis.
4. Any additional concepts the user could learn from this problem.
"""
evaluation_prompt = PromptTemplate.from_template(evaluation_template)
evaluation_chain = evaluation_prompt | llm | StrOutputParser()

@app.route('/generate-problem', methods=['POST'])
def generate_problem():
    try:
        # the data that requests json and takes as parameters the data structure and difficulty
        data = request.json
        data_structure = data.get('dataStructure')
        difficulty = data.get('difficulty')

        # the new data strcture and difficulty settings for the problem of coding
        if not data_structure or not difficulty:
            return jsonify({"error": "Missing dataStructure or difficulty"}), 400

        # Generate Problem using LangChain
        problem = problem_chain.invoke({"data_structure": data_structure, "difficulty": difficulty})
        return jsonify({"problem": problem})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# the submit soltuion post request that takes in the problem and solution as the parameters
@app.route('/submit-solution', methods=['POST'])
def submit_solution():
    try:
        data = request.json
        problem = data.get('problem')
        solution = data.get('solution')

        if not problem or not solution:
            return jsonify({"error": "Missing problem or solution"}), 400

        # Evaluate Solution using LangChain
        feedback = evaluation_chain.invoke({"problem": problem, "solution": solution})
        return jsonify({"feedback": feedback})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
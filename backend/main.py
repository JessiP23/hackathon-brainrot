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

# Define the prompt template for generating AI solutions
solution_template = PromptTemplate.from_template(
    "You are an expert programmer. Given the following problem and programming language, provide a detailed solution:\n\n"
    "Problem: {problem}\n"
    "Language: {language}\n\n"
    "Please provide a step-by-step solution with explanations and the final code."
)


# Prompt template for generating hints
hint_template = PromptTemplate(
    input_variables=["problem", "code"],
    template=(
        "Problem: {problem}\n"
        "Code so far:\n{code}\n"
        "What is the next step or hint to solve this problem?"
    )
)

# Create the LLMChain for generating solutions
solution_chain = LLMChain(llm=llm, prompt=solution_template, output_parser=StrOutputParser())

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

@app.route('/get-ai-solution', methods=['POST'])
def get_ai_solution():
    data = request.json
    problem = data.get('problem')
    language = data.get('language')

    if not problem or not language:
        return jsonify({"error": "Missing problem or language"}), 400

    try:
        solution = solution_chain.run(problem=problem, language=language)
        return jsonify({"solution": solution})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-hints", methods=["POST"])
def get_hints():
    data = request.json
    problem = data.get("problem", "")
    current_code = data.get("currentCode", "")

    if not problem or not current_code:
        return jsonify({"error": "Problem and code are required."}), 400

    try:
        chain = LLMChain(prompt=hint_template, llm=llm)
        hints = chain.run(problem=problem, code=current_code)
        return jsonify({"hints": hints.split("\n")})  # Assuming multiple hints are separated by newlines
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
import requests

class FigmaAgent:
    def __init__(self, figma_token):
        self.base_url = "https://api.figma.com/v1"
        self.headers = {"Authorization": f"Bearer {figma_token}"}

    def fetch_file_data(self, file_id):
        url = f"{self.base_url}/files/{file_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch Figma file: {response.text}")

# Example usage
figma_agent = FigmaAgent(figma_token="figd_ZWoNFnjj5Dd2xPwUFi7UVn4za-JhrAUwooOrjO5P")
design_data = figma_agent.fetch_file_data("Bi5F4rrUGBA0ZGaUMS2Xxl")

def parse_figma_data(figma_json):
    components = figma_json.get("components", {})
    styles = figma_json.get("styles", {})
    frames = figma_json.get("document", {}).get("children", [])
    return {"components": components, "styles": styles, "frames": frames}

parsed_data = parse_figma_data(design_data)

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Load Hugging Face model
tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("Salesforce/codet5-base")

def generate_code(component_data):
    prompt = f"Generate React code for the following design: {component_data}"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)
    outputs = model.generate(**inputs, max_length=512)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Example: Generate code for a button component
component_example = {"type": "button", "text": "Submit", "styles": {"color": "blue"}}
code = generate_code(component_example)
print(code)


from langchain.chains import LLMChain
#from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Define a template for LangChain
template = PromptTemplate(
    input_variables=["design_data"],
    template="Given the following design data: {design_data}, generate React code."
)

def langchain_generate_code(design_data):
    chain = LLMChain(prompt=template, llm=model)
    return chain.run({"design_data": design_data})

from fetchai.ledger.api.init import LedgerApi

# Initialize Fetch.ai agent
api = LedgerApi("testnet")

# Define a task
def fetch_and_generate_task(figma_file_id):
    # Step 1: Fetch Figma data
    design_data = figma_agent.fetch_file_data(figma_file_id)
    parsed_data = parse_figma_data(design_data)
    
    # Step 2: Generate code
    generated_code = generate_code(parsed_data["frames"])
    
    # Step 3: Save the output
    with open("output/GeneratedCode.js", "w") as f:
        f.write(generated_code)
    return "GeneratedCode.js saved!"


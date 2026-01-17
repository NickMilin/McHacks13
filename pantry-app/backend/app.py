"""
PantryPal Flask Backend Template
================================
This is a starter template for connecting your React frontend to Flask.
You'll integrate this with Gumloop for AI-powered features.

Run with: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
load_dotenv()  # Load environment variables from .env if present

# ============================================================
# PANTRY ENDPOINTS
# ============================================================

# In-memory storage (replace with actual database)
pantry_items = []
recipes = []

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/pantry', methods=['POST'])
def add_pantry_item():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/pantry/<int:item_id>', methods=['PUT'])
def update_pantry_item(item_id):
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/pantry/<int:item_id>', methods=['DELETE'])
def delete_pantry_item(item_id):
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/pantry/receipt', methods=['POST'])
def upload_receipt():
    return jsonify({'error': 'Not implemented in this build'}), 501

# ============================================================
# RECIPE ENDPOINTS
# ============================================================

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes', methods=['POST'])
def add_recipe():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes/<int:recipe_id>/cook', methods=['POST'])
def cook_recipe(recipe_id):
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes/suggestions', methods=['GET'])
def get_suggestions():
    return jsonify({'error': 'Not implemented in this build'}), 501

@app.route('/api/recipes/<int:recipe_id>/shopping-list', methods=['GET'])
def get_shopping_list(recipe_id):
    return jsonify({'error': 'Not implemented in this build'}), 501

# ============================================================
# INGREDIENT SUBSTITUTES
# ============================================================

@app.route('/api/ingredients/<ingredient>/substitutes', methods=['GET'])
def get_substitutes(ingredient):
    return jsonify({'error': 'Not implemented in this build'}), 501

# ============================================================
# HEALTH STATS
# ============================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify({'error': 'Not implemented in this build'}), 501

# ============================================================
# CLAUDE AI CHAT
# ============================================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat with AI for pantry assistance.
    Supports either OpenAI (ChatGPT) via OPENAI_API_KEY or Anthropic (Claude) via ANTHROPIC_API_KEY.
    """
    data = request.json
    messages = data.get('messages', [])

    # System prompt for pantry assistant context
    system_prompt = """You are a helpful pantry and cooking assistant called PantryPal. 
You help users with:
- Recipe suggestions based on available ingredients
- Ingredient substitutions for dietary restrictions or missing items
- Meal planning tips
- Food storage and expiration guidance
- Nutrition information
- Cooking tips and techniques

Keep responses concise, friendly, and practical. Focus on being helpful for home cooks managing their kitchen pantry."""

    # Prefer OpenAI if configured, otherwise fall back to Anthropic
    openai_key = os.environ.get('OPENAI_API_KEY')
    anthropic_key = os.environ.get('ANTHROPIC_API_KEY')

    try:
        if openai_key:
            # Use OpenAI (ChatGPT)
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)

            # Convert messages, prepend system prompt
            openai_messages = [{'role': 'system', 'content': system_prompt}]
            for msg in messages:
                if msg.get('role') in ['user', 'assistant']:
                    openai_messages.append({'role': msg['role'], 'content': msg['content']})

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages,
                temperature=0.7,
                max_tokens=512
            )
            assistant_message = completion.choices[0].message.content
            return jsonify({'message': assistant_message})

        elif anthropic_key:
            # Use Anthropic (Claude)
            import anthropic
            client = anthropic.Anthropic(api_key=anthropic_key)

            claude_messages = []
            for msg in messages:
                if msg.get('role') in ['user', 'assistant']:
                    claude_messages.append({'role': msg['role'], 'content': msg['content']})

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system_prompt,
                messages=claude_messages
            )

            assistant_message = response.content[0].text
            return jsonify({'message': assistant_message})

        else:
            return jsonify({'error': 'No AI key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.'}), 500

    except Exception as e:
        print(f"AI chat error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("🍳 PantryPal Backend Starting...")
    print("📡 API available at http://localhost:5000/api")
    print("💡 Connect your Gumloop workflows in the TODO sections")
    app.run(debug=True, port=5000)

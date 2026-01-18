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
# MAIN
# ============================================================

if __name__ == '__main__':
    print("🍳 PantryPal Backend Starting...")
    print("📡 API available at http://localhost:5001/api")
    print("💡 Connect your Gumloop workflows in the TODO sections")
    app.run(debug=True, port=5001)

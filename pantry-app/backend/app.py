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
import csv
import io
import json
import tempfile
from dotenv import load_dotenv
from receipt_upload import run_pipeline
from recipe_provided import run_pipeline as run_recipe_pipeline
from recipe_suggest import run_pipeline as run_suggest_pipeline

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
load_dotenv()  # Load environment variables from .env if present

# Gumloop configuration
GUMLOOP_USER_ID = os.getenv('GUMLOOP_USER_ID', 'ACFRzCqhciYjfQxd77vMlTxTMD22')

# Category mapping for frontend compatibility
CATEGORY_MAP = {
    'Proteins': 'protein',
    'Dairy': 'dairy',
    'Grains': 'grain',
    'Fruits': 'fruit',
    'Vegetables': 'vegetable',
    'Other': 'other'
}

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
    """
    Process an uploaded receipt image through Gumloop OCR pipeline.
    Returns extracted grocery items as JSON.
    """
    if 'receipt' not in request.files:
        return jsonify({'error': 'No receipt file provided'}), 400
    
    file = request.files['receipt']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save uploaded file temporarily
    try:
        # Create a temp file with the original extension
        ext = os.path.splitext(file.filename or '.jpg')[1] or '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            file.save(tmp.name)
            temp_path = tmp.name
        
        # Process through Gumloop pipeline
        csv_text = run_pipeline(temp_path, GUMLOOP_USER_ID)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        # Parse CSV response into items
        items = []
        if csv_text:
            # Parse the CSV text
            reader = csv.DictReader(io.StringIO(csv_text.strip()))
            for idx, row in enumerate(reader):
                # Map category to frontend format
                raw_category = row.get('food_category', 'Other')
                category = CATEGORY_MAP.get(raw_category, 'other')
                
                # Parse quantity
                qty_str = row.get('quantity', '1')
                try:
                    quantity = float(qty_str) if '.' in str(qty_str) else int(qty_str)
                except (ValueError, TypeError):
                    quantity = 1
                
                # Parse unit (handle 'null' string)
                unit = row.get('unit', 'count')
                if unit == 'null' or not unit:
                    unit = 'count'
                
                items.append({
                    'id': idx + 1,
                    'name': row.get('food_name', 'Unknown Item'),
                    'quantity': quantity,
                    'unit': unit,
                    'category': category
                })
        
        return jsonify({
            'success': True,
            'items': items,
            'count': len(items)
        })
        
    except FileNotFoundError as e:
        return jsonify({'error': f'File processing error: {str(e)}'}), 500
    except TimeoutError as e:
        return jsonify({'error': f'Processing timeout: {str(e)}'}), 504
    except Exception as e:
        # Clean up temp file on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

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

@app.route('/api/recipes/from-url', methods=['POST'])
def get_recipe_from_url():
    """
    Process a recipe URL (website or YouTube) through Gumloop pipeline.
    Returns extracted recipe as JSON in recipe_format structure.
    """
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400
    
    recipe_url = data['url'].strip()
    if not recipe_url:
        return jsonify({'error': 'Empty URL provided'}), 400
    
    try:
        # Process through Gumloop recipe pipeline
        recipe_json_str = run_recipe_pipeline(recipe_url, GUMLOOP_USER_ID)
        
        if not recipe_json_str:
            return jsonify({'error': 'No recipe data returned from pipeline'}), 500
        
        # Parse the JSON response
        try:
            recipe_data = json.loads(recipe_json_str)
        except json.JSONDecodeError:
            # If it's already a dict, use it directly
            if isinstance(recipe_json_str, dict):
                recipe_data = recipe_json_str
            else:
                return jsonify({'error': 'Invalid recipe data format'}), 500
        
        # Add source URL to the recipe
        recipe_data['sourceUrl'] = recipe_url
        recipe_data['source'] = 'Imported Recipe'
        
        return jsonify({
            'success': True,
            'recipe': recipe_data
        })
        
    except TimeoutError as e:
        return jsonify({'error': f'Processing timeout: {str(e)}'}), 504
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/recipes/suggestions', methods=['POST'])
def get_suggestions():
    """
    Generate recipe suggestions based on pantry items.
    Expects a POST with JSON body containing pantry_csv string.
    Returns 3 recipe suggestions.
    """
    data = request.get_json()
    if not data or 'pantry_csv' not in data:
        return jsonify({'error': 'No pantry data provided'}), 400
    
    pantry_csv = data['pantry_csv'].strip()
    if not pantry_csv:
        return jsonify({'error': 'Empty pantry data provided'}), 400
    
    try:
        # Process through Gumloop suggestion pipeline
        outputs = run_suggest_pipeline(pantry_csv, GUMLOOP_USER_ID)
        
        if not outputs:
            return jsonify({'error': 'No suggestions returned from pipeline'}), 500
        
        # Parse the 3 recipe outputs
        recipes = []
        for i in range(1, 4):
            output_key = f'output{i}'
            recipe_str = outputs.get(output_key)
            if recipe_str:
                try:
                    recipe_data = json.loads(recipe_str)
                    recipe_data['id'] = i
                    recipe_data['source'] = 'AI Suggested'
                    recipes.append(recipe_data)
                except json.JSONDecodeError:
                    # If it's already a dict, use it directly
                    if isinstance(recipe_str, dict):
                        recipe_str['id'] = i
                        recipe_str['source'] = 'AI Suggested'
                        recipes.append(recipe_str)
        
        return jsonify({
            'success': True,
            'recipes': recipes,
            'count': len(recipes)
        })
        
    except TimeoutError as e:
        return jsonify({'error': f'Processing timeout: {str(e)}'}), 504
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

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

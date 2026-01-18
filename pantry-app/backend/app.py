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
import json
import traceback
import uuid
from dotenv import load_dotenv

# Import Gumloop pipeline functions
try:
    from receipt_upload import run_pipeline as run_receipt_pipeline
    from recipe_suggest import run_pipeline as run_suggest_pipeline
    from recipe_provided import run_pipeline as run_provided_pipeline
except ImportError as e:
    print(f"Warning: Could not import Gumloop pipeline functions: {e}")
    run_receipt_pipeline = None
    run_suggest_pipeline = None
    run_provided_pipeline = None

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
load_dotenv()  # Load environment variables from .env if present

# Configuration from environment
USER_ID = os.getenv('GUMLOOP_USER_ID', 'ACFRzCqhciYjfQxd77vMlTxTMD22')
RECEIPT_PIPELINE_ID = os.getenv('RECEIPT_PIPELINE_ID', 'vezQxjRcmZY43i7KWchyKw')
SUGGEST_PIPELINE_ID = os.getenv('SUGGEST_PIPELINE_ID', '6rJM8cctyz3xjYTooAMjpe')
PROVIDED_PIPELINE_ID = os.getenv('PROVIDED_PIPELINE_ID', 'hqBPoCuJVrK2FTJ4ejFUqf')

# Constants
WASTE_SAVED_MULTIPLIER = 0.5  # Mock multiplier for waste saved calculation

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def find_matching_pantry_item(ingredient_name, pantry_items_list):
    """
    Find a pantry item that matches the ingredient name.
    Returns the index of the matching item, or -1 if not found.
    """
    for i, item in enumerate(pantry_items_list):
        item_name = item.get('name', '').lower()
        ingredient_lower = ingredient_name.lower()
        if item_name in ingredient_lower or ingredient_lower in item_name:
            return i
    return -1

# ============================================================
# PANTRY ENDPOINTS
# ============================================================

# In-memory storage (replace with actual database)
pantry_items = []
recipes = []

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    """Get all pantry items"""
    try:
        return jsonify({
            'success': True,
            'items': pantry_items
        }), 200
    except Exception as e:
        print(f"Error getting pantry: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pantry', methods=['POST'])
def add_pantry_item():
    """Add a new item to the pantry"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Generate ID for the item
        item_id = len(pantry_items) + 1
        item = {
            'id': item_id,
            **data
        }
        pantry_items.append(item)
        
        return jsonify({
            'success': True,
            'item': item
        }), 201
    except Exception as e:
        print(f"Error adding pantry item: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pantry/<int:item_id>', methods=['PUT'])
def update_pantry_item(item_id):
    """Update a pantry item"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Find and update the item
        for i, item in enumerate(pantry_items):
            if item['id'] == item_id:
                pantry_items[i] = {
                    'id': item_id,
                    **data
                }
                return jsonify({
                    'success': True,
                    'item': pantry_items[i]
                }), 200
        
        return jsonify({
            'success': False,
            'error': f'Item {item_id} not found'
        }), 404
    except Exception as e:
        print(f"Error updating pantry item: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pantry/<int:item_id>', methods=['DELETE'])
def delete_pantry_item(item_id):
    """Delete a pantry item"""
    try:
        # Find and delete the item
        for i, item in enumerate(pantry_items):
            if item['id'] == item_id:
                deleted_item = pantry_items.pop(i)
                return jsonify({
                    'success': True,
                    'item': deleted_item
                }), 200
        
        return jsonify({
            'success': False,
            'error': f'Item {item_id} not found'
        }), 404
    except Exception as e:
        print(f"Error deleting pantry item: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pantry/receipt', methods=['POST'])
def upload_receipt():
    """Upload and process a receipt image"""
    try:
        if run_receipt_pipeline is None:
            return jsonify({
                'success': False,
                'error': 'Receipt processing not available'
            }), 501
        
        # Check if file is present
        if 'receipt' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No receipt file provided'
            }), 400
        
        file = request.files['receipt']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Generate a safe filename to prevent directory traversal
        file_ext = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        safe_filename = f"receipt_{uuid.uuid4().hex}{file_ext}"
        temp_path = os.path.join('/tmp', safe_filename)
        file.save(temp_path)
        
        try:
            # Process receipt using Gumloop pipeline
            receipt_text = run_receipt_pipeline(temp_path, USER_ID, RECEIPT_PIPELINE_ID)
            
            # Parse the receipt text and extract items
            # This is a simplified version - you may need to adjust based on actual output format
            items = []
            if receipt_text:
                # Try to parse as JSON or CSV
                try:
                    # Assume the output is structured data
                    parsed_data = json.loads(receipt_text) if isinstance(receipt_text, str) else receipt_text
                    items = parsed_data if isinstance(parsed_data, list) else [parsed_data]
                except:
                    # If not JSON, treat as plain text
                    items = [{'name': receipt_text, 'quantity': 1}]
            
            return jsonify({
                'success': True,
                'items': items,
                'raw_text': receipt_text
            }), 200
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"Error processing receipt: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# RECIPE ENDPOINTS
# ============================================================

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Get all saved recipes"""
    try:
        return jsonify({
            'success': True,
            'recipes': recipes
        }), 200
    except Exception as e:
        print(f"Error getting recipes: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes', methods=['POST'])
def add_recipe():
    """Add a new recipe to the library"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Generate ID for the recipe
        recipe_id = len(recipes) + 1
        recipe = {
            'id': recipe_id,
            **data
        }
        recipes.append(recipe)
        
        return jsonify({
            'success': True,
            'recipe': recipe
        }), 201
    except Exception as e:
        print(f"Error adding recipe: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """Delete a recipe from the library"""
    try:
        # Find and delete the recipe
        for i, recipe in enumerate(recipes):
            if recipe['id'] == recipe_id:
                deleted_recipe = recipes.pop(i)
                return jsonify({
                    'success': True,
                    'recipe': deleted_recipe
                }), 200
        
        return jsonify({
            'success': False,
            'error': f'Recipe {recipe_id} not found'
        }), 404
    except Exception as e:
        print(f"Error deleting recipe: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/<int:recipe_id>/cook', methods=['POST'])
def cook_recipe(recipe_id):
    """Mark a recipe as cooked and remove ingredients from pantry"""
    try:
        # Find the recipe
        recipe = None
        for r in recipes:
            if r['id'] == recipe_id:
                recipe = r
                break
        
        if not recipe:
            return jsonify({
                'success': False,
                'error': f'Recipe {recipe_id} not found'
            }), 404
        
        # Remove ingredients from pantry
        removed_items = []
        if 'ingredients' in recipe:
            for ingredient in recipe['ingredients']:
                ingredient_name = ingredient.get('name', '')
                # Find matching pantry item
                item_index = find_matching_pantry_item(ingredient_name, pantry_items)
                if item_index >= 0:
                    removed_items.append(pantry_items.pop(item_index))
        
        return jsonify({
            'success': True,
            'recipe': recipe,
            'removed_items': removed_items
        }), 200
    except Exception as e:
        print(f"Error cooking recipe: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    """Search for recipes online using a recipe URL"""
    try:
        if run_provided_pipeline is None:
            return jsonify({
                'success': False,
                'error': 'Recipe search not available'
            }), 501
        
        # Get the search query from URL parameter
        query = request.args.get('q', '')
        if not query:
            return jsonify({
                'success': False,
                'error': 'No search query provided'
            }), 400
        
        # For now, return mock data since we need a URL, not a search term
        # In production, you'd integrate with a recipe API or use the provided pipeline with actual URLs
        return jsonify({
            'success': True,
            'recipes': [],
            'message': 'Recipe search requires a valid recipe URL. Use the provided pipeline endpoint instead.'
        }), 200
        
    except Exception as e:
        print(f"Error searching recipes: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/from-url', methods=['POST'])
def get_recipe_from_url():
    """Get recipe details from a URL using Gumloop"""
    try:
        if run_provided_pipeline is None:
            return jsonify({
                'success': False,
                'error': 'Recipe URL processing not available'
            }), 501
        
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'No URL provided'
            }), 400
        
        recipe_url = data['url']
        
        # Process the recipe URL using Gumloop pipeline
        recipe_json = run_provided_pipeline(recipe_url, USER_ID, PROVIDED_PIPELINE_ID)
        
        if recipe_json:
            return jsonify({
                'success': True,
                'recipe': recipe_json
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to extract recipe from URL'
            }), 500
            
    except Exception as e:
        print(f"Error processing recipe URL: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/suggestions', methods=['GET'])
def get_suggestions():
    """Get recipe suggestions based on current pantry items"""
    try:
        if run_suggest_pipeline is None:
            return jsonify({
                'success': False,
                'error': 'Recipe suggestions not available'
            }), 501
        
        # Convert pantry items to CSV format for the pipeline
        if not pantry_items:
            return jsonify({
                'success': True,
                'recipes': [],
                'message': 'No pantry items available for suggestions'
            }), 200
        
        # Create CSV string from pantry items
        csv_lines = ['food_name,quantity,unit,food_category']
        for item in pantry_items:
            name = item.get('name', 'Unknown')
            quantity = item.get('quantity', 1)
            unit = item.get('unit', 'null')
            category = item.get('category', 'Other')
            csv_lines.append(f"{name},{quantity},{unit},{category}")
        
        pantry_csv = '\n'.join(csv_lines)
        
        # Get suggestions from Gumloop pipeline
        recipe_json = run_suggest_pipeline(pantry_csv, USER_ID, SUGGEST_PIPELINE_ID)
        
        if recipe_json:
            # Parse the recipe JSON if it's a string
            if isinstance(recipe_json, str):
                try:
                    recipe_json = json.loads(recipe_json)
                except:
                    pass
            
            return jsonify({
                'success': True,
                'recipes': recipe_json if isinstance(recipe_json, list) else [recipe_json]
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate suggestions'
            }), 500
            
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recipes/<int:recipe_id>/shopping-list', methods=['GET'])
def get_shopping_list(recipe_id):
    """Get missing ingredients for a recipe as a shopping list"""
    try:
        # Find the recipe
        recipe = None
        for r in recipes:
            if r['id'] == recipe_id:
                recipe = r
                break
        
        if not recipe:
            return jsonify({
                'success': False,
                'error': f'Recipe {recipe_id} not found'
            }), 404
        
        # Find missing ingredients
        missing_ingredients = []
        if 'ingredients' in recipe:
            for ingredient in recipe['ingredients']:
                ingredient_name = ingredient.get('name', '')
                # Check if ingredient is in pantry
                item_index = find_matching_pantry_item(ingredient_name, pantry_items)
                if item_index < 0:
                    missing_ingredients.append(ingredient)
        
        return jsonify({
            'success': True,
            'recipe_id': recipe_id,
            'recipe_name': recipe.get('name', 'Unknown'),
            'missing_ingredients': missing_ingredients
        }), 200
    except Exception as e:
        print(f"Error getting shopping list: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# INGREDIENT SUBSTITUTES
# ============================================================

@app.route('/api/ingredients/<ingredient>/substitutes', methods=['GET'])
def get_substitutes(ingredient):
    """Get ingredient substitutes"""
    try:
        # This would ideally use an AI service or database
        # For now, return common substitutes
        common_substitutes = {
            'butter': ['margarine', 'coconut oil', 'olive oil'],
            'milk': ['almond milk', 'soy milk', 'oat milk'],
            'eggs': ['flax eggs', 'applesauce', 'banana'],
            'sugar': ['honey', 'maple syrup', 'stevia'],
            'flour': ['almond flour', 'coconut flour', 'rice flour'],
        }
        
        ingredient_lower = ingredient.lower()
        substitutes = common_substitutes.get(ingredient_lower, [])
        
        return jsonify({
            'success': True,
            'ingredient': ingredient,
            'substitutes': substitutes
        }), 200
    except Exception as e:
        print(f"Error getting substitutes: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# HEALTH STATS
# ============================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get health and pantry statistics"""
    try:
        # Calculate basic stats
        total_items = len(pantry_items)
        total_recipes = len(recipes)
        
        # Count items by category
        categories = {}
        for item in pantry_items:
            category = item.get('category', 'Other')
            categories[category] = categories.get(category, 0) + 1
        
        # Calculate expiring items (mock calculation)
        expiring_soon = 0
        for item in pantry_items:
            if 'expiryDate' in item:
                # In a real implementation, you'd check the date
                expiring_soon += 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_items': total_items,
                'total_recipes': total_recipes,
                'categories': categories,
                'expiring_soon': expiring_soon,
                'waste_saved': total_items * WASTE_SAVED_MULTIPLIER,
            }
        }), 200
    except Exception as e:
        print(f"Error getting stats: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("🍳 PantryPal Backend Starting...")
    print("📡 API available at http://localhost:5001/api")
    print("💡 Gumloop pipelines integrated for AI features")
    app.run(debug=True, port=5001)

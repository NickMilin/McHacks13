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

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ============================================================
# PANTRY ENDPOINTS
# ============================================================

# In-memory storage (replace with actual database)
pantry_items = []
recipes = []

@app.route('/api/pantry', methods=['GET'])
def get_pantry():
    """Get all pantry items"""
    return jsonify(pantry_items)

@app.route('/api/pantry', methods=['POST'])
def add_pantry_item():
    """Add item to pantry"""
    item = request.json
    item['id'] = len(pantry_items) + 1
    pantry_items.append(item)
    return jsonify(item), 201

@app.route('/api/pantry/<int:item_id>', methods=['PUT'])
def update_pantry_item(item_id):
    """Update pantry item"""
    item = next((i for i in pantry_items if i['id'] == item_id), None)
    if item:
        item.update(request.json)
        return jsonify(item)
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/pantry/<int:item_id>', methods=['DELETE'])
def delete_pantry_item(item_id):
    """Delete pantry item"""
    global pantry_items
    pantry_items = [i for i in pantry_items if i['id'] != item_id]
    return jsonify({'success': True})

@app.route('/api/pantry/receipt', methods=['POST'])
def upload_receipt():
    """
    Upload receipt image for OCR processing
    TODO: Integrate with Gumloop for OCR
    """
    if 'receipt' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['receipt']
    
    # TODO: Send image to Gumloop for OCR processing
    # Example Gumloop integration:
    # response = gumloop.process_receipt(file)
    # extracted_items = response['items']
    
    # Placeholder response
    extracted_items = [
        {'name': 'Sample Item 1', 'quantity': 1, 'unit': 'count', 'category': 'other'},
        {'name': 'Sample Item 2', 'quantity': 2, 'unit': 'lbs', 'category': 'protein'},
    ]
    
    return jsonify({'items': extracted_items})

# ============================================================
# RECIPE ENDPOINTS
# ============================================================

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """Get all saved recipes"""
    return jsonify(recipes)

@app.route('/api/recipes', methods=['POST'])
def add_recipe():
    """Add new recipe"""
    recipe = request.json
    recipe['id'] = len(recipes) + 1
    recipes.append(recipe)
    return jsonify(recipe), 201

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """Delete recipe"""
    global recipes
    recipes = [r for r in recipes if r['id'] != recipe_id]
    return jsonify({'success': True})

@app.route('/api/recipes/<int:recipe_id>/cook', methods=['POST'])
def cook_recipe(recipe_id):
    """
    Cook recipe - removes used ingredients from pantry
    """
    recipe = next((r for r in recipes if r['id'] == recipe_id), None)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # TODO: Deduct ingredients from pantry
    # for ingredient in recipe['ingredients']:
    #     # Find matching pantry item and reduce quantity
    #     pass
    
    return jsonify({'success': True, 'message': f'Cooked {recipe["name"]}'})

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    """
    Search for recipes online
    TODO: Integrate with Gumloop to search recipe APIs
    """
    query = request.args.get('q', '')
    
    # TODO: Use Gumloop to search recipe APIs (Spoonacular, etc.)
    # Example:
    # results = gumloop.search_recipes(query)
    
    # Placeholder response
    results = [
        {
            'id': 1,
            'name': f'{query} Recipe 1',
            'source': 'AllRecipes',
            'sourceUrl': 'https://allrecipes.com',
            'prepTime': 30,
            'servings': 4,
            'ingredients': [
                {'name': 'Ingredient 1', 'quantity': 1, 'unit': 'cup'},
                {'name': 'Ingredient 2', 'quantity': 2, 'unit': 'tbsp'},
            ]
        }
    ]
    
    return jsonify(results)

@app.route('/api/recipes/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get recipe suggestions based on pantry contents
    TODO: Integrate with Gumloop for AI suggestions
    """
    # TODO: Use Gumloop to analyze pantry and suggest recipes
    # Example:
    # suggestions = gumloop.get_recipe_suggestions(pantry_items)
    
    return jsonify([])

@app.route('/api/recipes/<int:recipe_id>/shopping-list', methods=['GET'])
def get_shopping_list(recipe_id):
    """Get shopping list for a recipe (missing ingredients)"""
    recipe = next((r for r in recipes if r['id'] == recipe_id), None)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Calculate missing ingredients
    missing = []
    for ingredient in recipe.get('ingredients', []):
        # Check if ingredient is in pantry
        in_pantry = any(
            item['name'].lower() in ingredient['name'].lower() or
            ingredient['name'].lower() in item['name'].lower()
            for item in pantry_items
        )
        if not in_pantry:
            missing.append(ingredient)
    
    return jsonify(missing)

# ============================================================
# INGREDIENT SUBSTITUTES
# ============================================================

@app.route('/api/ingredients/<ingredient>/substitutes', methods=['GET'])
def get_substitutes(ingredient):
    """
    Get ingredient substitutes
    TODO: Integrate with Gumloop for AI-powered substitutes
    """
    # TODO: Use Gumloop to get intelligent substitutes
    # Example:
    # substitutes = gumloop.get_substitutes(ingredient)
    
    # Placeholder substitutes
    common_substitutes = {
        'milk': ['Almond Milk', 'Oat Milk', 'Soy Milk', 'Coconut Milk'],
        'butter': ['Olive Oil', 'Coconut Oil', 'Margarine', 'Greek Yogurt'],
        'eggs': ['Flax Eggs', 'Chia Eggs', 'Applesauce', 'Mashed Banana'],
        'chicken': ['Turkey', 'Tofu', 'Tempeh', 'Seitan'],
    }
    
    subs = common_substitutes.get(ingredient.lower(), [])
    return jsonify(subs)

# ============================================================
# HEALTH STATS
# ============================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get health statistics for pantry"""
    # Calculate category distribution
    categories = {}
    for item in pantry_items:
        cat = item.get('category', 'other')
        categories[cat] = categories.get(cat, 0) + 1
    
    return jsonify({
        'total_items': len(pantry_items),
        'categories': categories,
    })

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("🍳 PantryPal Backend Starting...")
    print("📡 API available at http://localhost:5000/api")
    print("💡 Connect your Gumloop workflows in the TODO sections")
    app.run(debug=True, port=5000)

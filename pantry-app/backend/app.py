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
import tempfile
from dotenv import load_dotenv
from receipt_upload import run_pipeline

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
load_dotenv()  # Load environment variables from .env if present

# Gumloop configuration
GUMLOOP_USER_ID = os.getenv('GUMLOOP_USER_ID', 'ACFRzCqhciYjfQxd77vMlTxTMD22')
GUMLOOP_SAVED_ITEM_ID = os.getenv('GUMLOOP_SAVED_ITEM_ID', 'vezQxjRcmZY43i7KWchyKw')

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
        ext = os.path.splitext(file.filename)[1] or '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            file.save(tmp.name)
            temp_path = tmp.name
        
        # Process through Gumloop pipeline
        csv_text = run_pipeline(temp_path, GUMLOOP_USER_ID, GUMLOOP_SAVED_ITEM_ID)
        
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

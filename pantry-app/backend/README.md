# PantryPal Backend

Flask backend API for the PantryPal application, integrated with Gumloop AI pipelines.

## Features

- 🗄️ **Pantry Management**: CRUD operations for pantry items
- 📸 **Receipt OCR**: Upload receipt images and extract items using Gumloop
- 🍳 **Recipe Suggestions**: AI-powered recipe suggestions based on pantry contents
- 🔗 **Recipe URL Parser**: Extract recipe details from URLs
- 🛒 **Shopping Lists**: Generate shopping lists for missing ingredients
- 📊 **Health Stats**: Track pantry statistics and food waste reduction

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Add your Gumloop API key to `.env`:
```
GUMLOOP=your_api_key_here
```

### Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### Pantry Management

- `GET /api/pantry` - Get all pantry items
- `POST /api/pantry` - Add a new item
- `PUT /api/pantry/<id>` - Update an item
- `DELETE /api/pantry/<id>` - Delete an item

### Receipt Processing

- `POST /api/pantry/receipt` - Upload receipt image for OCR processing

### Recipe Management

- `GET /api/recipes` - Get all saved recipes
- `POST /api/recipes` - Add a new recipe
- `DELETE /api/recipes/<id>` - Delete a recipe
- `POST /api/recipes/<id>/cook` - Mark recipe as cooked (removes ingredients from pantry)

### Recipe Discovery

- `GET /api/recipes/search?q=<query>` - Search for recipes (limited functionality)
- `POST /api/recipes/from-url` - Extract recipe from URL using Gumloop
- `GET /api/recipes/suggestions` - Get AI-powered recipe suggestions based on pantry

### Shopping & Utilities

- `GET /api/recipes/<id>/shopping-list` - Get missing ingredients for a recipe
- `GET /api/ingredients/<name>/substitutes` - Get ingredient substitutes
- `GET /api/stats` - Get pantry statistics

## Example Requests

### Add a pantry item
```bash
curl -X POST http://localhost:5001/api/pantry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Breast",
    "quantity": 2,
    "unit": "lbs",
    "category": "protein"
  }'
```

### Get recipe suggestions
```bash
curl -X GET http://localhost:5001/api/recipes/suggestions
```

### Upload a receipt
```bash
curl -X POST http://localhost:5001/api/pantry/receipt \
  -F "receipt=@path/to/receipt.jpg"
```

## Gumloop Integration

This backend integrates with three Gumloop pipelines:

1. **Receipt Upload Pipeline** (`receipt_upload.py`)
   - Processes receipt images using OCR
   - Extracts item names, quantities, and prices

2. **Recipe Suggestion Pipeline** (`recipe_suggest.py`)
   - Takes pantry items as CSV input
   - Returns AI-generated recipe suggestions

3. **Recipe URL Parser Pipeline** (`recipe_provided.py`)
   - Extracts recipe details from URLs
   - Returns structured recipe data (ingredients, instructions, etc.)

## Environment Variables

Configure these in your `.env` file:

- `GUMLOOP` - Your Gumloop API key (required for AI features)
- `GUMLOOP_USER_ID` - Your Gumloop user ID
- `RECEIPT_PIPELINE_ID` - Pipeline ID for receipt processing
- `SUGGEST_PIPELINE_ID` - Pipeline ID for recipe suggestions
- `PROVIDED_PIPELINE_ID` - Pipeline ID for URL recipe extraction

## Development

The server runs in debug mode by default, which enables:
- Auto-reload on code changes
- Detailed error messages
- Debug console

For production, use a proper WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Error Handling

All endpoints return JSON responses with:
- `success`: Boolean indicating success/failure
- `error`: Error message (if failed)
- Additional data fields based on the endpoint

Example error response:
```json
{
  "success": false,
  "error": "Item not found"
}
```

## CORS

CORS is enabled for all origins to support the React frontend running on a different port during development.

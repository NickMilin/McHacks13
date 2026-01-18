# PantryPal - Smart Pantry Management App

A full-stack React + Flask application for managing your pantry, reducing food waste, and discovering recipes based on what you have.

## 🌟 Features

- 📦 **Pantry Management**: Track your food items with quantities and expiry dates
- 📸 **Receipt Scanning**: Upload grocery receipts and automatically extract items using OCR
- 🍳 **Recipe Suggestions**: Get AI-powered recipe recommendations based on your pantry
- 🔗 **Recipe Import**: Extract recipes from URLs
- 🛒 **Shopping Lists**: Generate shopping lists for missing ingredients
- 📊 **Analytics**: Track food waste reduction and pantry statistics
- 🔄 **Ingredient Substitutes**: Find alternatives for ingredients you don't have

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** 3.8+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pantry-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your Gumloop API key
   ```

### Running the Application

You need to run both the frontend and backend servers.

**Terminal 1 - Backend (Flask):**
```bash
cd backend
python app.py
```
The backend will start on `http://localhost:5001`

**Terminal 2 - Frontend (React + Vite):**
```bash
npm run dev
```
The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

Open your browser and navigate to the frontend URL (displayed in Terminal 2).

## 🏗️ Project Structure

```
pantry-app/
├── backend/               # Flask backend
│   ├── app.py            # Main API server
│   ├── receipt_upload.py # Receipt OCR processing
│   ├── recipe_suggest.py # Recipe suggestions
│   ├── recipe_provided.py# Recipe URL parsing
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variables template
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   └── main.jsx         # Entry point
├── public/              # Static assets
└── package.json         # Frontend dependencies
```

## 🔧 API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

### Key Endpoints

- `GET /api/pantry` - Get all pantry items
- `POST /api/pantry` - Add a new item
- `POST /api/pantry/receipt` - Upload receipt for OCR
- `GET /api/recipes/suggestions` - Get AI recipe suggestions
- `POST /api/recipes/from-url` - Import recipe from URL
- `GET /api/stats` - Get pantry statistics

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GUMLOOP=your_gumloop_api_key_here
GUMLOOP_USER_ID=your_user_id
RECEIPT_PIPELINE_ID=your_receipt_pipeline_id
SUGGEST_PIPELINE_ID=your_suggest_pipeline_id
PROVIDED_PIPELINE_ID=your_provided_pipeline_id
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
# Test the backend imports
python -c "import app; print('✓ Backend OK')"

# Start the server and test endpoints
python app.py
# In another terminal:
curl http://localhost:5001/api/pantry
```

### Frontend Tests
```bash
npm run lint
```

## 📦 Building for Production

### Frontend
```bash
npm run build
npm run preview  # Preview the production build
```

### Backend
For production, use a WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 🤝 Integration with Gumloop

This app integrates with [Gumloop](https://gumloop.com) for AI-powered features:

1. **Receipt OCR**: Extracts items from receipt images
2. **Recipe Suggestions**: Generates recipes based on pantry contents
3. **Recipe Parsing**: Extracts structured data from recipe URLs

To use these features, you need a Gumloop API key. Sign up at [gumloop.com](https://gumloop.com) and add your API key to the `.env` file.

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide Icons
- Recharts

**Backend:**
- Flask
- Flask-CORS
- Python-dotenv
- Requests
- Pillow (for image processing)

## 📝 License

[Add your license here]

## 🙏 Acknowledgements

- Built with [Vite](https://vitejs.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- AI features powered by [Gumloop](https://gumloop.com)

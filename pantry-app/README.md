# 🍳 PantryPal

> **Your AI-Powered Smart Kitchen Companion** - Built for McHacks 13

PantryPal helps you manage your pantry, reduce food waste, and discover delicious recipes based on what you already have. Powered by AI through Gumloop pipelines for smart receipt scanning and personalized recipe suggestions.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)
![Flask](https://img.shields.io/badge/Flask-Backend-green?logo=flask)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20DB-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)

---

## ✨ Features

### 📦 Smart Pantry Management
- Track all your food items with quantities, categories, and expiry dates
- Visual indicators for items expiring soon
- Automatic category organization (Proteins, Dairy, Grains, Fruits, Vegetables)

### 📷 AI Receipt Scanning
- Upload grocery receipts and automatically extract items
- Powered by Gumloop OCR pipeline
- One-click add to pantry

### 🤖 AI Recipe Suggestions
- Get personalized recipe recommendations based on your pantry contents
- AI analyzes what you have and suggests 3 complete recipes
- Includes links to original recipes

### 📥 Recipe Import
- Import recipes from any website or YouTube video
- Automatic extraction of ingredients and instructions
- See which ingredients you already have vs. need to buy

### 👨‍🍳 Cooking Mode
- Step-by-step guided cooking instructions
- Progress tracking through recipes
- Save recipes to your personal library

### 🛒 Shopping List
- Automatically add missing ingredients
- Track what you need to buy

### 📊 Health Stats Dashboard
- Visualize your pantry composition
- Track food categories and nutritional balance

### 🌙 Theme Support
- Beautiful dark/light mode
- Time-based automatic theme switching

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+
- **Gumloop API Key** (for AI features)

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
   cd ..
   ```

4. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   GUMLOOP=your_gumloop_api_key_here
   ```

### Running the App

#### Cross-Platform (Recommended)
```bash
# Mac/Linux
python3 start.py

# Windows
start.bat
# or
python start.py
```

#### Manual Start
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001/api

---

## 🏗️ Project Structure

```
pantry-app/
├── src/                      # React Frontend
│   ├── App.jsx               # Main app with routing
│   ├── index.css             # Global styles (Tailwind)
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   │   ├── Layout.jsx    # Main layout wrapper
│   │   │   └── Sidebar.jsx   # Navigation sidebar
│   │   └── ui/               # Reusable UI components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       └── ...
│   ├── contexts/
│   │   ├── AuthContext.jsx   # Firebase authentication
│   │   └── PantryContext.jsx # Pantry state management
│   ├── lib/
│   │   ├── api.js            # Backend API client
│   │   ├── firebase.js       # Firebase configuration
│   │   ├── pantryFirebase.js # Pantry CRUD operations
│   │   ├── recipesFirebase.js# Recipe CRUD operations
│   │   └── shoppingListFirebase.js
│   └── pages/
│       ├── Dashboard.jsx     # Home dashboard
│       ├── Pantry.jsx        # Pantry management
│       ├── UploadReceipt.jsx # Receipt scanning
│       ├── Recipes.jsx       # Recipe library
│       ├── SearchRecipes.jsx # Recipe import
│       ├── Suggestions.jsx   # AI recipe suggestions
│       ├── ShoppingList.jsx  # Shopping list
│       └── HealthStats.jsx   # Health analytics
│
├── backend/                  # Flask Backend
│   ├── app.py                # Main Flask server
│   ├── receipt_upload.py     # Gumloop receipt OCR pipeline
│   ├── recipe_provided.py    # Gumloop recipe extraction pipeline
│   ├── recipe_suggest.py     # Gumloop recipe suggestion pipeline
│   ├── recipe_format.json    # Recipe data schema
│   └── requirements.txt      # Python dependencies
│
├── start.py                  # Cross-platform launcher
├── start.sh                  # Mac/Linux launcher
├── start.bat                 # Windows launcher
└── package.json              # Node dependencies
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pantry/receipt` | POST | Upload receipt image for OCR |
| `/api/recipes/from-url` | POST | Extract recipe from URL |
| `/api/recipes/suggestions` | POST | Get AI recipe suggestions |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin support
- **Gumloop** - AI pipeline orchestration
- **Pillow** - Image processing

### Database & Auth
- **Firebase Authentication** - Google Sign-In
- **Cloud Firestore** - Real-time database

---

## 🔧 Configuration

### Firebase Setup
The app uses Firebase for authentication and data storage. The configuration is in `src/lib/firebase.js`.

### Gumloop Pipelines
Three AI pipelines power the smart features:
1. **Receipt OCR** - Extracts grocery items from receipt images
2. **Recipe Extraction** - Parses recipes from websites/YouTube
3. **Recipe Suggestions** - Generates recipes based on pantry contents

---

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview with quick actions and expiring items |
| Pantry | `/pantry` | View and manage all pantry items |
| Upload Receipt | `/upload` | Scan receipts to add items |
| My Recipes | `/recipes` | Personal recipe library |
| Import Recipe | `/search` | Import recipes from URLs |
| Suggestions | `/suggestions` | AI-generated recipe recommendations |
| Shopping List | `/shopping` | Manage shopping list |
| Health Stats | `/health` | Nutritional analytics |

---

## 🎨 UI Components

Built with a custom component library inspired by shadcn/ui:
- `Button` - Various button styles
- `Card` - Content containers
- `Dialog` - Modal dialogs
- `Input` - Form inputs
- `Badge` - Status indicators
- `Tabs` - Tab navigation
- `Progress` - Progress bars

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project was built for **McHacks 13** hackathon.

---

## 🙏 Acknowledgments

- **Gumloop** - AI pipeline platform
- **Firebase** - Authentication and database
- **shadcn/ui** - UI component inspiration
- **Lucide** - Beautiful icons

---

<p align="center">
  Made with ❤️ at McHacks 13
</p>

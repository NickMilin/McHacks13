// API service for connecting to Flask backend
const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Pantry API
export const pantryApi = {
  // Get all pantry items
  getItems: () => apiCall('/pantry'),
  
  // Add item to pantry
  addItem: (item) => apiCall('/pantry', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  
  // Update pantry item
  updateItem: (id, item) => apiCall(`/pantry/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  
  // Delete pantry item
  deleteItem: (id) => apiCall(`/pantry/${id}`, {
    method: 'DELETE',
  }),
  
  // Upload receipt image for OCR
  uploadReceipt: (formData) => apiCall('/pantry/receipt', {
    method: 'POST',
    headers: {}, // Let browser set content-type for FormData
    body: formData,
  }),
};

// Recipe API
export const recipeApi = {
  // Get all recipes
  getRecipes: () => apiCall('/recipes'),
  
  // Add new recipe
  addRecipe: (recipe) => apiCall('/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  }),
  
  // Delete recipe
  deleteRecipe: (id) => apiCall(`/recipes/${id}`, {
    method: 'DELETE',
  }),
  
  // Cook recipe (removes ingredients from pantry)
  cookRecipe: (id) => apiCall(`/recipes/${id}/cook`, {
    method: 'POST',
  }),
  
  // Get recipe from URL (website or YouTube)
  getRecipeFromUrl: (url) => apiCall('/recipes/from-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }),
  
  // Search recipes online by dish name
  searchOnline: (query) => apiCall(`/recipes/search?q=${encodeURIComponent(query)}`),
  
  // Get recipe suggestions based on pantry (accepts pantry CSV string)
  getSuggestions: (pantryCSV) => apiCall('/recipes/suggestions', {
    method: 'POST',
    body: JSON.stringify({ pantry_csv: pantryCSV }),
  }),
  
  // Get shopping list for a recipe
  getShoppingList: (recipeId) => apiCall(`/recipes/${recipeId}/shopping-list`),
  
  // Get ingredient substitutes
  getSubstitutes: (ingredient) => apiCall(`/ingredients/${encodeURIComponent(ingredient)}/substitutes`),
};

// Health Stats API
export const statsApi = {
  // Get health statistics
  getStats: () => apiCall('/stats'),
};

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
    const data = await response.json();
    
    if (!response.ok) {
      // Check if backend returned an error message
      const errorMessage = data?.error || `API Error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Check if backend response indicates failure
    if (data.success === false) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Pantry API
export const pantryApi = {
  // Get all pantry items
  getItems: async () => {
    const response = await apiCall('/pantry');
    return response.items || [];
  },
  
  // Add item to pantry
  addItem: async (item) => {
    const response = await apiCall('/pantry', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.item;
  },
  
  // Update pantry item
  updateItem: async (id, item) => {
    const response = await apiCall(`/pantry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.item;
  },
  
  // Delete pantry item
  deleteItem: async (id) => {
    const response = await apiCall(`/pantry/${id}`, {
      method: 'DELETE',
    });
    return response.item;
  },
  
  // Upload receipt image for OCR
  uploadReceipt: async (formData) => {
    const response = await apiCall('/pantry/receipt', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
    return response.items || [];
  },
};

// Recipe API
export const recipeApi = {
  // Get all recipes
  getRecipes: async () => {
    const response = await apiCall('/recipes');
    return response.recipes || [];
  },
  
  // Add new recipe
  addRecipe: async (recipe) => {
    const response = await apiCall('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
    return response.recipe;
  },
  
  // Delete recipe
  deleteRecipe: async (id) => {
    const response = await apiCall(`/recipes/${id}`, {
      method: 'DELETE',
    });
    return response.recipe;
  },
  
  // Cook recipe (removes ingredients from pantry)
  cookRecipe: async (id) => {
    const response = await apiCall(`/recipes/${id}/cook`, {
      method: 'POST',
    });
    return response;
  },
  
  // Search recipes online by dish name
  searchOnline: async (query) => {
    const response = await apiCall(`/recipes/search?q=${encodeURIComponent(query)}`);
    return response.recipes || [];
  },
  
  // Get recipe from URL
  getFromUrl: async (url) => {
    const response = await apiCall('/recipes/from-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return response.recipe;
  },
  
  // Get recipe suggestions based on pantry
  getSuggestions: async () => {
    const response = await apiCall('/recipes/suggestions');
    return response.recipes || [];
  },
  
  // Get shopping list for a recipe
  getShoppingList: async (recipeId) => {
    const response = await apiCall(`/recipes/${recipeId}/shopping-list`);
    return response.missing_ingredients || [];
  },
  
  // Get ingredient substitutes
  getSubstitutes: async (ingredient) => {
    const response = await apiCall(`/ingredients/${encodeURIComponent(ingredient)}/substitutes`);
    return response.substitutes || [];
  },
};

// Health Stats API
export const statsApi = {
  // Get health statistics
  getStats: async () => {
    const response = await apiCall('/stats');
    return response.stats || {};
  },
};

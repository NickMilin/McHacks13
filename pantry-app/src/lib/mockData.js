// Mock data for development (will be replaced by Flask backend)

export const mockPantryItems = [
  { id: 1, name: 'Chicken Breast', quantity: 2, unit: 'lbs', category: 'protein', expiryDate: '2026-01-25' },
  { id: 2, name: 'Broccoli', quantity: 1, unit: 'head', category: 'vegetable', expiryDate: '2026-01-20' },
  { id: 3, name: 'Rice', quantity: 5, unit: 'lbs', category: 'grain', expiryDate: '2026-06-01' },
  { id: 4, name: 'Milk', quantity: 1, unit: 'gallon', category: 'dairy', expiryDate: '2026-01-22' },
  { id: 5, name: 'Eggs', quantity: 12, unit: 'count', category: 'protein', expiryDate: '2026-02-01' },
  { id: 6, name: 'Spinach', quantity: 1, unit: 'bag', category: 'vegetable', expiryDate: '2026-01-19' },
  { id: 7, name: 'Olive Oil', quantity: 1, unit: 'bottle', category: 'fat', expiryDate: '2026-12-01' },
  { id: 8, name: 'Tomatoes', quantity: 4, unit: 'count', category: 'vegetable', expiryDate: '2026-01-21' },
  { id: 9, name: 'Pasta', quantity: 2, unit: 'boxes', category: 'grain', expiryDate: '2026-08-01' },
  { id: 10, name: 'Cheese', quantity: 8, unit: 'oz', category: 'dairy', expiryDate: '2026-02-15' },
];

export const mockRecipes = [
  {
    id: 1,
    name: 'Chicken Stir Fry',
    ingredients: [
      { name: 'Chicken Breast', quantity: 1, unit: 'lb' },
      { name: 'Broccoli', quantity: 0.5, unit: 'head' },
      { name: 'Rice', quantity: 1, unit: 'cup' },
      { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' },
    ],
    instructions: '1. Cook rice. 2. Cut chicken into cubes. 3. Stir fry chicken. 4. Add broccoli. 5. Add soy sauce. 6. Serve over rice.',
    prepTime: 30,
    servings: 4,
  },
  {
    id: 2,
    name: 'Pasta Primavera',
    ingredients: [
      { name: 'Pasta', quantity: 1, unit: 'box' },
      { name: 'Tomatoes', quantity: 2, unit: 'count' },
      { name: 'Spinach', quantity: 0.5, unit: 'bag' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
      { name: 'Cheese', quantity: 4, unit: 'oz' },
    ],
    instructions: '1. Boil pasta. 2. Sauté tomatoes and spinach in olive oil. 3. Mix with pasta. 4. Top with cheese.',
    prepTime: 25,
    servings: 4,
  },
  {
    id: 3,
    name: 'Scrambled Eggs',
    ingredients: [
      { name: 'Eggs', quantity: 4, unit: 'count' },
      { name: 'Milk', quantity: 0.25, unit: 'cup' },
      { name: 'Cheese', quantity: 2, unit: 'oz' },
    ],
    instructions: '1. Whisk eggs with milk. 2. Cook on low heat, stirring. 3. Add cheese at the end.',
    prepTime: 10,
    servings: 2,
  },
];

export const mockSubstitutes = {
  'Chicken Breast': ['Turkey Breast', 'Tofu', 'Tempeh', 'Seitan'],
  'Milk': ['Almond Milk', 'Oat Milk', 'Soy Milk', 'Coconut Milk'],
  'Eggs': ['Flax Eggs', 'Chia Eggs', 'Applesauce', 'Mashed Banana'],
  'Butter': ['Olive Oil', 'Coconut Oil', 'Avocado', 'Greek Yogurt'],
  'Rice': ['Quinoa', 'Cauliflower Rice', 'Couscous', 'Bulgur'],
  'Pasta': ['Zucchini Noodles', 'Rice Noodles', 'Spaghetti Squash'],
  'Cheese': ['Nutritional Yeast', 'Vegan Cheese', 'Cottage Cheese'],
};

export const categoryColors = {
  vegetable: '#22c55e',
  protein: '#ef4444',
  grain: '#f59e0b',
  dairy: '#3b82f6',
  fruit: '#a855f7',
  fat: '#eab308',
  other: '#6b7280',
};

export const categoryLabels = {
  vegetable: 'Vegetables',
  protein: 'Protein',
  grain: 'Grains',
  dairy: 'Dairy',
  fruit: 'Fruits',
  fat: 'Fats & Oils',
  other: 'Other',
};

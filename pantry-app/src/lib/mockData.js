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
  { id: 11, name: 'Soy Sauce', quantity: 1, unit: 'bottle', category: 'condiment', expiryDate: '2027-06-01' },
];

export const mockRecipes = [
  {
    id: 1,
    name: 'Chicken Stir Fry',
    description: 'A quick and healthy stir fry with tender chicken and fresh vegetables.',
    source: null,
    sourceUrl: null,
    ingredients: [
      { name: 'Chicken Breast', quantity: '1', unit: 'lb', preparation_notes: 'cut into cubes', group: 'Main' },
      { name: 'Broccoli', quantity: '0.5', unit: 'head', preparation_notes: 'cut into florets', group: 'Main' },
      { name: 'Rice', quantity: '1', unit: 'cup', group: 'Main' },
      { name: 'Soy Sauce', quantity: '2', unit: 'tbsp', group: 'Sauce' },
    ],
    instructions: [
      { step_number: 1, instruction_text: 'Rinse the rice and cook according to package directions. Set aside and keep warm.' },
      { step_number: 2, instruction_text: 'Cut the chicken breast into 1-inch cubes and season with salt and pepper.' },
      { step_number: 3, instruction_text: 'Heat a large wok or skillet over high heat. Add oil and stir fry chicken for 5-6 minutes until golden and cooked through.' },
      { step_number: 4, instruction_text: 'Add broccoli florets to the pan and stir fry for 3-4 minutes until bright green and slightly tender.' },
      { step_number: 5, instruction_text: 'Pour soy sauce over the chicken and broccoli, toss to coat evenly.' },
      { step_number: 6, instruction_text: 'Serve the stir fry over the cooked rice. Enjoy!' },
    ],
    prepTime: 30,
    cookTime: 20,
    servings: 4,
  },
  {
    id: 2,
    name: 'Pasta Primavera',
    description: 'A light and fresh pasta dish loaded with garden vegetables.',
    source: 'AllRecipes',
    sourceUrl: 'https://allrecipes.com/recipe/pasta-primavera',
    ingredients: [
      { name: 'Pasta', quantity: '1', unit: 'box', preparation_notes: 'penne or fusilli', group: 'Main' },
      { name: 'Tomatoes', quantity: '2', unit: 'count', preparation_notes: 'diced', group: 'Vegetables' },
      { name: 'Spinach', quantity: '0.5', unit: 'bag', preparation_notes: 'roughly chopped', group: 'Vegetables' },
      { name: 'Olive Oil', quantity: '2', unit: 'tbsp', group: 'Main' },
      { name: 'Cheese', quantity: '4', unit: 'oz', preparation_notes: 'freshly grated Parmesan', group: 'Topping' },
    ],
    instructions: [
      { step_number: 1, instruction_text: 'Bring a large pot of salted water to a boil. Cook pasta according to package directions until al dente. Reserve 1/2 cup pasta water, then drain.' },
      { step_number: 2, instruction_text: 'While pasta cooks, heat olive oil in a large skillet over medium heat.' },
      { step_number: 3, instruction_text: 'Add diced tomatoes to the skillet and sauté for 2-3 minutes until they start to soften.' },
      { step_number: 4, instruction_text: 'Add spinach and cook for 1-2 minutes until wilted.' },
      { step_number: 5, instruction_text: 'Add the drained pasta to the skillet and toss with the vegetables. Add pasta water if needed to loosen.' },
      { step_number: 6, instruction_text: 'Remove from heat, top with freshly grated Parmesan cheese, and serve immediately.' },
    ],
    prepTime: 25,
    cookTime: 15,
    servings: 4,
  },
  {
    id: 3,
    name: 'Scrambled Eggs',
    description: 'Creamy, fluffy scrambled eggs perfect for breakfast.',
    source: null,
    sourceUrl: null,
    ingredients: [
      { name: 'Eggs', quantity: '4', unit: 'count', preparation_notes: 'room temperature', group: 'Main' },
      { name: 'Milk', quantity: '0.25', unit: 'cup', group: 'Main' },
      { name: 'Cheese', quantity: '2', unit: 'oz', preparation_notes: 'shredded cheddar', group: 'Topping' },
    ],
    instructions: [
      { step_number: 1, instruction_text: 'Crack eggs into a bowl and add milk. Whisk vigorously until fully combined and slightly frothy.' },
      { step_number: 2, instruction_text: 'Heat a non-stick pan over low heat and add a pat of butter.' },
      { step_number: 3, instruction_text: 'Pour in the egg mixture. Let it sit for 20 seconds until the edges start to set.' },
      { step_number: 4, instruction_text: 'Using a spatula, gently push the eggs from the edges to the center, creating soft curds. Repeat until eggs are mostly set but still slightly wet.' },
      { step_number: 5, instruction_text: 'Remove from heat (eggs will continue cooking). Fold in the shredded cheese.' },
      { step_number: 6, instruction_text: 'Season with salt and pepper to taste. Serve immediately while hot and creamy.' },
    ],
    prepTime: 10,
    cookTime: 5,
    servings: 2,
  },
];

export const mockSubstitutes = {
  'Chicken Breast': ['Turkey Breast', 'Tofu', 'Tempeh', 'Eggs'],
  'Milk': ['Almond Milk', 'Oat Milk', 'Soy Milk', 'Coconut Milk'],
  'Eggs': ['Flax Eggs', 'Chia Eggs', 'Applesauce', 'Mashed Banana'],
  'Butter': ['Olive Oil', 'Coconut Oil', 'Avocado', 'Greek Yogurt'],
  'Rice': ['Quinoa', 'Cauliflower Rice', 'Pasta', 'Bulgur'],
  'Pasta': ['Zucchini Noodles', 'Rice', 'Spaghetti Squash'],
  'Cheese': ['Nutritional Yeast', 'Vegan Cheese', 'Eggs'],
  'Soy Sauce': ['Olive Oil', 'Salt'],
  'Tomatoes': ['Spinach', 'Broccoli'],
  'Spinach': ['Broccoli', 'Tomatoes'],
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

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Clock, Users, ExternalLink, ShoppingCart, Check, X, Loader2, ChefHat, Flame, ArrowLeft, ArrowRight, BookmarkPlus, Sparkles, PartyPopper, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'

export function SearchRecipes() {
  const { user } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [pantryLoading, setPantryLoading] = useState(true)
  const [pantryError, setPantryError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [cookingRecipe, setCookingRecipe] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [notification, setNotification] = useState({ open: false, title: '', message: '', type: 'success' })

  // Load pantry items from Firebase
  useEffect(() => {
    const loadItems = async () => {
      if (!user) {
        setPantryLoading(false)
        return
      }
      try {
        const items = await pantryFirebase.getItems(user.uid)
        setPantryItems(items)
        setPantryError(null)
      } catch (err) {
        setPantryError(err.message)
        setPantryItems([])
      } finally {
        setPantryLoading(false)
      }
    }
    loadItems()
  }, [user])

  // Simulate recipe search
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return
    
    setSearchQuery(query)
    setIsSearching(true)
    setHasSearched(true)
    
    // TODO: Replace with actual Flask API call
    // const results = await recipeApi.searchOnline(query)
    
    // Simulated search results
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          name: `${query} Classic Style`,
          description: 'A delicious classic recipe perfect for any occasion.',
          source: 'AllRecipes',
          sourceUrl: 'https://allrecipes.com',
          prepTime: 15,
          cookTime: 30,
          servings: 4,
          ingredients: [
            { name: 'Chicken Breast', quantity: '1', unit: 'lb', preparation_notes: 'boneless, skinless', group: 'Main' },
            { name: 'Rice', quantity: '2', unit: 'cups', preparation_notes: 'long grain', group: 'Main' },
            { name: 'Broccoli', quantity: '0.5', unit: 'head', preparation_notes: 'cut into florets', group: 'Vegetables' },
            { name: 'Soy Sauce', quantity: '3', unit: 'tbsp', group: 'Sauce' },
            { name: 'Olive Oil', quantity: '2', unit: 'tbsp', preparation_notes: 'for cooking', group: 'Main' },
          ],
          instructions: [
            { step_number: 1, instruction_text: 'Prepare all ingredients by washing vegetables and cutting chicken into bite-sized pieces.' },
            { step_number: 2, instruction_text: 'Cook rice according to package instructions and set aside.' },
            { step_number: 3, instruction_text: 'Heat olive oil in a large pan over medium-high heat. Add chicken and cook until golden brown, about 5-7 minutes.' },
            { step_number: 4, instruction_text: 'Add broccoli florets and sauté for 3-4 minutes until tender-crisp.' },
            { step_number: 5, instruction_text: 'Add soy sauce and stir to combine. Serve over rice and enjoy!' },
          ],
          image: 'https://via.placeholder.com/300x200/22c55e/22c55e'
        },
        {
          id: 2,
          name: `Easy ${query}`,
          description: 'A quick and easy recipe ready in under 30 minutes.',
          source: 'Food Network',
          sourceUrl: 'https://foodnetwork.com',
          prepTime: 10,
          cookTime: 25,
          servings: 6,
          ingredients: [
            { name: 'Pasta', quantity: '1', unit: 'box', preparation_notes: 'your favorite shape', group: 'Main' },
            { name: 'Tomatoes', quantity: '4', unit: 'count', preparation_notes: 'diced', group: 'Vegetables' },
            { name: 'Olive Oil', quantity: '2', unit: 'tbsp', group: 'Main' },
            { name: 'Basil', quantity: '1', unit: 'bunch', preparation_notes: 'fresh, chopped', group: 'Herbs' },
            { name: 'Parmesan', quantity: '0.5', unit: 'cup', preparation_notes: 'freshly grated', group: 'Cheese' },
          ],
          instructions: [
            { step_number: 1, instruction_text: 'Bring a large pot of salted water to a boil. Cook pasta according to package directions.' },
            { step_number: 2, instruction_text: 'While pasta cooks, heat olive oil in a large skillet over medium heat.' },
            { step_number: 3, instruction_text: 'Add diced tomatoes and cook for 5 minutes until softened.' },
            { step_number: 4, instruction_text: 'Drain pasta and add to the skillet. Toss with fresh basil.' },
            { step_number: 5, instruction_text: 'Top with freshly grated Parmesan and serve immediately.' },
          ],
          image: 'https://via.placeholder.com/300x200/3b82f6/3b82f6'
        },
        {
          id: 3,
          name: `Healthy ${query} Bowl`,
          description: 'A nutritious and wholesome bowl packed with goodness.',
          source: 'Bon Appetit',
          sourceUrl: 'https://bonappetit.com',
          prepTime: 10,
          cookTime: 20,
          servings: 2,
          ingredients: [
            { name: 'Quinoa', quantity: '1', unit: 'cup', preparation_notes: 'rinsed', group: 'Grains' },
            { name: 'Spinach', quantity: '2', unit: 'cups', preparation_notes: 'fresh', group: 'Vegetables' },
            { name: 'Eggs', quantity: '2', unit: 'count', preparation_notes: 'poached or fried', group: 'Protein' },
            { name: 'Avocado', quantity: '1', unit: 'count', preparation_notes: 'sliced', group: 'Vegetables' },
            { name: 'Lemon', quantity: '1', unit: 'count', preparation_notes: 'juiced', group: 'Dressing' },
          ],
          instructions: [
            { step_number: 1, instruction_text: 'Cook quinoa according to package instructions. Fluff with a fork when done.' },
            { step_number: 2, instruction_text: 'While quinoa cooks, prepare eggs to your liking (poached or fried).' },
            { step_number: 3, instruction_text: 'Divide quinoa between two bowls and top with fresh spinach.' },
            { step_number: 4, instruction_text: 'Add sliced avocado and place egg on top.' },
            { step_number: 5, instruction_text: 'Drizzle with lemon juice, season with salt and pepper, and serve.' },
          ],
          image: 'https://via.placeholder.com/300x200/a855f7/a855f7'
        },
        {
          id: 4,
          name: `${query} for Two`,
          description: 'A romantic dinner perfect for two people.',
          source: 'Tasty',
          sourceUrl: 'https://tasty.co',
          prepTime: 15,
          cookTime: 35,
          servings: 2,
          ingredients: [
            { name: 'Salmon', quantity: '2', unit: 'fillets', preparation_notes: 'skin-on', group: 'Protein' },
            { name: 'Broccoli', quantity: '1', unit: 'head', preparation_notes: 'cut into florets', group: 'Vegetables' },
            { name: 'Lemon', quantity: '1', unit: 'count', preparation_notes: 'sliced', group: 'Garnish' },
            { name: 'Garlic', quantity: '3', unit: 'cloves', preparation_notes: 'minced', group: 'Aromatics' },
            { name: 'Butter', quantity: '2', unit: 'tbsp', preparation_notes: 'melted', group: 'Main' },
          ],
          instructions: [
            { step_number: 1, instruction_text: 'Preheat oven to 400°F (200°C). Line a baking sheet with parchment paper.' },
            { step_number: 2, instruction_text: 'Place salmon fillets on the baking sheet. Arrange broccoli florets around them.' },
            { step_number: 3, instruction_text: 'Mix melted butter with minced garlic. Brush over salmon and drizzle over broccoli.' },
            { step_number: 4, instruction_text: 'Top salmon with lemon slices. Season everything with salt and pepper.' },
            { step_number: 5, instruction_text: 'Bake for 20-25 minutes until salmon is cooked through and broccoli is tender.' },
          ],
          image: 'https://via.placeholder.com/300x200/f59e0b/f59e0b'
        },
      ]
      
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1500)
  }

  // Check which ingredients are available in pantry
  const checkPantryAvailability = (ingredients) => {
    const available = []
    const missing = []
    
    ingredients.forEach(ingredient => {
      const inPantry = pantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      
      if (inPantry) {
        available.push(ingredient)
      } else {
        missing.push(ingredient)
      }
    })
    
    return { available, missing }
  }

  // Add recipe to my recipes
  const handleSaveRecipe = (recipe) => {
    setNotification({
      open: true,
      title: 'Recipe Saved!',
      message: `"${recipe.name}" has been added to your recipe library.`,
      type: 'success'
    })
    // TODO: Call Flask API
    // recipeApi.addRecipe(recipe)
  }

  // Start cooking mode
  const handleCookRecipe = (recipe) => {
    setCookingRecipe(recipe)
    setCurrentStep(0)
    setSelectedRecipe(null)
  }

  // Close cooking mode
  const closeCookingMode = () => {
    setCookingRecipe(null)
    setCurrentStep(0)
  }

  // Navigate steps
  const nextStep = () => {
    if (cookingRecipe && currentStep < cookingRecipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Finish cooking
  const finishCooking = () => {
    const recipeName = cookingRecipe.name
    closeCookingMode()
    setNotification({
      open: true,
      title: 'Cooking Complete!',
      message: `You've finished cooking "${recipeName}"! Ingredients have been removed from your pantry.`,
      type: 'cooking'
    })
  }

  // Finish cooking and save to library
  const finishAndSaveRecipe = () => {
    const recipeName = cookingRecipe.name
    closeCookingMode()
    setNotification({
      open: true,
      title: 'Cooking Complete & Saved!',
      message: `You've finished cooking "${recipeName}"! The recipe has been saved to your library and ingredients have been removed from your pantry.`,
      type: 'cooking-saved'
    })
    // TODO: Call Flask API to save recipe
    // recipeApi.addRecipe(cookingRecipe)
  }

  // Add missing ingredients to shopping list
  const handleAddToShoppingList = (recipe) => {
    const missingIngredients = checkPantryAvailability(recipe.ingredients).missing
    // TODO: Call Flask API to add items to shopping list
    // shoppingListApi.addItems(missingIngredients)
    setNotification({
      open: true,
      title: 'Added to Shopping List!',
      message: `${missingIngredients.length} missing ingredient${missingIngredients.length > 1 ? 's' : ''} for "${recipe.name}" have been added to your shopping list.`,
      type: 'success'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Recipes</h1>
        <p className="text-muted-foreground">
          Search for recipes online and see what you need from your pantry
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a dish (e.g., Chicken Alfredo, Pad Thai, Tacos...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Searching for recipes...</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {searchResults.length} recipes for "{searchQuery}"
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {searchResults.map(recipe => {
              const { available, missing } = checkPantryAvailability(recipe.ingredients)
              const matchPercentage = Math.round((available.length / recipe.ingredients.length) * 100)
              
              return (
                <Card key={recipe.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader>
                    <CardTitle>{recipe.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <a 
                        href={recipe.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {recipe.source}
                      </a>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.prepTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} servings
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Pantry Match */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pantry Match</span>
                        <span className={`text-sm font-bold ${
                          matchPercentage >= 80 ? 'text-green-600' :
                          matchPercentage >= 50 ? 'text-orange-500' : 'text-red-600'
                        }`}>
                          {matchPercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            matchPercentage >= 80 ? 'bg-green-500' :
                            matchPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${matchPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Ingredients Status */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          You Have ({available.length})
                        </p>
                        <ul className="text-muted-foreground space-y-0.5">
                          {available.slice(0, 3).map((ing, i) => (
                            <li key={i} className="truncate">• {ing.name}</li>
                          ))}
                          {available.length > 3 && (
                            <li className="text-xs">+{available.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-1 text-red-600">
                          <ShoppingCart className="h-4 w-4" />
                          Need to Buy ({missing.length})
                        </p>
                        <ul className="text-muted-foreground space-y-0.5">
                          {missing.slice(0, 3).map((ing, i) => (
                            <li key={i} className="truncate">• {ing.name}</li>
                          ))}
                          {missing.length > 3 && (
                            <li className="text-xs">+{missing.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <ChefHat className="mr-1 h-4 w-4" />
                      View Recipe
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleSaveRecipe(recipe)}>
                      Save Recipe
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
          
          {/* Show More Button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setIsLoadingMore(true)
                // Simulate loading more recipes
                setTimeout(() => {
                  const moreRecipes = [
                    {
                      id: searchResults.length + 1,
                      name: `${searchQuery} Deluxe`,
                      description: 'A premium version of this classic dish.',
                      source: 'Epicurious',
                      sourceUrl: 'https://epicurious.com',
                      prepTime: 20,
                      cookTime: 40,
                      servings: 4,
                      ingredients: [
                        { name: 'Chicken Breast', quantity: '2', unit: 'lbs', group: 'Protein' },
                        { name: 'Olive Oil', quantity: '3', unit: 'tbsp', group: 'Main' },
                        { name: 'Garlic', quantity: '4', unit: 'cloves', group: 'Aromatics' },
                      ],
                      instructions: [
                        { step_number: 1, instruction_text: 'Prepare all ingredients.' },
                        { step_number: 2, instruction_text: 'Cook according to directions.' },
                        { step_number: 3, instruction_text: 'Serve and enjoy!' },
                      ],
                      image: 'https://via.placeholder.com/300x200/ef4444/ef4444'
                    },
                    {
                      id: searchResults.length + 2,
                      name: `Quick ${searchQuery}`,
                      description: 'A fast weeknight version ready in minutes.',
                      source: 'Serious Eats',
                      sourceUrl: 'https://seriouseats.com',
                      prepTime: 5,
                      cookTime: 15,
                      servings: 2,
                      ingredients: [
                        { name: 'Pasta', quantity: '1', unit: 'box', group: 'Main' },
                        { name: 'Tomatoes', quantity: '2', unit: 'count', group: 'Vegetables' },
                        { name: 'Cheese', quantity: '4', unit: 'oz', group: 'Dairy' },
                      ],
                      instructions: [
                        { step_number: 1, instruction_text: 'Boil pasta.' },
                        { step_number: 2, instruction_text: 'Add toppings.' },
                        { step_number: 3, instruction_text: 'Serve hot!' },
                      ],
                      image: 'https://via.placeholder.com/300x200/06b6d4/06b6d4'
                    },
                  ]
                  setSearchResults([...searchResults, ...moreRecipes])
                  setIsLoadingMore(false)
                }, 1000)
              }}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Show More Recipes'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && hasSearched && searchResults.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No recipes found. Try a different search term.</p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Search for any dish</p>
            <p className="text-muted-foreground text-sm mt-1">
              We'll show you recipes and what you need to buy based on your pantry
            </p>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Chicken Stir Fry', 'Pasta Carbonara', 'Beef Tacos', 'Caesar Salad', 'Fried Rice', 'Pancakes', 'Grilled Salmon', 'Vegetable Soup'].map(term => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Details Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-black/70">{selectedRecipe.source}</Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Prep: {selectedRecipe.prepTime} min
                  </span>
                  {selectedRecipe.cookTime && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      Cook: {selectedRecipe.cookTime} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRecipe.servings} servings
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              {selectedRecipe.description && (
                <p className="text-muted-foreground">{selectedRecipe.description}</p>
              )}
              
              <div className="space-y-6 py-4">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  {/* Group ingredients by their group property */}
                  {(() => {
                    const groups = {}
                    selectedRecipe.ingredients.forEach(ing => {
                      const group = ing.group || 'Main'
                      if (!groups[group]) groups[group] = []
                      groups[group].push(ing)
                    })
                    
                    return Object.entries(groups).map(([groupName, ingredients]) => (
                      <div key={groupName} className="mb-4 last:mb-0">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                          {groupName}
                        </h4>
                        <ul className="space-y-2">
                          {ingredients.map((ingredient, index) => {
                            const inPantry = pantryItems.find(
                              item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                                      ingredient.name.toLowerCase().includes(item.name.toLowerCase())
                            )
                            
                            return (
                              <li key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  inPantry ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  {inPantry ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-medium">
                                      {ingredient.quantity} {ingredient.unit}
                                    </span>
                                    <span className="text-foreground">{ingredient.name}</span>
                                  </div>
                                  {ingredient.preparation_notes && (
                                    <p className="text-sm text-muted-foreground">
                                      {ingredient.preparation_notes}
                                    </p>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))
                  })()}
                </div>
                
                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {instruction.step_number}
                        </span>
                        <p className="text-muted-foreground pt-0.5">{instruction.instruction_text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* Shopping List */}
                {checkPantryAvailability(selectedRecipe.ingredients).missing.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-600 flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4" />
                      Missing Ingredients
                    </h3>
                    <ul className="space-y-1 text-sm text-orange-700 mb-3">
                      {checkPantryAvailability(selectedRecipe.ingredients).missing.map((item, i) => (
                        <li key={i}>• {item.quantity} {item.unit} {item.name}</li>
                      ))}
                    </ul>
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                      onClick={() => handleAddToShoppingList(selectedRecipe)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Shopping List
                    </Button>
                  </div>
                )}

                {/* Source Link */}
                {selectedRecipe.source && selectedRecipe.sourceUrl ? (
                  <div className="pt-2">
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View original on {selectedRecipe.source}
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>This is your original recipe</span>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => handleCookRecipe(selectedRecipe)}
                  disabled={checkPantryAvailability(selectedRecipe.ingredients).missing.length > 0}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  Cook Now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cooking Mode Dialog */}
      <Dialog open={!!cookingRecipe} onOpenChange={closeCookingMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {cookingRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Cooking: {cookingRecipe.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Prep: {cookingRecipe.prepTime} min
                      </span>
                      {cookingRecipe.cookTime && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          Cook: {cookingRecipe.cookTime} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {cookingRecipe.servings} servings
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="steps" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                </TabsList>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ingredients Needed</CardTitle>
                      {cookingRecipe.description && (
                        <CardDescription>{cookingRecipe.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Group ingredients by their group property */}
                      {(() => {
                        const groups = {}
                        cookingRecipe.ingredients.forEach(ing => {
                          const group = ing.group || 'Main'
                          if (!groups[group]) groups[group] = []
                          groups[group].push(ing)
                        })
                        
                        return Object.entries(groups).map(([groupName, ingredients]) => (
                          <div key={groupName} className="mb-6 last:mb-0">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                              {groupName}
                            </h4>
                            <ul className="space-y-3">
                              {ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-semibold text-lg">
                                        {ingredient.quantity} {ingredient.unit}
                                      </span>
                                      <span className="text-foreground">{ingredient.name}</span>
                                    </div>
                                    {ingredient.preparation_notes && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {ingredient.preparation_notes}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Steps Tab */}
                <TabsContent value="steps" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Step {currentStep + 1} of {cookingRecipe.instructions.length}
                        </CardTitle>
                        <div className="flex gap-1">
                          {cookingRecipe.instructions.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentStep(idx)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                idx === currentStep 
                                  ? 'bg-primary' 
                                  : idx < currentStep 
                                    ? 'bg-green-500' 
                                    : 'bg-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[200px] flex flex-col">
                        {/* Progress bar */}
                        <div className="w-full bg-muted rounded-full h-2 mb-6">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / cookingRecipe.instructions.length) * 100}%` }}
                          />
                        </div>

                        {/* Current step */}
                        <div className="flex-1 flex items-center justify-center p-6">
                          <div className="text-center max-w-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                              {cookingRecipe.instructions[currentStep].step_number}
                            </div>
                            <p className="text-xl leading-relaxed">
                              {cookingRecipe.instructions[currentStep].instruction_text}
                            </p>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t">
                          <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>

                          {currentStep < cookingRecipe.instructions.length - 1 ? (
                            <Button onClick={nextStep}>
                              Next Step
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button onClick={finishCooking} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                <Check className="mr-2 h-4 w-4" />
                                Finish
                              </Button>
                              <Button onClick={finishAndSaveRecipe} className="bg-green-600 hover:bg-green-700">
                                <BookmarkPlus className="mr-2 h-4 w-4" />
                                Finish & Save to Library
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success/Notification Dialog */}
      <Dialog open={notification.open} onOpenChange={(open) => setNotification({ ...notification, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                notification.type === 'cooking' || notification.type === 'cooking-saved' 
                  ? 'bg-green-100' 
                  : 'bg-primary/10'
              }`}>
                {notification.type === 'cooking' || notification.type === 'cooking-saved' ? (
                  <PartyPopper className="h-8 w-8 text-green-600" />
                ) : (
                  <Sparkles className="h-8 w-8 text-primary" />
                )}
              </div>
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <DialogDescription className="mt-2 text-center">
                {notification.message}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button onClick={() => setNotification({ ...notification, open: false })}>
              {notification.type === 'cooking' || notification.type === 'cooking-saved' ? 'Awesome!' : 'Got it!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

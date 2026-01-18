import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Clock, Users, ChefHat, ShoppingCart, X, Check, ArrowLeft, ArrowRight, Flame, ExternalLink, BookOpen, PartyPopper } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'
import { recipesFirebase } from '@/lib/recipesFirebase'
import { shoppingListFirebase } from '@/lib/shoppingListFirebase'
import { mockSubstitutes } from '@/lib/mockData'

export function Recipes() {
  const { user } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [pantryLoading, setPantryLoading] = useState(true)
  const [pantryError, setPantryError] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showShoppingList, setShowShoppingList] = useState(null)
  const [showSubstitutes, setShowSubstitutes] = useState(null)
  const [cookingRecipe, setCookingRecipe] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [notification, setNotification] = useState({ open: false, title: '', message: '' })
  const [ingredientSelections, setIngredientSelections] = useState({}) // Track user selections for missing ingredients
  
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: '',
    prepTime: '',
    servings: ''
  })

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

  // Load recipes from Firebase
  useEffect(() => {
    const loadRecipes = async () => {
      if (!user) {
        setRecipesLoading(false)
        return
      }
      try {
        const userRecipes = await recipesFirebase.getRecipes(user.uid)
        setRecipes(userRecipes)
      } catch (err) {
        console.error('Error loading recipes:', err)
        setNotification({ open: true, title: 'Error', message: 'Failed to load recipes' })
      } finally {
        setRecipesLoading(false)
      }
    }
    loadRecipes()
  }, [user])

  // Check which ingredients are missing from pantry
  const getMissingIngredients = (recipe) => {
    return recipe.ingredients.filter(ingredient => {
      const pantryItem = pantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      const qty = parseFloat(ingredient.quantity) || 0
      return !pantryItem || pantryItem.quantity < qty
    })
  }

  // Check which ingredients are available
  const getAvailableIngredients = (recipe) => {
    return recipe.ingredients.filter(ingredient => {
      const pantryItem = pantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      const qty = parseFloat(ingredient.quantity) || 0
      return pantryItem && pantryItem.quantity >= qty
    })
  }

  // Add ingredient to new recipe
  const addIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { name: '', quantity: '', unit: '' }]
    })
  }

  // Remove ingredient from new recipe
  const removeIngredient = (index) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    })
  }

  // Update ingredient
  const updateIngredient = (index, field, value) => {
    const updated = [...newRecipe.ingredients]
    updated[index][field] = value
    setNewRecipe({ ...newRecipe, ingredients: updated })
  }

  // Add new recipe
  const handleAddRecipe = async () => {
    if (!newRecipe.name || newRecipe.ingredients.length === 0) return
    
    const recipe = {
      name: newRecipe.name,
      prepTime: parseInt(newRecipe.prepTime) || 30,
      servings: parseInt(newRecipe.servings) || 4,
      instructions: newRecipe.instructions,
      ingredients: newRecipe.ingredients.filter(i => i.name).map(i => ({
        ...i,
        quantity: parseFloat(i.quantity) || 1
      }))
    }
    
    try {
      const recipeId = await recipesFirebase.addRecipe(user.uid, recipe)
      setRecipes([...recipes, { id: recipeId, ...recipe }])
      setNewRecipe({
        name: '',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        instructions: '',
        prepTime: '',
        servings: ''
      })
      setIsAddDialogOpen(false)
      setNotification({ open: true, title: 'Recipe Added', message: 'Your recipe has been added successfully!' })
    } catch (err) {
      console.error('Error adding recipe:', err)
      setNotification({ open: true, title: 'Error', message: 'Failed to add recipe' })
    }
  }

  // Delete recipe
  const handleDeleteRecipe = async (id) => {
    try {
      await recipesFirebase.deleteRecipe(user.uid, id)
      setRecipes(recipes.filter(r => r.id !== id))
      setNotification({ open: true, title: 'Recipe Deleted', message: 'Recipe has been removed.' })
    } catch (err) {
      console.error('Error deleting recipe:', err)
      setNotification({ open: true, title: 'Error', message: 'Failed to delete recipe' })
    }
  }

  // Cook recipe (remove ingredients from pantry)
  const handleCookRecipe = (recipe) => {
    setCookingRecipe(recipe)
    setCurrentStep(0)
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
  const finishCooking = async () => {
    const recipe = cookingRecipe
    const recipeName = recipe.name
    closeCookingMode()
    
    try {
      // Remove or reduce ingredients from pantry
      for (const ingredient of recipe.ingredients) {
        const pantryItem = pantryItems.find(
          item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                  ingredient.name.toLowerCase().includes(item.name.toLowerCase())
        )
        
        if (pantryItem) {
          const usedQty = parseFloat(ingredient.quantity) || 1
          const remainingQty = (pantryItem.quantity || 0) - usedQty
          
          if (remainingQty <= 0) {
            // Remove item completely
            await pantryFirebase.deleteItem(user.uid, pantryItem.id)
            setPantryItems(prev => prev.filter(item => item.id !== pantryItem.id))
          } else {
            // Reduce quantity
            await pantryFirebase.updateItem(user.uid, pantryItem.id, { quantity: remainingQty })
            setPantryItems(prev => prev.map(item => 
              item.id === pantryItem.id ? { ...item, quantity: remainingQty } : item
            ))
          }
        }
      }
      
      setNotification({
        open: true,
        title: 'Cooking Complete!',
        message: `You've finished cooking "${recipeName}"! Ingredients have been removed from your pantry.`
      })
    } catch (err) {
      console.error('Error updating pantry after cooking:', err)
      setNotification({
        open: true,
        title: 'Cooking Complete!',
        message: `You've finished cooking "${recipeName}"! Note: There was an issue updating your pantry.`
      })
    }
  }

  // Add missing ingredients to shopping list
  const handleAddToShoppingList = async (recipe) => {
    // Only add items that are marked as "need" or not yet selected
    const missingIngredients = getMissingIngredients(recipe).filter(ingredient => {
      const key = `${recipe.id}-${ingredient.name}`
      return ingredientSelections[key] !== 'have' // Exclude items marked as "have"
    })
    
    if (missingIngredients.length === 0) {
      setNotification({
        open: true,
        title: 'No Items to Add',
        message: 'All missing ingredients have been marked as "already have".'
      })
      return
    }
    
    try {
      // Get current shopping list
      const currentList = await shoppingListFirebase.getShoppingList(user.uid)
      const existingItems = currentList.items || []
      
      // Create new items from missing ingredients
      const newItems = missingIngredients.map(ingredient => ({
        id: `${recipe.name}-${ingredient.name}-${Date.now()}`,
        name: ingredient.name,
        quantity: ingredient.quantity || 1,
        unit: ingredient.unit || '',
        recipes: [recipe.name],
        category: 'other',
        isCustom: true
      }))
      
      // Merge with existing items (avoid duplicates by name)
      const existingNames = existingItems.map(item => item.name.toLowerCase())
      const itemsToAdd = newItems.filter(item => !existingNames.includes(item.name.toLowerCase()))
      
      // Update shopping list in Firebase
      await shoppingListFirebase.updateShoppingList(user.uid, {
        items: [...existingItems, ...itemsToAdd],
        checkedItems: currentList.checkedItems || [],
        selectedRecipes: currentList.selectedRecipes || []
      })
      
      setNotification({
        open: true,
        title: 'Added to Shopping List!',
        message: `${itemsToAdd.length} missing ingredient${itemsToAdd.length > 1 ? 's' : ''} for "${recipe.name}" have been added to your shopping list.`
      })
    } catch (err) {
      console.error('Error adding to shopping list:', err)
      setNotification({
        open: true,
        title: 'Error',
        message: 'Failed to add items to shopping list. Please try again.'
      })
    }
  }

  // Handle ingredient selection (have/need)
  const handleIngredientSelection = async (recipeId, ingredientName, ingredient, selection) => {
    const key = `${recipeId}-${ingredientName}`
    setIngredientSelections(prev => ({
      ...prev,
      [key]: selection
    }))
    
    // If marked as "have", add the ingredient to pantry
    if (selection === 'have') {
      try {
        const newItem = await pantryFirebase.addItem(user.uid, {
          name: ingredientName,
          quantity: ingredient.quantity || 1,
          unit: ingredient.unit || '',
          category: 'other'
        })
        
        // Update local pantry state
        setPantryItems(prev => [{ id: newItem.id, ...newItem }, ...prev])
        
        setNotification({
          open: true,
          title: 'Added to Pantry',
          message: `${ingredientName} has been added to your pantry.`
        })
      } catch (err) {
        console.error('Error adding to pantry:', err)
        // Revert the selection on error
        setIngredientSelections(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
        setNotification({
          open: true,
          title: 'Error',
          message: 'Failed to add item to pantry. Please try again.'
        })
      }
    }
  }

  // Reset ingredient selections when dialog closes
  const handleCloseRecipeDialog = () => {
    setSelectedRecipe(null)
    // Optionally reset selections when closing
    // setIngredientSelections({})
  }

  // Get substitutes for an ingredient
  const getSubstitutes = (ingredientName) => {
    return mockSubstitutes[ingredientName] || []
  }

  // Get substitutes that are available in the user's pantry
  const getPantrySubstitutes = (ingredientName) => {
    const allSubstitutes = mockSubstitutes[ingredientName] || []
    const pantryNames = pantryItems.map(item => item.name.toLowerCase())
    
    return allSubstitutes
      .filter(sub => pantryNames.includes(sub.toLowerCase()))
      .map(sub => {
        const pantryItem = pantryItems.find(item => item.name.toLowerCase() === sub.toLowerCase())
        return {
          name: sub,
          pantryItem: pantryItem
        }
      })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground">Manage your saved recipes</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => {
          const missing = getMissingIngredients(recipe)
          const available = getAvailableIngredients(recipe)
          const canCook = missing.length === 0
          
          return (
            <Card key={recipe.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{recipe.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-4">
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
              
              <CardContent className="flex-1">
                {/* Ingredient Status */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{available.length} ingredients available</span>
                  </div>
                  {missing.length > 0 && (
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{missing.length} ingredients missing</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                {canCook ? (
                  <Badge className="bg-green-100 text-green-800">Ready to Cook!</Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-500 border-orange-300">
                    Need {missing.length} more ingredient{missing.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardContent>
              
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!canCook}
                  onClick={() => handleCookRecipe(recipe)}
                >
                  <ChefHat className="mr-1 h-4 w-4" />
                  Cook
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {recipes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No recipes yet. Add your first recipe!</p>
          </CardContent>
        </Card>
      )}

      {/* Add Recipe Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Recipe</DialogTitle>
            <DialogDescription>Create a new recipe to save to your collection</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipe-name">Recipe Name</Label>
              <Input
                id="recipe-name"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                placeholder="e.g., Chicken Stir Fry"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={newRecipe.prepTime}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: e.target.value })}
                  placeholder="30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                  placeholder="4"
                />
              </div>
            </div>
            
            {/* Ingredients */}
            <div className="space-y-3">
              <Label>Ingredients</Label>
              {newRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-1"
                  />
                  <Input
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-20"
                  />
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-24"
                  />
                  {newRecipe.ingredients.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                placeholder="Step by step cooking instructions..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecipe}>Save Recipe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Details Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedRecipe.source ? (
                    <Badge className="bg-black/70">{selectedRecipe.source}</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <BookOpen className="mr-1 h-3 w-3" />
                      Original Recipe
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedRecipe.prepTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRecipe.servings} servings
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => {
                      const inPantry = pantryItems.find(
                        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase())
                      )
                      const pantrySubstitutes = getPantrySubstitutes(ingredient.name)
                      const selectionKey = `${selectedRecipe.id}-${ingredient.name}`
                      const userSelection = ingredientSelections[selectionKey]
                      
                      return (
                        <li key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {inPantry || userSelection === 'have' ? (
                              // In pantry or marked as "have" - just bullet point
                              <span className="w-4 h-4 flex items-center justify-center text-slate-400">•</span>
                            ) : userSelection === 'need' ? (
                              // Marked as "need" - show red X
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              // Not in pantry and no selection yet - show both buttons
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleIngredientSelection(selectedRecipe.id, ingredient.name, ingredient, 'have')}
                                  className="p-0.5 rounded hover:bg-green-100 transition-colors group relative"
                                  title="I have this"
                                >
                                  <Check className="h-4 w-4 text-green-500 hover:text-green-600" />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-slate-800 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    I have this
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleIngredientSelection(selectedRecipe.id, ingredient.name, ingredient, 'need')}
                                  className="p-0.5 rounded hover:bg-red-100 transition-colors group relative"
                                  title="I need this"
                                >
                                  <X className="h-4 w-4 text-red-500 hover:text-red-600" />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-slate-800 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    I need this
                                  </span>
                                </button>
                              </div>
                            )}
                            <span className={userSelection === 'have' || inPantry ? 'text-slate-400' : ''}>
                              {ingredient.quantity} {ingredient.unit} {ingredient.name}
                            </span>
                          </div>
                          {!inPantry && userSelection !== 'have' && pantrySubstitutes.length > 0 && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setShowSubstitutes(ingredient.name)}
                              className="text-green-600"
                            >
                              Use pantry substitute
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  
                  {/* Add missing ingredients to shopping list button */}
                  {getMissingIngredients(selectedRecipe).filter(ing => {
                    const key = `${selectedRecipe.id}-${ing.name}`
                    return ingredientSelections[key] !== 'have'
                  }).length > 0 && (
                    <Button 
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAddToShoppingList(selectedRecipe)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add missing items to shopping list
                    </Button>
                  )}
                </div>
                
                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  {Array.isArray(selectedRecipe.instructions) ? (
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0">
                            {instruction.step_number}
                          </span>
                          <p className="text-muted-foreground">{instruction.instruction_text}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedRecipe.instructions}
                    </p>
                  )}
                </div>

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
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => handleCookRecipe(selectedRecipe)}
                  disabled={getMissingIngredients(selectedRecipe).length > 0}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  Cook Now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Substitutes Dialog */}
      <Dialog open={!!showSubstitutes} onOpenChange={() => setShowSubstitutes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substitutes for {showSubstitutes}</DialogTitle>
            <DialogDescription>
              These alternatives are available in your pantry
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="space-y-2">
              {showSubstitutes && getPantrySubstitutes(showSubstitutes).map((sub, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                      <Check className="h-3 w-3" />
                    </span>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      {sub.pantryItem && (
                        <p className="text-sm text-muted-foreground">
                          You have: {sub.pantryItem.quantity} {sub.pantryItem.unit}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="success" className="bg-green-100 text-green-700 border-green-300">
                    In Pantry
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSubstitutes(null)}>Close</Button>
          </DialogFooter>
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

                        {/* Current instruction */}
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center max-w-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl font-bold text-primary">
                                {cookingRecipe.instructions[currentStep].step_number}
                              </span>
                            </div>
                            <p className="text-xl leading-relaxed">
                              {cookingRecipe.instructions[currentStep].instruction_text}
                            </p>
                          </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>

                          {currentStep === cookingRecipe.instructions.length - 1 ? (
                            <Button onClick={finishCooking} className="bg-green-600 hover:bg-green-700">
                              <Check className="mr-2 h-4 w-4" />
                              Finish Cooking
                            </Button>
                          ) : (
                            <Button onClick={nextStep}>
                              Next Step
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* All steps overview */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">All Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {cookingRecipe.instructions.map((instruction, idx) => (
                          <li 
                            key={idx}
                            onClick={() => setCurrentStep(idx)}
                            className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              idx === currentStep 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                              idx < currentStep 
                                ? 'bg-green-500 text-white' 
                                : idx === currentStep 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {idx < currentStep ? <Check className="h-3 w-3" /> : instruction.step_number}
                            </span>
                            <p className={`text-sm ${idx === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                              {instruction.instruction_text}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={closeCookingMode}>
                  Exit Cooking Mode
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success/Notification Dialog */}
      <Dialog open={notification.open} onOpenChange={(open) => setNotification({ ...notification, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <DialogDescription className="mt-2 text-center">
                {notification.message}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button onClick={() => setNotification({ ...notification, open: false })}>
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

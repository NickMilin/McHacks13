import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Trash2, Clock, Users, ChefHat, ShoppingCart, X, Check } from 'lucide-react'
import { mockRecipes, mockPantryItems, mockSubstitutes } from '@/lib/mockData'

export function Recipes() {
  const [recipes, setRecipes] = useState(mockRecipes)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showShoppingList, setShowShoppingList] = useState(null)
  const [showSubstitutes, setShowSubstitutes] = useState(null)
  
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: '',
    prepTime: '',
    servings: ''
  })

  // Check which ingredients are missing from pantry
  const getMissingIngredients = (recipe) => {
    return recipe.ingredients.filter(ingredient => {
      const pantryItem = mockPantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      return !pantryItem || pantryItem.quantity < ingredient.quantity
    })
  }

  // Check which ingredients are available
  const getAvailableIngredients = (recipe) => {
    return recipe.ingredients.filter(ingredient => {
      const pantryItem = mockPantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      return pantryItem && pantryItem.quantity >= ingredient.quantity
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
  const handleAddRecipe = () => {
    if (!newRecipe.name || newRecipe.ingredients.length === 0) return
    
    const recipe = {
      id: Date.now(),
      ...newRecipe,
      prepTime: parseInt(newRecipe.prepTime) || 30,
      servings: parseInt(newRecipe.servings) || 4,
      ingredients: newRecipe.ingredients.filter(i => i.name).map(i => ({
        ...i,
        quantity: parseFloat(i.quantity) || 1
      }))
    }
    
    setRecipes([...recipes, recipe])
    setNewRecipe({
      name: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      instructions: '',
      prepTime: '',
      servings: ''
    })
    setIsAddDialogOpen(false)
    
    // TODO: Call Flask API
    // recipeApi.addRecipe(recipe)
  }

  // Delete recipe
  const handleDeleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id))
    // TODO: Call Flask API
    // recipeApi.deleteRecipe(id)
  }

  // Cook recipe (remove ingredients from pantry)
  const handleCookRecipe = (recipe) => {
    alert(`Cooking "${recipe.name}"! Ingredients would be removed from your pantry.`)
    // TODO: Call Flask API
    // recipeApi.cookRecipe(recipe.id)
  }

  // Get substitutes for an ingredient
  const getSubstitutes = (ingredientName) => {
    return mockSubstitutes[ingredientName] || []
  }

  // Get substitutes that are available in the user's pantry
  const getPantrySubstitutes = (ingredientName) => {
    const allSubstitutes = mockSubstitutes[ingredientName] || []
    const pantryNames = mockPantryItems.map(item => item.name.toLowerCase())
    
    return allSubstitutes
      .filter(sub => pantryNames.includes(sub.toLowerCase()))
      .map(sub => {
        const pantryItem = mockPantryItems.find(item => item.name.toLowerCase() === sub.toLowerCase())
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
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
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
                      const inPantry = mockPantryItems.find(
                        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase())
                      )
                      const pantrySubstitutes = getPantrySubstitutes(ingredient.name)
                      
                      return (
                        <li key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {inPantry ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>
                              {ingredient.quantity} {ingredient.unit} {ingredient.name}
                            </span>
                          </div>
                          {!inPantry && pantrySubstitutes.length > 0 && (
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
                </div>
                
                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedRecipe.instructions}
                  </p>
                </div>
                
                {/* Shopping List */}
                {getMissingIngredients(selectedRecipe).length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4" />
                      Shopping List
                    </h3>
                    <ul className="space-y-1 text-sm text-orange-700">
                      {getMissingIngredients(selectedRecipe).map((item, i) => (
                        <li key={i}>• {item.quantity} {item.unit} {item.name}</li>
                      ))}
                    </ul>
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
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Clock, Users, ChefHat, Sparkles, AlertCircle, Check, X, ShoppingCart, Flame, ArrowLeft, ArrowRight, PartyPopper, ExternalLink, BookOpen } from 'lucide-react'
import { mockPantryItems, mockRecipes } from '@/lib/mockData'

export function Suggestions() {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [cookingRecipe, setCookingRecipe] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [notification, setNotification] = useState({ open: false, title: '', message: '' })

  // Get expiring items
  const expiringItems = useMemo(() => {
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    return mockPantryItems.filter(item => {
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= threeDaysFromNow && expiryDate >= today
    })
  }, [])

  // Calculate which recipes can be made with current pantry
  const recipeSuggestions = useMemo(() => {
    return mockRecipes.map(recipe => {
      let matchCount = 0
      let expiringMatch = 0
      
      recipe.ingredients.forEach(ingredient => {
        const pantryItem = mockPantryItems.find(
          item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                  ingredient.name.toLowerCase().includes(item.name.toLowerCase())
        )
        
        if (pantryItem) {
          matchCount++
          // Check if this item is expiring
          const isExpiring = expiringItems.find(e => e.id === pantryItem.id)
          if (isExpiring) expiringMatch++
        }
      })
      
      const matchPercentage = Math.round((matchCount / recipe.ingredients.length) * 100)
      
      return {
        ...recipe,
        matchCount,
        matchPercentage,
        expiringMatch,
        missingCount: recipe.ingredients.length - matchCount
      }
    }).sort((a, b) => {
      // Prioritize recipes that use expiring ingredients
      if (a.expiringMatch !== b.expiringMatch) {
        return b.expiringMatch - a.expiringMatch
      }
      // Then by match percentage
      return b.matchPercentage - a.matchPercentage
    })
  }, [expiringItems])

  // Generate AI suggestions (mock)
  const aiSuggestions = useMemo(() => {
    if (expiringItems.length === 0) return []
    
    const suggestions = [
      {
        id: 1,
        title: `Use your ${expiringItems[0]?.name || 'expiring items'}`,
        description: `Make a quick meal using ${expiringItems.slice(0, 3).map(i => i.name).join(', ')} before they expire.`,
        recipes: ['Stir Fry', 'Salad', 'Soup']
      }
    ]
    
    if (expiringItems.length > 1) {
      suggestions.push({
        id: 2,
        title: 'Batch cooking opportunity',
        description: 'You have several items expiring soon. Consider meal prepping to use them all!',
        recipes: ['Meal Prep Bowls', 'Freezer Meals']
      })
    }
    
    return suggestions
  }, [expiringItems])

  // Get missing ingredients for a recipe
  const getMissingIngredients = (recipe) => {
    return recipe.ingredients.filter(ingredient => {
      const pantryItem = mockPantryItems.find(
        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
      )
      return !pantryItem
    })
  }

  // Handle view recipe
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe)
  }

  // Handle cook recipe
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
      message: `You've finished cooking "${recipeName}"! Ingredients have been removed from your pantry.`
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
        <p className="text-muted-foreground">
          Personalized recommendations based on your pantry
        </p>
      </div>

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="h-5 w-5" />
              Use These Soon!
            </CardTitle>
            <CardDescription className="text-orange-500">
              These items are expiring within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringItems.map(item => (
                <Badge key={item.id} variant="outline" className="text-orange-500 border-orange-300">
                  {item.name} - Expires {new Date(item.expiryDate).toLocaleDateString()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map(suggestion => (
              <Card key={suggestion.id} className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.recipes.map((recipe, i) => (
                      <Badge key={i} variant="secondary">{recipe}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommended Recipes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipeSuggestions.map(recipe => (
            <Card key={recipe.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  {recipe.expiringMatch > 0 && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-600 border-orange-200 text-xs hover:bg-orange-100">
                      Uses expiring items
                    </Badge>
                  )}
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
                {/* Match Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pantry Match</span>
                    <span className={`text-sm font-bold ${
                      recipe.matchPercentage >= 80 ? 'text-green-600' :
                      recipe.matchPercentage >= 50 ? 'text-orange-500' : 'text-red-600'
                    }`}>
                      {recipe.matchPercentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        recipe.matchPercentage >= 80 ? 'bg-green-500' :
                        recipe.matchPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${recipe.matchPercentage}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {recipe.matchCount} of {recipe.ingredients.length} ingredients in pantry
                  {recipe.missingCount > 0 && (
                    <span className="text-orange-500">
                      {' '}• Need {recipe.missingCount} more
                    </span>
                  )}
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={recipe.matchPercentage === 100 ? 'default' : 'outline'}
                  onClick={() => handleViewRecipe(recipe)}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  View Recipe
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {recipeSuggestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">No suggestions yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Add more items to your pantry to get personalized recipe suggestions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips to Reduce Food Waste</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Cook meals using ingredients that are expiring soon</li>
            <li>• Freeze items before they go bad if you can't use them in time</li>
            <li>• Plan your meals around what's already in your pantry</li>
            <li>• Buy only what you need based on your meal plan</li>
          </ul>
        </CardContent>
      </Card>

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
                        item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                                ingredient.name.toLowerCase().includes(item.name.toLowerCase())
                      )
                      
                      return (
                        <li key={index} className="flex items-center gap-2">
                          {inPantry ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
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
                
                {/* Shopping List */}
                {getMissingIngredients(selectedRecipe).length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-600 flex items-center gap-2 mb-2">
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
                        {cookingRecipe.prepTime} min
                      </span>
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
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {cookingRecipe.ingredients.map((ingredient, index) => (
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
                            <Button onClick={finishCooking} className="bg-green-600 hover:bg-green-700">
                              <Check className="mr-2 h-4 w-4" />
                              Finish Cooking
                            </Button>
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

      {/* Success Notification Dialog */}
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

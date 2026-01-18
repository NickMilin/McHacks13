import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link2, Clock, Users, ExternalLink, ShoppingCart, Check, X, Loader2, ChefHat, Flame, ArrowLeft, ArrowRight, BookmarkPlus, Sparkles, PartyPopper, Youtube, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'
import { recipeApi } from '@/lib/api'

export function SearchRecipes() {
  const { user } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [pantryLoading, setPantryLoading] = useState(true)
  const [pantryError, setPantryError] = useState(null)
  const [recipeUrl, setRecipeUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [importedRecipe, setImportedRecipe] = useState(null)
  const [hasImported, setHasImported] = useState(false)
  const [error, setError] = useState(null)
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

  // Import recipe from URL
  const handleImportRecipe = async () => {
    if (!recipeUrl.trim()) return
    
    setIsProcessing(true)
    setHasImported(true)
    setError(null)
    setImportedRecipe(null)
    
    try {
      const result = await recipeApi.getRecipeFromUrl(recipeUrl)
      
      if (result.success && result.recipe) {
        // Transform the recipe to match our display format
        const recipe = {
          id: Date.now(),
          name: result.recipe.recipe_title || 'Imported Recipe',
          description: result.recipe.description || '',
          source: result.recipe.source || 'Imported',
          sourceUrl: result.recipe.sourceUrl || recipeUrl,
          prepTime: result.recipe.prep_time_minutes || 0,
          cookTime: result.recipe.cook_time_minutes || 0,
          servings: result.recipe.servings || 4,
          ingredients: result.recipe.ingredients || [],
          instructions: result.recipe.instructions || [],
        }
        setImportedRecipe(recipe)
      } else {
        setError(result.error || 'Failed to extract recipe from URL')
      }
    } catch (err) {
      console.error('Recipe import error:', err)
      setError('Failed to import recipe. Make sure the backend server is running on port 5001.')
    } finally {
      setIsProcessing(false)
    }
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

  // Reset import
  const handleReset = () => {
    setRecipeUrl('')
    setImportedRecipe(null)
    setHasImported(false)
    setError(null)
  }

  // Check if URL is YouTube
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import Recipe</h1>
        <p className="text-muted-foreground">
          Paste a link to a recipe website or YouTube video to import it
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Paste recipe URL (e.g., https://allrecipes.com/recipe/... or YouTube video)"
                value={recipeUrl}
                onChange={(e) => setRecipeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImportRecipe()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleImportRecipe} disabled={isProcessing || !recipeUrl.trim()}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              Import
            </Button>
          </div>
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Recipe websites
            </span>
            <span className="flex items-center gap-1">
              <Youtube className="h-4 w-4" />
              YouTube cooking videos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
            <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Extracting recipe from URL...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Imported Recipe */}
      {!isProcessing && importedRecipe && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Imported Recipe</h2>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Import Another
            </Button>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary">
                  {isYouTubeUrl(importedRecipe.sourceUrl) ? (
                    <><Youtube className="h-3 w-3 mr-1" /> YouTube</>
                  ) : (
                    <><Globe className="h-3 w-3 mr-1" /> {importedRecipe.source}</>
                  )}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{importedRecipe.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 flex-wrap">
                {importedRecipe.prepTime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Prep: {importedRecipe.prepTime} min
                  </span>
                )}
                {importedRecipe.cookTime > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    Cook: {importedRecipe.cookTime} min
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {importedRecipe.servings} servings
                </span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {importedRecipe.description && (
                <p className="text-muted-foreground">{importedRecipe.description}</p>
              )}
              
              {/* Pantry Match */}
              {importedRecipe.ingredients.length > 0 && (
                <div>
                  {(() => {
                    const { available, missing } = checkPantryAvailability(importedRecipe.ingredients)
                    const matchPercentage = Math.round((available.length / importedRecipe.ingredients.length) * 100)
                    
                    return (
                      <>
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
                      </>
                    )
                  })()}
                </div>
              )}
              
              {/* Ingredients */}
              <div>
                <h3 className="font-semibold mb-3">Ingredients ({importedRecipe.ingredients.length})</h3>
                {(() => {
                  // Group ingredients by their group property
                  const groups = {}
                  importedRecipe.ingredients.forEach(ing => {
                    const group = ing.group || 'Main'
                    if (!groups[group]) groups[group] = []
                    groups[group].push(ing)
                  })
                  
                  const { available, missing } = checkPantryAvailability(importedRecipe.ingredients)
                  const availableNames = available.map(a => a.name.toLowerCase())
                  
                  return Object.entries(groups).map(([groupName, ingredients]) => (
                    <div key={groupName} className="mb-4">
                      {Object.keys(groups).length > 1 && (
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{groupName}</h4>
                      )}
                      <ul className="space-y-1.5">
                        {ingredients.map((ing, i) => {
                          const inPantry = availableNames.includes(ing.name.toLowerCase())
                          return (
                            <li key={i} className="flex items-start gap-2">
                              {inPantry ? (
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={inPantry ? 'text-muted-foreground' : ''}>
                                {ing.quantity} {ing.unit} {ing.name}
                                {ing.preparation_notes && (
                                  <span className="text-muted-foreground"> ({ing.preparation_notes})</span>
                                )}
                              </span>
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
                  {importedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {instruction.step_number}
                      </span>
                      <p className="text-muted-foreground pt-0.5">{instruction.instruction_text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              
              {/* Missing Ingredients */}
              {checkPantryAvailability(importedRecipe.ingredients).missing.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-600 flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4" />
                    Missing Ingredients
                  </h3>
                  <ul className="space-y-1 text-sm text-orange-700 mb-3">
                    {checkPantryAvailability(importedRecipe.ingredients).missing.map((item, i) => (
                      <li key={i}>• {item.quantity} {item.unit} {item.name}</li>
                    ))}
                  </ul>
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                    onClick={() => handleAddToShoppingList(importedRecipe)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Shopping List
                  </Button>
                </div>
              )}
              
              {/* Source Link */}
              {importedRecipe.sourceUrl && (
                <div className="pt-2">
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href={importedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      View original recipe
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleSaveRecipe(importedRecipe)}>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save to Library
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => handleCookRecipe(importedRecipe)}
                disabled={checkPantryAvailability(importedRecipe.ingredients).missing.length > 0}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Cook Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isProcessing && !importedRecipe && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Import a recipe from any URL</p>
            <p className="text-muted-foreground text-sm mt-1">
              Paste a link above to extract the recipe automatically
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {!hasImported && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Supported Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Recipe websites (AllRecipes, Food Network, etc.)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                YouTube cooking videos
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Food blogs with recipes
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Any page with structured recipe data
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

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

                <TabsContent value="ingredients" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ingredients Needed</CardTitle>
                      {cookingRecipe.description && (
                        <CardDescription>{cookingRecipe.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {cookingRecipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>
                              {ing.quantity} {ing.unit} {ing.name}
                              {ing.preparation_notes && (
                                <span className="text-muted-foreground"> ({ing.preparation_notes})</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

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
                        <div className="w-full bg-muted rounded-full h-2 mb-6">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / cookingRecipe.instructions.length) * 100}%` }}
                          />
                        </div>

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

      {/* Notification Dialog */}
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

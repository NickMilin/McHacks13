import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Clock, Users, ChefHat, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { mockPantryItems, mockRecipes } from '@/lib/mockData'

export function Suggestions() {
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Refresh suggestions
  const handleRefresh = () => {
    setIsRefreshing(true)
    // TODO: Call Flask API for new suggestions
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
          <p className="text-muted-foreground">
            Personalized recommendations based on your pantry
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Use These Soon!
            </CardTitle>
            <CardDescription className="text-orange-700">
              These items are expiring within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringItems.map(item => (
                <Badge key={item.id} variant="outline" className="border-orange-300 text-orange-800">
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
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
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
                      recipe.matchPercentage >= 50 ? 'text-orange-600' : 'text-red-600'
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
                    <span className="text-orange-600">
                      {' '}• Need {recipe.missingCount} more
                    </span>
                  )}
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={recipe.matchPercentage === 100 ? 'default' : 'outline'}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  {recipe.matchPercentage === 100 ? 'Cook Now' : 'View Recipe'}
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
    </div>
  )
}

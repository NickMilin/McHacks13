import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, Users, ExternalLink, ShoppingCart, Check, X, Loader2 } from 'lucide-react'
import { mockPantryItems } from '@/lib/mockData'

export function SearchRecipes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  // Simulate recipe search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setHasSearched(true)
    
    // TODO: Replace with actual Flask API call
    // const results = await recipeApi.searchOnline(searchQuery)
    
    // Simulated search results
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          name: `${searchQuery} Classic Style`,
          source: 'AllRecipes',
          sourceUrl: 'https://allrecipes.com',
          prepTime: 30,
          servings: 4,
          ingredients: [
            { name: 'Chicken Breast', quantity: 2, unit: 'lbs' },
            { name: 'Rice', quantity: 2, unit: 'cups' },
            { name: 'Bell Peppers', quantity: 2, unit: 'count' },
            { name: 'Soy Sauce', quantity: 3, unit: 'tbsp' },
            { name: 'Garlic', quantity: 4, unit: 'cloves' },
          ],
          image: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Recipe+1'
        },
        {
          id: 2,
          name: `Easy ${searchQuery}`,
          source: 'Food Network',
          sourceUrl: 'https://foodnetwork.com',
          prepTime: 25,
          servings: 6,
          ingredients: [
            { name: 'Pasta', quantity: 1, unit: 'box' },
            { name: 'Tomatoes', quantity: 4, unit: 'count' },
            { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
            { name: 'Basil', quantity: 1, unit: 'bunch' },
            { name: 'Parmesan', quantity: 0.5, unit: 'cup' },
          ],
          image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Recipe+2'
        },
        {
          id: 3,
          name: `Healthy ${searchQuery} Bowl`,
          source: 'Bon Appetit',
          sourceUrl: 'https://bonappetit.com',
          prepTime: 20,
          servings: 2,
          ingredients: [
            { name: 'Quinoa', quantity: 1, unit: 'cup' },
            { name: 'Spinach', quantity: 2, unit: 'cups' },
            { name: 'Eggs', quantity: 2, unit: 'count' },
            { name: 'Avocado', quantity: 1, unit: 'count' },
            { name: 'Lemon', quantity: 1, unit: 'count' },
          ],
          image: 'https://via.placeholder.com/300x200/a855f7/ffffff?text=Recipe+3'
        },
        {
          id: 4,
          name: `${searchQuery} for Two`,
          source: 'Tasty',
          sourceUrl: 'https://tasty.co',
          prepTime: 35,
          servings: 2,
          ingredients: [
            { name: 'Salmon', quantity: 2, unit: 'fillets' },
            { name: 'Broccoli', quantity: 1, unit: 'head' },
            { name: 'Lemon', quantity: 1, unit: 'count' },
            { name: 'Garlic', quantity: 3, unit: 'cloves' },
            { name: 'Butter', quantity: 2, unit: 'tbsp' },
          ],
          image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Recipe+4'
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
      const inPantry = mockPantryItems.find(
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
    alert(`"${recipe.name}" would be saved to your recipes!`)
    // TODO: Call Flask API
    // recipeApi.addRecipe(recipe)
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
                    <Badge className="absolute top-2 right-2 bg-black/70">
                      {recipe.source}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle>{recipe.name}</CardTitle>
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
                  
                  <CardContent className="space-y-4">
                    {/* Pantry Match */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pantry Match</span>
                        <span className={`text-sm font-bold ${
                          matchPercentage >= 80 ? 'text-green-600' :
                          matchPercentage >= 50 ? 'text-orange-600' : 'text-red-600'
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
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View Recipe
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleSaveRecipe(recipe)}>
                      Save Recipe
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
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
                  onClick={() => {
                    setSearchQuery(term)
                    setTimeout(() => handleSearch(), 100)
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

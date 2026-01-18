import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Trash2, Check, Download, Share2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'
import { shoppingListFirebase } from '@/lib/shoppingListFirebase'
import { mockRecipes, categoryLabels } from '@/lib/mockData'

export function ShoppingList() {
  const { user } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [pantryLoading, setPantryLoading] = useState(true)
  const [pantryError, setPantryError] = useState(null)
  const [items, setItems] = useState([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [selectedRecipes, setSelectedRecipes] = useState(new Set([1, 2])) // Default selected recipes
  const [editingItem, setEditingItem] = useState(null) // Track which item is being edited
  const [loading, setLoading] = useState(true)

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

  // Load shopping list from Firebase
  useEffect(() => {
    const loadShoppingList = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const data = await shoppingListFirebase.getShoppingList(user.uid)
        setItems(data.items || [])
        setCheckedItems(new Set(data.checkedItems || []))
        setSelectedRecipes(new Set(data.selectedRecipes || [1, 2]))
      } catch (err) {
        console.error('Error loading shopping list:', err)
      } finally {
        setLoading(false)
      }
    }
    loadShoppingList()
  }, [user])

  // Save shopping list to Firebase whenever it changes
  useEffect(() => {
    const saveShoppingList = async () => {
      if (!user || loading) return
      
      try {
        await shoppingListFirebase.updateShoppingList(user.uid, {
          items,
          checkedItems: Array.from(checkedItems),
          selectedRecipes: Array.from(selectedRecipes)
        })
      } catch (err) {
        console.error('Error saving shopping list:', err)
      }
    }
    saveShoppingList()
  }, [user, items, checkedItems, selectedRecipes, loading])

  // Sync items with selected recipes
  useEffect(() => {
    if (loading || pantryLoading) return

    const newItems = [...items]
    const itemMap = new Map(items.map(item => [item.id, item]))

    // Calculate missing ingredients from selected recipes
    const recipeIngredients = new Map()
    mockRecipes
      .filter(recipe => selectedRecipes.has(recipe.id))
      .forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          const inPantry = pantryItems.find(
            item => item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                    ingredient.name.toLowerCase().includes(item.name.toLowerCase())
          )
          
          if (!inPantry) {
            const key = ingredient.name.toLowerCase()
            const qty = parseFloat(ingredient.quantity) || 1
            if (recipeIngredients.has(key)) {
              const existing = recipeIngredients.get(key)
              existing.quantity += qty
              existing.recipes.push(recipe.name)
            } else {
              recipeIngredients.set(key, {
                id: ingredient.name,
                name: ingredient.name,
                quantity: qty,
                unit: ingredient.unit,
                recipes: [recipe.name],
                category: 'other',
                isCustom: false
              })
            }
          }
        })
      })

    // Add new recipe items
    recipeIngredients.forEach((ingredient, key) => {
      if (!itemMap.has(ingredient.id)) {
        newItems.push(ingredient)
      } else {
        // Update recipes list for existing item
        const existingIndex = newItems.findIndex(item => item.id === ingredient.id)
        if (existingIndex !== -1 && !newItems[existingIndex].isCustom) {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            recipes: ingredient.recipes
          }
        }
      }
    })

    // Remove items that are no longer in selected recipes (but keep custom items)
    const filteredItems = newItems.filter(item => {
      if (item.isCustom) return true
      return recipeIngredients.has(item.id.toLowerCase())
    })

    setItems(filteredItems)
  }, [selectedRecipes, pantryItems, loading, pantryLoading])

  // All shopping list items
  const allItems = items

  // Toggle recipe selection
  const toggleRecipe = (recipeId) => {
    const newSelected = new Set(selectedRecipes)
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
    } else {
      newSelected.add(recipeId)
    }
    setSelectedRecipes(newSelected)
  }

  // Add custom item
  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return
    
    const item = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      quantity: parseFloat(newItemQuantity) || 1,
      unit: newItemUnit.trim(),
      recipes: ['Custom'],
      category: 'other',
      isCustom: true
    }
    
    setItems([...items, item])
    setNewItemName('')
    setNewItemQuantity('')
    setNewItemUnit('')
  }

  // Remove item
  const handleRemoveItem = (item) => {
    setItems(items.filter(i => i.id !== item.id))
    checkedItems.delete(item.id)
    setCheckedItems(new Set(checkedItems))
  }

  // Update item quantity/unit
  const handleUpdateItem = (itemId, quantity, unit) => {
    if (editingItem !== itemId) return
    
    const itemIndex = items.findIndex(item => item.id === itemId)
    if (itemIndex !== -1) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: parseFloat(quantity) || 1,
        unit: unit
      }
      setItems(updatedItems)
    }
    setEditingItem(null)
  }

  // Clear entire list
  const clearAllItems = async () => {
    setItems([])
    setCheckedItems(new Set())
    
    if (user) {
      try {
        await shoppingListFirebase.clearShoppingList(user.uid)
      } catch (err) {
        console.error('Error clearing shopping list:', err)
      }
    }
  }

  // Toggle item checked
  const toggleChecked = (itemId) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  // Clear all checked items
  const clearChecked = () => {
    setItems(items.filter(item => !checkedItems.has(item.id)))
    setCheckedItems(new Set())
  }

  // Export shopping list
  const handleExport = () => {
    const text = allItems
      .map(item => `${checkedItems.has(item.id) ? '☑' : '☐'} ${item.quantity} ${item.unit} ${item.name}`)
      .join('\n')
    
    navigator.clipboard.writeText(text)
    alert('Shopping list copied to clipboard!')
  }

  // Share shopping list
  const handleShare = async () => {
    const text = allItems
      .map(item => `- ${item.quantity} ${item.unit} ${item.name}`)
      .join('\n')
    
    if (navigator.share) {
      await navigator.share({
        title: 'Shopping List',
        text: `Shopping List:\n${text}`
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('Shopping list copied to clipboard!')
    }
  }

  const uncheckedCount = allItems.length - checkedItems.size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping List</h1>
          <p className="text-muted-foreground">
            Items you need to buy for your selected recipes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Recipes</CardTitle>
            <CardDescription>
              Choose which recipes to include in your shopping list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => toggleRecipe(recipe.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedRecipes.has(recipe.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted'}
                `}
              >
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${selectedRecipes.has(recipe.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}
                `}>
                  {selectedRecipes.has(recipe.id) && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{recipe.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {recipe.ingredients.length} ingredients
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shopping List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your List
                </CardTitle>
                <CardDescription>
                  {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} to buy
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {checkedItems.size > 0 && (
                  <Button variant="outline" size="sm" onClick={clearChecked}>
                    Clear Checked
                  </Button>
                )}
                {allItems.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllItems} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Custom Item */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Item name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                  className="w-20"
                />
                <Input
                  placeholder="Unit"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                  className="w-24"
                />
                <Button onClick={handleAddCustomItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Shopping Items */}
            {allItems.length > 0 ? (
              <div className="space-y-2">
                {allItems.map(item => (
                  <div
                    key={item.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border transition-colors
                      ${checkedItems.has(item.id) ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/50'}
                    `}
                  >
                    <button
                      onClick={() => toggleChecked(item.id)}
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                        ${checkedItems.has(item.id) ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}
                      `}
                    >
                      {checkedItems.has(item.id) && <Check className="h-3 w-3 text-white" />}
                    </button>
                    
                    {editingItem === item.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={item.quantity}
                          className="w-20"
                          id={`qty-${item.id}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const qty = document.getElementById(`qty-${item.id}`).value
                              const unit = document.getElementById(`unit-${item.id}`).value
                              handleUpdateItem(item.id, qty, unit)
                            }
                          }}
                        />
                        <Input
                          defaultValue={item.unit}
                          className="w-24"
                          id={`unit-${item.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const qty = document.getElementById(`qty-${item.id}`).value
                              const unit = document.getElementById(`unit-${item.id}`).value
                              handleUpdateItem(item.id, qty, unit)
                            }
                          }}
                        />
                        <Input
                          defaultValue={item.name}
                          className="flex-1"
                          disabled
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const qty = document.getElementById(`qty-${item.id}`).value
                            const unit = document.getElementById(`unit-${item.id}`).value
                            handleUpdateItem(item.id, qty, unit)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0" onClick={() => setEditingItem(item.id)}>
                        <p className={`font-medium cursor-pointer ${checkedItems.has(item.id) ? 'line-through' : ''}`}>
                          {item.quantity} {item.unit} {item.name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.recipes.map((recipe, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {recipe}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item)}
                      className="flex-shrink-0 hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your shopping list is empty</p>
                <p className="text-sm">Select recipes or add custom items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {allItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{allItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{checkedItems.size}</p>
                <p className="text-sm text-muted-foreground">Checked Off</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-500">{uncheckedCount}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{selectedRecipes.size}</p>
                <p className="text-sm text-muted-foreground">Recipes Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

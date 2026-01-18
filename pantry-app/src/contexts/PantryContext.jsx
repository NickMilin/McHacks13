import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'

const PantryContext = createContext({
  pantryItems: [],
  loading: false,
  error: null,
  loadPantryItems: () => {},
  addPantryItem: () => {},
  updatePantryItem: () => {},
  deletePantryItem: () => {},
  exportPantryToCSV: () => {}
})

export function usePantry() {
  return useContext(PantryContext)
}

export function PantryProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load pantry items when user changes
  useEffect(() => {
    console.log('PantryProvider useEffect triggered:', { isAuthenticated, user: user?.uid })
    if (isAuthenticated && user) {
      loadPantryItems()
    } else {
      setPantryItems([])
      setLoading(false)
      setError(null)
    }
  }, [user, isAuthenticated])

  // Load all pantry items for the current user
  const loadPantryItems = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const items = await pantryFirebase.getItems(user.uid)
      setPantryItems(items)
    } catch (err) {
      console.error('Error loading pantry items:', err)
      setError('Failed to load pantry items')
    } finally {
      setLoading(false)
    }
  }

  // Add item to pantry
  const addPantryItem = async (item) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const newItem = await pantryFirebase.addItem(user.uid, item)
      setPantryItems(prev => [newItem, ...prev])
    } catch (err) {
      console.error('Error adding pantry item:', err)
      setError('Failed to add item')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update item in pantry
  const updatePantryItem = async (itemId, updates) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const updatedItem = await pantryFirebase.updateItem(user.uid, itemId, updates)
      setPantryItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      ))
    } catch (err) {
      console.error('Error updating pantry item:', err)
      setError('Failed to update item')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete item from pantry
  const deletePantryItem = async (itemId) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await pantryFirebase.deleteItem(user.uid, itemId)
      setPantryItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting pantry item:', err)
      setError('Failed to delete item')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Export pantry to CSV format
  const exportPantryToCSV = async () => {
    if (!user) return []

    try {
      return await pantryFirebase.exportToCSV(user.uid)
    } catch (err) {
      console.error('Error exporting pantry to CSV:', err)
      throw err
    }
  }

  const value = {
    pantryItems,
    loading,
    error,
    loadPantryItems,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    exportPantryToCSV
  }

  console.log('PantryContext value:', value)

  return (
    <PantryContext.Provider value={value}>
      {children}
    </PantryContext.Provider>
  )
}
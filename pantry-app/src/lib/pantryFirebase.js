import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

// Pantry Firebase service for managing user's pantry items
export const pantryFirebase = {
  // Get all pantry items for a user
  getItems: async (userId) => {
    try {
      const pantryRef = collection(db, 'users', userId, 'pantry')
      const q = query(pantryRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const items = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string for compatibility
          expiryDate: data.expiryDate?.toDate?.()?.toISOString().split('T')[0] || data.expiryDate,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        })
      })

      return items
    } catch (error) {
      console.error('Error getting pantry items:', error)
      throw error
    }
  },

  // Add item to user's pantry
  addItem: async (userId, item) => {
    try {
      const pantryRef = collection(db, 'users', userId, 'pantry')

      const itemData = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '',
        category: item.category,
        expiryDate: item.expiryDate || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(pantryRef, itemData)
      return { id: docRef.id, ...itemData }
    } catch (error) {
      console.error('Error adding pantry item:', error)
      throw error
    }
  },

  // Update item in user's pantry
  updateItem: async (userId, itemId, updates) => {
    try {
      const itemRef = doc(db, 'users', userId, 'pantry', itemId)

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      await updateDoc(itemRef, updateData)
      return { id: itemId, ...updateData }
    } catch (error) {
      console.error('Error updating pantry item:', error)
      throw error
    }
  },

  // Delete item from user's pantry
  deleteItem: async (userId, itemId) => {
    try {
      const itemRef = doc(db, 'users', userId, 'pantry', itemId)
      await deleteDoc(itemRef)
    } catch (error) {
      console.error('Error deleting pantry item:', error)
      throw error
    }
  },

  // Export pantry to CSV format: food_name,quantity,unit,food_category
  exportToCSV: async (userId) => {
    try {
      const items = await pantryFirebase.getItems(userId)

      // Convert to CSV format: food_name,quantity,unit,food_category
      const csvData = items.map(item => ({
        food_name: item.name,
        quantity: item.quantity,
        unit: item.unit || '',
        food_category: item.category
      }))

      // Create CSV content
      const headers = ['food_name', 'quantity', 'unit', 'food_category']
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `pantry_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return csvData
    } catch (error) {
      console.error('Error exporting pantry to CSV:', error)
      throw error
    }
  }
}
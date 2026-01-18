import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore'

export const shoppingListFirebase = {
  // Get shopping list data for a user
  async getShoppingList(userId) {
    try {
      const docRef = doc(db, 'users', userId, 'shoppingList', 'data')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      }
      
      // Return default structure if doesn't exist
      return {
        items: [],
        checkedItems: [],
        selectedRecipes: []
      }
    } catch (error) {
      console.error('Error getting shopping list:', error)
      throw error
    }
  },

  // Update shopping list data for a user
  async updateShoppingList(userId, shoppingListData) {
    try {
      const docRef = doc(db, 'users', userId, 'shoppingList', 'data')
      await setDoc(docRef, {
        ...shoppingListData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating shopping list:', error)
      throw error
    }
  },

  // Clear the entire shopping list
  async clearShoppingList(userId) {
    try {
      const docRef = doc(db, 'users', userId, 'shoppingList', 'data')
      await setDoc(docRef, {
        items: [],
        checkedItems: [],
        selectedRecipes: [],
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error clearing shopping list:', error)
      throw error
    }
  }
}

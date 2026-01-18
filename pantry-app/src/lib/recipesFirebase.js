import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

/**
 * Get all recipes for a user
 */
export const getRecipes = async (userId) => {
  try {
    const recipesRef = collection(db, 'users', userId, 'recipes')
    const q = query(recipesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting recipes:', error)
    throw new Error('Failed to load recipes')
  }
}

/**
 * Add a new recipe for a user
 */
export const addRecipe = async (userId, recipeData) => {
  try {
    const recipesRef = collection(db, 'users', userId, 'recipes')
    const docRef = await addDoc(recipesRef, {
      ...recipeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return {
      id: docRef.id,
      ...recipeData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Error adding recipe:', error)
    throw new Error('Failed to add recipe')
  }
}

/**
 * Update an existing recipe
 */
export const updateRecipe = async (userId, recipeId, updates) => {
  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId)
    await updateDoc(recipeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    return {
      ...updates,
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Error updating recipe:', error)
    throw new Error('Failed to update recipe')
  }
}

/**
 * Delete a recipe
 */
export const deleteRecipe = async (userId, recipeId) => {
  try {
    const recipeRef = doc(db, 'users', userId, 'recipes', recipeId)
    await deleteDoc(recipeRef)
  } catch (error) {
    console.error('Error deleting recipe:', error)
    throw new Error('Failed to delete recipe')
  }
}

export const recipesFirebase = {
  getRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe
}

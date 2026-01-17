import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDxt1PzQAr5nJqNMDZVh86vScutP5fk80o",
  authDomain: "mchacks-food-project.firebaseapp.com",
  databaseURL: "https://mchacks-food-project-default-rtdb.firebaseio.com/",
  projectId: "mchacks-food-project",
  storageBucket: "mchacks-food-project.firebasestorage.app",
  messagingSenderId: "95911205495",
  appId: "1:95911205495:web:7ecc9fea9ea13763c20472",
  measurementId: "G-SZWYWF1CND"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export default app

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Pantry } from '@/pages/Pantry'
import { UploadReceipt } from '@/pages/UploadReceipt'
import { HealthStats } from '@/pages/HealthStats'
import { Recipes } from '@/pages/Recipes'
import { SearchRecipes } from '@/pages/SearchRecipes'
import { Suggestions } from '@/pages/Suggestions'
import { ShoppingList } from '@/pages/ShoppingList'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

// Public Route wrapper (redirects to home if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="upload-receipt" element={<UploadReceipt />} />
        <Route path="health-stats" element={<HealthStats />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="search-recipes" element={<SearchRecipes />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="shopping-list" element={<ShoppingList />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App

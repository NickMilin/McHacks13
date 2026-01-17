import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Pantry } from '@/pages/Pantry'
import { UploadReceipt } from '@/pages/UploadReceipt'
import { HealthStats } from '@/pages/HealthStats'
import { Recipes } from '@/pages/Recipes'
import { SearchRecipes } from '@/pages/SearchRecipes'
import { Suggestions } from '@/pages/Suggestions'
import { ShoppingList } from '@/pages/ShoppingList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
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
    </Router>
  )
}

export default App

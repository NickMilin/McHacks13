import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ShoppingBasket,
  Upload,
  BarChart3,
  BookOpen,
  Search,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'

export function Dashboard() {
  const { user } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadItems = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const items = await pantryFirebase.getItems(user.uid)
        setPantryItems(items)
        setError(null)
      } catch (err) {
        setError(err.message)
        setPantryItems([])
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [user])

  // Calculate expiring soon items (within 3 days)
  const expiringItems = pantryItems.filter(item => {
    if (!item.expiryDate) return false
    const today = new Date()
    const expiryDate = new Date(item.expiryDate)
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  })

  const quickActions = [
    { 
      to: '/upload-receipt', 
      icon: Upload, 
      title: 'Scan Receipt', 
      description: 'Upload a receipt to add items',
      color: 'bg-blue-500'
    },
    { 
      to: '/pantry', 
      icon: ShoppingBasket, 
      title: 'View Pantry', 
      description: `${pantryItems.length} items in stock`,
      color: 'bg-green-500'
    },
    { 
      to: '/health-stats', 
      icon: BarChart3, 
      title: 'Health Stats', 
      description: 'Track your nutrition balance',
      color: 'bg-purple-500'
    },
    { 
      to: '/search-recipes', 
      icon: Search, 
      title: 'Find Recipes', 
      description: 'Search for new dishes to make',
      color: 'bg-orange-500'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to PantryPal 👋</h1>
        <p className="text-white mt-2">
          Manage your pantry, get personalized recipe suggestions, and reduce food waste.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && pantryItems.length === 0 && !error && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              Your pantry is empty. Start by scanning a receipt or manually adding items!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Alert */}
      {expiringItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Expiring Soon
            </CardTitle>
            <CardDescription className="text-orange-700">
              These items will expire within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringItems.map(item => (
                <div 
                  key={item.id} 
                  className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
                >
                  {item.name} - {new Date(item.expiryDate).toLocaleDateString()}
                </div>
              ))}
            </div>
            <Link to="/suggestions">
              <Button variant="outline" className="mt-4 border-orange-300 text-orange-800 hover:bg-orange-100">
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Recipe Suggestions
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity / Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-4xl">{pantryItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">in your pantry</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-4xl">
              {new Set(pantryItems.map(i => i.category)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">food groups tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expiring Soon</CardDescription>
            <CardTitle className="text-4xl text-orange-500">{expiringItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">items need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

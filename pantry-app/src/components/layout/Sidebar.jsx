import { NavLink } from 'react-router-dom'
import { 
  Home, 
  ShoppingBasket, 
  Upload, 
  BarChart3, 
  BookOpen, 
  Search, 
  Lightbulb,
  ShoppingCart,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/pantry', icon: ShoppingBasket, label: 'My Pantry' },
  { to: '/upload-receipt', icon: Upload, label: 'Scan Receipt' },
  { to: '/health-stats', icon: BarChart3, label: 'Health Stats' },
  { to: '/recipes', icon: BookOpen, label: 'My Recipes' },
  { to: '/search-recipes', icon: Search, label: 'Find Recipes' },
  { to: '/suggestions', icon: Lightbulb, label: 'Suggestions' },
  { to: '/shopping-list', icon: ShoppingCart, label: 'Shopping List' },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <ShoppingBasket className="h-8 w-8 text-primary" />
          <span className="ml-3 text-xl font-bold text-primary">PantryPal</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* User Profile & Logout */}
        <div className="border-t p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

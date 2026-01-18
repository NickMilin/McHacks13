import { NavLink } from 'react-router-dom'
import { 
  Home, 
  ShoppingBasket, 
  Upload, 
  BarChart3, 
  BookOpen, 
  Link2, 
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
  { to: '/search-recipes', icon: Link2, label: 'Import Recipe' },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/30 dark:border-white/10 bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-white/20 dark:border-white/10 px-5">
          {/* 3D Logo Container */}
          <div className="relative group cursor-pointer">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse" />
            
            {/* 3D Icon container */}
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300"
                 style={{
                   boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                   transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)'
                 }}>
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
              <ShoppingBasket className="h-6 w-6 text-white drop-shadow-lg relative z-10" />
            </div>
          </div>
          
          {/* 3D Title - VERSUS style */}
          <div className="ml-2 relative">
            {/* 3D shadow layers */}
            <span 
              className="absolute text-[1.4rem] font-black tracking-tight uppercase text-emerald-950"
              style={{ transform: 'translate(3px, 3px)', letterSpacing: '-0.02em' }}
              aria-hidden="true"
            >
              PantryPal
            </span>
            <span 
              className="absolute text-[1.4rem] font-black tracking-tight uppercase text-emerald-900"
              style={{ transform: 'translate(2px, 2px)', letterSpacing: '-0.02em' }}
              aria-hidden="true"
            >
              PantryPal
            </span>
            <span 
              className="absolute text-[1.4rem] font-black tracking-tight uppercase text-emerald-800"
              style={{ transform: 'translate(1px, 1px)', letterSpacing: '-0.02em' }}
              aria-hidden="true"
            >
              PantryPal
            </span>
            {/* Main gradient text */}
            <span 
              className="relative text-[1.4rem] font-black tracking-tight uppercase"
              style={{
                background: 'linear-gradient(180deg, #86efac 0%, #4ade80 30%, #22c55e 60%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            >
              PantryPal
            </span>
          </div>
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
                    : "text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* User Profile & Logout */}
        <div className="border-t border-white/20 dark:border-white/10 p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-100">{user.displayName || 'User'}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
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

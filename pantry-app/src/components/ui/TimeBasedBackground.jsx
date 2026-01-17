import { useState, useEffect, createContext, useContext } from 'react'

// Context to control the time/meal theme from anywhere in the app
const TimeThemeContext = createContext({
  theme: 'day',
  setTheme: () => {},
  setMealTime: () => {}
})

export const useTimeTheme = () => useContext(TimeThemeContext)

export function TimeThemeProvider({ children }) {
  const [theme, setTheme] = useState('day')
  const [manualOverride, setManualOverride] = useState(null)

  // Auto-detect time of day
  useEffect(() => {
    if (manualOverride) return

    const updateTheme = () => {
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        setTheme('morning')
      } else if (hour >= 12 && hour < 17) {
        setTheme('day')
      } else if (hour >= 17 && hour < 20) {
        setTheme('sunset')
      } else {
        setTheme('night')
      }
    }

    updateTheme()
    const interval = setInterval(updateTheme, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [manualOverride])

  // Set meal time manually (for recipe browsing)
  const setMealTime = (meal) => {
    if (!meal) {
      setManualOverride(null)
      return
    }
    
    const mealThemes = {
      breakfast: 'morning',
      brunch: 'morning',
      lunch: 'day',
      snack: 'day',
      dinner: 'sunset',
      'late-night': 'night'
    }
    
    setManualOverride(mealThemes[meal] || 'day')
    setTheme(mealThemes[meal] || 'day')
  }

  return (
    <TimeThemeContext.Provider value={{ theme, setTheme, setMealTime }}>
      {children}
    </TimeThemeContext.Provider>
  )
}

export function TimeBasedBackground() {
  const { theme } = useTimeTheme()
  const [stars, setStars] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prevTheme, setPrevTheme] = useState(theme)

  // Generate random stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 60,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        })
      }
      setStars(newStars)
    }
    generateStars()
  }, [])

  // Handle theme transitions
  useEffect(() => {
    if (theme !== prevTheme) {
      setIsTransitioning(true)
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setPrevTheme(theme)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [theme, prevTheme])

  const themeStyles = {
    morning: {
      background: 'linear-gradient(180deg, #87CEEB 0%, #FFF8DC 50%, #FFEFD5 100%)',
      sunPosition: { bottom: '20%', right: '15%' },
      sunScale: 0.8,
      moonVisible: false,
      starsVisible: false
    },
    day: {
      background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 40%, #F0F8FF 100%)',
      sunPosition: { top: '10%', right: '20%' },
      sunScale: 1,
      moonVisible: false,
      starsVisible: false
    },
    sunset: {
      background: 'linear-gradient(180deg, #2C3E50 0%, #E74C3C 30%, #F39C12 60%, #F1C40F 100%)',
      sunPosition: { bottom: '-5%', right: '30%' },
      sunScale: 1.2,
      moonVisible: true,
      moonPosition: { top: '15%', left: '20%' },
      starsVisible: true,
      starsOpacity: 0.3
    },
    night: {
      background: 'linear-gradient(180deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
      sunPosition: { bottom: '-20%', right: '30%' },
      sunScale: 0,
      moonVisible: true,
      moonPosition: { top: '10%', right: '15%' },
      starsVisible: true,
      starsOpacity: 1
    }
  }

  const currentStyle = themeStyles[theme] || themeStyles.day

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
        style={{ background: currentStyle.background }}
      />

      {/* Subtle overlay to ensure content readability */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          theme === 'night' ? 'bg-black/20' : 'bg-white/30'
        }`}
      />

      {/* Sun */}
      <div
        className="absolute transition-all duration-[2000ms] ease-in-out"
        style={{
          ...currentStyle.sunPosition,
          transform: `scale(${currentStyle.sunScale})`,
          opacity: currentStyle.sunScale > 0 ? 1 : 0
        }}
      >
        <div className="relative">
          {/* Sun glow */}
          <div 
            className="absolute w-32 h-32 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,200,50,0.4) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%'
            }}
          />
          {/* Sun body */}
          <div 
            className="w-16 h-16 rounded-full shadow-lg"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #FFF7AE 0%, #FFD93D 50%, #F4A100 100%)',
              boxShadow: '0 0 60px rgba(255,200,50,0.6), 0 0 100px rgba(255,150,50,0.3)'
            }}
          />
          {/* Sun rays */}
          {theme !== 'night' && (
            <div className="absolute inset-0 animate-spin-slow">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-6 bg-gradient-to-t from-yellow-400/60 to-transparent"
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: '50% 50%',
                    transform: `translateX(-50%) translateY(-150%) rotate(${i * 45}deg)`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Moon */}
      {currentStyle.moonVisible && (
        <div
          className="absolute transition-all duration-[2000ms] ease-in-out"
          style={{
            ...currentStyle.moonPosition,
            opacity: theme === 'night' ? 1 : 0.6
          }}
        >
          <div className="relative">
            {/* Moon glow */}
            <div 
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%'
              }}
            />
            {/* Moon body */}
            <div 
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle at 65% 35%, #FFFEF0 0%, #E8E8E0 50%, #D4D4C8 100%)',
                boxShadow: '0 0 30px rgba(255,255,255,0.4), inset -4px -2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {/* Moon craters */}
              <div 
                className="absolute w-2 h-2 rounded-full bg-gray-300/40"
                style={{ top: '20%', left: '30%' }}
              />
              <div 
                className="absolute w-3 h-3 rounded-full bg-gray-300/30"
                style={{ top: '50%', left: '60%' }}
              />
              <div 
                className="absolute w-1.5 h-1.5 rounded-full bg-gray-300/35"
                style={{ top: '70%', left: '25%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stars */}
      {currentStyle.starsVisible && (
        <div 
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{ opacity: currentStyle.starsOpacity }}
        >
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.5)`
              }}
            />
          ))}
        </div>
      )}

      {/* Shooting star (occasional) */}
      {theme === 'night' && <ShootingStar />}

      {/* Clouds for day/morning */}
      {(theme === 'day' || theme === 'morning') && (
        <div className="absolute inset-0 overflow-hidden">
          <Cloud className="top-[10%] animate-cloud-slow" style={{ left: '-10%' }} />
          <Cloud className="top-[25%] animate-cloud-medium" style={{ left: '20%' }} size="small" />
          <Cloud className="top-[5%] animate-cloud-fast" style={{ left: '60%' }} size="large" />
        </div>
      )}
    </div>
  )
}

// Cloud component
function Cloud({ className, style, size = 'medium' }) {
  const sizes = {
    small: 'w-16 h-6',
    medium: 'w-24 h-8',
    large: 'w-32 h-10'
  }

  return (
    <div 
      className={`absolute ${sizes[size]} ${className}`}
      style={style}
    >
      <div className="relative w-full h-full">
        <div className="absolute bottom-0 left-[20%] w-[40%] h-full bg-white/40 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[70%] bg-white/40 rounded-full" />
        <div className="absolute bottom-0 right-0 w-[35%] h-[70%] bg-white/40 rounded-full" />
      </div>
    </div>
  )
}

// Shooting star component
function ShootingStar() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const triggerShootingStar = () => {
      setPosition({
        x: Math.random() * 60 + 20,
        y: Math.random() * 30 + 5
      })
      setVisible(true)
      setTimeout(() => setVisible(false), 1000)
    }

    // Random interval between 5-15 seconds
    const scheduleNext = () => {
      const delay = Math.random() * 10000 + 5000
      return setTimeout(() => {
        triggerShootingStar()
        scheduleNext()
      }, delay)
    }

    const timeout = scheduleNext()
    return () => clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return (
    <div
      className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        boxShadow: '0 0 6px 2px rgba(255,255,255,0.8)'
      }}
    />
  )
}

// Demo control panel to showcase themes
export function ThemeDemoControls() {
  const { theme, setTheme } = useTimeTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { id: 'morning', label: '🌅 Morning', desc: 'Sunrise vibes' },
    { id: 'day', label: '☀️ Day', desc: 'Bright & clear' },
    { id: 'sunset', label: '🌇 Sunset', desc: 'Sun setting, moon rising' },
    { id: 'night', label: '🌙 Night', desc: 'Stars & moon' },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 hover:scale-110 transition-transform"
      >
        🎨
      </button>

      {/* Theme selector panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 w-56 border">
          <p className="text-xs font-semibold text-gray-500 mb-3">DEMO: Theme Preview</p>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  theme === t.id 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="block font-medium">{t.label}</span>
                <span className={`text-xs ${theme === t.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            Click 🌇 Sunset to see the animation!
          </p>
        </div>
      )}
    </div>
  )
}

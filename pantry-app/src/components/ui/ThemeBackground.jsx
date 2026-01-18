import { useState, useEffect, createContext, useContext } from 'react'

// Context to control Light/Dark theme
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  // Always dark mode
  const [theme] = useState('dark')

  // Apply dark class to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {}, isDark: true }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeBackground() {
  const { isDark } = useTheme()
  const [stars, setStars] = useState([])

  // Generate random stars for dark mode
  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 60; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 70,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        })
      }
      setStars(newStars)
    }
    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Light mode - Morning sky */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 30%, #E0F4FF 60%, #F8FCFF 100%)' 
        }}
      />

      {/* Dark mode - Night sky */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          background: 'linear-gradient(180deg, #0F0C29 0%, #302B63 40%, #24243E 70%, #1a1a2e 100%)' 
        }}
      />

      {/* Sun for light mode */}
      <div
        className={`absolute transition-all duration-1000 ease-in-out ${
          isDark ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'
        }`}
        style={{ top: '8%', right: '12%' }}
      >
        <div className="relative">
          {/* Sun glow */}
          <div 
            className="absolute w-40 h-40 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,200,50,0.3) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%'
            }}
          />
          {/* Sun body */}
          <div 
            className="w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #FFF7AE 0%, #FFD93D 50%, #F4A100 100%)',
              boxShadow: '0 0 60px rgba(255,200,50,0.5), 0 0 100px rgba(255,150,50,0.2)'
            }}
          />
          {/* Sun rays */}
          <div className="absolute inset-0 animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400/50 to-transparent"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: '50% 50%',
                  transform: `translateX(-50%) translateY(-180%) rotate(${i * 45}deg)`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clouds for light mode */}
      <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <Cloud className="top-[15%]" style={{ left: '-10%', animationDuration: '60s' }} />
        <Cloud className="top-[30%]" style={{ left: '30%', animationDuration: '45s' }} size="small" />
        <Cloud className="top-[8%]" style={{ left: '60%', animationDuration: '55s' }} size="large" />
        <Cloud className="top-[22%]" style={{ left: '10%', animationDuration: '70s' }} size="small" />
        <Cloud className="top-[12%]" style={{ left: '80%', animationDuration: '50s' }} size="medium" />
        <Cloud className="top-[35%]" style={{ left: '-5%', animationDuration: '65s' }} size="large" />
        <Cloud className="top-[5%]" style={{ left: '40%', animationDuration: '75s' }} size="small" />
        <Cloud className="top-[25%]" style={{ left: '70%', animationDuration: '58s' }} size="medium" />
      </div>

      {/* Birds for light mode */}
      {!isDark && <FlyingBirds />}

      {/* Moon for dark mode */}
      <div
        className={`absolute transition-all duration-1000 ease-in-out ${
          isDark ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'
        }`}
        style={{ top: '10%', right: '15%' }}
      >
        <div className="relative">
          {/* Moon glow */}
          <div 
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%'
            }}
          />
          {/* Moon body */}
          <div 
            className="w-14 h-14 rounded-full relative"
            style={{
              background: 'radial-gradient(circle at 65% 35%, #FFFEF0 0%, #E8E8E0 50%, #D4D4C8 100%)',
              boxShadow: '0 0 40px rgba(255,255,255,0.3), inset -4px -2px 10px rgba(0,0,0,0.1)'
            }}
          >
            {/* Moon craters */}
            <div className="absolute w-2 h-2 rounded-full bg-gray-300/40" style={{ top: '20%', left: '30%' }} />
            <div className="absolute w-3 h-3 rounded-full bg-gray-300/30" style={{ top: '50%', left: '55%' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-gray-300/35" style={{ top: '65%', left: '25%' }} />
          </div>
        </div>
      </div>

      {/* Stars for dark mode */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* Shooting star for dark mode */}
      {isDark && <ShootingStar />}

      {/* Subtle overlay for content readability */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        isDark ? 'bg-black/10' : 'bg-white/20'
      }`} />
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
      className={`absolute ${sizes[size]} ${className} animate-cloud`}
      style={style}
    >
      <div className="relative w-full h-full">
        <div className="absolute bottom-0 left-[20%] w-[40%] h-full bg-white/50 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[70%] bg-white/50 rounded-full" />
        <div className="absolute bottom-0 right-0 w-[35%] h-[70%] bg-white/50 rounded-full" />
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

// Flying birds component for light mode
function FlyingBirds() {
  const [birds, setBirds] = useState([])

  useEffect(() => {
    // Generate initial birds
    const generateBirds = () => {
      const newBirds = []
      for (let i = 0; i < 5; i++) {
        newBirds.push({
          id: i,
          top: 50 + Math.random() * 35, // Bottom half (50-85%)
          delay: Math.random() * 20,
          duration: 15 + Math.random() * 15, // 15-30s to cross
          size: 0.6 + Math.random() * 0.4, // Scale 0.6-1
          direction: Math.random() > 0.5 ? 1 : -1 // Left or right
        })
      }
      setBirds(newBirds)
    }
    generateBirds()
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {birds.map((bird) => (
        <div
          key={bird.id}
          className="absolute animate-bird-fly"
          style={{
            top: `${bird.top}%`,
            animationDelay: `${bird.delay}s`,
            animationDuration: `${bird.duration}s`,
            transform: `scale(${bird.size}) scaleX(${bird.direction})`,
            '--bird-direction': bird.direction
          }}
        >
          <Bird />
        </div>
      ))}
    </div>
  )
}

// Single bird SVG component
function Bird() {
  return (
    <svg
      width="24"
      height="12"
      viewBox="0 0 24 12"
      className="animate-bird-flap"
    >
      <path
        d="M0 6 Q6 0 12 6 Q18 0 24 6"
        fill="none"
        stroke="#374151"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Theme toggle button
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isDark 
          ? 'bg-slate-800/90 text-yellow-300 hover:bg-slate-700/90' 
          : 'bg-white/90 text-slate-700 hover:bg-white'
      } backdrop-blur-sm border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}

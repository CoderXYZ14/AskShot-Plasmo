import { useState, useEffect } from "react"
import { signIn, signOut, getCurrentUser, isAuthenticated } from "../utils/auth"

interface AuthButtonProps {
  onAuthChange?: (isAuthenticated: boolean) => void
}

export function AuthButton({ onAuthChange }: AuthButtonProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated()
        setAuthenticated(isAuth)
        
        if (isAuth) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        }
        
        if (onAuthChange) {
          onAuthChange(isAuth)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [onAuthChange])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const session = await signIn()
      const isAuth = !!session
      setAuthenticated(isAuth)
      
      if (isAuth && session?.user) {
        setUser(session.user)
      }
      
      if (onAuthChange) {
        onAuthChange(isAuth)
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      setAuthenticated(false)
      setUser(null)
      
      if (onAuthChange) {
        onAuthChange(false)
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <button 
        disabled
        className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        <div className="w-4 h-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin" />
        Loading...
      </button>
    )
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl bg-white/70 text-gray-700 border border-white/40">
          {user.image && (
            <img 
              src={user.image} 
              alt={user.name || "User"} 
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="truncate max-w-[100px]">
            {user.name || user.email || "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="relative px-3 py-1.5 text-sm font-medium rounded-xl text-white overflow-hidden transition-all hover:shadow-lg group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 transition-transform group-hover:scale-[1.1] duration-300" />
          <span className="relative">Logout</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="relative px-3 py-1.5 text-sm font-medium rounded-xl text-white overflow-hidden transition-all hover:shadow-lg group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-[1.1] duration-300" />
      <span className="relative">Login with Google</span>
    </button>
  )
}

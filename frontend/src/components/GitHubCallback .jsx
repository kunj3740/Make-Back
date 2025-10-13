import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { BACKEND_URL } from "../config"

export const GitHubCallback = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        const state = urlParams.get("state")
        
        console.log("GitHub callback received:", { code: !!code, state })
        
        if (!code || !state) {
          console.error("Missing code or state parameter")
          toast.error("Authentication failed: Missing parameters")
          navigate("/signin")
          return
        }
        
        // Check stored state
        const storedState = localStorage.getItem("github_oauth_state") || 
                           sessionStorage.getItem("github_oauth_state")
        
        console.log("State validation:", { received: state, stored: storedState })
        
        if (!storedState) {
          console.error("No stored state found")
          toast.error("Authentication failed: Session expired")
          navigate("/signin")
          return
        }
        
        if (state !== storedState) {
          console.error("State mismatch")
          toast.error("Authentication failed: Invalid session")
          localStorage.removeItem("github_oauth_state")
          sessionStorage.removeItem("github_oauth_state")
          navigate("/signin")
          return
        }
        
        // Clean up stored state
        localStorage.removeItem("github_oauth_state")
        sessionStorage.removeItem("github_oauth_state")
        
        // Show loading toast
        toast.loading("Authenticating with GitHub...")
        
        console.log("Sending to backend:", { code, redirect_uri: `${window.location.origin}/auth/github/callback` })
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication timeout')), 30000)
        })
        
        // Call backend
        const apiCall = axios.post(`${BACKEND_URL}/api/v1/user/github-auth`, {
          code,
          redirect_uri: `${window.location.origin}/auth/github/callback`
        }, {
          timeout: 25000
        })
        
        const res = await Promise.race([apiCall, timeoutPromise])
        
        toast.dismiss()
        toast.success("Successfully logged in with GitHub!")
        
        // Store token and redirect
        localStorage.setItem("token", res.data.token)
        navigate("/projects")
        
      } catch (err) {
        console.error("GitHub auth error:", err)
        console.error("Error response:", err.response?.data)
        
        toast.dismiss()
        
        let errorMessage = "GitHub authentication failed"
        if (err.message === 'Authentication timeout') {
          errorMessage = "Authentication timed out. Please try again."
        } else if (err.response?.status === 500) {
          errorMessage = "Server error. Please check backend configuration."
        } else if (err.response?.data?.message) {
          errorMessage = `Authentication failed: ${err.response.data.message}`
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = "Cannot connect to server. Please check if backend is running."
        }
        
        toast.error(errorMessage)
        navigate("/signin")
      }
    }
    
    // Prevent double execution in React StrictMode
    const processingKey = "github_callback_processing"
    if (!sessionStorage.getItem(processingKey)) {
      sessionStorage.setItem(processingKey, "true")
      handleCallback().finally(() => {
        sessionStorage.removeItem(processingKey)
      })
    }
    
    // Auto-redirect after 45 seconds if stuck
    const timer = setTimeout(() => {
      console.warn("Callback processing took too long, redirecting...")
      toast.dismiss()
      toast.error("Authentication took too long. Please try again.")
      navigate("/signin")
    }, 45000)

    return () => clearTimeout(timer)
  }, [navigate])
  
  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-white mx-auto mb-4 rounded-full"></div>
        <p className="text-lg font-medium">Processing GitHub authentication...</p>
        <p className="text-sm text-gray-400 mt-2">This shouldn't take more than a few seconds</p>
      </div>
    </div>
  )
}
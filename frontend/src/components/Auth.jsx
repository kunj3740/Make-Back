import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-hot-toast"
import { GoogleLogin } from "@react-oauth/google"
import { BACKEND_URL } from "../config"

export default function Auth({ type }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  })

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
  // Fixed: Use consistent redirect URI that matches your GitHub OAuth app settings
  const REDIRECT_URI = `${window.location.origin}/auth/github/callback`

  // Handle GitHub callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    // Fixed: Check for the correct callback path and prevent double execution
    if (code && (window.location.pathname === "/auth/github/callback" || window.location.pathname === "/signin")) {
      // Use a more specific flag to prevent double execution
      const processingFlag = `github_processing_${code}_${state}`
      const isProcessing = sessionStorage.getItem(processingFlag)
      
      if (!isProcessing) {
        sessionStorage.setItem(processingFlag, "true")
        handleGithubCallback(code, state).finally(() => {
          // Clean up the specific processing flag
          sessionStorage.removeItem(processingFlag)
        })
      }
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      toast.loading("Authenticating...")
      const endpoint = type === "signup" ? "signup" : "signin"
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/${endpoint}`, formData)

      toast.dismiss()
      toast.success("Success!")
      localStorage.setItem("token", res.data)
      navigate("/projects")
    } catch {
      toast.dismiss()
      toast.error("Authentication error")
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      toast.loading("Google Authentication in progress")
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/google-auth`, {
        token: credentialResponse.credential,
      })

      toast.dismiss()
      toast.success("Logged in with Google!")
      localStorage.setItem("token", res.data.token)
      navigate("/projects")
    } catch {
      toast.dismiss()
      toast.error("Google login failed")
    }
  }

  const handleGoogleError = () => toast.error("Google sign-in failed")

  // GitHub login flow
  const handleGithubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      toast.error("GitHub not configured")
      return
    }

    // Fixed: Generate a more secure state parameter
    const state = btoa(crypto.randomUUID() + Date.now())
    localStorage.setItem("github_oauth_state", state)

    // Fixed: Add more specific scopes if needed
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=user:email&state=${state}&allow_signup=true`

    console.log("Redirecting to GitHub with state:", state) // Debug log
    window.location.href = githubAuthUrl
  }
  // GitHub callback
  const handleGithubCallback = async (code, state) => {
    console.log("GitHub callback received:", { code: !!code, state }) // Debug log
    console.log("Current localStorage keys:", Object.keys(localStorage)) // Debug log
    
    const storedState = localStorage.getItem("github_oauth_state")
    console.log("Stored state:", storedState) // Debug log
    
    // Check if we're in an environment where localStorage works
    if (typeof Storage === "undefined") {
      console.error("localStorage not supported")
      toast.error("Browser storage not supported")
      navigate("/signin")
      return
    }
    
    // Try to recover state from sessionStorage as fallback
    if (!storedState) {
      const sessionState = sessionStorage.getItem("github_oauth_state")
      if (sessionState) {
        console.log("Found state in sessionStorage:", sessionState)
        localStorage.setItem("github_oauth_state", sessionState)
        sessionStorage.removeItem("github_oauth_state")
      }
    }
    
    const finalStoredState = localStorage.getItem("github_oauth_state")
    
    // Fixed: More detailed state validation
    if (!finalStoredState) {
      console.error("No stored state found in localStorage or sessionStorage")
      toast.error("Authentication error: Session expired. Please try again.")
      navigate("/signin")
      return
    }

    if (!state) {
      console.error("No state parameter received")
      toast.error("Authentication error: No state parameter")
      localStorage.removeItem("github_oauth_state")
      navigate("/signin")
      return
    }

    if (state !== finalStoredState) {
      console.error("State mismatch:", { received: state, stored: finalStoredState })
      toast.error("Authentication error: Invalid state parameter")
      localStorage.removeItem("github_oauth_state")
      navigate("/signin")
      return
    }

    // Clean up state immediately after validation
    localStorage.removeItem("github_oauth_state")
    sessionStorage.removeItem("github_oauth_state")

    try {
      toast.loading("GitHub Authentication in progress")

      console.log("Sending to backend:", { code, redirect_uri: REDIRECT_URI }) // Debug log

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 30000) // 30 second timeout
      })

      // send code to backend (backend will exchange for access_token)
      const apiCall = axios.post(`${BACKEND_URL}/api/v1/user/github-auth`, {
        code,
        redirect_uri: REDIRECT_URI,
      }, {
        timeout: 25000 // 25 second axios timeout
      })

      const res = await Promise.race([apiCall, timeoutPromise])

      toast.dismiss()
      toast.success("Logged in with GitHub!")
      localStorage.setItem("token", res.data.token)

      // clean URL and navigate
      window.history.replaceState({}, document.title, "/projects")
      navigate("/projects")
    } catch (err) {
      console.error("GitHub auth error:", err)
      console.error("Error response:", err.response?.data) // More detailed error logging
      toast.dismiss()
      
      let errorMessage = "GitHub login failed"
      if (err.message === 'Authentication timeout') {
        errorMessage = "Authentication timed out. Please try again."
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please check your backend configuration."
      } else if (err.response?.data?.message) {
        errorMessage = `GitHub login failed: ${err.response.data.message}`
      }
      
      toast.error(errorMessage)
      navigate("/signin")
    }
  }

  // Callback logic is now handled by separate GitHubCallback component
  // Remove the callback loading screen from here since we have a dedicated component
  
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="w-full max-w-md mt-10 relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <div className="w-7 h-7 border-2 border-white rounded-sm"></div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {type === "signup" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                {type === "signup" ? "Join the future of technology" : "Access your digital workspace"}
              </p>
            </div>

            {type === "signup" && (
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                icon="👤"
              />
            )}

            <InputField
              label="Email Address"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="you@company.com"
              icon="✉️"
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              icon="🔒"
            />

            <button
              onClick={handleSubmit}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="flex items-center justify-center">
                {type === "signup" ? "Create Account" : "Sign In"}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <p className="text-sm mt-6 text-center text-gray-400">
              {type === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <Link
                to={type === "signup" ? "/signin" : "/signup"}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                {type === "signup" ? "Sign In" : "Create Account"}
              </Link>
            </p>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              <span className="px-4 text-sm text-gray-500">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>
            
            <div className="flex flex-col space-y-3">
              {/* Google OAuth */}
              <div className="bg-white/10 p-3 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 hover:shadow-md hover:shadow-blue-500/20">
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={handleGoogleError} 
                  useOneTap 
                  theme="filled_blue"
                  size="medium"
                  text={type === "signup" ? "signup_with" : "signin_with"}
                  shape="pill"
                />
              </div>

              {/* GitHub OAuth */}
              <button
                onClick={handleGithubLogin}
                className="w-full bg-gray-700/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-gray-500/20 flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, type = "text", icon }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">{icon}</span>
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-gray-800/70 text-sm"
        />
      </div>
    </div>
  )
}
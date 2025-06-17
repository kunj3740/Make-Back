import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast, Toaster } from "react-hot-toast"
import { GoogleLogin } from '@react-oauth/google'
import { BACKEND_URL } from "../config"

export default function Auth({ type }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async () => {
    try {
      toast.loading("Authenticating...")
      const endpoint = type === "signup" ? "signup" : "signin"
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/${endpoint}`, formData)

      if (!response) return toast.error("Authentication failed")

      toast.dismiss()
      toast.success("Success!")
      localStorage.setItem("token", response.data)
      navigate("/projects")
    } catch (err) {
      toast.dismiss()
      toast.error("Authentication error")
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      toast.loading("Google Authentication in progress")
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/google-auth`, {
        token: credentialResponse.credential,
      })

      if (!response) return toast.error("Google auth failed")

      toast.dismiss()
      toast.success("Logged in with Google!")
      localStorage.setItem("token", response.data.token)
      navigate("/projects")
    } catch (err) {
      toast.dismiss()
      toast.error("Google login failed")
    }
  }

  const handleGoogleError = () => {
    toast.error("Google sign-in was unsuccessful. Please try again.")
  }

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
            
            <div className="flex justify-center">
              <div className="bg-white/10 p-3 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 hover:shadow-md hover:shadow-blue-500/20 w-full max-w-sm">
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
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Auth from '../components/Auth'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export const Signup = () => {
  return (
    <div>
        <GoogleOAuthProvider clientId={clientId}>
            <Auth type={"signup"} />
        </GoogleOAuthProvider>
    </div>
  )
}

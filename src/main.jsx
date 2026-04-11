import React from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('placeholder')) {
  root.render(
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0a0f1d', 
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Missing Clerk Configuration</h1>
      <p style={{ maxWidth: '500px', lineHeight: '1.6', color: '#94a3b8' }}>
        The <code>VITE_CLERK_PUBLISHABLE_KEY</code> is missing or set to a placeholder in your <code>.env</code> file.
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px',
        textAlign: 'left',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>To fix this:</p>
        <ol style={{ marginLeft: '1.5rem', color: '#cbd5e1' }}>
          <li>Get your key from the <a href="https://dashboard.clerk.com" target="_blank" style={{ color: '#3b82f6' }}>Clerk Dashboard</a></li>
          <li>Add it to your <code>.env</code> file:</li>
        </ol>
        <pre style={{ 
          background: '#000', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem',
          color: '#10b981'
        }}>
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </pre>
      </div>
    </div>
  )
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </React.StrictMode>
  )
}

// import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { apolloClient } from './lib/apolloClient'
import { initializeCacheSystem } from './lib/cache'
import App from './App.tsx'
import './index.css'

// Initialize cache system
initializeCacheSystem()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <App />
        <Toaster position="top-right" />
      </ThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
)
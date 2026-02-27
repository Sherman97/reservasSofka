import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { ThemeProvider } from './core/adapters/providers/ThemeContext'
import { DependencyProvider } from './core/adapters/providers/DependencyProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DependencyProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </DependencyProvider>
  </StrictMode>,
)

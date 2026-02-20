import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { DependencyProvider } from './core/adapters/providers/DependencyProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DependencyProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </DependencyProvider>
  </StrictMode>,
)

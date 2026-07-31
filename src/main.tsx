import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Esconde splash depois que o React montou
requestAnimationFrame(() => {
  const splash = document.getElementById('mc-splash')
  if (!splash) return
  setTimeout(() => {
    splash.classList.add('out')
    setTimeout(() => splash.remove(), 450)
  }, 600)
})

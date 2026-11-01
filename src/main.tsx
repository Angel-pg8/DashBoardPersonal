import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { db } from './db/database'
import { seedDefaultCategories } from './db/seed'

void seedDefaultCategories(db).catch((error: unknown) => {
  console.error('No se pudieron preparar las categorías iniciales.', error)
})

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

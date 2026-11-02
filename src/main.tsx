import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { db } from './db/database'
import { seedDefaultAccounts, seedDefaultCategories } from './db/seed'

async function start(): Promise<void> {
  try {
    await Promise.all([seedDefaultCategories(db), seedDefaultAccounts(db)])
  } catch (error: unknown) {
    console.error('No se pudieron preparar los datos iniciales.', error)
  }
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
}

void start()

import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, type AppRoute } from './Navigation'

describe('Navigation items', () => {
  it('contiene exactamente las 3 rutas existentes de la aplicación', () => {
    const routeIds: AppRoute[] = NAV_ITEMS.map((item) => item.id)
    expect(routeIds).toEqual(['home', 'finance', 'more'])
  })

  it('asigna un icono representativo y válido de Lucide a cada pestaña', () => {
    for (const item of NAV_ITEMS) {
      expect(item.icon).toBeDefined()
      expect(typeof item.icon === 'function' || typeof item.icon === 'object').toBe(true)
    }
  })

  it('mantiene etiquetas de texto claras y accesibles para cada pestaña', () => {
    const labels = NAV_ITEMS.map((item) => item.label)
    expect(labels).toEqual(['Inicio', 'Finanzas', 'Más'])
  })

  it('no contiene rutas vacías o identificadores duplicados', () => {
    const ids = NAV_ITEMS.map((item) => item.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(NAV_ITEMS.length)
  })
})

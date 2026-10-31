# DESIGN.md — Sistema de diseño del Dashboard de vida

> Fuente de verdad visual. Todo componente nuevo debe salir de estos tokens.
> Marcas: **[Decidido]** lo eligió Ángel · **[Propuesto]** sugerido, pendiente de confirmar.
> Si un skill de diseño (Impeccable, Taste) contradice este archivo, **gana este archivo**.

## 1. Identidad [Decidido]
Misma identidad que https://angel-pg8.github.io/Pagina-web-personal/ : base oscura, títulos enormes y pesados, texto atenuado, hexágono decorativo, tono directo.

### Tokens base
```css
@theme {
  --color-black: #050505;
  --color-charcoal: #101112;
  --color-lead: #1b1d20;
  --color-graphite: #272a2f;
  --color-soft: #f5f5f0;
  --color-white: #ffffff;
  --color-muted: #b9bbb8;
  --color-line: rgba(255, 255, 255, 0.13);

  --color-income: #5fd39a;   /* ingreso */
  --color-expense: #ff6b81;  /* gasto */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --font-sans: "Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif;
}
```
No introducir colores fuera de esta lista salvo los de "Color por hora del día".

## 2. Tipografía [Decidido]
- **Inter Variable instalada localmente** (`@fontsource-variable/inter`). Nunca Google Fonts por CDN (la app debe funcionar offline).
- Esto **anula** cualquier regla de skill que diga "no uses Inter": aquí Inter es la identidad.
- Títulos de pantalla: peso 820, `line-height: 0.95`, `clamp()` adaptado a móvil (el 6rem de la web de marca es solo para escritorio; en iPhone máximo ~2.6rem).
- Cuerpo: peso 400–500, `line-height: 1.6`, color `--color-muted` para texto secundario y `--color-soft` para el principal.
- **Cifras de dinero y tiempo**: `font-variant-numeric: tabular-nums;` siempre.
- Tamaño mínimo de texto legible: 14px (16px en inputs, para que iOS no haga zoom al enfocar).

## 3. Fondo y superficies
- Fondo de app: degradado `155deg` de `--black` a `--charcoal` y de vuelta, **estático**.
- Superficies: `--charcoal` y `--lead`; bordes de 1px con `--line`. Evitar tarjetas dentro de tarjetas.
- Esquinas: radio 14px en tarjetas, 10px en controles, 999px en chips.
- Sombras: casi ninguna. La jerarquía se logra con tono de superficie y borde, no con sombras grandes.
- **Hexágono** (`clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)`): logo de la app, fondo del icono PWA y un detalle decorativo en la pantalla de inicio con opacidad ~0.12–0.16. Estático.
- Nada de resplandor que sigue al cursor en la app (no hay cursor en touch y cuesta rendimiento).

## 4. Color por hora del día [Propuesto]
La base oscura no cambia. Solo cambia el **acento** (botones principales, foco, énfasis, un tinte muy leve en el hexágono) según la hora local.

| Franja | Horas | `data-tone` | `--accent` | Sensación |
|---|---|---|---|---|
| Mañana | 05:00–11:59 | `morning` | `#f2c879` | ámbar cálido |
| Tarde | 12:00–17:59 | `day` | `#7cc4e8` | azul cielo |
| Atardecer | 18:00–20:59 | `dusk` | `#f0956b` | coral |
| Noche | 21:00–04:59 | `night` | `#9db4e6` | azul lavanda tenue |

Reglas:
- Se implementa con un atributo `data-tone` en `<html>` y variables CSS (`--accent`, `--accent-soft`). **Cero JS en cada render**: se calcula al abrir la app, al volver a primer plano (`visibilitychange`) y como mucho una vez por minuto.
- Texto sobre fondo de acento: siempre `--color-black`.
- Todos los acentos deben cumplir contraste AA contra `--black` y `--charcoal`. Si se ajusta un valor, verificarlo.
- Transición de color opcional y corta (≤400 ms), solo en `color`/`background-color` de pocos elementos.
- Ajuste manual en Configuración: Automático / fijar una franja.
- Los colores de ingreso/gasto **no cambian** con la hora.

## 5. Layout y navegación [Decidido: comodidad primero]
- Pensado para **iPhone a una mano**: navegación inferior fija con 4–5 destinos como máximo (Inicio, Finanzas, Tareas, Pomodoro, Más).
- Respetar `env(safe-area-inset-*)` y `viewport-fit=cover`.
- Objetivos táctiles de **mínimo 44×44 px**.
- Acción principal (por ejemplo "Agregar gasto") alcanzable con el pulgar, abajo a la derecha o centrada sobre la barra.
- **Inicio** muestra lo más usado: resumen del mes (gastado / presupuesto restante), tarea actual con acceso directo al Pomodoro, y botón rápido de "Agregar gasto".
- Registrar un gasto: máximo 3 toques (monto → categoría → guardar). Fecha de hoy por defecto.
- En PC (≥1024px): barra lateral en lugar de inferior, mismo contenido.

## 6. Componentes base (crear una vez, reutilizar)
Button (primary/secondary/ghost), IconButton, Card, ListItem, Input/Amount input, Chip, Tabs, BottomNav, SideNav, EmptyState, Dialog/Sheet inferior. Cada uno con estados: normal, foco visible, presionado, deshabilitado, cargando y error cuando aplique.

## 7. Movimiento [Decidido: bajo y barato]
- Dial de movimiento **bajo**. La app se siente rápida, no llamativa.
- **Solo animar `transform` y `opacity`.** Prohibido animar `width`, `height`, `top`, `left`, `margin` o `box-shadow`.
- Duración 150–250 ms, easing `--ease-out`. Entradas de pantalla y sheets inferiores son lo principal; nada más.
- Sin animaciones infinitas en pantallas de trabajo. Sin parallax. Sin animar fondos.
- `backdrop-filter` y blur grandes: evitar. Máximo uno, pequeño, y solo si aporta.
- `will-change` solo durante la animación, nunca permanente.
- Respetar `prefers-reduced-motion: reduce` (quitar movimientos, mantener cambios de estado).
- Preferir CSS puro. No instalar GSAP ni librerías de animación sin aprobación.
- Pomodoro: actualizar el texto una vez por segundo. Sin `requestAnimationFrame` continuo.

## 8. Accesibilidad [Decidido: WCAG 2.2 AA]
- Contraste de texto ≥ 4.5:1 (3:1 en texto grande y componentes).
- Foco visible en todo elemento interactivo (anillo con `--accent`).
- No transmitir información solo con color (ingreso/gasto además llevan signo + / − e icono).
- Etiquetas reales en inputs; botones con nombre accesible.
- Mensajes de error claros y junto al campo.

## 9. Escritura de la interfaz
Español, directo, sin relleno ni signos de exclamación innecesarios. Botones con verbos ("Guardar gasto", no "Aceptar"). Estados vacíos que digan qué hacer ("Aún no hay gastos este mes. Agrega el primero.").

## 10. Qué NO tocar
- Los tokens base de la sección 1.
- La fuente Inter y los pesos de título.
- El hexágono como elemento de marca.
- La regla de navegación inferior y el máximo de 3 toques para registrar un gasto.
- Los colores semánticos de ingreso y gasto.

## 11. Anti-patrones a evitar
Gradientes morado-azul genéricos, tarjetas idénticas en cuadrícula sin jerarquía, iconos decorativos sin función, texto gris sobre fondos de color, sombras difusas grandes, emojis como iconos de interfaz, bordes izquierdos de color en tarjetas, textos centrados en bloques largos.

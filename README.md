# React + Vite

# Front Padel (React)

SPA para autenticación y navegación con rutas protegidas por rol (USER/ADMIN) y flujo de reservas.  
Stack: **React 19.2**, **React Router DOM 7.13**, **Vite**.

---

## Mini-introducción a React (cómo pensar el proyecto)

En React, cada componente es una **función** que se ejecuta para calcular el JSX (la UI). A eso se le llama **render**.

Idea mental clave:

```
Evento (click/submit) -> setState(...) -> nuevo render -> (si toca) useEffect
```

- **Render**: debe ser “puro” (calcular UI). Se ejecuta cada vez que cambia el estado/props.
- **useEffect**: se ejecuta **después** de pintar. Ideal para side effects: llamadas al backend, sincronización, etc.

Hooks típicos que verás en el proyecto:
- **useState**: estado local que provoca re-render cuando cambia (form, loading, errores…).
- **useEffect**: carga inicial (`[]`) o recargas cuando cambian dependencias (`[fecha]`, etc.).
- **useMemo**: memoriza cálculos derivados (ordenar, agrupar) para no recomputar en cada render.
- **useRef**: guarda valores entre renders sin re-render (timers/debounce, flags internas).

> Nota: en desarrollo, `React.StrictMode` puede ejecutar algunos ciclos “extra” para ayudarte a detectar efectos no idempotentes.

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

Build/preview:

```bash
npm run build
npm run preview
```

---

## Variables de entorno (backend)

El front usa:

- `VITE_API_BASE_URL`

Crea `.env` (dev) o `.env.production` (prod) en la raíz:

```env
VITE_API_BASE_URL=https://TU_BACKEND_URL
```

---

## Rutas y roles (resumen)

- Públicas: `/`, `/login`, `/register`, `/forbidden`
- Protegidas:
  - `/app/...` → USER y ADMIN
  - `/admin/...` → solo ADMIN

Las rutas protegidas se controlan con `ProtectedRoute` (redirige a `/login` si no hay usuario o a `/forbidden` si no hay permisos).

---

## Deploy a GitHub Pages (Vite + gh-pages)

1) `vite.config.js` (importante el `base`):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/front-padel/",
});
```

2) Instalar y scripts:

```bash
npm i -D gh-pages
```

`package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3) Publicar:

```bash
npm run deploy
```

4) GitHub → Settings → Pages:
- Source: **Deploy from a branch**
- Branch: **gh-pages** / **(root)**

URL:
`https://TU_USUARIO.github.io/front-padel/`

---

## Nota sobre React Router en Pages (404 al refrescar)

Con `BrowserRouter` puede dar 404 al recargar rutas profundas.  
Solución simple: usar `HashRouter` (URLs con `/#/`), o mantener `BrowserRouter` con `basename={import.meta.env.BASE_URL}` y configurar fallback.

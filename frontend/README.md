# Frontend Structure Overview

This frontend uses Vite + Vue + TypeScript. The `src` directory is organized by responsibility to make future feature work predictable:

- `pages/` – top-level views that represent full screens. `HomePage.vue` mirrors the original landing content and wires in shared components.
- `components/` – reusable UI blocks. `HealthCheckPanel.vue` encapsulates the backend health fetch logic and can be reused by additional pages.
- `router/` – navigation configuration. `index.ts` defines the default route and is the single place to register future routes.
- `styles/` – global styles applied once from `base.css` to keep typography and spacing consistent across pages.
- `App.vue` – root shell that renders what the router provides, keeping the bootstrap layer slim.
- `main.ts` – application entry point responsible for mounting the app and importing the shared router and styles.

## Adding New Features

1. Create a page component inside `pages/`.
2. Register the page inside `router/index.ts`.
3. Factor any reusable UI into `components/`.
4. Extend shared look-and-feel in `styles/base.css` when you need app-wide changes.

Following this flow keeps new functionality isolated and prevents regressions to the existing health-check experience.

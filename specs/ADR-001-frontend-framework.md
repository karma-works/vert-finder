# ADR-001: Frontend Framework (React 18 + TypeScript)

**Status:** Decided

**Date:** 2026-06-20

## Context

UTM Height Training is a web app that needs:
- An interactive map with pan, zoom, and layer controls
- Filter controls (elevation gain range slider, location search)
- Route detail panels with dynamic content
- Responsive UI (works on desktop and mobile browsers)
- Type safety to catch data bugs early (routes are complex geographic objects)

### Alternatives considered:

**A) React 18 + TypeScript + Vite** (chosen)
- Pros: Standard for interactive UIs, excellent React ecosystem (leaflet bindings, chart libraries), strong type safety
- Cons: Bundle size ~35 KB (gzipped), requires React knowledge

**B) Vanilla JavaScript + Web Components**
- Pros: No framework, smallest bundle, zero abstraction overhead
- Cons: State management becomes manual and error-prone; harder to maintain as features grow (saved routes, user preferences)

**C) Vue 3 + TypeScript**
- Pros: Slightly smaller bundle than React, similar features
- Cons: Smaller ecosystem for geospatial libraries; react-leaflet is more mature than vue-leaflet

**D) Svelte + TypeScript**
- Pros: Smallest bundle (~15 KB), compile-to-JavaScript approach
- Cons: Immature ecosystem for maps; Svelte-leaflet is not as battle-tested as react-leaflet

## Decision

Use **React 18 + TypeScript + Vite**.

- React 18 for the UI framework
- TypeScript for type safety (catch geographic data bugs early)
- Vite for the build tool (fast dev loop, optimized production builds)

## Rationale

1. **Ecosystem maturity:** React has the most mature Leaflet bindings (react-leaflet), charting libraries (Recharts), and date/utility libraries. This is important for a geospatial tool with complex data structures.

2. **Type safety:** TypeScript prevents runtime errors when handling route objects, elevation arrays, and geographic coordinates. A single error (e.g., passing latitude instead of longitude) can break the map. TypeScript catches these at compile time.

3. **State management:** React's built-in useState/useContext is sufficient for the MVP (location, elevation gain filter, selected route). No Redux bloat.

4. **Fast iteration:** Vite's hot module reload (HMR) means you can tweak map controls and filters and see changes in <100ms. Crucial for rapid prototyping.

5. **Hiring/collaboration:** React developers are abundant. If you need to hire or collaborate, React knowledge is common.

## What This Option Does NOT Do Well

- **Bundle size:** React adds overhead compared to vanilla JS. For users on slow connections (2G/3G), the initial load time may be noticeable (~2–3 seconds to download, parse, and render).
  - **Mitigation:** Use code splitting and lazy loading. Load map and charts only after user confirms their location.

- **Server-side rendering (SSR):** React is client-side only. The page is blank until React hydrates. This hurts SEO.
  - **Mitigation:** Not a problem for a utility tool. Users don't search for "elevation gain finder" in Google; they search in Reddit or ultra forums and find the link directly.

- **Performance on old devices:** Parsing React and executing JavaScript on a 5-year-old phone will be slow.
  - **Mitigation:** This is acceptable for MVP. If mobile experience is critical, optimize later with lazy loading and code splitting.

## Consequences

1. **DevOps:** You'll need Node.js tooling. `npm install`, `npm run dev`, `npm run build`. Standard for any React project.

2. **Testing:** Vitest + React Testing Library are the standard testing tools. Not required for MVP, but expected for production code.

3. **Type coverage:** Aim for >80% TypeScript coverage. The remaining 20% (third-party libraries without types) is acceptable.

4. **Build size:** Production bundle will be ~100–150 KB gzipped (React + Leaflet + Recharts). Acceptable for 2025.

5. **Training:** Team members need React experience (or be willing to learn). Vanilla JS developers can pick it up in 1–2 weeks.

## Related Decisions

- **ADR-003:** Choice of Vite as bundler (depends on React)
- **ADR-002:** Choice of Leaflet + react-leaflet (depends on React ecosystem)
- **ADR-004:** Choice of Recharts for elevation chart (depends on React)

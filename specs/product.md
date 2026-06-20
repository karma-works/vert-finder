# Product Specification: UTM Height Training

## Current MVP Direction

The discovery unit is a **useful trail-network segment**, not a complete curated route. Users search worldwide, filter nearby segments by elevation gain, select one or more segments, and inspect combined distance and ascent. Combined selections may be disconnected; the UI states this explicitly. Zurich and Bülach with 10 km radii are the primary validation areas.

This direction replaces references below to bundled regional route files. See [ADR-006](ADR-006-worldwide-live-data.md) for the implemented data flow.

## User Types and Permissions

| User Type | Primary Goal | Trust Level | MVP Scope |
|-----------|--------------|-------------|-----------|
| Ultra runner (new to region) | Find a route by elevation gain | Low friction, no auth | Full access |
| Event organizer / guide | Scout training routes in bulk | Low friction, no auth | Full access (same as runner) |
| Admin | Monitor data quality, manage regions | Internal only | Out of MVP scope |

**Auth assumption for MVP:** None. Public, static site. No login. This trades away personalization (saved routes, history) for radical simplicity.

---

## Core User Flows

### Flow 1: Find a Route (Primary)

**User:** Ultra runner arriving in a new city.

**Goal:** Find a route with 1,200m elevation gain, runnable in 45 minutes.

**Steps:**

1. Load app. Land on a map view centered on a default location (e.g., Boulder, CO).
2. Search for a new location: type city name or coordinates (e.g., "Chamonix") → map recenters.
3. Optionally adjust search radius (default 30 km) via dropdown or slider.
4. Set elevation gain filter: choose a range (e.g., 1,000–1,400 m) via slider or number input.
5. Routes matching the filter appear on the map as line segments or markers.
6. Click a route → detail panel appears showing:
   - Route name (if available from OSM)
   - Total elevation gain, distance
   - Elevation profile (chart: distance vs. elevation)
   - Path on map (highlighted)
7. Decide: Does this work? If yes, open in mapping app (e.g., Apple Maps, Google Maps, or export as GPX). If no, click another route.

**Exit:** Runner has a route and heads out to train.

### Flow 2: Explore Routes by Map (Secondary)

**User:** Runner wants to browse the region visually before committing to elevation gain.

**Goal:** See what's available in the area without a specific gain filter.

**Steps:**

1. Load app, search location (same as Flow 1, steps 1–3).
2. Skip the gain filter (leave it at "show all").
3. Routes appear as a density heatmap or markers on the map.
4. Pan and zoom the map to explore.
5. Click a route to see gain, distance, profile (same as Flow 1, step 6).

**Exit:** Same as Flow 1.

---

## Feature List (MVP vs. Post-MVP)

| Feature | User Type | MVP | Post-MVP | Notes |
|---------|-----------|-----|----------|-------|
| Location search (city or coordinates) | Ultra runner | ✓ | — | Reverse geocoding or typed search |
| Elevation gain filter (range) | Ultra runner | ✓ | — | Slider or text input for min/max |
| Map display | Ultra runner | ✓ | — | OSM base layer, routes as vectors |
| Route detail view | Ultra runner | ✓ | — | Gain, distance, elevation profile |
| Elevation profile chart | Ultra runner | ✓ | — | Distance vs. elevation; identify steep sections |
| Radius configuration | Ultra runner | ✓ | — | Dropdown or settings toggle (not prominent) |
| Export route (GPX/KML) | Ultra runner | ✗ | ✓ | Opens path in Apple Maps / Google Maps instead (MVP) |
| Save/favorite routes | Ultra runner | ✗ | ✓ | Requires local storage or account |
| Route difficulty badge | Ultra runner | ✗ | ✓ | Technical rating, runability assessment |
| Terrain type overlay | Ultra runner | ✗ | ✓ | Road vs. trail vs. single-track |
| Weather integration | Ultra runner | ✗ | ✓ | Forecast for search location |
| User accounts / history | Ultra runner | ✗ | ✓ | Saved locations, past searches |
| Mobile app | Ultra runner | ✗ | ✓ | React Native or native iOS/Android |
| Admin panel | Admin | ✗ | ✓ | Monitor region coverage, data freshness |
| Bulk route upload (for organizers) | Event organizer | ✗ | ✓ | For race prep, scouting |

---

## Monetization Hypothesis

**MVP:** Free. Public good. No monetization.

**Rationale:** The MVP is a tool, not a product with a captive audience. Ultra runners are not in a captive market — they have free alternatives (manual map reading, Strava, Google Maps). The best strategy is to nail the core problem (route discovery by gain) so well that the tool becomes indispensable, *then* think about monetization.

**Post-MVP revenue hypotheses (unproven; do NOT build for these yet):**

1. **Premium features:** GPX export, saved routes, weather integration. Pay-once ($2–5) or subscription ($1–2/mo).
   - **Risk:** Ultra runners are not used to paying for route data. This may not work.

2. **Partnerships:** Gear sponsors (Salomon, ASICS, Patagonia) pay for placement/links. Race organizers pay to embed the tool or access bulk route data.
   - **Risk:** Feels icky if done wrong; can degrade UX.

3. **API for race organizers:** "Build a custom route finder for your race." Probably not viable until the core product has traction.

**Most likely path:** The tool remains free and donation-supported, or it gets acquired by a larger running app. Do not design the MVP around monetization.

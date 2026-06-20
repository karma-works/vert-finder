# Vision: Vert Finder

## What It Is

A web app that lets you enter a city or location, set a target elevation gain (e.g., 1,200m), and see a map of all real, runnable routes within a configurable radius (default 30km) that match that gain. You filter by gain, you click on a route, you see the path on the map and its elevation profile. You decide if it works for today's training. Done.

## What It Is NOT

- **Not a training plan generator.** We do not create workouts, suggest schedules, or track progress.
- **Not a social app.** No user accounts, no route sharing, no comments or reviews.
- **Not a route planner.** We do not optimize routes, suggest turns, or help you plan a multi-day traverse.
- **Not a "scenic route" recommender.** We do not rate routes by beauty, difficulty, or user reviews.
- **Not a logging app.** We do not track runs, record your GPS, or store activity history.
- **Not a hiking guide.** This is for running/moving fast, not leisurely day hikes.

(These are post-MVP scope. The MVP is: find routes by elevation gain, period.)

## Primary User

**Name:** Alex (or any experienced ultra marathon runner)

**Situation:**
- Just moved to a new city (job, sabbatical, training camp, race prep)
- Knows their training needs: "I need 1,200m of elevation gain today, 60 km running time available"
- Doesn't know the region well; has no local route knowledge
- Trains 4–6 days a week and needs to find new routes quickly
- Experienced enough to read a topographic map and assess runability by eye

**Goals:**
- Find a route that matches today's elevation gain requirement in <2 minutes
- Be confident the route is real (marked on OSM) and actually runnable (not scrambling, not hiking-only)
- See the elevation profile to verify it's not all gain in the first 100m (fatigue management)

**Trust level:** Low friction. No login required. Just wants to enter a location and see routes.

## Secondary Users

**Local guide / event organizer:** Might use the tool to scout training routes in preparation for hosting an ultra race in a new region. Occasional user, same needs as Alex.

**(Out of scope for MVP)** Casual trail runners, hikers — these are lower-priority. If the tool becomes popular with casual users, that's fine, but we're not optimizing for them.

## Success Criteria (MVP)

1. **Discoverability:** An experienced ultra runner new to a city can find a route matching their elevation gain goal within 90 seconds (from page load to route selected).

2. **Accuracy:** 95%+ of routes shown are real, runnable paths (not theoretical DEM gain, not hiking-only terrain). Measured by spot-checking a sample of routes against OSM and running community feedback.

3. **Gain calculation:** Elevation gain calculation within ±5% of manual calculation using the same DEM (Copernicus GLO-30 or similar). Not pixel-perfect, but close enough for training.

4. **Regional coverage:** At MVP launch, the tool works for at least 5 major ultra running destinations (e.g., Boulder CO, Chamonix FR, Limone Piemonte IT, Moab UT, Sedona AZ). Not global, but enough to prove the model.

5. **Performance:** Page loads in <3 seconds, map interaction is responsive (<200ms pan/zoom). Runner should not be waiting on the tool; it should feel instant.

(Retention, user counts, revenue: not measures of MVP success. We're solving a real problem; we'll measure whether we actually solved it.)

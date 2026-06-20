# Challenges: Assumptions That Could Fail

This document lists the major assumptions in the thesis, vision, and product, and describes the most likely ways they could be wrong. For each, I've assessed the counter-evidence strength and, where possible, named a mitigation.

---

## 1. OSM Coverage Is Sufficient to Support the App's Promise

**Assumption:** OpenStreetMap has mapped all or most runnable trails in ultra running destinations. When we filter by elevation gain, runners will reliably find 5–10 routes per search in a 30 km radius.

**How it could be wrong:**
- **Sparse regions:** OSM coverage is crowd-sourced and uneven. Popular climbing destinations (Chamonix, Moab) have good trail data. Rural regions, developing countries, and private land do not. A runner in a sparse region will load the app and see 2–3 routes, not 10+.
- **Local trails not mapped:** In regions where people run bootleg trails (not official hiking routes), OSM is incomplete. Strava can identify these trails via GPS heatmaps; OSM cannot.
- **Stale data:** A trail that was on OSM 2 years ago might be closed, rerouted, or impassable. The app has no way to flag dead routes.

**Failure mode:**
- App launches, runner searches for "Alpine region," sees 5 routes. Tries them all over two weeks. Realizes app is incomplete and abandons it.
- Or: Runner finds a route on the app, heads out, discovers the trail is closed/overgrown/impassable. Loses trust.

**Counter-evidence strength:** **STRONG.** OSM data quality varies wildly by region. This is a known problem in the mapping community. For proof, compare OSM coverage in Chamonix vs. rural Japan. The delta is huge.

**Mitigation:**
- **Phase 0:** Validate coverage in your target launch regions *before* building the full app. Pick 5 regions, manually count runnable trails within 30 km, compare to OSM count. If OSM is missing >30% of known routes, reconsider the MVP.
- **Phase 1:** Add a "report this route is closed/wrong" button in the detail view. Use community feedback to flag bad routes and reduce visibility.
- **Phase 2:** Integrate Strava heatmap data (with permission) to fill OSM gaps in sparse regions. This is pricey but could be necessary for non-European markets.

---

## 2. Elevation Gain Calculation Is Accurate Enough for Training

**Assumption:** Using a standard 30m DEM (Copernicus GLO-30), we can calculate elevation gain within ±5% of the runner's actual experience.

**How it could be wrong:**
- **DEM resolution limits:** A 30m DEM misses terrain features smaller than 30m. A trail that switchbacks tightly will have elevation gain smoothed out by the DEM. The DEM might report 800m but the ground truth is 900m.
- **Error accumulation:** DEMs have systematic bias. Copernicus GLO-30 has a vertical error of ±10–30m depending on terrain. Over a long route with many climbs, small errors accumulate.
- **Seasonal/weather variation:** Snow coverage, floods, and wet conditions change terrain locally. The DEM doesn't account for this. A runner in October might find a 1,200m route is actually 1,400m due to wet conditions increasing apparent gain.

**Failure mode:**
- Runner searches for "1,200m elevation gain," finds a route, runs it, and discovers they only got 1,000m of actual climbing. Wasted session.
- Or: Route appears to have 800m on the app but the runner experiences 950m, tiring them out more than expected.
- Ultra runners obsess over exact training metrics. If the app is consistently off by >100m, they'll switch to manual route planning or competing tools.

**Counter-evidence strength:** **MEDIUM.** The ±5% assumption is optimistic. Real-world DEMs are generally accurate to ±50–150m on long routes. This is "good enough" for most purposes but possibly not for serious ultra training where 100m matters.

**Mitigation:**
- **Phase 0:** Test the DEM on 5–10 known routes in your launch regions. Get a GPS recording of an actual run, calculate the ground-truth elevation gain, and compare to the DEM calculation. Report the error openly in the app: "Calculated from 30m DEM, ±100m expected."
- **Phase 1:** Do NOT claim 5% accuracy; claim ±100–150m accuracy. Be honest.
- **Phase 2:** If runners report consistent bias (e.g., "your app always underestimates by 150m"), retrain the DEM or switch to a higher-resolution source (SRTM-GL1 at 30m, or NASADEM at 30m). Avoid over-promising accuracy you can't deliver.

---

## 3. Elevation Gain Is the Only Training Variable That Matters

**Assumption:** An experienced ultra runner's decision to run route A vs. route B depends primarily on elevation gain. Other factors (terrain type, distance, tech, exposure) are secondary.

**How it could be wrong:**
- **Terrain type dominates:** A 1,200m gain on a wide dirt road is different from 1,200m on exposed single-track in alpine terrain. The second is much harder and not interchangeable. If the runner is training for a technical mountain race, they won't take the road route even if the gain matches.
- **Recovery value:** Some runners prefer sustained climbing (good for aerobic base); others prefer repeated short climbs (good for leg power). Same elevation gain, different training effect. The app doesn't distinguish.
- **Runability variation:** A trail that's runnable in summer is not runnable in winter. The app can't model this without seasonal data.

**Failure mode:**
- Runner searches for 1,200m gain, finds 3 routes: one on dirt road, one on exposed ridgeline single-track, one on steep gully scramble. App shows them all equally. Runner picks one, discovers it's not what they trained for, abandons tool.
- Or: Runner gets 1,200m of elevation gain but doesn't improve for the type of climbing in their goal race. Blames the app.

**Counter-evidence strength:** **MEDIUM-STRONG.** Elevation gain is not the whole story. However, for experienced runners new to a region, it's *the* most urgent discovery problem. They can read a topographic map and assess terrain type themselves; what they can't do quickly is calculate gain. So while this assumption is incomplete, the MVP scope is still correct: solve the gain problem first, add terrain filtering later.

**Mitigation:**
- **Phase 0:** Validate this with 2–3 target runners. Show them the mockup: "Here are routes by elevation gain. Does this solve your problem?" If they say "yes, but I also need to filter by terrain type," add that to Phase 1. If they say "elevation gain is only half the story," reconsider the whole product.
- **Phase 1:** Display terrain type on the route detail view (road, trail, single-track, scramble). Don't filter by it yet, but make it visible so runners can self-select.
- **Phase 2:** Add optional terrain-type filter. This is straightforward once the data layer is built.

---

## 4. Geographic Coverage: Sufficient Elevation Gain Variety Exists in Every Target Region

**Assumption:** In any major ultra running destination (Boulder, Chamonix, Sedona, Alps), there are routes with elevation gain ranging from 500m to 2,500m within a 30 km radius.

**How it could be wrong:**
- **Flat regions:** Entire regions are flat or monotonously hilly. Netherlands, Denmark, UK lowlands: you might find routes with 200–500m of gain max. A runner training for an ultra with 3,000m of gain can't find suitable training routes. The app is useless.
- **Sparse mountain regions:** Some mountain ranges are remote and have few trail networks. The 30 km radius might contain only 2–3 major routes, all of similar elevation gain profile.
- **Seasonal limitations:** In alpine regions, many high-elevation trails are snow-covered for 6 months a year. Available routes shrink seasonally.

**Failure mode:**
- App launches in Netherlands. Runners open it, find only 3 routes with <400m elevation gain each. No one uses it. Product dies in that region.
- Or: App works great in mountain regions (Chamonix, Sedona) but useless in others (UK, Canada). Market is too small.

**Counter-evidence strength:** **MEDIUM.** This is a real geographic limitation. However, it's not a flaw in the product idea — it's a flaw in target market selection. Ultra marathons in flat regions are rare; ultra runners naturally cluster in mountainous regions.

**Mitigation:**
- **Phase 0:** Choose launch regions wisely. Focus on mountainous ultra running destinations first: Chamonix (French Alps), Moab (US), Limone Piemonte (Maritime Alps), Sedona (US), Colorado Rockies. Avoid flat regions initially.
- **Phase 1:** Monitor coverage per region. Display a "coverage status" for each location: "Great coverage" (5+ routes per 500m gain bucket), "Good coverage," "Limited coverage." Set expectation with users.
- **Phase 2:** If demand exists for flat-region routes, partner with local running communities to map bootleg trails. But do NOT pretend the app solves training in flat regions if the geophysics don't support it.

---

## 5. Transient Ultra Runners Will Use an App Instead of Asking Local Communities

**Assumption:** When a runner moves to a new city, they'll search the internet for "elevation gain routes near me" and find the app, rather than post in a running forum or ask local friends.

**How it could be wrong:**
- **Community is tight:** The ultra running community is small and active on forums (Reddit r/ultrarunning, Facebook groups, TrainingPeaks). A runner relocating will join these groups and ask directly. A local will give them 3–5 vetted routes in 20 minutes. The app can't compete with that.
- **Trust in algorithms:** Ultra runners are conservative. They prefer routes recommended by people who have run them, not by an algorithm. An untested, unknown app loses to a friend's advice.
- **Network effects work against newcomers:** Apps that rely on community input (Strava, AllTrails) get better as they grow. On day one, they're sparse. The app needs to be so good at discovery that it wins despite community alternatives.

**Failure mode:**
- Runner arrives in Chamonix, searches online, finds the app, opens it, sees 50 routes. Overwhelmed. Posts in a running forum instead. Gets 5 trusted recommendations. Uses those. Never comes back to the app.
- Or: App has high search traffic but low session duration (runners come, see routes, leave without deciding) and no retention.

**Counter-evidence strength:** **MEDIUM.** This is a known problem for algorithm-based discovery tools. However, there's a narrow window: runners relocating often don't know where the local forums are yet and value speed. The app wins if it's >10x faster than community discovery. Is it?

**Mitigation:**
- **Phase 0:** Talk to 5–10 target runners. Ask: "When you move to a new region, how do you discover training routes? How long does it take? What's wrong with that process?" If they say "I post in a forum and get answers in a day," and your app is not dramatically faster, reconsider.
- **Phase 1:** Build a simple "recommended routes" feature: let local runners/guides pin their favorite routes for each region. This is a hybrid: app handles discovery, community provides curation. Requires low-friction contribution (one-click "favorite").
- **Phase 2:** Integrate with running forums. If a route is discussed in Reddit threads, surface that context in the app. Blend algorithm + community.

---

## 6. Free + No-Login Is Viable Long-Term

**Assumption:** The MVP is a static site (or low-cost hosting) with no user accounts, no login, no tracking. This is sustainable at any reasonable scale.

**How it could be wrong:**
- **Data staleness:** Without users reporting issues, the app will silently degrade. Routes close, trails get rerouted, OSM data goes stale. No feedback loop.
- **No insight into usage:** Without tracking, you won't know if routes are being used, if runners find them helpful, or if they're accurate. You're flying blind for product decisions.
- **Hosting costs at scale:** Map tile requests, DEM processing, route searches — if the app becomes popular, these will cost money. Free + no ads is not sustainable unless you have a benefactor.
- **No way to build community:** Without accounts, you can't collect feedback, build a user base, or create network effects that could lead to sustainability (partnerships, sponsorship).

**Failure mode:**
- App launches, gets traction, runs for a year with no feedback mechanism. Data decays. By year 2, runners report routes are outdated or inaccurate. Reputation dies.
- Or: Hosting costs spike to $500/month, you can't monetize because there's no user base to charge, the project becomes a money sink, and you shut it down.
- Or: You build the product, realize you have no data on whether it's actually solving the problem, and can't improve it.

**Counter-evidence strength:** **MEDIUM-STRONG.** This is the silent killer of successful open-source and public tools. No feedback loop = no learning.

**Mitigation:**
- **Phase 0:** Commit to a feedback mechanism from day one. Options:
  - Simple Google Form: "Did this route work for you? Any issues?" (low friction, no account needed)
  - GitHub Issues: Users can report broken routes (assumes technical audience)
  - Email feedback (oldschool, low friction)
  - Choose one; commit to reading feedback weekly.
- **Phase 1:** If usage > 1,000 unique users/month, revisit the sustainability model. Consider:
  - Sponsorship from gear brands or race organizers
  - Donation-based (Patreon, one-time donate button)
  - Basic paid tier (GPX export, saved routes) if demand exists
  - Don't wait until hosting costs are unsustainable.
- **Phase 2:** If the product is valuable and used, find an owner (you, a team, or an org) who can sustain it. "Free forever" only works if the underlying costs are zero AND someone cares enough to maintain it for years.

---

## 7. OSM + DEM Approach Is Cost-Effective to Scale

**Assumption:** Using free/open data (OSM, Copernicus DEM) keeps hosting and compute costs low enough that the app stays free-to-run indefinitely.

**How it could be wrong:**
- **DEM processing is expensive:** Computing elevation gain for thousands of routes requires high-resolution raster operations. At scale (10,000+ routes, frequent updates), this is CPU-intensive. Costs add up.
- **Map tile serving:** If you host your own map tiles instead of using a third-party service (Mapbox, ESRI), costs scale with traffic. Free services (like OSMATIC) have rate limits.
- **Data freshness requires updates:** OSM updates monthly. Keeping your derived route dataset in sync with OSM requires scheduled jobs, storage, and processing. This is not "set and forget."
- **Competitive pressure:** A better-resourced competitor (Strava, AllTrails, Mapbox) could offer similar features with lower costs, making your free model obsolete.

**Failure mode:**
- App becomes popular. DEM processing costs spike to $200/month. Hosting costs go to $100/month. You're now paying $3,600/year to run a free app. Unsustainable.
- Or: You use a third-party tile service (Mapbox), which charges per request. Traffic spikes, bills go to $500/month. You're cornered.

**Counter-evidence strength:** **MEDIUM.** This is a real engineering / DevOps risk for open-source projects. However, it's manageable if you plan for it from the start.

**Mitigation:**
- **Phase 0:** Do a cost analysis. Pick one target region (e.g., Chamonix 30km radius). Extract all OSM trails, calculate their elevation gain using a free tool (GDAL, or Mapbox Elevation API), measure compute time and storage. Extrapolate to 5 regions, then global. What's the cost per month? If it's >$100/month at scale, find a cheaper approach.
- **Phase 1:** Use a free tile service (OpenStreetMap community tiles, with attribution). Accept rate limits as a constraint.
- **Phase 2:** Cache aggressively. Pre-compute elevation gain for all routes in all target regions, store in a database. Don't compute on-the-fly. This keeps serving costs low and query times fast.

---

## 8. "Route Name from OSM" Provides Enough Context

**Assumption:** When a route appears on the map, its name (from OSM) is meaningful and sufficient for the runner to remember it and navigate to it later.

**How it could be wrong:**
- **Most trails have no name:** In OSM, the majority of trail segments are unnamed. A route might be described as "way_12345" or by its node coordinates.
- **Names are inconsistent:** The same trail might be called "Trail #42" in one part of OSM and "Ridge Trail" in another, or no name at all. Runners can't rely on consistent naming.
- **No way to save or share:** Without user accounts, a runner can't save a route to visit later. They have to remember it or bookmark the map view (fragile).

**Failure mode:**
- Runner finds a route at 2pm, decides to run it tomorrow. Forgets the name, can't find it again on the map. Frustration.
- Or: Runner wants to tell a friend about a route: "It's the one with 1,200m elevation gain on the map." Not useful.

**Counter-evidence strength:** **MEDIUM.** This is a minor UX issue, not a fundamental flaw. However, it degrades usability.

**Mitigation:**
- **Phase 1:** Generate meaningful names algorithmically. If a route has no OSM name, derive one from start/end location names: "Boulder to Flagstaff Ridge" instead of "way_12345."
- **Phase 2:** Add saved routes (requires localStorage or very lightweight persistence). Runners can click "save," and it bookmarks the route in their browser.
- **Phase 2:** Add share links. Generate a unique short URL for each route, so runners can share: "Check this route: bit.ly/xyz" (decoding the coordinates/route ID).

---

## 9. Liability and Responsibility for Route Accuracy

**Assumption:** By providing route information, the app is offering data, not advice. Runners assume full responsibility for verifying route safety and legality.

**How it could be wrong:**
- **Legal ambiguity:** If a runner uses the app to navigate to a route, follows the mapped path, and gets injured (falls, trespassing, trail closure), is there any liability on the app creator?
- **Implied endorsement:** By showing a route and describing its elevation gain, are you implying the route is safe, legal, and runnable? A lawyer might argue yes.
- **Inaccuracy at scale:** If the app shows 100 routes and 5% are inaccurate (trail closed, rerouted, private property), you're liable for the injuries/trespassing.

**Failure mode:**
- Runner is injured using a route from the app. They sue, claiming you should have verified the trail was open and safe. Litigation costs $50k+.
- Or: A park authority asks you to remove routes from their private land, citing liability concerns.

**Counter-evidence strength:** **MEDIUM-STRONG.** This is a real legal risk for any web service that provides navigation or route data. The industry (Strava, AllTrails, komoot) handles this with:
- Terms of Service: explicit disclaimers
- User-reported flagging: "This route is closed/unsafe"
- No liability insurance (risky)

**Mitigation:**
- **Phase 0:** Have a lawyer (ideally one with trail app experience) review your TOS and liability approach. Budget for this; it's not expensive ($500–2k for a basic review).
- **Phase 1:** Add clear ToS disclaimers: "Routes are provided as-is. Users are responsible for verifying route safety, legality, and current status. This app is not responsible for injuries, trespassing, or route inaccuracy."
- **Phase 1:** Add a "Report issue" button on each route. Users can flag routes as closed, rerouted, or unsafe. Use community feedback to mark routes as unreliable.
- **Phase 2:** Don't navigate. Provide the route data, but require the user to verify before running (e.g., "Open in Apple Maps" or export as GPX). You're providing information, not directions.

---

## 10. Competitors Won't Solve This First (or Better)

**Assumption:** The route-discovery-by-elevation-gain niche is not interesting enough for Strava, Komoot, AllTrails, or Mapbox to solve before you launch.

**How it could be wrong:**
- **Strava adds "filter by elevation gain":** Strava has 100M users and could add this feature in 2–4 weeks. They'd win immediately.
- **Mapbox or Google Maps upgrades:** If either adds sophisticated route discovery with elevation-gain filtering, they'd dominate due to distribution (Google Maps is on every phone).
- **Komoot goes upmarket:** Komoot already has route planning and elevation-gain calculation. They might add "discover routes by gain" to their feature set.
- **Niche competitor:** A veteran ultra runner with tech skills launches a similar app, gets early adopter traction, and captures the market before you.

**Failure mode:**
- You spend 3 months building the MVP. Two weeks before launch, Strava announces "elevation gain filtering." Your app is obsolete.
- Or: Komoot integrates the feature. Your only differentiator (simplicity, focus) is gone.

**Counter-evidence strength:** **MEDIUM.** This is a real competitive risk. However:
- Strava's core business is social logging, not route discovery. They prioritize social features over tools.
- Komoot is paid; adding free features is not their strategy.
- Google/Mapbox are too broad to focus on ultra runners specifically.
- **There is a narrow window (6–12 months) before a competitor solves this.**

**Mitigation:**
- **Phase 0:** Launch MVP quickly. MVP = location search + elevation gain filter + route display. Ship in 6–8 weeks, not 6 months.
- **Phase 1:** Get users *now*. Even if a competitor launches a similar feature later, early adopters will stick with you if you're good and fast.
- **Phase 2:** If a competitor launches a similar feature but with less focus on the ultra runner use case, your differentiation is clarity + speed. Don't try to be all things; be the best at the one thing (elevation gain discovery for ultra training).

---

## 11. "30km radius" Assumption Holds Across Regions

**Assumption:** Experienced ultra runners won't drive more than 30 km to find a training route, regardless of region density.

**How it could be wrong:**
- **Dense regions (Alps, California):** 30 km might be too *small*. Runners could comfortably drive 45–60 km and expect more route variety.
- **Sparse regions (rural Australia, remote Alaska):** 30 km might have zero routes. Runners would need to expand the radius to 100+ km, making driving time >1 hour.
- **Urban runners training near cities:** Might only need 5–10 km radius. Larger radius adds clutter.

**Failure mode:**
- In the Alps, runner searches with default 30 km, sees 50 routes, gets overwhelmed or frustrated.
- In rural area, runner searches with 30 km, sees zero routes, assumes the app is broken.
- UX is suboptimal because the default doesn't fit the user's mental model.

**Counter-evidence strength:** **WEAK.** This assumption is speculative. You don't have data yet.

**Mitigation:**
- **Phase 0:** Ask target users: "When training in a new region, how far would you drive to find a suitable route?" Get responses from 5+ runners in different geographies (urban, mountain, rural). Make this decision data-driven.
- **Phase 1:** Default to 30 km, but make the radius configurable and prominent (not hidden in settings). Users should be able to adjust instantly.
- **Phase 1:** Provide feedback on route availability: "Found 12 routes" or "Found 2 routes in this radius." Suggest expanding radius if coverage is sparse.

---

## 12. The Core Problem Is Actually Solvable in MVP Scope

**Assumption:** The problem ("find training routes by elevation gain") can be solved with just location + elevation gain filter + map display, without route planning, difficulty assessment, terrain type, or seasonal data.

**How it could be wrong:**
- **"Minimal" is not useful:** A runner opens the app, enters "Chamonix," gets 50 routes, has no way to distinguish between a steep scramble and a runnable trail. They still have to open each route and check the elevation profile manually. You've only saved them 10% of the work.
- **Elevation profile alone is insufficient:** Without terrain type, exposure, seasonality, or difficulty rating, runners can't make a confident decision. They still call a friend or ask a forum.
- **The UX bottleneck is not discovery, it's decision-making:** The real problem might not be "I can't find routes" but "I can't *choose* between routes." If the latter, your MVP won't solve it.

**Failure mode:**
- MVP launches to weak adoption. Runners like the concept but don't use it regularly because the decision-making is still manual. Retention is low.
- Or: Runners report: "Great concept, but I need terrain type / difficulty / seasonal info to make decisions." You realize you under-scoped.

**Counter-evidence strength:** **MEDIUM.** This is a design risk, not a market risk. The mitigation is to validate with target users before building.

**Mitigation:**
- **Phase 0:** Build a clickable prototype (Figma mockup or paper wireframe). Show it to 5 target runners. Walk through the flow: "You land here, enter Chamonix, see 50 routes. Now what?" Listen to what they do and what they ask for. If they immediately ask for terrain type or difficulty, that's a Phase 1 feature, not Post-MVP.
- **Phase 1:** Include elevation profile chart from day one. This gives runners enough info to rule out unsuitable routes (e.g., "this one is all uphill in the first 3 km, too hard for a warm-up").
- **Phase 2:** Iterate based on user feedback. If runners consistently request terrain type, add it. If they ask for weather, add it. Don't guess; let them tell you.

---

## Summary: The Biggest Risks

**1. Geographic coverage is insufficient (Challenge #1, #4).** If OSM data in your target regions is sparse, or if suitable elevation gain variety doesn't exist, the app dies immediately. **Validate this before coding.**

**2. The MVP scope is too minimal (Challenge #12).** If elevation gain alone is insufficient for runners to make decisions, adoption will be weak. **Validate with a prototype before building.**

**3. Sustainable operation is not planned (Challenge #6, #7).** Without a feedback loop or a cost model, the app will degrade or become a money sink. **Plan for sustainability from day one.**

**The one thing to validate before writing code:** Show a clickable prototype to 5–10 target ultra runners. Ask: "Would you use this to find a route?" If >3 say "no, I still need X," add X to MVP scope. If >3 say "yes, this solves my problem," you're ready to build.

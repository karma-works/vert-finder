# Vert Finder

Find and combine nearby trail segments by elevation gain. Search any city or coordinates, choose a radius and vertical range, then select segments on the map to see their combined distance and ascent.

The application is a static React site. It fetches current OpenStreetMap paths on demand, builds useful network segments at intersections, calculates elevation in the browser from global Terrarium terrain tiles, and caches completed search areas in IndexedDB. It has no accounts, tracking, API keys, or application backend.

## Validation regions

The primary test areas are:

- Zurich, Switzerland: 10 km radius
- Bülach, Switzerland: 10 km radius

These are validation fixtures, not coverage boundaries. Location search and live trail loading work worldwide where OpenStreetMap, an Overpass instance, and Mapzen/AWS terrain tiles have coverage.

## Development

Requires Node.js 20+.

```bash
npm install
npm run dev
npm test
npm run build
```

## Live data flow

1. Nominatim resolves a searched place to coordinates.
2. A Web Worker fetches public `highway=path|bridleway` ways from Overpass within the selected radius.
3. The worker splits ways at shared OSM nodes and merges uninterrupted compatible chains.
4. Geometry is sampled about every 50 metres from global Terrarium raster tiles at zoom 12.
5. The worker applies a three-point moving average before gain and loss are summed.
6. The processed area is cached locally in IndexedDB for seven days.

The default radius is 10 km. Public Overpass and Nominatim services are shared infrastructure, so new areas can take several seconds and requests can occasionally fail. Repeat searches use the local cache.

For rendering performance, the sidebar virtualizes its rows and the map draws at most 1,200 segments intersecting the padded viewport through one GeoJSON layer. All matching segments remain available through filtering and appear as the map moves or zooms.

Legacy Copernicus/GDAL scripts and generated GeoJSON remain in the repository as validation tooling. They are no longer the production data path.

Trail and elevation data can be incomplete or wrong. Selected segments are not guaranteed to connect. Verify access, conditions, and navigation independently before running.

## Deployment

Pushes to `main` run tests, build the Vite app, and deploy it through GitHub Pages. Enable GitHub Pages with “GitHub Actions” as the source in repository settings.

## Attribution and license

Application code is MIT licensed. Trail and map data is © OpenStreetMap contributors. Elevation uses Mapzen terrain tiles hosted in the AWS Open Data program; source attribution is embedded in the tile metadata.

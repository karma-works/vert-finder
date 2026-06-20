#!/bin/bash
# Run elevation processor once DEM tiles are ready
# This script:
# 1. Builds a VRT mosaic from all tiles
# 2. Processes all 5 regions
# 3. Generates real GeoJSON with elevation gain

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEM_DIR="$ROOT/data/copernicus"
VRT_FILE="$ROOT/data/copernicus.vrt"
OUTPUT_FILE="$ROOT/public/data/routes.geojson"

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "ELEVATION PROCESSING PIPELINE"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Verify tiles
TILE_COUNT=$(find "$DEM_DIR" -name "*.tif" 2>/dev/null | wc -l)
if [ "$TILE_COUNT" -lt 13 ]; then
    echo "❌ ERROR: Expected 13 tiles, found $TILE_COUNT"
    echo "   Waiting for DEM download to complete..."
    exit 1
fi
echo "✓ Found $TILE_COUNT DEM tiles"

# Step 1: Build VRT
echo ""
echo "Building VRT mosaic..."
if [ -f "$VRT_FILE" ]; then
    rm "$VRT_FILE"
fi
gdalbuildvrt "$VRT_FILE" "$DEM_DIR"/*.tif
SIZE=$(wc -c < "$VRT_FILE")
echo "✓ VRT created: $VRT_FILE ($SIZE bytes)"

# Step 2: Show VRT info
echo ""
echo "DEM Info:"
gdalinfo "$VRT_FILE" 2>/dev/null | head -15

# Step 3: Run elevation processor
echo ""
echo "Processing trails for all 5 regions..."
echo "  (Querying OSM, sampling elevation, calculating gains...)"
echo ""

python3 "$ROOT/scripts/process_elevation.py" --dem "$VRT_FILE" --output "$OUTPUT_FILE"

# Step 4: Show results
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "RESULTS"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ ERROR: Output file not created: $OUTPUT_FILE"
    exit 1
fi

SIZE=$(wc -c < "$OUTPUT_FILE")
echo "✓ Generated: $OUTPUT_FILE"
echo "  Size: $(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "$SIZE bytes")"

# Show metadata
METADATA="$(dirname "$OUTPUT_FILE")/metadata.json"
if [ -f "$METADATA" ]; then
    echo ""
    echo "Region statistics:"
    python3 -c "import json; data = json.load(open('$METADATA')); [print(f'  {r[\"id\"]}: {r[\"count\"]} trails') for r in data['regions']]" 2>/dev/null || cat "$METADATA"
    echo ""
    echo "Updated: $(python3 -c "import json; data = json.load(open('$METADATA')); print(data['updated'])" 2>/dev/null)"
fi

# Count total routes
ROUTE_COUNT=$(python3 -c "import json; data = json.load(open('$OUTPUT_FILE')); print(len(data['features']))" 2>/dev/null)
echo ""
echo "Total routes indexed: $ROUTE_COUNT"

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "NEXT STEPS"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "1. REVIEW METADATA:"
echo "   cat public/data/metadata.json | jq '.'"
echo ""
echo "2. SPOT-CHECK 10 ROUTES:"
echo "   - Open Gaia GPS, Komoot, AllTrails"
echo "   - Find 2 routes per region"
echo "   - Compare elevation gain to app values"
echo "   - Fill in specs/ELEVATION-VALIDATION-RESULTS.md"
echo ""
echo "3. MAKE DECISION:"
echo "   - ≥85% routes within ±10% error? → ✅ PROCEED PHASE 0"
echo "   - <70% routes within ±10% error? → ❌ HALT for improvements (Phase 0.5b)"
echo ""

#!/bin/bash
# Build VRT mosaic and run elevation processor
# Usage: bash scripts/build_vrt_and_process.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEM_DIR="$ROOT/data/copernicus"
VRT_FILE="$ROOT/data/copernicus.vrt"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Building Copernicus GLO-30 DEM mosaic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for DEM tiles
TILES=$(find "$DEM_DIR" -name "*.tif" 2>/dev/null | wc -l)
if [ "$TILES" -eq 0 ]; then
    echo "❌ No DEM tiles found in $DEM_DIR"
    echo "Run: python3 scripts/download_dem.py"
    exit 1
fi

echo "✓ Found $TILES DEM tiles"

# Build VRT
echo ""
echo "Building VRT mosaic..."
gdalbuildvrt -overwrite "$VRT_FILE" "$DEM_DIR"/*.tif
echo "✓ VRT created: $VRT_FILE"

# Show VRT info
echo ""
echo "VRT info:"
gdalinfo "$VRT_FILE" | head -20

# Run elevation processor
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running elevation processor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 "$ROOT/scripts/process_elevation.py" --dem "$VRT_FILE"

echo ""
echo "✓ Processing complete"
echo ""
echo "Output files:"
ls -lh "$ROOT/public/data/"

echo ""
echo "Next steps:"
echo "  1. Review the generated routes: cat public/data/metadata.json"
echo "  2. Spot-check elevation gain values"
echo "  3. Compare to known routes (Gaia GPS, Komoot, etc.)"

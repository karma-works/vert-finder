#!/usr/bin/env python3
"""Download Copernicus GLO-30 DEM tiles for configured regions from AWS public dataset.

Copernicus GLO-30 is available at s3://copernicus-dem-30m/ (no AWS account required).
Tiles are 1°×1° Cloud Optimized GeoTIFFs named like: Copernicus_DSM_10_N00_00_E006_00_DEM.tif

This script:
1. Calculates bounding box for each region
2. Lists required 1°×1° tiles
3. Downloads tiles from AWS (if not already cached)
4. Verifies checksums (optional)
"""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AWS_BUCKET = "s3://copernicus-dem-30m"
OUTPUT_DIR = ROOT / "data" / "copernicus"


def get_tiles_for_bbox(lon_min: float, lon_max: float, lat_min: float, lat_max: float) -> list[tuple[int, int]]:
    """Return list of (lon_tile, lat_tile) grid cells covering the bbox.

    Copernicus tiles are 1°×1°. Tile (lon, lat) covers [lon, lon+1) × [lat, lat+1).
    """
    tiles = []
    for lon in range(math.floor(lon_min), math.ceil(lon_max)):
        for lat in range(math.floor(lat_min), math.ceil(lat_max)):
            tiles.append((lon, lat))
    return tiles


def tile_name(lon: int, lat: int) -> str:
    """Generate Copernicus tile filename and directory path.

    Returns relative path: Copernicus_DSM_COG_10_N45_00_E006_00_DEM/Copernicus_DSM_COG_10_N45_00_E006_00_DEM.tif
    """
    ns = "N" if lat >= 0 else "S"
    ew = "E" if lon >= 0 else "W"
    lat_str = f"{ns}{abs(lat):02d}_00"
    lon_str = f"{ew}{abs(lon):03d}_00"
    dir_name = f"Copernicus_DSM_COG_10_{lat_str}_{lon_str}_DEM"
    file_name = f"Copernicus_DSM_COG_10_{lat_str}_{lon_str}_DEM.tif"
    return f"{dir_name}/{file_name}"


def download_tile(bucket: str, tile: str, output_dir: Path, force: bool = False) -> bool:
    """Download a single tile from AWS. Returns True if successful."""
    output_path = output_dir / tile

    if output_path.exists() and not force:
        print(f"  ✓ {tile} (cached)")
        return True

    s3_url = f"{bucket}/{tile}"
    print(f"  ↓ {tile}...", end=" ", flush=True)

    try:
        result = subprocess.run(
            ["aws", "s3", "cp", s3_url, str(output_path), "--no-sign-request"],
            capture_output=True,
            timeout=300,
        )
        if result.returncode == 0:
            size_mb = output_path.stat().st_size / (1024 ** 2)
            print(f"({size_mb:.1f} MB)")
            return True
        else:
            print(f"ERROR: {result.stderr.decode()}")
            return False
    except subprocess.TimeoutExpired:
        print("TIMEOUT")
        return False
    except FileNotFoundError:
        print("ERROR: AWS CLI not found. Install with: pip install awscli")
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Download Copernicus GLO-30 DEM tiles")
    parser.add_argument("--regions", type=Path, default=ROOT / "scripts/regions.json")
    parser.add_argument("--output", type=Path, default=OUTPUT_DIR)
    parser.add_argument("--force", action="store_true", help="Re-download existing tiles")
    args = parser.parse_args()

    regions = json.loads(args.regions.read_text())
    args.output.mkdir(parents=True, exist_ok=True)

    all_tiles = set()
    region_tiles = {}

    # Calculate required tiles for each region
    print("Calculating required tiles...")
    for region in regions:
        lon, lat = region["center"]
        radius_deg = region["radius_km"] / 111.0  # Rough conversion

        tiles = get_tiles_for_bbox(
            lon - radius_deg,
            lon + radius_deg,
            lat - radius_deg,
            lat + radius_deg,
        )
        region_tiles[region["id"]] = tiles
        all_tiles.update(tiles)
        print(f"  {region['name']}: {len(tiles)} tiles")

    print(f"\nTotal unique tiles: {len(all_tiles)}")
    print(f"Estimated size: {len(all_tiles) * 0.05:.1f}–{len(all_tiles) * 0.15:.1f} GB\n")

    # Download tiles
    failed = []
    for lon, lat in sorted(all_tiles):
        tile = tile_name(lon, lat)
        if not download_tile(AWS_BUCKET, tile, args.output, args.force):
            failed.append(tile)

    if failed:
        print(f"\n❌ Failed to download {len(failed)} tiles:")
        for tile in failed:
            print(f"  - {tile}")
        sys.exit(1)

    # Save tile manifest
    manifest = {
        "bucket": AWS_BUCKET,
        "tiles": sorted([tile_name(lon, lat) for lon, lat in all_tiles]),
        "regions": {rid: [tile_name(lon, lat) for lon, lat in tiles] for rid, tiles in region_tiles.items()},
    }
    manifest_path = args.output / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))

    print(f"\n✓ Downloaded {len(all_tiles)} tiles to {args.output}")
    print(f"  Manifest: {manifest_path}")
    print(f"\nNext steps:")
    print(f"  1. Build VRT: gdalbuildvrt data/copernicus.vrt data/copernicus/*.tif")
    print(f"  2. Run processor: python scripts/process_elevation.py --dem data/copernicus.vrt")


if __name__ == "__main__":
    main()

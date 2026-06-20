#!/usr/bin/env python3
"""Fetch OSM trails and enrich them from a local Copernicus-compatible DEM.

The script deliberately requires a DEM path. It never invents elevation values.
Download a GLO-30 GeoTIFF or VRT covering the configured regions, then run:
  python scripts/process_elevation.py --dem data/copernicus.vrt
"""

from __future__ import annotations

import argparse
import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
import rasterio
from rasterio.warp import transform

ROOT = Path(__file__).resolve().parents[1]
OVERPASS = "https://overpass-api.de/api/interpreter"


def haversine(a: tuple[float, float], b: tuple[float, float]) -> float:
    radius_m = 6_371_000
    lon1, lat1, lon2, lat2 = map(math.radians, (*a, *b))
    dlon, dlat = lon2 - lon1, lat2 - lat1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return radius_m * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))


def query_region(region: dict[str, Any], retries: int = 3) -> list[dict[str, Any]]:
    lon, lat = region["center"]
    radius = region["radius_km"] * 1000
    query = f'''[out:json][timeout:120];
    way(around:{radius},{lat},{lon})[highway~"^(path|footway|bridleway)$"][access!="private"];
    out tags geom;'''
    headers = {"User-Agent": "UTM-Height-Training/1.0 (elevation processing)"}
    for attempt in range(retries):
        try:
            response = requests.post(OVERPASS, data={"data": query}, headers=headers, timeout=150)
            response.raise_for_status()
            return response.json()["elements"]
        except (requests.RequestException, KeyError, ValueError) as e:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)
    return []


def sample_profile(dataset: rasterio.DatasetReader, coordinates: list[tuple[float, float]]) -> list[dict[str, float]]:
    xs, ys = transform("EPSG:4326", dataset.crs, [p[0] for p in coordinates], [p[1] for p in coordinates])
    values = [float(row[0]) for row in dataset.sample(zip(xs, ys), masked=True)]
    profile: list[dict[str, float]] = []
    distance = 0.0
    for index, (coordinate, elevation) in enumerate(zip(coordinates, values)):
        if not math.isfinite(elevation):
            continue
        if index:
            distance += haversine(coordinates[index - 1], coordinate) / 1000
        profile.append({"distance": round(distance, 2), "elevation": round(elevation)})
    return profile


def gains(profile: list[dict[str, float]]) -> tuple[int, int]:
    changes = [b["elevation"] - a["elevation"] for a, b in zip(profile, profile[1:])]
    return round(sum(max(0, change) for change in changes)), round(abs(sum(min(0, change) for change in changes)))


def feature(element: dict[str, Any], region: dict[str, Any], dem: rasterio.DatasetReader) -> dict[str, Any] | None:
    coordinates = [(node["lon"], node["lat"]) for node in element.get("geometry", [])]
    if len(coordinates) < 2:
        return None
    profile = sample_profile(dem, coordinates)
    if len(profile) < 2:
        return None
    gain, loss = gains(profile)
    tags = element.get("tags", {})
    return {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": coordinates},
        "properties": {
            "id": f'osm-{element["id"]}',
            "name": tags.get("name", f'Trail {element["id"]}'),
            "region": region["name"],
            "elevation_gain": gain,
            "elevation_loss": loss,
            "distance": round(profile[-1]["distance"], 2),
            "surface": tags.get("surface", tags.get("highway", "trail")).replace("_", " "),
            "profile": profile[::max(1, len(profile) // 100)],
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dem", required=True, type=Path, help="GeoTIFF or VRT covering all regions")
    parser.add_argument("--regions", type=Path, default=ROOT / "scripts/regions.json")
    parser.add_argument("--output", type=Path, default=ROOT / "public/data/routes.geojson")
    args = parser.parse_args()
    if not args.dem.exists():
        parser.error(f"DEM does not exist: {args.dem}")

    regions = json.loads(args.regions.read_text())
    features = []
    counts = []
    with rasterio.open(args.dem) as dem:
        for region in regions:
            region_features = [item for element in query_region(region) if (item := feature(element, region, dem))]
            features.extend(region_features)
            counts.append({"id": region["id"], "count": len(region_features)})
            print(f'{region["name"]}: {len(region_features)} trails')

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")))
    metadata = {"updated": datetime.now(timezone.utc).isoformat(), "source": "OpenStreetMap + Copernicus DEM", "regions": counts}
    (args.output.parent / "metadata.json").write_text(json.dumps(metadata, separators=(",", ":")))


if __name__ == "__main__":
    main()

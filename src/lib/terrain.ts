import type { Coordinate } from '../types'

const zoom = 12
const tileSize = 256
const terrainBase = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium'

interface TilePixel { key: string; x: number; y: number; pixelX: number; pixelY: number }

export function coordinateToTilePixel([lon, lat]: Coordinate, z = zoom): TilePixel {
  const scale = 2 ** z
  const worldX = ((lon + 180) / 360) * scale
  const latitude = Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI / 180
  const worldY = (1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2 * scale
  const x = Math.floor(worldX)
  const y = Math.floor(worldY)
  return { key: `${z}/${x}/${y}`, x, y, pixelX: Math.min(255, Math.floor((worldX - x) * tileSize)), pixelY: Math.min(255, Math.floor((worldY - y) * tileSize)) }
}

export function decodeTerrarium(red: number, green: number, blue: number): number {
  return red * 256 + green + blue / 256 - 32768
}

async function loadTile(key: string): Promise<Uint8ClampedArray> {
  const response = await fetch(`${terrainBase}/${key}.png`)
  if (!response.ok) throw new Error(`Terrain tile returned ${response.status}`)
  const bitmap = await createImageBitmap(await response.blob())
  const canvas = document.createElement('canvas')
  canvas.width = tileSize
  canvas.height = tileSize
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas is unavailable')
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  return context.getImageData(0, 0, tileSize, tileSize).data
}

export async function sampleTerrain(coordinates: Coordinate[], signal?: AbortSignal): Promise<number[]> {
  const pixels = coordinates.map((coordinate) => coordinateToTilePixel(coordinate))
  const keys = [...new Set(pixels.map((pixel) => pixel.key))]
  const tiles = new Map<string, Uint8ClampedArray>()
  const concurrency = 6
  for (let index = 0; index < keys.length; index += concurrency) {
    signal?.throwIfAborted()
    const batch = keys.slice(index, index + concurrency)
    const loaded = await Promise.all(batch.map(async (key) => [key, await loadTile(key)] as const))
    loaded.forEach(([key, data]) => tiles.set(key, data))
  }
  return pixels.map((pixel) => {
    const data = tiles.get(pixel.key)
    if (!data) throw new Error(`Terrain tile ${pixel.key} was not loaded`)
    const offset = (pixel.pixelY * tileSize + pixel.pixelX) * 4
    return decodeTerrarium(data[offset], data[offset + 1], data[offset + 2])
  })
}

import type { Coordinate, TrailFeature } from '../types'
import { sampleTerrain } from './terrain'

const globalEndpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']

type WorkerResponse =
  | { type: 'prepared'; coordinates: Coordinate[] }
  | { type: 'finalized'; features: TrailFeature[] }
  | { type: 'error'; message: string }

function waitFor<T extends WorkerResponse['type']>(worker: Worker, type: T, signal: AbortSignal): Promise<Extract<WorkerResponse, { type: T }>> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', abort, { once: true })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      signal.removeEventListener('abort', abort)
      if (event.data.type === 'error') reject(new Error(event.data.message))
      else if (event.data.type === type) resolve(event.data as Extract<WorkerResponse, { type: T }>)
    }
    worker.onerror = (event) => {
      signal.removeEventListener('abort', abort)
      reject(new Error(event.message || 'Trail worker failed'))
    }
  })
}

export async function processTrailArea(center: Coordinate, radius: number, label: string, signal: AbortSignal): Promise<TrailFeature[]> {
  const worker = new Worker(new URL('../workers/trailWorker.ts', import.meta.url), { type: 'module' })
  const terminate = () => worker.terminate()
  signal.addEventListener('abort', terminate, { once: true })
  try {
    const preparing = waitFor(worker, 'prepared', signal)
    const inSwitzerland = center[0] >= 5.8 && center[0] <= 10.6 && center[1] >= 45.7 && center[1] <= 47.9
    const endpoints = inSwitzerland ? ['https://overpass.osm.ch/api/interpreter', ...globalEndpoints] : globalEndpoints
    worker.postMessage({ type: 'prepare', center, radius, endpoints })
    const { coordinates } = await preparing
    const elevations = await sampleTerrain(coordinates, signal)
    const finalizing = waitFor(worker, 'finalized', signal)
    worker.postMessage({ type: 'finalize', elevations, label })
    return (await finalizing).features
  } finally {
    signal.removeEventListener('abort', terminate)
    worker.terminate()
  }
}

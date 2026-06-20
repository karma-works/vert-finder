import { describe, expect, it } from 'vitest'
import { coordinateToTilePixel, decodeTerrarium } from './terrain'

describe('terrain tiles', () => {
  it('decodes Terrarium RGB elevations', () => {
    expect(decodeTerrarium(129, 244, 0)).toBe(500)
  })

  it('maps Zurich to a stable tile pixel', () => {
    expect(coordinateToTilePixel([8.5417, 47.3769])).toMatchObject({ key: '12/2145/1434' })
  })
})

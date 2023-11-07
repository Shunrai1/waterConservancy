import { Overlay } from 'ol'
import { Vector } from 'ol/layer'
/**
 * 水库state
 */
export type WaterState = {
  reservoir: Vector

  reservoirSign: Vector
  popup: Overlay | null
}

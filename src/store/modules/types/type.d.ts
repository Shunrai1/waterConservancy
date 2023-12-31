import { Overlay } from 'ol'
import { Vector } from 'ol/layer'
import { Style } from 'ol/style'
/**
 * 水库state
 */
export type WaterState = {
  rain: Vector
  reservoir: Vector
  river: Vector
  reservoirSign: Vector
  popup: Overlay | null
}
/**
 * 图例state
 */
export type legendType = {
  geomType: string
  style: Style
  title: string
}
export type legendState = {
  legendList: legendType[]
}
/**
 * 台风state
 */
export type windType = {
  wind: Vector
}

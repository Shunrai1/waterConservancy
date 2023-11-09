import { Fill, RegularShape, Stroke, Style } from 'ol/style'

//图层Style样式
export const reservoirStyle = new Style({
  image: new RegularShape({
    fill: new Fill({
      color: '#3399CC',
    }),
    stroke: new Stroke({
      color: '#fff',
    }),
    points: 3, // 三角形的边数
    radius: 10, // 三角形的半径
    angle: 0, // 三角形的旋转角度
  }),
})
export const riverStyle = new Style({
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(47, 89, 205)',
    }),
    stroke: new Stroke({
      color: '#fff',
    }),
    points: 3, // 三角形的边数
    radius: 10, // 三角形的半径
    angle: 0, // 三角形的旋转角度
  }),
})
export const guangxiStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 5,
  }),
})

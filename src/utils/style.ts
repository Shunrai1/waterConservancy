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
export const rainLessTenStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 5,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})
export const rainTenToTwentyFiveStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 7,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})
export const rainTwentyFiveToFiftyStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 9,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})
export const rainFiveToHundredStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 11,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})
export const rainHundredToTowHundredAndFiftyStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 13,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})
export const rainMoreTowHundredAndFiftyStyle = new Style({
  //形状
  image: new RegularShape({
    fill: new Fill({
      color: 'rgb(211, 213, 71)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1,
    }),
    radius: 15,
    points: 50, // 设置点数越多，圆形越平滑
  }),
})

import { Circle, Fill, RegularShape, Stroke, Style } from 'ol/style'

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
//雨量样式，点样式
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
//台风点样式
/**
 * 热带低压
 */
export const troDep = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'rgb(221, 207, 85)' }),
  }),
})
/**
 * 热带风暴
 */
export const troSto = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'blue' }),
  }),
})
/**
 * 强热带风暴
 */
export const cycNar = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'green' }),
  }),
})
/**
 * 台风
 */
export const typhoon = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'rgb(254, 156, 69)' }),
  }),
})
/**
 * 强台风
 */
export const vilTyphoon = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'rgb(254, 0, 254)' }),
  }),
})
/**
 *超强台风
 */
export const supTyphoon = new Style({
  //填充色
  fill: new Fill({
    color: 'rgb(221, 207, 85)',
  }),
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(221, 207, 85)',
    width: 2,
  }),
  //形状
  image: new Circle({
    radius: 5,
    fill: new Fill({ color: 'red' }),
  }),
})
/**
 * 台风路径
 */
export const typhoonRole = new Style({
  //边线颜色
  stroke: new Stroke({
    color: 'rgb(99, 94, 100)',
    width: 3,
  }),
})
/**
 * 台风预测路径
 */
export const typhoonForecastRole = new Style({
  // 边线样式
  stroke: new Stroke({
    color: 'red',
    width: 3,
    lineDash: [5, 10], // 设置为虚线样式，[10, 5] 表示10个像素的实线和5个像素的空白
  }),
})

import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import { Vector } from 'ol/source'
import { typhoonCircle10, typhoonCircle7 } from '@/utils/style.ts'

/**
 * @description 设置风圈
 * @param node - {JSON} 格式{"WD":"20.9","JD":"116.2","EN7Radii":"220","ES7Radii":"220","WS7Radii":"260","WN7Radii":"240","EN10Radii":"50","ES10Radii":"80","WS10Radii":"80","WN10Radii":"50"}
 */
const useSetWindCircle = function (node: any) {
  if (node == null) return
  const typhoonLayers = []
  const n = node
  const center = [n.JD, n.WD]
  //台风位置
  // this._typhoonFeature.setGeometry(
  //   new ol.geom.Point([Number(center[0]), Number(center[1])]),
  // )
  let ENGeom: any
  let ESGeom: any
  let WSGeom: any
  let WNGeom: any
  // //7级风圈
  if (n.EN7Radii) {
    const path = getSectorPoints(center, n.EN7Radii, 0, 90, 30)
    ENGeom = new Polygon([path])
  }
  if (n.ES7Radii) {
    const path = getSectorPoints(center, n.ES7Radii, 90, 180, 30)
    ESGeom = new Polygon([path])
  }
  if (n.WS7Radii) {
    const path = getSectorPoints(center, n.WS7Radii, 180, 270, 30)
    WSGeom = new Polygon([path])
  }
  if (n.WN7Radii) {
    const path = getSectorPoints(center, n.WN7Radii, 270, 360, 30)
    WNGeom = new Polygon([path])
  }
  const features = []
  for (let i = 0; i < 4; i++) {
    let geom
    if (i == 0) {
      geom = ENGeom
    } else if (i == 1) {
      geom = ESGeom
    } else if (i == 2) {
      geom = WNGeom
    } else {
      geom = WSGeom
    }
    features[i] = new Feature({
      geometry: geom,
    })
  }
  const source = new Vector({
    features: features,
  })
  const rainLayer = new VectorLayer({
    zIndex: 88,
    source: source,
    style: typhoonCircle7,
    properties: {
      title: 'typhoonCircle',
    },
  })
  typhoonLayers.push(rainLayer)
  //   props.map.addLayer(rainLayer)
  //10级风圈
  let EN10Geom
  let ES10Geom
  let WN10Geom
  let WS10Geom
  if (n.EN10Radii) {
    const path = getSectorPoints(center, n.EN10Radii, 0, 90, 30)
    EN10Geom = new Polygon([path])
  }
  if (n.ES10Radii) {
    const path = getSectorPoints(center, n.ES10Radii, 90, 180, 30)
    ES10Geom = new Polygon([path])
  }
  if (n.WS10Radii) {
    const path = getSectorPoints(center, n.WS10Radii, 180, 270, 30)
    WS10Geom = new Polygon([path])
  }
  if (n.WN10Radii) {
    const path = getSectorPoints(center, n.WN10Radii, 270, 360, 30)
    WN10Geom = new Polygon([path])
  }
  const features10 = []
  for (let i = 0; i < 4; i++) {
    let geom
    if (i == 0) {
      geom = EN10Geom
    } else if (i == 1) {
      geom = ES10Geom
    } else if (i == 2) {
      geom = WN10Geom
    } else {
      geom = WS10Geom
    }
    features10[i] = new Feature({
      geometry: geom,
    })
  }
  const source10 = new Vector({
    features: features10,
  })
  const typhoon10 = new VectorLayer({
    properties: {
      title: 'typhoonCircle',
    },
    zIndex: 88,
    source: source10,
    style: typhoonCircle10,
  })
  typhoonLayers.push(typhoon10)
  return typhoonLayers
  //   props.map.addLayer(typhoon10)
}

/**
 * @description 逆时针计算扇形风圈的点集合
 * @param center - {Array<String|Number>}中心点，例如[117.23,23.123]
 * @param radius - {String|Number} 半径km
 * @param startAngle - {String|Number} 起始角度（单位°）
 * @param endAngle - {String|Number} 结束角度（单位°）
 * @param pointNum - {String|Number} 返回构成的弧点个数，默认30
 * @return {Array}
 */
const getSectorPoints = function (
  center: any,
  radius: any,
  startAngle: any,
  endAngle: any,
  pointNum: any,
) {
  radius = Number(radius) * 1000

  const MetersPerUnit = 111319.9 //1度多少米111319.49079327358
  radius = radius / MetersPerUnit //转化为度

  center = [Number(center[0]), Number(center[1])]
  startAngle = Number(startAngle)
  endAngle = Number(endAngle)
  pointNum = Number(pointNum || 30)

  let sin
  let cos
  let x
  let y
  let angle
  const points = []
  const pointsLL = []
  // const lonlat = center
  points.push(fromLonLat([center[0], center[1]]))
  for (let i = 0; i <= pointNum; i++) {
    angle = startAngle + ((endAngle - startAngle) * i) / pointNum
    sin = Math.sin((angle * Math.PI) / 180)
    cos = Math.cos((angle * Math.PI) / 180)
    x = center[0] + radius * sin
    y = center[1] + radius * cos

    points[i + 1] = fromLonLat([x, y])
  }
  points.push(fromLonLat([center[0], center[1]]))
  for (let j = 0; j < points.length; j++) {
    pointsLL[j] = points[j]
  }

  return pointsLL
}

export default useSetWindCircle

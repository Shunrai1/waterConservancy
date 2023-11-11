<template>
  <div id="mapcontainer" ref="mapRef">
    <div class="title">
      <span class="zh">水利信息在线分析服务系统</span>
      <span class="zhuangzu">Shui Li Vahc Yitxinz Vahc Vunz Nghienz</span>
    </div>
    <!-- 右侧操作选择面板 -->
    <Opration :map="map!" @legend="getLegend" />
    <div class="basemap">
      <div class="vector" title="显示矢量标注地图" @click="invisibelVector">
        <img
          src="./assets/zhushi.png"
          style="width: 53px; height: 53px"
          alt=""
        />
      </div>
      <div class="image" title="显示卫星地图" @click="invisibelImage">
        <img
          src="./assets/weixin.png"
          style="width: 53px; height: 53px"
          alt=""
        />
      </div>
      <div class="gaodeVector" title="显示高德地图" @click="invisibelGaode">
        <img
          src="./assets/gaode.png"
          style="width: 53px; height: 53px"
          alt=""
        />
      </div>
    </div>
    <!-- 图例 -->
    <el-card class="legend">
      <template #header>
        <div
          style="
            background-color: aqua;
            width: 5px;
            height: 24px;
            margin-right: 4px;
          "
        ></div>
        <div class="card-header">
          <span>图例</span>
        </div>
        <div
          style="
            background-color: aquamarine;
            width: 20px;
            height: 5px;
            margin-left: 140px;
          "
        ></div>
      </template>
      <table class="table" id="table">
        <!-- <tr>
          <td>你好</td>
          <td>e好啊</td>
        </tr>
        <tr>
          <td>你好</td>
          <td>，好啊</td>
        </tr>
        <tr>
          <td>你好</td>
          <td>你好，好啊</td>
        </tr> -->
      </table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import useLegendStore from '@/store/modules/legend'
// import useWaterStore from '@/store/modules/water'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import Opration from './components/Opration.vue'
//openlayers的API
import { Feature, Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { defaults, Zoom, ZoomToExtent } from 'ol/control'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import { Projection, fromLonLat } from 'ol/proj'
import { LineString, Point, Polygon } from 'ol/geom'

import Vector from 'ol/source/Vector'
import { ImageStatic } from 'ol/source'
import { Image } from 'ol/layer'
import { getCenter } from 'ol/extent'
import { guangxiStyle } from './utils/style'
import { StyleLike } from 'ol/style/Style'

const legendStore = useLegendStore()
// const waterStore = useWaterStore()
const centerCoordinate = ref([109.079829, 23.770015])
const zoom = ref(8)
const view = ref<View>()
const image = ref<TileLayer<any>>()
const vector = ref<TileLayer<any>>()
const vectorSign = ref<TileLayer<any>>()
const gaode = ref<TileLayer<any>>()
const map = ref<Map>()
const mapRef = ref()
const guanxiVector = ref<VectorLayer<any>>()

// 方法
//图例
const getLegend = () => {
  const legendRows = legendStore.legendList

  // 遍历存储的图例行并构建所需的 HTML 元素，通常是“迷你 map ”的 div 和图层名称
  const tble = document.getElementById('table')
  tble!.innerHTML = ''
  for (let i = 0; i < legendRows.length; i++) {
    const row: any = document.createElement('tr')
    row.style = 'margin-bottom: 10px;'
    //symbol
    let cell: any = document.createElement('td')
    // cell.style = 'width:35px;height:35px'
    const div: any = document.createElement('div')
    div.style = 'width:32px; height:32px;'
    div.id = 'mapLegendRowSymbolDiv' + i
    tble!.appendChild(row)
    row.appendChild(cell)
    cell.appendChild(div)
    //layer title
    cell = document.createElement('td')
    cell.style = 'vertical-align: middle;marign-left:2px;'
    tble!.appendChild(row)
    row.appendChild(cell)
    cell.innerHTML = legendRows[i].title
  }

  // 将 HTML 元素添加到页面后，启动 map 并插入假特征以显示符号
  //loop legend rows and and insert the maps
  const extent = [0, 0, 32, 32]
  const projection = new Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: extent,
  })
  for (let i = 0; i < legendRows.length; i++) {
    //target div
    const targetDiv = document.getElementById('mapLegendRowSymbolDiv' + i)
    //layer for icon
    const sourceLegend = new Vector({ wrapX: false })

    const vectorLegend = new VectorLayer({
      source: sourceLegend,
      style: legendRows[i].style as StyleLike,
    })
    //map
    new Map({
      controls: [],
      layers: [
        new Image({
          source: new ImageStatic({
            projection: projection,
            imageExtent: extent,
            url: '',
          }),
        }),
        vectorLegend,
      ],
      target: targetDiv!,
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 2,
      }),
    })
    //icon feature depending on type
    let geom
    if (legendRows[i].geomType == 'point') {
      geom = new Point([16, 16])
    } else if (legendRows[i].geomType == 'polygon') {
      const polyCoords = []
      polyCoords.push([15.7, 15.7])
      polyCoords.push([16.3, 15.7])
      polyCoords.push([16.3, 16.3])
      polyCoords.push([15.7, 16.3])
      polyCoords.push([15.7, 15.7])
      geom = new Polygon([polyCoords])
    } else {
      const lineCoords = []
      lineCoords.push([15.6, 15.6])
      lineCoords.push([16, 16])
      lineCoords.push([16, 15.8])
      lineCoords.push([16.4, 16.2])
      geom = new LineString(lineCoords)
    }
    const feature = new Feature({
      geometry: geom,
    })
    vectorLegend.getSource()!.addFeature(feature)
  }
}
//定义大屏缩放比例
function getScale(w = 1920, h = 1080) {
  const ww = window.innerWidth / w
  const wh = window.innerHeight / h
  return ww < wh ? ww : wh
}
//展示高德地图
const invisibelGaode = () => {
  gaode.value?.setVisible(true)
  image.value?.setVisible(false)
  vector.value?.setVisible(false)
  vectorSign.value?.setVisible(false)
}
//展示卫星地图
const invisibelImage = () => {
  image.value?.setVisible(true)
  vector.value?.setVisible(false)
  vectorSign.value?.setVisible(false)
  gaode.value?.setVisible(false)
}
//展示矢量标注地图
const invisibelVector = () => {
  image.value?.setVisible(false)
  vector.value?.setVisible(true)
  vectorSign.value?.setVisible(true)
  gaode.value?.setVisible(false)
}
// 初始化地图
const initMap = () => {
  //视图
  view.value = new View({
    center: fromLonLat(centerCoordinate.value),
    zoom: zoom.value,
  })
  //天地图影像地图
  image.value = new TileLayer({
    source: new XYZ({
      url: 'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=0359705082220de297c5777e18eddd44',
      wrapX: true,
    }),
  })
  //矢量地图
  vector.value = new TileLayer({
    source: new XYZ({
      url: 'http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=0359705082220de297c5777e18eddd44',
      wrapX: true,
    }),
  })
  //矢量标注
  // vectorSign.value = new TileLayer({
  //   source: new XYZ({
  //     url: 'http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=0359705082220de297c5777e18eddd44',
  //     wrapX: true,
  //   }),
  // })
  //高德
  gaode.value = new TileLayer({
    source: new XYZ({
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
      wrapX: true,
    }),
  })
  //广西矢量源
  const source = new VectorSource({
    format: new GeoJSON(),
    url: 'src/assets/data/data.json',
  })
  guanxiVector.value = new VectorLayer({
    properties: {
      title: '广西省',
    },
    source: source,
    style: guangxiStyle,
  })
  //添加图例到仓库
  legendStore.addLegend({
    title: '广西省',
    geomType: 'polygon',
    style: guangxiStyle,
  })

  //地图对象
  map.value = new Map({
    target: mapRef.value,
    layers: [
      image.value,
      gaode.value,
      vector.value,
      // vectorSign.value,
      guanxiVector.value,
    ],
    view: view.value,
    //清除默认控件
    controls: defaults({
      zoom: false,
      rotate: false,
      attribution: false,
    }).extend([
      new Zoom({
        className: 'zoom',
      }),
    ]),
  })

  //获取当前地图范围(extent:返回的值是一个由最小经度、最小纬度、最大经度和最大纬度组成的数组，)
  const extent = view.value.calculateExtent(map.value.getSize())
  map.value.addControl(
    new ZoomToExtent({
      extent: extent,
      className: 'extent',
    }),
  )
}

//生命周期
onMounted(() => {
  initMap()
  invisibelGaode()
  nextTick(() => {
    getLegend()
  })
  mapRef.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
})
window.onresize = () => {
  mapRef.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
}
onUnmounted(() => {
  console.log('App.vue,destory')
})
</script>

<style scoped lang="scss">
#mapcontainer {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  transform-origin: left top;

  // width: 100vw;
  // height: 100vh;
  // position: relative;
  // zoom控件
  :deep(.zoom) {
    display: flex;
    flex-direction: column;
    width: 27px;
    height: 27px;
    margin-top: 3px;
    margin-left: 3px;
  }

  // 缩放控件
  :deep(.extent) {
    margin-top: 40px;
    margin-left: 3px;
  }

  .title {
    position: absolute;
    top: 2%;
    left: 3%;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 20%;
    background-color: rgb(255 255 255 / 80%);

    .zh {
      font-size: 25px;
    }

    .zhuangzu {
      font-style: italic;
    }
  }

  .basemap {
    margin-left: 10px;

    .vector {
      position: absolute;
      top: 85%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }

    .image {
      position: absolute;
      top: 93%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }

    .gaodeVector {
      position: absolute;
      top: 77%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }
  }
  .legend {
    position: absolute;
    top: 77%;
    left: 5%;
    z-index: 4;
    height: 225px;
    width: 225px;
    background-color: rgb(66, 62, 62);
    color: white;

    :deep(.el-card__header) {
      padding-left: 8px;
      padding-right: 8px;
      height: 26px;
      display: flex;
      align-items: center;
    }

    .table {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
  }
}
</style>

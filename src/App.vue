<template>
  <div id="mapcontainer" ref="mapRef">
    <div class="title">
      <span class="zh">水利信息在线分析服务系统</span>
      <span class="zhuangzu">Shui Li Vahc Yitxinz Vahc Vunz Nghienz</span>
    </div>
    <!-- 右侧操作选择面板 -->
    <Opration :map="map" />
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
    <div class="legend"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Opration from './components/Opration.vue'
//openlayers的API
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { defaults, Zoom, ZoomToExtent } from 'ol/control'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import { fromLonLat } from 'ol/proj'

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
    source: source,
    style: function () {
      return new Style({
        stroke: new Stroke({
          color: 'balck',
        }),
      })
    },
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

  //获取当前地图范围
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
  mapRef.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
})
window.onresize = () => {
  mapRef.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
}
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
      top: 80%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }

    .image {
      position: absolute;
      top: 90%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }

    .gaodeVector {
      position: absolute;
      top: 70%;
      z-index: 4;
      width: 53px;
      height: 53px;
      box-shadow: 0 0 10px rgb(0 0 0 / 100%);
    }
  }
}
</style>

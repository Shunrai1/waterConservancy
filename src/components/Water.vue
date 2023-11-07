<template>
  <div class="top">
    <el-radio-group v-model="radio">
      <el-radio :label="3">水库</el-radio>
      <el-radio :label="6">河流</el-radio>
    </el-radio-group>
    <el-input
      class="input1"
      v-model="waterSearch"
      placeholder="搜索"
      :prefix-icon="Search"
      @keyup.enter.self="handleSearch($event)"
    />
  </div>
  <!-- 水库表 -->
  <el-table
    ref="tableRef"
    :data="tableData"
    border
    style="width: 100%; margin: 10px 0"
  >
    <el-table-column type="index" label="序列" width="60"></el-table-column>
    <el-table-column prop="stname" label="站名" width="150" />
    <el-table-column prop="city" label="所属地市" width="150" />
    <el-table-column prop="substation" label="所属分局" width="180" />
    <el-table-column prop="address" label="具体位置" width="180" />
    <el-table-column prop="rsvrrTM[0].tm" label="时间" width="180" />
    <el-table-column prop="rsvrrTM[0].rz" label="水位/m" width="180" />
    <el-table-column prop="rsvrrTM[0].inq" label="流量(m3/s)" width="180" />
    <el-table-column prop="rsvrrTM[0].otq" label="正常水位/m" width="180" />
    <el-table-column prop="rsvrrTM[0].w" label="警戒水位/m" width="180" />
  </el-table>
  <el-pagination
    background
    v-model:page-size="pageSize"
    v-model:current-page="currentPage"
    :pager-count="5"
    layout="total,->,prev, pager, next"
    :total="total"
    @current-change="currentChange"
  />
  <!-- popup -->
  <div ref="popupRef" id="popup" class="ol-popup">
    <a
      href="#"
      ref="popupCloserRef"
      id="popup-closer"
      class="ol-popup-closer"
    ></a>
    <div id="popup-content" ref="popupContentRef"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getReservoirDataAPI, searchAPI } from '@/api/Water/index'
import { SitInfo } from '@/api/Water/type'
import { Feature, Overlay } from 'ol'
import { Point } from 'ol/geom'
import { Cluster } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector } from 'ol/source'
import { Style, Stroke, Fill, Text, RegularShape, Icon } from 'ol/style'
import useWaterStore from '@/store/modules/water'
import { fromLonLat } from 'ol/proj'

const waterStore = useWaterStore()
const radio = ref(3)
const waterSearch = ref('')
const pageSize = ref(7)
const currentPage = ref(1)
const total = ref(10)
//水库数据
const tableData = ref<SitInfo[]>([])
const props = defineProps(['dataRes', 'map'])
// 实现popup的html元素
const popupRef = ref()
const popupContentRef = ref()
const popupCloserRef = ref()

const reservoirPopup = () => {
  const beijing = fromLonLat([116.28, 39.54])
  //示例标注点北京市的信息对象
  const featuerInfo = {
    geo: beijing,
    att: {
      //标注信息的标题内容
      title: '北京市(中华人民共和国首都)',
      //标注详细信息链接
      titleURL: 'http://www.openlayers.org/',
      //标注内容简介
      text: '北京（Beijing），简称京，中华人民共和国首都、直辖市，中国的政治、文化和国际交往中心……',
      //标注的图片
      imgURL: './src/assets/b1.jpg',
    },
  }
  /**
   * 创建标注样式函数,设置image为图标ol.style.Icon
   * @param {ol.Feature} feature 要素
   */
  const createLabelStyle = function (feature: any) {
    return new Style({
      image: new Icon(
        /** @type {olx.style.IconOptions} */
        {
          //设置图标点
          anchor: [0.5, 60],
          //图标起点
          anchorOrigin: 'top-right',
          //指定x值为图标点的x值
          anchorXUnits: 'fraction',
          //指定Y值为像素的值
          anchorYUnits: 'pixels',
          //偏移
          offsetOrigin: 'top-right',
          // offset:[0,10],
          //图标缩放比例
          // scale:0.5,
          //透明度
          opacity: 0.75,
          //图标的url
          src: './src/assets/b1.jpg',
        },
      ),
      text: new Text({
        //位置
        textAlign: 'center',
        //基准线
        textBaseline: 'middle',
        //文字样式
        font: 'normal 14px 微软雅黑',
        //文本内容
        text: feature.get('name'),
        //文本填充样式（即文字颜色）
        fill: new Fill({ color: '#aa3300' }),
        stroke: new Stroke({ color: '#ffcc33', width: 2 }),
      }),
    })
  }
  //实例化Vector要素，通过矢量图层添加到地图容器中
  const iconFeature = new Feature({
    //坐标点
    geometry: new Point(beijing),
    //名称属性
    name: '北京市',
    //大概人口数（万）
    population: 2115,
  })
  iconFeature.setStyle(createLabelStyle(iconFeature))
  //矢量标注的数据源
  const vectorSource = new Vector({
    features: [iconFeature],
  })
  //矢量标注图层
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  })
  waterStore.setReservoirSign(vectorLayer)
  // map.addLayer(vectorLayer)

  /**
   * 在地图容器中创建一个Overlay
   */
  const popup = new Overlay(
    /** @type {olx.OverlayOptions} */
    {
      //要转换成overlay的HTML元素
      element: popupRef.value,
      //当前窗口可见
      // autoPan: true,
      //Popup放置的位置
      positioning: 'bottom-center',
      //是否应该停止事件传播到地图窗口
      stopEvent: false,
      autoPan: {
        animation: {
          //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度
          duration: 250,
        },
      },
    },
  )
  // map.addOverlay(popup)
  waterStore.setPopUP(popup)
  /**
   * 添加关闭按钮的单击事件（隐藏popup）
   * @return {boolean} Don't follow the href.
   */
  popupCloserRef.value.onclick = function () {
    //未定义popup位置
    popup.setPosition(undefined)
    //失去焦点
    popupCloserRef.value.blur()
    return false
  }
  /**
   * 动态创建popup的具体内容
   * @param {string} title
   */
  function addFeatrueInfo(info: any) {
    //新增a元素
    const elementA = document.createElement('a')
    elementA.className = 'markerInfo'
    elementA.href = info.att.titleURL
    //elementA.innerText = info.att.title;
    setInnerText(elementA, info.att.title)
    // 新建的div元素添加a子节点
    popupContentRef.value.appendChild(elementA)
    //新增div元素
    const elementDiv = document.createElement('div')
    elementDiv.className = 'markerText'
    //elementDiv.innerText = info.att.text;
    setInnerText(elementDiv, info.att.text)
    // 为content添加div子节点
    popupContentRef.value.appendChild(elementDiv)
    //新增img元素
    const elementImg = document.createElement('img')
    elementImg.className = 'markerImg'
    elementImg.src = info.att.imgURL
    // 为content添加img子节点
    popupContentRef.value.appendChild(elementImg)
  }
  /**
   * 动态设置元素文本内容（兼容）
   */
  function setInnerText(element: any, text: any) {
    if (typeof element.textContent == 'string') {
      element.textContent = text
    } else {
      element.innerText = text
    }
  }
  /**
   * 为map添加点击事件监听，渲染弹出popup
   */
  props.map.on('click', function (evt: any) {
    //判断当前单击处是否有要素，捕获到要素时弹出popup.
    //forEachFeatureAtPixel用于在指定像素位置检索地图上的要素
    const feature = props.map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature: any) {
        return feature
      },
    )
    if (feature) {
      //清空popup的内容容器
      popupContentRef.value.innerHTML = ''
      //在popup中加载当前要素的具体信息
      addFeatrueInfo(featuerInfo)
      if (popup.getPosition() == undefined) {
        //设置popup的位置
        popup.setPosition(featuerInfo.geo)
      }
    }
  })
}

//初始化水库图层
const initReservoirLayer = () => {
  //此示例创建多个要素]

  const count = props.dataRes.length
  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([
      parseFloat(props.dataRes[i].lon),
      parseFloat(props.dataRes[i].lat),
    ])
    features[i] = new Feature(new Point(coordinates))
  }

  //矢量要素数据源
  const source = new Vector({
    features: features,
  })

  //聚合标注数据源
  const clusterSource = new Cluster({
    // 指定了聚合的距离阈值，即距离小于等于 50 像素的要素将被组合成一个聚合点
    distance: 50,
    source: source,
  })

  //加载聚合标注的矢量图层
  const styleCache: any = {}
  const clusters = new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      //获取每个聚合标注要素的features属性，含有多少个feature
      const size = feature.get('features').length
      let style = styleCache[size]
      if (!style) {
        style = [
          new Style({
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
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: '#fff',
              }),
              font: '12px Arial', // 设置文本的字体大小和字体类型
            }),
          }),
        ]
        styleCache[size] = style
      }
      return style
    },
  })

  //存储图层
  waterStore.setReservoir(clusters)
}
//当前页数改变
const currentChange = (val: any) => {
  if (radio.value == 3) {
    if (waterSearch.value != '') {
      handleSearch(undefined, val)
    } else {
      initData(val)
    }
  }
}
//搜索
const handleSearch = async (_event: any, pager = 1) => {
  if (radio.value == 3) {
    const res = await searchAPI(waterSearch.value, pageSize.value, pager)
    if (res.code == 200) {
      total.value = res.data.total
      tableData.value = res.data.data
    }
  }
}
const initData = async (pager = 1) => {
  currentPage.value = pager
  //初始化水库数据
  if (radio.value == 3) {
    const res = await getReservoirDataAPI(pageSize.value, currentPage.value)
    if (res.code == 200) {
      total.value = res.data.total
      tableData.value = res.data.data
    }
  }
}

onMounted(() => {
  initData()
  initReservoirLayer()
  reservoirPopup()
})
</script>

<style scoped lang="scss">
.top {
  display: flex;
  justify-content: space-between;
  .input1 {
    width: 200px;
  }
}
#menu {
  width: 100%;
  height: 20px;
  padding: 5px 10px;
  font-size: 14px;
  font-family: '微软雅黑';
  left: 10px;
  text-align: center;
}

#mapCon {
  width: 100%;
  height: 95%;
  position: absolute;
}

.ol-popup {
  position: absolute;
  background-color: white;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 45px;
  left: -50px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer:after {
  content: '✖';
}

#popup-content {
  font-size: 14px;
  font-family: '微软雅黑';
}

#popup-content .markerInfo {
  font-weight: bold;
}
</style>

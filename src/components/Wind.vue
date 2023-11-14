<template>
  <div class="wind">
    <div class="top">台风数据</div>
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="windid"
        label="台风编号"
        width="120"
      ></el-table-column>
      <el-table-column property="windname" label="台风名" width="120" />
      <el-table-column property="windeng" label="英文名">
        <template v-slot="{ row }">
          <div class="custom">
            <span>{{ row.windeng }}</span>
            <el-icon
              v-if="row.isSelected && isSelected"
              size="medium"
              class="palyClass"
              @click="playClick(row)"
            >
              <VideoPause color="red" v-if="row.isPlayed" />
              <VideoPlay v-else />
            </el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="visible" style="margin-top: 10px">
      <div class="middle">&nbsp;&nbsp;{{ windName }}台风路径</div>
      <el-table
        :data="filterrouteData"
        border
        style="width: 100%"
        @row-click="typhoonRow"
        highlight-current-row
      >
        <el-table-column prop="tm" label="时间" width="180" />
        <el-table-column prop="windstrong" label="风力" width="180" />
        <el-table-column prop="windspeed" label="风速"></el-table-column>
      </el-table>
      <el-pagination
        background
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        :pager-count="5"
        layout="total,->,prev, pager, next"
        :total="total"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import {
  getBasicWindInfoAPI,
  getForecastWindInfoAPI,
  getWindInfoAPI,
} from '@/api/Wind/index'
import { windInfo } from '@/api/Wind/type'
import { Feature, Map } from 'ol'
import { LineString, Point, Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { Vector } from 'ol/source'
import { computed, inject, onMounted, ref } from 'vue'
import useWindStore from '@/store/modules/wind'
import { fromLonLat } from 'ol/proj'
import {
  cycNar,
  supTyphoon,
  troDep,
  troSto,
  typhoon,
  typhoonCircle10,
  typhoonCircle7,
  typhoonForecastRoute,
  typhoonRoute,
  vilTyphoon,
} from '@/utils/style'
import useLegendStore from '@/store/modules/legend'
import useSetWindCircle from '@/hooks/typhoonCircle'

const isSelected = ref(true)
const legendStore = useLegendStore()
const windStore = useWindStore()
const pageSize = ref(7)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref()
const routeData = ref<windInfo[]>([]) //后端传来的台风信息
const visible = ref(false)
const windName = ref()
const $emit = defineEmits(['auto'])
const filterrouteData = computed(() => {
  return routeData.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  )
})
const forecastData = ref() //后端传来的台风预测信息
const windRouteList = ref<any>([]) //储存台风路径的数组,多条台风数据
const windForecastRouteList = ref<any>([]) //存储台风预测路径的数组，多条台风预测数据
const getLegend = inject('getLegend', () => {})
const props = defineProps({
  map: {
    type: Map,
    required: true,
  },
})

//播放按钮点击事件
const playClick = (row: any) => {
  row.isPlayed = !row.isPlayed
  //先移除之前存在的要素，图层
  const features = windStore.wind.getSource().getFeatures()
  for (let i = 0; i < features.length; i++) {
    if (row.windid == features[i].get('attribute').windid) {
      windStore.wind.getSource().removeFeature(features[i])
      const arr = props.map.getAllLayers()
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].getProperties().title == 'typhoonCircle') {
          props.map.removeLayer(arr[i])
        }
      }
    }
  }
  //筛选相关台风路径和台风预测路径
  const windroute = JSON.parse(
    JSON.stringify(
      windRouteList.value.filter((v: any) => v[0].windid == row.windid)[0],
    ),
  ).reverse()
  const windforecastroute = JSON.parse(
    JSON.stringify(
      windForecastRouteList.value.filter(
        (v: any) => (v[0].windid = row.windid),
      )[0],
    ),
  ).reverse()
  const windforecastList = windforecastroute.map((v: any) => {
    return fromLonLat([v.jindu, v.weidu])
  })
  //跳转定位
  const view = props.map.getView()
  view.setCenter(fromLonLat([windroute[0].jindu, windroute[0].weidu]))
  view.setZoom(6.5)
  //初始化台风实际
  const pathFeature = new Feature({
    geometry: new LineString([]),
    attribute: { windid: windroute[0].windid },
  })
  pathFeature.setStyle(typhoonRoute)
  //创建预测台风要素
  const forecastPathFeature = new Feature({
    geometry: new LineString(windforecastList),
    attribute: { windid: windforecastroute[0].windid },
  })
  forecastPathFeature.setStyle(typhoonForecastRoute)
  //预测点要素
  const pointforecastFeature: any = []
  for (let j = 0; j < windforecastList.length; j++) {
    pointforecastFeature[j] = new Feature({
      geometry: new Point(windforecastList[j]),
      attribute: {
        windid: windforecastroute[j].windid,
        qiya: windforecastroute[j].qiya,
        tm: windforecastroute[j].tm,
        coordinate: [windforecastroute[j].jindu, windforecastroute[j].weidu],
        type: windforecastroute[j].forecast
          ? 'typhoonForecastPoint'
          : 'typhoonPoint',
        windstrong: windforecastroute[j].windstrong,
        windspeed: windforecastroute[j].windspeed,
        movespeed: windforecastroute[j].movespeed,
        movedirect: windforecastroute[j].movedirect,
        sevradius: windforecastroute[j].sevradius,
        tenradius: windforecastroute[j].tenradius,
        forecast: windforecastroute[j].forecast,
      },
    })
    const qiya = windforecastroute[j].qiya
    let style
    if (qiya == '热带低压') {
      style = troDep
    } else if (qiya == '热带风暴') {
      style = troSto
    } else if (qiya == '强热带风暴') {
      style = cycNar
    } else if (qiya == '台风') {
      style = typhoon
    } else if (qiya == '强台风') {
      style = vilTyphoon
    } else {
      style = supTyphoon
    }
    pointforecastFeature[j].setStyle(style)
  }
  //初始化风圈对象
  const windWN10 = new Feature({ geometry: new Polygon([]) })
  windWN10.setStyle(typhoonCircle10)
  const windWN7 = new Feature({ geometry: new Polygon([]) })
  windWN7.setStyle(typhoonCircle7)
  //动态创建台风
  let index = 0
  const pointFeatrues: any = []
  let source: any //源
  //定时任务
  const mytimer = setInterval(() => {
    if (index >= windroute.length) {
      clearInterval(mytimer)
      row.isPlayed = false
      source.addFeature(forecastPathFeature)
      source.addFeatures(pointforecastFeature)
      return
    }
    row.isPlayed = true
    const node = windroute[index] //实际位置节点
    const curPosition = fromLonLat([node.jindu, node.weidu])
    let nextPostion: any = [] //下一个点
    if (index < windroute.length - 1) {
      const nextNode = windroute[index + 1]
      nextPostion = fromLonLat([Number(nextNode.jindu), Number(nextNode.weidu)])
    }
    //创建风圈
    const nodecircle = {
      WD: node.weidu,
      JD: node.jindu,
      EN7Radii: node.tenradius,
      ES7Radii: node.tenradius + 20,
      WN7Radii: node.tenradius - 30,
      WS7Radii: node.tenradius - 20,
      EN10Radii: node.sevradius,
      ES10Radii: node.sevradius + 20,
      WN10Radii: node.sevradius - 30,
      WS10Radii: node.sevradius - 20,
    }
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == 'typhoonCircle') {
        props.map.removeLayer(arr[i])
      }
    }
    const layers = useSetWindCircle(nodecircle)
    layers?.forEach((v) => {
      props.map.addLayer(v)
    })
    //创建实际路线
    const realPathLine: any = pathFeature.getGeometry()
    if (nextPostion.length) {
      if (index == 0) {
        realPathLine.setCoordinates([curPosition, nextPostion])
      } else {
        realPathLine.appendCoordinate(nextPostion)
      }
    }
    //创建实际路线节点
    const realNodeFeature = new Feature({
      geometry: new Point(curPosition),
      attribute: {
        windid: node.windid,
        qiya: node.qiya,
        tm: node.tm,
        coordinate: [node.jindu, node.weidu],
        type: 'typhoonPoint',
        windstrong: node.windstrong,
        windspeed: node.windspeed,
        movespeed: node.movespeed,
        movedirect: node.movedirect,
        sevradius: node.sevradius,
        tenradius: node.tenradius,
      },
    })
    const qiya = node.qiya
    let style
    if (qiya == '热带低压') {
      style = troDep
    } else if (qiya == '热带风暴') {
      style = troSto
    } else if (qiya == '强热带风暴') {
      style = cycNar
    } else if (qiya == '台风') {
      style = typhoon
    } else if (qiya == '强台风') {
      style = vilTyphoon
    } else {
      style = supTyphoon
    }
    realNodeFeature.setStyle(style)
    pointFeatrues.push(realNodeFeature)
    if (!source) {
      source = new Vector({
        features: pointFeatrues.concat(pathFeature),
      })
    } else {
      source.clear()
      source.addFeatures(pointFeatrues.concat(pathFeature))
    }
    if (windStore.wind) {
      windStore.wind.setSource(source)
    } else {
      windStore.wind = new VectorLayer({
        properties: {
          title: '台风',
        },
        source: source,
        zIndex: 100,
      })
    }
    index++
  }, 300)
}
//台风行点击事件
const typhoonRow = (row: any) => {
  const view = props.map.getView()
  view.setCenter(fromLonLat([row.jindu, row.weidu]))
  view.setZoom(8)
  //地图移动事件结束后，执行回调函数
  props.map.once('moveend', () => {
    const attr = {
      coordinate: [parseFloat(row.jindu), parseFloat(row.weidu)],
      windid: row.windid,
      qiya: row.qiya,
      tm: row.tm,
      type: 'typhoonPoint',
      windstrong: row.windstrong,
      windspeed: row.windspeed,
      movespeed: row.movespeed,
      movedirect: row.movedirect,
      sevradius: row.sevradius,
      tenradius: row.tenradius,
    }
    $emit('auto', props.map.getPixelFromCoordinate(view.getCenter()!), attr)
  })
}
//初始化台风图层
const initWindInfo = () => {
  const lineList: any = [] //路径数组
  const lineFeaturesAttr: any = [] //路径要素属性数组
  const lineFeatures: any = [] //路径要素数组
  const pointFeatures: any = [[]]
  const forecastLineList: any = []
  const foreLineFeaturesAttr: any = []
  const forecastLineFeatures: any = []
  const forecastPointFeatures: any = [[]]
  //windRouteList台风路径列表，存储着多个台风路径
  windRouteList.value.forEach((v: any) => {
    const line = []
    const attr = []
    for (let i = 0; i < v.length; i++) {
      line.push(fromLonLat([v[i].jindu, v[i].weidu]))
      attr.push(v[i])
    }
    lineList.push(line)
    lineFeaturesAttr.push(attr) //每个点有一个属性，存储在以线为单位的数组中，线存储在线属性数组中
  })
  windForecastRouteList.value.forEach((v: any) => {
    const line = []
    const attr = []
    for (let i = 0; i < v.length; i++) {
      line.push(fromLonLat([v[i].jindu, v[i].weidu]))
      attr.push(v[i])
    }
    foreLineFeaturesAttr.push(attr)
    forecastLineList.push(line)
  })
  //遍历创建多个台风路径要素和台风点要素
  for (let i = 0; i < lineList.length; i++) {
    lineFeatures[i] = new Feature({
      geometry: new LineString(lineList[i]),
      attribute: {
        windid: lineFeaturesAttr[i][0].windid,
      },
    })
    lineFeatures[i].setStyle(typhoonRoute)
    if (i != 0) {
      pointFeatures.push([])
    }
    //点要素
    for (let j = 0; j < lineList[i].length; j++) {
      pointFeatures[i][j] = new Feature({
        geometry: new Point(lineList[i][j]),
        attribute: {
          windid: lineFeaturesAttr[i][j].windid,
          qiya: lineFeaturesAttr[i][j].qiya,
          tm: lineFeaturesAttr[i][j].tm,
          coordinate: [
            lineFeaturesAttr[i][j].jindu,
            lineFeaturesAttr[i][j].weidu,
          ],
          type: 'typhoonPoint',
          windstrong: lineFeaturesAttr[i][j].windstrong,
          windspeed: lineFeaturesAttr[i][j].windspeed,
          movespeed: lineFeaturesAttr[i][j].movespeed,
          movedirect: lineFeaturesAttr[i][j].movedirect,
          sevradius: lineFeaturesAttr[i][j].sevradius,
          tenradius: lineFeaturesAttr[i][j].tenradius,
        },
      })
      const qiya = lineFeaturesAttr[i][j].qiya
      let style
      if (qiya == '热带低压') {
        style = troDep
      } else if (qiya == '热带风暴') {
        style = troSto
      } else if (qiya == '强热带风暴') {
        style = cycNar
      } else if (qiya == '台风') {
        style = typhoon
      } else if (qiya == '强台风') {
        style = vilTyphoon
      } else {
        style = supTyphoon
      }
      pointFeatures[i][j].setStyle(style)
    }
  }
  //遍历创建多个台风预测路径要素和台风预测点要素
  for (let i = 0; i < forecastLineList.length; i++) {
    forecastLineFeatures[i] = new Feature({
      geometry: new LineString(forecastLineList[i]),
      attribute: {
        windid: foreLineFeaturesAttr[i][0].windid,
      },
    })
    forecastLineFeatures[i].setStyle(typhoonForecastRoute)
    if (i != 0) {
      forecastPointFeatures.push([])
    }
    //点要素
    for (let j = 0; j < forecastLineList[i].length; j++) {
      forecastPointFeatures[i][j] = new Feature({
        geometry: new Point(forecastLineList[i][j]),
        attribute: {
          windid: foreLineFeaturesAttr[i][j].windid,
          qiya: foreLineFeaturesAttr[i][j].qiya,
          tm: foreLineFeaturesAttr[i][j].tm,
          coordinate: [
            foreLineFeaturesAttr[i][j].jindu,
            foreLineFeaturesAttr[i][j].weidu,
          ],
          type: foreLineFeaturesAttr[i][j].forecast
            ? 'typhoonForecastPoint'
            : 'typhoonPoint',
          windstrong: foreLineFeaturesAttr[i][j].windstrong,
          windspeed: foreLineFeaturesAttr[i][j].windspeed,
          movespeed: foreLineFeaturesAttr[i][j].movespeed,
          movedirect: foreLineFeaturesAttr[i][j].movedirect,
          sevradius: foreLineFeaturesAttr[i][j].sevradius,
          tenradius: foreLineFeaturesAttr[i][j].tenradius,
          forecast: foreLineFeaturesAttr[i][j].forecast,
        },
      })
      const qiya = foreLineFeaturesAttr[i][j].qiya
      let style
      if (qiya == '热带低压') {
        style = troDep
      } else if (qiya == '热带风暴') {
        style = troSto
      } else if (qiya == '强热带风暴') {
        style = cycNar
      } else if (qiya == '台风') {
        style = typhoon
      } else if (qiya == '强台风') {
        style = vilTyphoon
      } else {
        style = supTyphoon
      }
      forecastPointFeatures[i][j].setStyle(style)
    }
  }

  //矢量要素数据源
  const source = new Vector({
    features: lineFeatures
      .concat(forecastLineFeatures)
      .concat(...pointFeatures)
      .concat(...forecastPointFeatures),
  })
  const layer = new VectorLayer({
    properties: {
      title: '台风',
    },
    zIndex: 100,
    source: source,
  })
  windStore.setWindLayer(layer)
}
//得到台风路径信息
const getWindInfo = async (windId: number) => {
  await getWindInfoAPI(windId).then((res) => {
    if (res.code == 200) {
      routeData.value = res.data.reverse()
      total.value = res.data.length
    }
  })
  await getForecastWindInfoAPI(windId).then((res) => {
    if (res.code == 200) {
      forecastData.value = res.data.reverse()
    }
  })
  // let newArr = routeData.value.concat(forecastData.value)
  const newArr = routeData.value
  forecastData.value.push(routeData.value[0])
  let flag = false
  let flag2 = false
  //添加前检查是否存在路径
  windForecastRouteList.value.forEach((v: any) => {
    if (v[0].windid == forecastData.value[0].windid) {
      flag2 = true
    }
  })
  if (!flag2) {
    windForecastRouteList.value.push(forecastData.value)
  }
  //添加前检查是否存在路径
  windRouteList.value.forEach((v: any) => {
    if (v[0].windid == newArr[0].windid) {
      flag = true
    }
  })
  if (!flag) {
    windRouteList.value.push(newArr)
  }
  initWindInfo()
}
//勾选全选行的触发事件
const handleSelectAll = (selection: any) => {
  if (selection.length <= 0) {
    isSelected.value = false
  } else {
    isSelected.value = true
    selection.forEach((row: any) => {
      // console.log(row)
      // if ('isSelected' in row) {
      //   row.isSelected = !row.isSelected
      // } else {
      //   row.isSelected = true
      // }
      row.isSelected = true
    })
  }
}
//勾选数据行的触发事件
const handleSelect = (_selection: any, row: any) => {
  if ('isSelected' in row) {
    row.isSelected = !row.isSelected
  } else {
    row.isSelected = true
  }
}
//表格selection改变事件
const handleSelectionChange = async (val: any) => {
  if (val.length > 0) {
    isSelected.value = true
    // getLegend
    //添加图例
    legendStore.addLegend({
      title: '热带低压',
      style: troDep,
      geomType: 'point',
    })
    legendStore.addLegend({
      title: '热带风暴',
      style: troSto,
      geomType: 'point',
    })
    legendStore.addLegend({
      title: '强热带风暴',
      style: cycNar,
      geomType: 'point',
    })
    legendStore.addLegend({
      title: '台风',
      style: typhoon,
      geomType: 'point',
    })
    legendStore.addLegend({
      title: '强台风',
      style: vilTyphoon,
      geomType: 'point',
    })
    legendStore.addLegend({
      title: '超强台风',
      style: supTyphoon,
      geomType: 'point',
    })
    getLegend()
    visible.value = true
    const windid = val[val.length - 1].windid
    windName.value = val[val.length - 1].windid + val[val.length - 1].windname
    await getWindInfo(windid)
    const features = windStore.wind.getSource().getFeatures()
    for (let i = 0; i < features.length; i++) {
      //如果没有选择，图层移除相关要素和图层
      if (
        !val
          .map((v: any) => v.windid)
          .includes(features[i].get('attribute').windid)
      ) {
        console.log('进来了')
        //移除没有选择的要素
        windStore.wind.getSource().removeFeature(features[i])
        //移除风圈
        const arr = props.map.getAllLayers()
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].getProperties().title == 'typhoonCircle') {
            props.map.removeLayer(arr[i])
          }
        }
      }
    }
    //删除旧图层后重新添加新图层
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '台风') {
        props.map.removeLayer(arr[i])
      }
    }
    props.map.addLayer(windStore.wind)
  } else {
    isSelected.value = false
    legendStore.removeLegend('热带低压')
    legendStore.removeLegend('热带风暴')
    legendStore.removeLegend('强热带风暴')
    legendStore.removeLegend('台风')
    legendStore.removeLegend('强台风')
    legendStore.removeLegend('超强台风')
    getLegend()
    visible.value = false
    props.map.removeLayer(windStore.wind)
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == 'typhoonCircle') {
        props.map.removeLayer(arr[i])
      }
    }
    return
  }
}
//初始化基本台风数据
const initBasicWindInfo = async () => {
  const res = await getBasicWindInfoAPI()
  if (res.code == 200) {
    tableData.value = res.data
  }
}

onMounted(() => {
  initBasicWindInfo()
})
</script>

<style scoped lang="scss">
.wind {
  .top {
    background-color: rgb(65, 65, 210);
    height: 25px;
    width: 90px;
    color: white;
    border-radius: 5%;
    text-align: center;
    font-size: 16px;
    line-height: 25px;
  }
  .middle {
    background-color: skyblue;
    color: white;
    font-size: 16px;
    height: 25px;
    line-height: 25px;
  }
  .custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    //播放按钮样式
    .palyClass {
      color: skyblue;
      cursor: pointer;
    }
  }
}
</style>

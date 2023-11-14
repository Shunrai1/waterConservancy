<template>
  <div class="wind">
    <div class="top">台风数据</div>
    <el-table
      ref="multipleTableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="windid"
        label="台风编号"
        width="120"
      ></el-table-column>
      <el-table-column property="windname" label="台风名" width="120" />
      <el-table-column property="windeng" label="英文名" />
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
        <el-table-column prop="windspeed" label="风速" />
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
import {
  getBasicWindInfoAPI,
  getForecastWindInfoAPI,
  getWindInfoAPI,
} from '@/api/Wind/index'
import { windInfo } from '@/api/Wind/type'
import { Feature, Map } from 'ol'
import { LineString, Point } from 'ol/geom'
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
  typhoonForecastRoute,
  typhoonRoute,
  vilTyphoon,
} from '@/utils/style'
import useLegendStore from '@/store/modules/legend'

const legendStore = useLegendStore()
const windStore = useWindStore()
const pageSize = ref(7)
const currentPage = ref(1)
const total = ref(0)
const tableData = ref()
const routeData = ref<windInfo[]>([])
const visible = ref(false)
const windName = ref()
const $emit = defineEmits(['auto'])
const filterrouteData = computed(() => {
  return routeData.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value,
  )
})
const forecastData = ref()
const windRouteList = ref<any>([])
const windForecastRouteList = ref<any>([])
const getLegend = inject('getLegend', () => {})
const props = defineProps({
  map: {
    type: Map,
    required: true,
  },
})

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
  // console.log('layer', layer.getSource()?.getFeatures())
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
//表格selection改变事件
const handleSelectionChange = async (val: any) => {
  if (val.length > 0) {
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
        windStore.wind.getSource().removeFeature(features[i])
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
}
</style>

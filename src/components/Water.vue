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
      clearable
      @clear="handleSearch"
    />
  </div>
  <!-- 水库表 -->
  <el-table
    ref="tableRef"
    :data="tableData"
    border
    style="width: 100%; margin: 10px 0"
    @row-click="reservoirRow"
    highlight-current-row
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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getReservoirDataAPI, searchAPI } from '@/api/Water/index'
import { SitInfo } from '@/api/Water/type'
import { Feature, Map } from 'ol'
import { Point } from 'ol/geom'
import { Cluster } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector } from 'ol/source'
import { Style, Stroke, Fill, Text, RegularShape } from 'ol/style'
import useWaterStore from '@/store/modules/water'
import { fromLonLat } from 'ol/proj'

const $emit = defineEmits(['auto'])

const waterStore = useWaterStore()
const radio = ref(3)
const waterSearch = ref('')
const pageSize = ref(7)
const currentPage = ref(1)
const total = ref(10)
//水库数据
const tableData = ref<SitInfo[]>([])
const props = defineProps({
  dataRes: {
    type: Object as () => SitInfo[],
    required: true,
  },
  map: {
    type: Map,
    required: true,
  },
})

//水库行点击事件
const reservoirRow = (row: SitInfo) => {
  const view = props.map.getView()
  view.setCenter(fromLonLat([parseFloat(row.lon), parseFloat(row.lat)]))
  view.setZoom(12)
  //地图移动事件结束后，执行回调函数
  props.map.once('moveend', () => {
    const attr = {
      userName: `${row.stname}-水位图`,
      address: `${row.city}${row.address}`,
      data: row.rsvrrTM,
      coordinate: fromLonLat([parseFloat(row.lon), parseFloat(row.lat)]),
      type: 'reservoir',
    }
    $emit('auto', props.map.getPixelFromCoordinate(view.getCenter()!), attr)
  })
}
//初始化水库图层
const initReservoirLayer = () => {
  //此示例创建多个要素
  const count = props.dataRes.length
  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([
      parseFloat(props.dataRes[i].lon),
      parseFloat(props.dataRes[i].lat),
    ])

    const attr = {
      userName: `${props.dataRes[i].stname}-水位图`,
      address: `${props.dataRes[i].city}${props.dataRes[i].address}`,
      data: props.dataRes[i].rsvrrTM,
      coordinate: fromLonLat(coordinates, 'EPSG:4326'),
      type: 'reservoir',
    }
    features[i] = new Feature({
      geometry: new Point(coordinates),
      attribute: attr,
    })
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
    properties: {
      title: '水库',
    },
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
    currentPage.value = pager
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
</style>

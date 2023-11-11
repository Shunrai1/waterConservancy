<template>
  <div class="rain">
    <div class="top"><span>雨量范围 (单位:mm)</span></div>
    <el-checkbox-group
      v-model="checkList"
      class="styleCheckbox"
      @change="checkChange"
      style="margin-top: 5px; margin-bottom: 10px"
    >
      <el-checkbox label="1">
        <template v-slot>
          <div class="container">
            <div ref="lesTen" style="height: 30px; width: 30px"></div>
            <span>小于10</span>
          </div>
        </template>
      </el-checkbox>
      <el-checkbox label="2">
        <template v-slot>
          <div class="container">
            <span ref="tenToTF" style="height: 30px; width: 30px"></span>
            <span>(10-25)</span>
          </div>
        </template>
      </el-checkbox>
      <el-checkbox label="3">
        <template v-slot>
          <div class="container">
            <span ref="TFToF" style="height: 30px; width: 30px"></span>
            <span>(25-50)</span>
          </div>
        </template>
      </el-checkbox>
      <el-checkbox label="4">
        <template v-slot>
          <div class="container">
            <span ref="FToH" style="height: 30px; width: 30px"></span>
            <span>(50-100)</span>
          </div>
        </template>
      </el-checkbox>
      <el-checkbox label="5">
        <template v-slot>
          <div class="container">
            <span ref="HToTHF" style="height: 30px; width: 30px"></span>
            <span>(100-250)</span>
          </div>
        </template>
      </el-checkbox>
      <el-checkbox label="6">
        <template v-slot>
          <div class="container">
            <span ref="MTF" style="height: 30px; width: 30px"></span>
            <span>250以上</span>
          </div>
        </template>
      </el-checkbox>
    </el-checkbox-group>
    <el-radio-group v-model="radio">
      <el-radio :label="3">雨量信息</el-radio>
      <el-radio :label="6">各市最大雨量</el-radio>
      <el-radio :label="9">量级统计</el-radio>
    </el-radio-group>
    <!-- 雨量信息表格 -->
    <el-table
      :data="filterTableData"
      border
      style="width: 100%; margin-top: 2px; margin-bottom: 10px"
      @row-click="rainRow"
      highlight-current-row
    >
      <el-table-column type="index" label="序列" width="60"></el-table-column>
      <el-table-column prop="stname" label="站名" width="150" />
      <el-table-column prop="city" label="所属地市" width="150" />
      <el-table-column prop="substation" label="所属分局" width="180" />
      <el-table-column prop="address" label="具体位置" width="180" />
      <el-table-column prop="soilList[0].col002" label="时间" width="180" />
      <el-table-column prop="soilList[0].col007" label="雨量(mm)" width="180" />
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
</template>

<script setup lang="ts">
import { SitInfo } from '@/api/Water/type'
import useWaterStore from '@/store/modules/water'
import {
  rainFiveToHundredStyle,
  rainHundredToTowHundredAndFiftyStyle,
  rainLessTenStyle,
  rainMoreTowHundredAndFiftyStyle,
  rainTenToTwentyFiveStyle,
  rainTwentyFiveToFiftyStyle,
} from '@/utils/style'
import { CheckboxValueType } from 'element-plus'
import { Feature, View, Map } from 'ol'
import { getCenter } from 'ol/extent'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { Projection, fromLonLat } from 'ol/proj'
import { ImageStatic, Vector } from 'ol/source'
import { Image } from 'ol/layer'
import { computed, onMounted, ref } from 'vue'

const pageSize = ref(7)
const currentPage = ref(1)
const radio = ref(3)
const $emit = defineEmits(['auto'])
const checkList = ref<any>(['1', '2', '3', '4', '5', '6'])
const waterStore = useWaterStore()
const props = defineProps({
  rainRes: {
    type: Object as () => SitInfo[],
    required: true,
  },
  rainTotal: {
    type: Number,
    required: true,
  },
  map: {
    type: Map,
    required: true,
  },
})
const lesTen = ref()
const tenToTF = ref()
const TFToF = ref()
const FToH = ref()
const HToTHF = ref()
const MTF = ref()
const total = ref<number>(props.rainTotal)
const tableData = ref<SitInfo[]>([])
const lesTenData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v < 10)
    .includes(v.soilList[0].col007),
)
const tenToTFData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v >= 10 && v < 25)
    .includes(v.soilList[0].col007),
)
const TFToFData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v >= 25 && v < 50)
    .includes(v.soilList[0].col007),
)
const FToHData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v >= 50 && v < 100)
    .includes(v.soilList[0].col007),
)
const HToTHFData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v >= 100 && v < 250)
    .includes(v.soilList[0].col007),
)
const MTFData: SitInfo[] = props.rainRes.filter((v) =>
  props.rainRes
    .map((v) => v.soilList[0].col007)
    .filter((v) => v >= 250)
    .includes(v.soilList[0].col007),
)
//过滤数据
const filterTableData = computed(() => {
  if (radio.value == 3) {
    return tableData.value.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value,
    )
  }
  return []
})

//表格行点击事件
const rainRow = (row: SitInfo) => {
  const view = props.map.getView()
  view.setCenter(fromLonLat([parseFloat(row.lon), parseFloat(row.lat)]))
  view.setZoom(12)
  //地图移动事件结束后，执行回调函数
  props.map.once('moveend', () => {
    if (radio.value == 3) {
      const attr = {
        userName: `${row.stname}-雨量图`,
        address: `${row.city}${row.address}`,
        data: row.soilList,
        coordinate: fromLonLat([parseFloat(row.lon), parseFloat(row.lat)]),
        type: 'rain',
      }
      $emit('auto', props.map.getPixelFromCoordinate(view.getCenter()!), attr)
    } else {
      const attr = {
        userName: `${row.rivername}-水位图`,
        address: `${row.city}${row.address}`,
        data: row.riverrTM,
        coordinate: fromLonLat([parseFloat(row.lon), parseFloat(row.lat)]),
        type: 'river',
      }
      $emit('auto', props.map.getPixelFromCoordinate(view.getCenter()!), attr)
    }
  })
}
//复选框样式
const checkboxStyle = () => {
  // 将 HTML 元素添加到页面后，启动 map 并插入假特征以显示符号
  //loop legend rows and and insert the maps
  for (let i = 0; i < 6; i++) {
    const extent = [0, 0, 32, 32]
    const projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    })
    //target div
    let targetDiv
    let style
    if (i == 0) {
      targetDiv = lesTen.value
      style = rainLessTenStyle
    } else if (i == 1) {
      targetDiv = tenToTF.value
      style = rainTenToTwentyFiveStyle
    } else if (i == 2) {
      targetDiv = TFToF.value
      style = rainTwentyFiveToFiftyStyle
    } else if (i == 3) {
      targetDiv = FToH.value
      style = rainFiveToHundredStyle
    } else if (i == 4) {
      targetDiv = HToTHF.value
      style = rainHundredToTowHundredAndFiftyStyle
    } else {
      targetDiv = MTF.value
      style = rainMoreTowHundredAndFiftyStyle
    }

    //layer for icon
    const sourceLegend = new Vector({ wrapX: false })

    const vectorLegend = new VectorLayer({
      source: sourceLegend,
      style: style,
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
    const geom = new Point([16, 16])
    const feature = new Feature({
      geometry: geom,
    })
    vectorLegend.getSource()!.addFeature(feature)
  }
}
//雨量复选框变化
const checkChange = (val: CheckboxValueType[]) => {
  console.log(val)
  for (let i = 1; i < 7; i++) {
    let tempData: any
    if (i == 1) {
      tempData = lesTenData
    } else if (i == 2) {
      tempData = tenToTFData
    } else if (i == 3) {
      tempData = TFToFData
    } else if (i == 4) {
      tempData = FToHData
    } else if (i == 5) {
      tempData = HToTHFData
    } else {
      tempData = MTFData
    }
    if (val.includes(i + '')) {
      //添加前去重
      const newData = [...tempData].filter(
        (item) => !tableData.value.some((obj) => obj.stcd === item.stcd),
      )
      tableData.value.push(...newData)
    } else {
      tableData.value = tableData.value.filter(
        (obj) => !tempData.some((item: any) => item.stcd === obj.stcd),
      )
    }
  }
  total.value = tableData.value.length
}
//初始化雨量图层信息
const initRainData = () => {
  const count = props.rainRes.length

  const features = new Array(count)

  for (let i = 0; i < count; ++i) {
    const coordinates = fromLonLat([
      parseFloat(props.rainRes[i].lon),
      parseFloat(props.rainRes[i].lat),
    ])

    const attr = {
      userName: `${props.rainRes[i].stname}-雨量图`,
      address: `${props.rainRes[i].city}${props.rainRes[i].address}`,
      data: props.rainRes[i].soilList,
      coordinate: fromLonLat(coordinates, 'EPSG:4326'),
      type: 'rain',
      rainfall: props.rainRes[i].soilList[0].col007,
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

  //加载矢量图层
  const rainLayer = new VectorLayer({
    zIndex: 100,
    properties: {
      title: '雨量',
    },
    source: source,
    style: function (feature) {
      const rainfall = feature.get('attribute').rainfall
      let style
      if (rainfall < 10) {
        style = rainLessTenStyle
      } else if (rainfall < 25) {
        style = rainTenToTwentyFiveStyle
      } else if (rainfall < 50) {
        style = rainTwentyFiveToFiftyStyle
      } else if (rainfall < 100) {
        style = rainFiveToHundredStyle
      } else if (rainfall < 250) {
        style = rainHundredToTowHundredAndFiftyStyle
      } else {
        style = rainMoreTowHundredAndFiftyStyle
      }
      return style
    },
  })

  //存储图层
  waterStore.setRainLayer(rainLayer)
}

onMounted(() => {
  initRainData()
  checkboxStyle()
  checkChange(['1', '2', '3', '4', '5', '6'])
})
</script>

<style scoped lang="scss">
.rain {
  .top {
    height: 30px;
    background-color: rgba(92, 176, 244, 0.445);
    line-height: 30px;
    span {
      margin-left: 10px;
    }
  }
  .styleCheckbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    .ol-viewport {
      height: 30px;
    }
    .container {
      display: flex;
      align-items: center;
    }
  }
}
</style>

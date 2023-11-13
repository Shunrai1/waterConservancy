<template>
  <div class="opration">
    <el-checkbox-group
      class="checkbox"
      v-model="checkList"
      @change="checkChange"
    >
      <el-checkbox label="实时水情" @change="waterCheck" />
      <el-checkbox label="实时雨情" @change="rainCheck" />
      <el-checkbox label="台风路径" @change="windCheck" />
      <el-checkbox label="卫星云层" />
      <el-button
        @click="handle"
        :class="['btn', flag ? 'active' : '']"
        :icon="List"
        ref="resetBtn"
        size="small"
        circle
      />
    </el-checkbox-group>
    <el-card class="box-card" v-show="flag || editList.length > 0">
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        class="demo-tabs"
        closable
        @tab-remove="removeTab"
      >
        <el-tab-pane
          v-for="item in editList"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <template v-slot>
            <Water
              v-if="editableTabsValue == '1'"
              :dataRes="dataRes"
              :map="map"
              @auto="autoPopup"
              :riverRes="riverRes"
            />
            <Rain
              v-show="editableTabsValue == '2'"
              :rainRes="rainRes"
              :rainTotal="rainTotal"
              @auto="autoPopup"
              :map="map"
            ></Rain>
            <Wind v-show="editableTabsValue == '3'" :map="map"></Wind>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
  <!-- popup -->
  <div v-show="popupVisible" ref="popupRef" id="popup" class="ol-popup">
    <a
      href="#"
      ref="popupCloserRef"
      id="popup-closer"
      class="ol-popup-closer"
    ></a>
    <!-- 标题 -->
    <div id="popup-content" ref="popupContentRef"></div>
    <!-- 内容 -->
    <div v-show="waterVisible">
      <div ref="chart" id="chart" style="width: 300px; height: 200px"></div>
      <el-form label-width="70px" class="form">
        <el-form-item label="最新水位">
          <el-tag type="info" style="margin-right: 10px">
            {{ currentLevel }}/m
          </el-tag>
          <el-tag :type="currentLevel < dangerLevel ? 'success' : 'danger'">
            {{ currentLevel < dangerLevel ? '安全水位' : '危险水位' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间">
          {{ time }}
        </el-form-item>
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址">
          {{ address }}
        </el-form-item>
      </el-form>
    </div>
    <div v-show="rainVisible">
      <div ref="rainChart" id="chart" style="width: 300px; height: 200px"></div>
      <el-form label-width="70px" class="form">
        <el-form-item label="最新雨量">
          <el-tag type="info" style="margin-right: 10px">
            {{ currentLevel }}/mm
          </el-tag>
        </el-form-item>
        <el-form-item label="时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间">
          {{ time }}
        </el-form-item>
        <el-form-item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;址">
          {{ address }}
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import Wind from './Wind.vue'
import useWaterStore from '@/store/modules/water'
import { List } from '@element-plus/icons-vue'
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { CheckboxValueType, TabPaneName } from 'element-plus'
import Water from './Water.vue'
import Rain from './Rain.vue'
import { SitInfo } from '@/api/Water/type'
import { getAllAPI, getRiverAllAPI } from '@/api/Water'
import { usePopup } from '@/hooks/index'
import { Pixel } from 'ol/pixel'
import { Map } from 'ol'
import useLegendStore from '@/store/modules/legend'
import { reservoirStyle, riverStyle } from '@/utils/style'
import { getAllRainAPI } from '@/api/Rain'

const legendStore = useLegendStore()
const $emit = defineEmits(['legend'])
const props = defineProps({
  map: {
    type: Map,
    required: true,
  },
})
const waterStore = useWaterStore()
const editList = ref<any>([]) //card的值
const checkList = ref<any>([]) //多选框的值
const flag = ref(false) //card展示
const editableTabsValue = ref('1') //默认选中的tab
const resetBtn = ref()
let dataRes: SitInfo[] = reactive([])
let riverRes: SitInfo[] = reactive([])
let rainRes: SitInfo[] = reactive([])
const waterisChecked = ref(false)
const rainisChecked = ref(false)
const windChecked = ref(false)
// 实现popup的html元素
const popupVisible = ref<boolean>(false)
const popupRef = ref()
const popupContentRef = ref()
const popupCloserRef = ref()
const chart = ref()
const waterVisible = ref<boolean>(false) //控制实时水情的popup内容区是否展示
const rainVisible = ref<boolean>(false) ////控制实时雨情的popup内容区是否展示
const dangerLevel = ref<number>(120) //危险水位
const currentLevel = ref<number>(100) //目前水位
const time = ref()
const address = ref()
const rainTotal = ref()
const rainChart = ref()
const reservoirAndRiverVisble = ref<boolean>(false)
// let rainVisible = ref<boolean>(false)

//台风路径多选框改变
const windCheck = (val: any) => {
  editableTabsValue.value = '3'
  windChecked.value = val
}
//实时水情多选框改变
const waterCheck = (val: any) => {
  waterisChecked.value = val
  editableTabsValue.value = '1'
}
//实时雨情多选框改变
const rainCheck = (val: any) => {
  rainisChecked.value = val
  editableTabsValue.value = '2'
}
//获取所有雨量数据
const getAllRain = () => {
  getAllRainAPI().then((res) => {
    if (res.code == 200) {
      rainRes = res.data.data
      rainTotal.value = res.data.total
    }
  })
}
//获取所有河流信息
const getAllRiver = () => {
  getRiverAllAPI().then((res) => {
    if (res.code == 200) {
      riverRes = res.data.data
    }
  })
}
//获取所有水库信息
const getAllReservoir = () => {
  getAllAPI().then((res) => {
    if (res.code == 200) {
      dataRes = res.data.data
    }
  })
}
//点击table自动弹出popup
const autoPopup = (pixel: Pixel, attribute: any) => {
  const refs = {
    popupRef,
    popupContentRef,
    popupCloserRef,
    chart,
    rainChart,
    waterVisible,
    rainVisible,
    dangerLevel,
    currentLevel,
    time,
    address,
    popupVisible,
  }
  if (attribute.type == 'reservoir') {
    usePopup(1, props.map, pixel, attribute, refs, 'reservoir')
  } else if (attribute.type == 'river') {
    usePopup(1, props.map, pixel, attribute, refs, 'river')
  } else if (attribute.type == 'rain') {
    usePopup(1, props.map, pixel, attribute, refs, 'rain')
  }
}
//地图弹出框
const reservoirPopup = () => {
  /**
   * 为map添加点击事件监听，渲染弹出popup
   */
  props.map.on('click', function (evt: any) {
    //判断当前单击处是否有要素，捕获到要素时弹出popup.
    //forEachFeatureAtPixel用于在指定像素位置检索地图上的要素
    //该方法接受两个参数：
    // pixel：要素的像素位置，通常是通过事件对象（如鼠标点击事件）的 evt.pixel 属性获得的。
    // callback：一个回调函数，用于处理检索到的要素。
    const feature = props.map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature: any) {
        return feature
      },
    )
    if (feature) {
      const refs = {
        popupRef,
        popupContentRef,
        popupCloserRef,
        chart,
        rainChart,
        waterVisible,
        rainVisible,
        dangerLevel,
        currentLevel,
        time,
        address,
        popupVisible,
      }
      const pixel = props.map.getEventPixel(evt.originalEvent)
      let attribute
      //得到feature的属性
      if (!feature.getProperties().features) {
        console.log(feature.getProperties())
        attribute = feature.getProperties().attribute
      } else {
        attribute = feature.getProperties().features[0].values_.attribute
      }

      if (attribute.type == 'reservoir') {
        console.log('popup')
        const pLen = feature.getProperties().features.length
        reservoirAndRiverVisble.value = true
        rainVisible.value = false
        usePopup(pLen, props.map, pixel, attribute, refs, 'reservoir')
      } else if (attribute.type == 'river') {
        reservoirAndRiverVisble.value = true
        rainVisible.value = false
        const pLen = 1
        usePopup(pLen, props.map, pixel, attribute, refs, 'river')
      } else if (attribute.type == 'rain') {
        reservoirAndRiverVisble.value = false
        rainVisible.value = true
        const pLen = 1
        usePopup(pLen, props.map, pixel, attribute, refs, 'rain')
      }
    } else {
      // 当前点击位置没有要素
      return false
    }
  })
  /**
   * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
   */
  props.map.on('pointermove', function (e: any) {
    const pixel = props.map.getEventPixel(e.originalEvent)
    const hit = props.map.hasFeatureAtPixel(pixel)
    props.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
  })
}

//复选框变化,添加或删除图层
const checkChange = (valList: CheckboxValueType[]) => {
  //实时水情
  if (valList.includes('实时水情')) {
    let rsirFlag = false
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].getProperties().title ==
        waterStore.reservoir.getProperties().title
      ) {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      props.map.addLayer(waterStore.reservoir)
      //添加图例
      legendStore.addLegend({
        title: '水库',
        style: reservoirStyle,
        geomType: 'point',
      })
      props.map.addLayer(waterStore.river)

      legendStore.addLegend({
        title: '河流',
        style: riverStyle,
        geomType: 'point',
      })
    }
    $emit('legend')
  } else {
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].getProperties().title == '水库' ||
        arr[i].getProperties().title == '河流'
      ) {
        props.map.removeLayer(arr[i])
      }
    }
    legendStore.removeLegend('水库')
    legendStore.removeLegend('河流')
    $emit('legend')
  }

  //实时雨情
  if (valList.includes('实时雨情')) {
    let rsirFlag = false
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].getProperties().title == waterStore.rain?.getProperties().title
      ) {
        rsirFlag = true
      }
    }
    if (!rsirFlag) {
      props.map.addLayer(waterStore.rain)
    }
    $emit('legend')
  } else {
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '雨量') {
        props.map.removeLayer(arr[i])
      }
    }
    $emit('legend')
  }
  if (!valList.includes('台风路径')) {
    console.log('taifenlujjin1')
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == '台风') {
        props.map.removeLayer(arr[i])
      }
    }
  }
}
//list的icon点击事件
const handle = () => {
  //点击失去焦点
  resetBtn.value.ref.blur()
  flag.value = !flag.value
  if (flag.value == false) {
    editList.value = []
    return
  }
  if (editList.value.length == 0 && checkList.value.length == 0) {
    editList.value.push({
      title: '实时水情',
      name: '1',
      content: 'Tab 1 content',
    })
    checkList.value.push('实时水情')
  } else {
    editList.value = []
    checkList.value.forEach((v: any) => {
      if (v == '实时水情') {
        editList.value.push({
          title: '实时水情',
          name: '1',
          content: 'Tab 1 content',
        })
      } else if (v == '实时雨情') {
        editList.value.push({
          title: '实时雨情',
          name: '2',
          content: 'Tab 2 content',
        })
      } else if (v == '台风路径') {
        editList.value.push({
          title: '台风路径',
          name: '3',
          content: 'Tab 2 content',
        })
      } else {
        editList.value.push({
          title: '卫星云层',
          name: '4',
          content: 'Tab 2 content',
        })
      }
    })
  }
}
//移除tab
const removeTab = (targetName: TabPaneName) => {
  const tabs = editList.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab: any, index: any) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editList.value = tabs.filter((tab: any) => tab.name !== targetName)
}
watch(
  () => checkList.value,
  () => {
    editList.value = []
    checkList.value.forEach((v: any) => {
      if (v == '实时水情') {
        editList.value.push({
          title: '实时水情',
          name: '1',
          content: 'Tab 1 content',
        })
      } else if (v == '实时雨情') {
        editList.value.push({
          title: '实时雨情',
          name: '2',
          content: 'Tab 2 content',
        })
      } else if (v == '台风路径') {
        editList.value.push({
          title: '台风路径',
          name: '3',
          content: 'Tab 2 content',
        })
      } else {
        editList.value.push({
          title: '卫星云层',
          name: '4',
          content: 'Tab 2 content',
        })
      }
    })
  },
)
watch(
  () => editList.value,
  () => {
    if (editList.value.length == 0) {
      flag.value = false
    } else {
      flag.value = true
    }
  },
)

onMounted(() => {
  console.log('mounted--')
  getAllReservoir()
  getAllRiver()
  getAllRain()
  nextTick(() => {
    reservoirPopup()
  })
})
onBeforeUnmount(() => {
  console.log('Opration.vue,destory--')
})
</script>

<style scoped lang="scss">
.opration {
  position: absolute;
  top: 2%;
  right: 2%;
  z-index: 4;
  width: 480px;
  .checkbox {
    background-color: rgba(135, 207, 235, 0.21);
    display: flex;
    justify-content: center;
  }
  :deep(.el-checkbox__label) {
    font-weight: bold;
  }
  .box-card {
    margin-top: 15px;
    width: 480px;
  }
  .btn {
    margin-top: 5px;
    margin-left: 15px;
  }
  .active {
    color: red;
  }
}

// popup

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
  width: 300px;
  .form {
    div {
      margin: 0;
    }
  }
}

.ol-popup::after,
.ol-popup::before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup::after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup::before {
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

.ol-popup-closer::after {
  content: '✖';
}

#popup-content {
  font-size: 14px;
  font-family: '微软雅黑';
  font-weight: bold;
}
</style>

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
      <el-checkbox label="卫星云层" @change="satelliteCheck" />
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
            <Wind
              v-show="editableTabsValue == '3'"
              :map="map"
              @auto="autoPopup"
            ></Wind>
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
    <div v-show="titleVisible" id="popup-content" ref="popupContentRef"></div>
    <div v-show="typhoonVisible" class="typhoonTitle">
      {{ typhoonType == 'typhoonPoint' ? '实测路径' : '预测路径' }}
    </div>
    <!-- 内容 -->
    <!-- 实时水情 -->
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
    <!-- 实时雨情 -->
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
    <!-- 台风路径 -->
    <div v-show="typhoonVisible">
      <el-form label-width="70px" class="form">
        <el-form-item
          :label="typhoonType == 'typhoonPoint' ? '过去时间' : '预测时间'"
        >
          {{ tm }}
        </el-form-item>
        <el-form-item label="预测国家" v-show="typhoonType != 'typhoonPoint'">
          {{ forecast }}
        </el-form-item>
        <el-form-item label="坐标位置">
          {{ lonlat }}
        </el-form-item>
        <el-form-item label="最大风力">{{ windstrong }}级</el-form-item>
        <el-form-item label="最大风速">{{ windspeed }}米/秒</el-form-item>
        <el-form-item label="移动速度">{{ movespeed }}公里/小时</el-form-item>
        <el-form-item label="移动方向">{{ movedirect }}</el-form-item>
      </el-form>
    </div>
  </div>
  <!-- 卫星云层dialog -->
  <el-dialog
    :close-on-click-modal="false"
    v-model="visible"
    :show-close="false"
    class="dialog"
  >
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">卫星图层</h4>
        <el-button type="danger" @click="closeDialog">
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          关闭
        </el-button>
      </div>
    </template>
    <div class="main">
      <div class="mainLeft">
        <div class="leftTop">
          <div class="timeDiv">
            &nbsp;&nbsp; 动画延时:&nbsp;&nbsp;&nbsp;&nbsp;
            <el-input-number
              v-model="num"
              :min="1"
              :max="10"
              style="width: 80px; height: 26px"
              controls-position="right"
            />
          </div>
          <div class="functionButton">
            <input type="button" value="播放" @click="startShowCloud()" />
            <input type="button" value="停止" @click="stopShowCloud()" />
          </div>
        </div>

        <div ref="selectImgRef" class="selectImg" id="selectImgList"></div>
      </div>
      <div class="mainRight">
        <div class="yuntuMain" id="yuntuImg">
          <img
            ref="imgRef"
            style="height: 530px; width: 720px"
            src="@/assets/images/yuntu/201206180000.jpg"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import Wind from './Wind.vue'
import useWaterStore from '@/store/modules/water'
import { List, CircleCloseFilled } from '@element-plus/icons-vue'
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
import useSetWindCircle from '@/hooks/typhoonCircle'

const num = ref(1)
const visible = ref(false)
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
const titleVisible = ref(true)
const waterVisible = ref<boolean>(false) //控制实时水情的popup内容区是否展示
const rainVisible = ref<boolean>(false) ////控制实时雨情的popup内容区是否展示
const typhoonVisible = ref<boolean>(false) //控制台风路径的popup内容区是否展示
const dangerLevel = ref<number>(120) //危险水位
const currentLevel = ref<number>(100) //目前水位
const time = ref()
const address = ref()
const rainTotal = ref()
const rainChart = ref()
const reservoirAndRiverVisble = ref<boolean>(false)
//台风路径
const tm = ref()
const lonlat = ref()
const windstrong = ref()
const windspeed = ref()
const movespeed = ref()
const movedirect = ref()
const typhoonType = ref()
const forecast = ref()
// let rainVisible = ref<boolean>(false)
const timeStrArray: any = [] //记录云图地址数组
const timeShowStrArr: any = [] //记录云图地址数组
let ytInfoTimer: any = null //云图播放动画时间控制器
let timeControl: any = 0 //控制卫星云图播放
const selectImgRef = ref()
const imgRef = ref()
/*
 *	初始化图片列表
 *@author fmm 2015-06-24
 */
function initSelectImgList() {
  GetImgAddress() //得到图片地址
  //动态创建左侧列表
  let html = '<ul>'
  for (let i = 0; i < timeStrArray.length; i++) {
    const tempHtml =
      "<li class='wxytLi c' style='padding:5px;font-size:16px;cursor:pointer;' >" +
      timeStrArray[i] +
      '</li>'
    html += tempHtml
  }
  html += '</ul>'
  selectImgRef.value.innerHTML = html
  // 通过事件委托绑定点击事件
  selectImgRef.value.addEventListener('click', handleClick)
  // 绑定鼠标移入事件
  selectImgRef.value.addEventListener('mouseover', handleMouseOver)

  // 绑定鼠标移出事件
  selectImgRef.value.addEventListener('mouseout', handleMouseOut)
  let selectedLi: any = null // 用于跟踪当前选中的 <li> 元素
  function handleClick(event: any) {
    const target = event.target
    const imgUrl = '/src/assets/images/yuntu/' + target.textContent + '.jpg'
    imgRef.value.src = imgUrl
    timeControl = timeShowStrArr.indexOf(imgUrl)
    if (target && target.tagName === 'LI') {
      if (selectedLi) {
        selectedLi.style.backgroundColor = 'white' // 将上一个选中的 <li> 的背景色设置为白色
      }

      target.style.backgroundColor = 'skyblue' // 将当前点击的 <li> 的背景色设置为天蓝色
      selectedLi = target // 更新选中的 <li> 元素
    }
  }

  function handleMouseOver(event: any) {
    const target = event.target
    if (target && target.tagName === 'LI' && target !== selectedLi) {
      target.style.backgroundColor = 'skyblue' // 将当前鼠标移入的 <li> 的背景色设置为天蓝色
    }
  }

  function handleMouseOut(event: any) {
    const target = event.target
    if (target && target.tagName === 'LI' && target !== selectedLi) {
      target.style.backgroundColor = 'white' // 将当前鼠标移出的 <li> 的背景色设置为白色
    }
  }
}

/*
 *	得到图片的地址
 *@author fmm 2015-06-24
 */
function GetImgAddress() {
  const dataTimeTemp = '20120618'
  let timeStr = ''
  for (let i = 0; i < 24; i++) {
    //一天24个小时
    for (let j = 0; j < 60; j = j + 15) {
      //每15分钟显示一张图片
      if (i < 10) {
        if (j == 0) {
          timeStr = dataTimeTemp + '0' + i + '0' + j
        } else {
          timeStr = dataTimeTemp + '0' + i + j
        }
      } else {
        if (j == 0) {
          timeStr = dataTimeTemp + i + '0' + j
        } else {
          timeStr = dataTimeTemp + i + j
        }
      }
      timeStrArray.push(timeStr)
      const strAddress = '/src/assets/images/yuntu/' + timeStr + '.jpg'
      timeShowStrArr.push(strAddress)
    }
  }
}
/*
 *	开始播放云图动画
 *@author fmm 2015-06-24
 */
function startShowCloud() {
  if (ytInfoTimer != null) {
    clearTimer()
  }
  //设置计时器动态播放
  ytInfoTimer = setInterval(function () {
    console.log(timeControl)
    const liElements: any = document.querySelectorAll('.selectImg ul li')
    if (timeControl * 25 > 230) {
      selectImgRef.value.scrollTop = timeControl * 25 - 150
    }
    if (timeControl != 0) {
      liElements[timeControl - 1].style.backgroundColor = 'white'
    }
    liElements[timeControl].style.backgroundColor = 'skyblue'
    if (timeControl < timeShowStrArr.length) {
      const imgUrl = timeShowStrArr[timeControl++]
      imgRef.value.src = imgUrl //切换云图图片
    } else {
      timeControl = 0
      clearTimer()
    }
  }, num.value * 1000)
}

/*
 *	清除卫星云图时间控制器
 *@author fmm 2015-06-25
 */
function clearTimer() {
  if (ytInfoTimer != null) {
    clearInterval(ytInfoTimer)
    ytInfoTimer = null
  }
}

/*
 *	停止卫星云图播放
 *@author fmm 2015-06-25
 */
function stopShowCloud() {
  const liElements: any = document.querySelectorAll('.selectImg ul li')
  clearTimer()
  if (timeControl > 0) {
    liElements[timeControl - 1].style.backgroundColor = 'skyblue'
  }
}
//卫星云图多选框改变
const satelliteCheck = (val: any) => {
  visible.value = val
  timeControl = 0
  if (visible.value) {
    nextTick(() => {
      initSelectImgList()
    })
  }
}
const closeDialog = () => {
  visible.value = false
  clearInterval(ytInfoTimer)
  const index = checkList.value.indexOf('卫星图层')
  checkList.value.splice(index, 1)
}
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
    titleVisible,
    typhoonData: {
      typhoonVisible,
      tm,
      lonlat,
      windstrong,
      windspeed,
      movespeed,
      movedirect,
      forecast,
    },
  }
  if (attribute.type == 'reservoir') {
    usePopup(1, props.map, pixel, attribute, refs, 'reservoir')
  } else if (attribute.type == 'river') {
    usePopup(1, props.map, pixel, attribute, refs, 'river')
  } else if (attribute.type == 'rain') {
    usePopup(1, props.map, pixel, attribute, refs, 'rain')
  } else if (attribute.type == 'typhoonPoint') {
    typhoonType.value = 'typhoonPoint'
    usePopup(1, props.map, pixel, attribute, refs, 'typhoonPoint')
    const node = {
      WD: attribute.coordinate[1],
      JD: attribute.coordinate[0],
      EN7Radii: attribute.tenradius,
      ES7Radii: attribute.tenradius + 20,
      WN7Radii: attribute.tenradius - 30,
      WS7Radii: attribute.tenradius - 20,
      EN10Radii: attribute.sevradius,
      ES10Radii: attribute.sevradius + 20,
      WN10Radii: attribute.sevradius - 30,
      WS10Radii: attribute.sevradius - 20,
    }
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].getProperties().title == 'typhoonCircle') {
        props.map.removeLayer(arr[i])
      }
    }
    const layers = useSetWindCircle(node)
    layers?.forEach((v) => {
      props.map.addLayer(v)
    })
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
        titleVisible,
        typhoonData: {
          typhoonVisible,
          tm,
          lonlat,
          windstrong,
          windspeed,
          movespeed,
          movedirect,
          forecast,
        },
      }
      const pixel = props.map.getEventPixel(evt.originalEvent)
      let attribute
      //得到feature的属性
      if (!feature.getProperties().features) {
        attribute = feature.getProperties().attribute
      } else {
        //聚合要素
        attribute = feature.getProperties().features[0].values_.attribute
      }
      if (!attribute) return
      if (attribute.type == 'reservoir') {
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
      } else if (attribute.type == 'typhoonPoint') {
        const pLen = 1
        typhoonType.value = 'typhoonPoint'
        usePopup(pLen, props.map, pixel, attribute, refs, 'typhoonPoint')
        // {JSON} 格式{"WD":"20.9","JD":"116.2","EN7Radii":"220","ES7Radii":"220","WS7Radii":"260","WN7Radii":"240","EN10Radii":"50","ES10Radii":"80","WS10Radii":"80","WN10Radii":"50"}
        const node = {
          WD: attribute.coordinate[1],
          JD: attribute.coordinate[0],
          EN7Radii: attribute.tenradius,
          ES7Radii: attribute.tenradius + 20,
          WN7Radii: attribute.tenradius - 30,
          WS7Radii: attribute.tenradius - 20,
          EN10Radii: attribute.sevradius,
          ES10Radii: attribute.sevradius + 20,
          WN10Radii: attribute.sevradius - 30,
          WS10Radii: attribute.sevradius - 20,
        }
        const arr = props.map.getAllLayers()
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].getProperties().title == 'typhoonCircle') {
            props.map.removeLayer(arr[i])
          }
        }
        const layers = useSetWindCircle(node)
        layers?.forEach((v) => {
          props.map.addLayer(v)
        })
      } else if (attribute.type == 'typhoonForecastPoint') {
        const pLen = 1
        typhoonType.value = 'typhoonForecastPoint'
        usePopup(
          pLen,
          props.map,
          pixel,
          attribute,
          refs,
          'typhoonForecastPoint',
        )
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
    legendStore.removeLegend('热带低压')
    legendStore.removeLegend('热带风暴')
    legendStore.removeLegend('强热带风暴')
    legendStore.removeLegend('台风')
    legendStore.removeLegend('强台风')
    legendStore.removeLegend('超强台风')
    $emit('legend')
    const arr = props.map.getAllLayers()
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].getProperties().title == '台风' ||
        arr[i].getProperties().title == 'typhoonCircle'
      ) {
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

<style lang="scss">
.dialog {
  .el-dialog__body {
    padding-top: 5px;
  }
  .main {
    display: flex;
    justify-content: center;
    .mainLeft {
      width: 180px;
      height: 530px;
      border: 1px solid black;
      .leftTop {
        background-color: #cccccc;
      }
      .timeDiv {
        background-color: #cccccc;
        padding-top: 5px;
        padding-bottom: 10px;
      }
      .functionButton {
        background-color: #cccccc;
        display: flex;
        justify-content: space-around;
        padding-bottom: 10px;
        border-bottom: 1px solid black;
      }
      .selectImg {
        overflow: auto; /* 设置溢出内容时显示滚动条 */
        height: 450px; /* 设置容器的固定高度，超出部分将出现滚动条 */
        .wxytLi:hover {
          background-color: skyblue;
        }
        li.selected {
          background-color: skyblue;
        }
      }
    }
    .mainRight {
      width: 720px;
      height: 530px;
    }
  }
}
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
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
  //台风标题
  .typhoonTitle {
    background-color: rgb(142, 142, 232);
    height: 25px;
    width: 90px;
    color: white;
    border-radius: 5%;
    text-align: center;
    font-size: 16px;
    line-height: 25px;
    margin-bottom: 10px;
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

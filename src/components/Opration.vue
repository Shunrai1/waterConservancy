<template>
  <div class="opration">
    <el-checkbox-group v-model="checkList" @change="checkChange">
      <el-checkbox label="实时水情" />
      <el-checkbox label="实时雨情" />
      <el-checkbox label="台风路径" />
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
            <Water :dataRes="dataRes" />
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
  <!-- popup -->
  <div ref="popupRef" id="popup" class="ol-popup">
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
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import useWaterStore from '@/store/modules/water'
import { List } from '@element-plus/icons-vue'
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { CheckboxValueType, TabPaneName } from 'element-plus'
import Water from './Water.vue'
import { Reservoir, SitInfo } from '@/api/Water/type'
import { getAllAPI } from '@/api/Water'
import { Overlay } from 'ol'

const props = defineProps(['map'])
const waterStore = useWaterStore()
const editList = ref<any>([]) //card的值
const checkList = ref<any>([]) //多选框的值
const flag = ref(false) //card展示
const editableTabsValue = ref('1') //默认选中的tab
const resetBtn = ref()
let dataRes: SitInfo[] = reactive([])
// 实现popup的html元素
const popupRef = ref()
const popupContentRef = ref()
const popupCloserRef = ref()
const chart = ref()
const waterVisible = ref<boolean>(false) //控制实时水情的popup内容区是否展示
const dangerLevel = ref<number>(120) //危险水位
const currentLevel = ref<number>(100) //目前水位
const time = ref()
const address = ref()
//获取所有水库信息
const getAllReservoir = () => {
  getAllAPI().then((res) => {
    if (res.code == 200) {
      dataRes = res.data.data
    }
  })
}

//水库弹出框
const reservoirPopup = () => {
  const overlay = new Overlay({
    element: popupRef.value,
    //当前窗口可见
    autoPan: true,
    positioning: 'bottom-center',
  })
  /**
   * 添加关闭按钮的单击事件（隐藏popup）
   * @return {boolean} Don't follow the href.
   */
  popupCloserRef.value.onclick = function () {
    //未定义popup位置
    overlay.setPosition(undefined)
    //失去焦点
    popupCloserRef.value.blur()
    return false
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
    console.log('popup')
    popupContentRef.value.innerHTML = ''

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
      if (!feature.getProperties().features) return
      //得到feature的属性
      const attribute = feature.getProperties().features[0].values_.attribute

      if (attribute.type !== 'reservoir') return
      const pLen = feature.getProperties().features.length
      if (pLen === 1) {
        waterVisible.value = true

        // getEventPixel(evt.originalEvent) 是在地图点击事件中获取点击位置的像素坐标。
        const pixel = props.map.getEventPixel(evt.originalEvent)
        props.map.forEachFeatureAtPixel(pixel, function () {
          //新增div元素
          const elementDiv = document.createElement('div')
          elementDiv.className = 'markerText'
          setInnerText(elementDiv, `${attribute.userName}`)

          const xAxisData = attribute.data.map((v: Reservoir) => v.tm).reverse()
          const data = attribute.data.map((v: Reservoir) => v.rz).reverse()
          // let normal = attribute.data[0].otq
          // let danger = attribute.data[0].w
          // dangerLevel.value = attribute.data[0].w
          address.value = attribute.address
          time.value = attribute.data[0].tm
          currentLevel.value = attribute.data[0].rz
          const myChart = echarts.init(chart.value)

          /** @type EChartsOption */
          const option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            grid: {
              left: '10%',
              bottom: '20%',
            },
            xAxis: {
              type: 'category',
              data: xAxisData,
            },
            yAxis: {
              max: 150,
              type: 'value',
              name: '水位/m',
            },
            series: [
              {
                name: '水位',
                data: data,
                type: 'bar',
                markLine: {
                  label: {
                    formatter: '{b}',
                    position: 'insideEndTop',
                  },
                  data: [
                    {
                      name: '警戒水位',
                      yAxis: 120,
                      lineStyle: {
                        color: 'red',
                        type: 'dashed',
                      },
                      emphasis: {
                        lineStyle: {
                          color: 'rgba(122, 24, 192, 1)',
                        },
                        label: {
                          // 添加标题的显示内容和样式
                          show: true,
                          formatter: '120/m', // 标题的显示内容
                          textStyle: {
                            // 标题的样式
                            color: 'rgba(122, 24, 192, 1)',
                          },
                        },
                      },
                    },
                    {
                      name: '正常水位',
                      yAxis: 80,
                      lineStyle: {
                        color: 'rgb(39, 174, 50)',
                        type: 'dashed',
                      },
                      emphasis: {
                        lineStyle: {
                          color: 'rgba(122, 24, 192, 1)',
                        },
                        label: {
                          // 添加标题的显示内容和样式
                          show: true,
                          formatter: '80/m', // 标题的显示内容
                          textStyle: {
                            // 标题的样式
                            color: 'rgba(122, 24, 192, 1)',
                          },
                        },
                      },
                    },
                  ],

                  // silent: true,
                },
              },
            ],
          }

          option && myChart.setOption(option)

          // 为content添加div子节点
          popupContentRef.value.appendChild(elementDiv)
          overlay.setPosition(attribute.coordinate)
          props.map.addOverlay(overlay)
        })
      } else {
        waterVisible.value = false
        //新增div元素
        const elementDiv = document.createElement('div')
        elementDiv.className = 'markerText'
        const pixel = props.map.getEventPixel(evt.originalEvent)
        props.map.forEachFeatureAtPixel(pixel, function () {
          setInnerText(elementDiv, `水库聚合个数: ${pLen}。 请放大`)
          // 为content添加div子节点
          popupContentRef.value.appendChild(elementDiv)

          overlay.setPosition(attribute.coordinate)
          props.map.addOverlay(overlay)
        })
      }
    } else {
      overlay.setPosition(undefined)
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
  if (valList.includes('实时水情')) {
    props.map.addLayer(waterStore.reservoir)
  } else {
    props.map.removeLayer(waterStore.reservoir)
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

  nextTick(() => {
    reservoirPopup()
  })
})
onBeforeUnmount(() => {
  console.log('destory--')
})
</script>

<style scoped lang="scss">
.opration {
  position: absolute;
  top: 2%;
  right: 2%;
  z-index: 4;
  width: 480px;
  :deep(.el-checkbox-group) {
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

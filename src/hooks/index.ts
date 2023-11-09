import { Reservoir } from '@/api/Water/type'
import { Map, Overlay } from 'ol'
import { Pixel } from 'ol/pixel'
import { Ref } from 'vue'
import * as echarts from 'echarts'
/**
 * 实现popup功能
 * @param pLen
 * @param map
 * @param pixel
 * @param attribute
 * @param refs
 */
export const usePopup = (
  pLen: number,
  map: Map,
  pixel: Pixel,
  attribute: any,
  refs: {
    popupRef: Ref<any>
    popupContentRef: Ref<any>
    popupCloserRef: Ref<any>
    chart: Ref<any>
    waterVisible: Ref<boolean> //控制实时水情的popup内容区
    dangerLevel: Ref<number> //危险水位
    currentLevel: Ref<number> //目前水位
    time: Ref
    address: Ref
    popupVisible: Ref<boolean>
  },
) => {
  const {
    popupVisible,
    waterVisible,
    address,
    time,
    currentLevel,
    chart,
    popupContentRef,
    popupRef,
    popupCloserRef,
  } = refs
  popupVisible.value = true
  //新建覆盖物
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
  if (pLen === 1) {
    popupContentRef.value.innerHTML = ''
    waterVisible.value = true

    // getEventPixel(evt.originalEvent) 是在地图点击事件中获取点击位置的像素坐标。

    map.forEachFeatureAtPixel(pixel, function () {
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
      map.addOverlay(overlay)
    })
  } else {
    popupContentRef.value.innerHTML = ''
    waterVisible.value = false
    //新增div元素
    const elementDiv = document.createElement('div')
    elementDiv.className = 'markerText'
    map.forEachFeatureAtPixel(pixel, function () {
      setInnerText(elementDiv, `水库聚合个数: ${pLen}。 请放大`)
      // 为content添加div子节点
      popupContentRef.value.appendChild(elementDiv)

      overlay.setPosition(attribute.coordinate)
      map.addOverlay(overlay)
    })
  }
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

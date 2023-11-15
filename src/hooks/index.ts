import { Rain, Reservoir, River } from '@/api/Water/type'
import { Map, Overlay } from 'ol'
import { Pixel } from 'ol/pixel'
import { Ref } from 'vue'
import * as echarts from 'echarts'
import { fromLonLat } from 'ol/proj'
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
    rainChart: Ref<any>
    waterVisible: Ref<boolean> //控制实时水情的popup内容区
    rainVisible: Ref<boolean>
    dangerLevel: Ref<number> //危险水位
    currentLevel: Ref<number> //目前水位
    titleVisible: Ref
    time: Ref
    address: Ref
    popupVisible: Ref<boolean>
    typhoonData?: any
  },
  type: string,
) => {
  const {
    popupVisible,
    waterVisible,
    rainVisible,
    titleVisible,
    address,
    time,
    currentLevel,
    chart,
    rainChart,
    popupContentRef,
    popupRef,
    popupCloserRef,
    typhoonData,
  } = refs
  const {
    typhoonVisible,
    tm,
    lonlat,
    windstrong,
    windspeed,
    movespeed,
    movedirect,
    forecast,
  } = typhoonData
  popupVisible.value = true
  //清除已有echart实例
  // myChart.value?.dispose()

  // let myChart: any
  //新建覆盖物
  const overlay = new Overlay({
    element: popupRef.value,
    //当前窗口可见
    autoPan: true,
    positioning: 'bottom-center',
    offset: [0, 20],
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
  //实时水情
  if (type == 'reservoir' || type == 'river') {
    titleVisible.value = true
    if (pLen === 1) {
      popupContentRef.value.innerHTML = ''
      waterVisible.value = true
      rainVisible.value = false
      typhoonVisible.value = false
      // getEventPixel(evt.originalEvent) 是在地图点击事件中获取点击位置的像素坐标。

      map.forEachFeatureAtPixel(pixel, function () {
        popupContentRef.value.innerHTML = ''
        //新增div元素
        const elementDiv = document.createElement('div')
        elementDiv.className = 'markerText'
        setInnerText(elementDiv, `${attribute.userName}`)

        let xAxisData
        let data = null
        if (type == 'reservoir') {
          data = attribute.data.map((v: Reservoir) => v.rz).reverse()
          currentLevel.value = attribute.data[0].rz
          xAxisData = attribute.data.map((v: Reservoir) => v.tm).reverse()
        } else if (type == 'river') {
          data = attribute.data.map((v: River) => v.z).reverse()
          currentLevel.value = attribute.data[0].z
          xAxisData = attribute.data.map((v: River) => v.tm).reverse()
        }

        // let normal = attribute.data[0].otq
        // let danger = attribute.data[0].w
        // dangerLevel.value = attribute.data[0].w
        address.value = attribute.address
        time.value = attribute.data[0].tm
        // myChart?.dispose()
        const myChart = echarts.init(chart.value)

        /** @type EChartsOption */
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          toolbox: {
            show: true,
            feature: {
              dataView: {
                readOnly: false,
              },
              magicType: {
                type: ['line', 'bar'],
              },

              saveAsImage: {},
            },
            left: '50%',
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
      console.log('plen')
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
  //实时雨情
  if (type == 'rain') {
    titleVisible.value = true
    popupContentRef.value.innerHTML = ''
    waterVisible.value = false
    typhoonVisible.value = false
    rainVisible.value = true
    map.forEachFeatureAtPixel(pixel, function () {
      popupContentRef.value.innerHTML = ''
      //新增div元素
      const elementDiv = document.createElement('div')
      elementDiv.className = 'markerText'
      setInnerText(elementDiv, `${attribute.userName}`)

      const data = attribute.data.map((v: Rain) => v.col007).reverse()
      currentLevel.value = attribute.data[0].col007
      const xAxisData = attribute.data.map((v: Rain) => v.col002).reverse()

      // let normal = attribute.data[0].otq
      // let danger = attribute.data[0].w
      // dangerLevel.value = attribute.data[0].w
      address.value = attribute.address
      time.value = attribute.data[0].col002
      // myChart?.dispose()
      const myChart = echarts.init(rainChart.value)

      /** @type EChartsOption */
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        toolbox: {
          show: true,
          feature: {
            dataView: {
              readOnly: false,
            },
            magicType: {
              type: ['line', 'bar'],
            },

            saveAsImage: {},
          },
          left: '50%',
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
          max: 300,
          type: 'value',
          name: '雨量/mm',
        },
        series: [
          {
            name: '雨量',
            data: data,
            type: 'bar',
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' },
              ],
            },
            markLine: {
              data: [{ type: 'average', name: 'Avg' }],
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
  }
  //台风路径
  if (type == 'typhoonPoint') {
    titleVisible.value = false
    waterVisible.value = false
    rainVisible.value = false
    typhoonVisible.value = true
    map.forEachFeatureAtPixel(pixel, function () {
      tm.value = attribute.tm
      lonlat.value = attribute.coordinate
      windstrong.value = attribute.windstrong
      windspeed.value = attribute.windspeed
      movespeed.value = attribute.movespeed
      movedirect.value = attribute.movedirect
      overlay.setPosition(fromLonLat(attribute.coordinate))
      map.addOverlay(overlay)
    })
  }
  //台风预测路径
  if (type == 'typhoonForecastPoint') {
    titleVisible.value = false
    waterVisible.value = false
    rainVisible.value = false
    typhoonVisible.value = true
    forecast.value = attribute.forecast
    tm.value = attribute.tm
    lonlat.value = attribute.coordinate
    windstrong.value = attribute.windstrong
    windspeed.value = attribute.windspeed
    movespeed.value = attribute.movespeed
    movedirect.value = attribute.movedirect
    overlay.setPosition(fromLonLat(attribute.coordinate))
    map.addOverlay(overlay)
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

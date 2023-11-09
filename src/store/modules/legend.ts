//动态图例仓库(Vector图层)
import { defineStore } from 'pinia'
import { legendState, legendType } from './types/type'

const useLegendStore = defineStore('Legend', {
  state: (): legendState => {
    return {
      legendList: [],
    }
  },
  actions: {
    addLegend(legend: legendType) {
      if (!this.legendList.map((v) => v.title).includes(legend.title)) {
        this.legendList.push(legend)
      }
    },
    /**
     * 根据图例名称删除图例
     * @param title
     */
    removeLegend(title: string) {
      const index = this.legendList.map((v) => v.title).indexOf(title)
      if (index != -1) {
        this.legendList.splice(index, 1)
      }
    },
  },
  getters: {},
})

export default useLegendStore

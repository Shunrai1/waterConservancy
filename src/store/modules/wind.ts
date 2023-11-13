//台风路径小仓库
import { Vector } from 'ol/layer'
import { defineStore } from 'pinia'
import { windType } from './types/type'

const useWindStore = defineStore('Wind', {
  state: (): windType => {
    return {
      wind: null,
    }
  },
  actions: {
    /**
     * 设置台风图层
     * @param wind
     */
    setWindLayer(wind: Vector<any>) {
      this.wind = wind
    },
  },
  getters: {},
})
export default useWindStore

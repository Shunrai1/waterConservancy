//实时水情的小仓库
import { Vector } from 'ol/layer'
import { Cluster } from 'ol/source'
import { defineStore } from 'pinia'
import { WaterState } from './types/type'
const useWaterStore = defineStore('Water', {
  state: (): WaterState => {
    return {
      reservoir: null,
    }
  },
  actions: {
    //存储水库聚合图层数据
    setReservoir(reservoir: Vector<Cluster>) {
      this.reservoir = reservoir
    },
  },
  getters: {},
})

export default useWaterStore

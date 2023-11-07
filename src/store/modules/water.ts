//实时水情的小仓库
import { Vector } from 'ol/layer'
import { Cluster } from 'ol/source'
import { defineStore } from 'pinia'
import { WaterState } from './types/type'
import { Overlay } from 'ol'
const useWaterStore = defineStore('Water', {
  state: (): WaterState => {
    return {
      reservoir: null,
      reservoirSign: null,
      popup: null,
    }
  },
  actions: {
    //存储水库聚合图层数据
    setReservoir(reservoir: Vector<Cluster>) {
      this.reservoir = reservoir
    },
    /**
     * 矢量标注图层
     * @param reservoirSign
     */
    setReservoirSign(reservoirSign: Vector<any>) {
      this.reservoirSign = reservoirSign
    },
    setPopUP(popup: Overlay) {
      this.popup = popup
    },
  },
  getters: {},
})

export default useWaterStore

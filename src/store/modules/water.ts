//实时水情的小仓库
import { Vector } from 'ol/layer'
import { Cluster } from 'ol/source'
import { defineStore } from 'pinia'
import { WaterState } from './types/type'
import { Overlay } from 'ol'
const useWaterStore = defineStore('Water', {
  state: (): WaterState => {
    return {
      rain: null,
      river: null,
      reservoir: null,
      reservoirSign: null,
      popup: null,
    }
  },
  actions: {
    /**
     * 存储雨量图层数据
     * @param rainLayer
     */
    setRainLayer(rainLayer: Vector<any>) {
      this.rain = rainLayer
    },
    /**
     * 存储河流图层数据
     * @param riverLayer
     */
    setRiverLayer(riverLayer: Vector<any>) {
      this.river = riverLayer
    },
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

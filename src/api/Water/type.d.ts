export interface ResponsData {
  code: number
  message: string
}

/**
 * 水库信息
 */
export type Reservoir = {
  id: number
  stcd: string
  tm: string
  rz: number
  inq: number
  otq: number
  w: number
}
/**
 * 河流信息
 */
export type River = {
  id: number
  stcd: string
  tm: string
  z: number
  q: number
}

/**
 * 水库信息列表
 */
export type ReservoirList = Reservoir[]

/**
 * 河流信息列表
 */
export type RiverList = River[]

/**
 * 站点水库河流信息
 */
export interface SitInfo {
  stcd: string
  // 站点名字
  stname: string
  lon: string
  lat: string
  rivername: string
  category: string
  city: string
  substation: string
  address: string
  rsvrrTM: ReservoirList
  riverrTM: RiverList
}

/**
 * 获取水库数据响应类型
 */
export interface ReservoirResponsData extends ResponsData {
  data: {
    data: SitInfo[]
    total: number
  }
}

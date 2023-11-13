export interface ResponsData {
  code: number
  message: string
}
/**
 * 台风基本信息
 */
export type windBasicInfo = {
  windid: number
  windname: string
  windeng: string
}
export interface ResponseWindBasicInfo extends ResponsData {
  data: windBasicInfo[]
}
/**
 * 台风路径信息
 */
export type windInfo = {
  id: number
  windid: number
  tm: string
  jindu: number
  weidu: number
  windstrong: string
  windspeed: string
  qiya: string
  movespeed: string
  movedirect: string
  sevradius: number
  tenradius: number
}
export interface ResponseWindInfo extends ResponsData {
  data: windInfo[]
}
/**
 * 台风预测路径
 */
export type windForecastInfo = {
  id: number
  windid: number
  forecast: string
  tm: string
  jindu: number
  weidu: number
  windstrong: string
  windspeed: string
  qiya: string
  movespeed: string
  movedirect: string
  sevradius: number
  tenradius: number
}
export interface ResponseWindForecastInfo extends ResponsData {
  data: windBasicInfo[]
}

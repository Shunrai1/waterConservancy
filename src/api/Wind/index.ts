import request from '@/utils/request'
import { ResponseWindBasicInfo, ResponseWindInfo } from './type'

/**
 *得到所有的基本台风信息
 */
export const getBasicWindInfoAPI = () => {
  return request.get<any, ResponseWindBasicInfo>(`/Wind/getBasic`)
}
/**
 *得到台风路径信息
 * @param windId
 * @returns
 */
export const getWindInfoAPI = (windId: number) => {
  return request.get<any, ResponseWindInfo>(
    `/Wind/getWIfByWId?windId=${windId}`,
  )
}
/**
 *得到台风预测路径信息
 * @param windId
 * @returns
 */
export const getForecastWindInfoAPI = (windId: number) => {
  return request.get<any, ResponseWindForecastInfo>(
    `/Wind/getForInfo?windId=${windId}`,
  )
}

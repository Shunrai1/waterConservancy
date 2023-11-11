import request from '@/utils/request'
import { ReservoirResponsData } from '../Water/type'

/**
 * 获取所有雨量信息
 * @returns
 */
export const getAllRainAPI = () => {
  return request.get<any, ReservoirResponsData>(`/StSoilR/getAll`)
}

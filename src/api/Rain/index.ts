import request from '@/utils/request'
import { ReservoirResponsData } from '../Water/type'

/**
 * 获取所有雨量信息
 * @returns
 */
export const getAllRainAPI = () => {
  return request.get<any, ReservoirResponsData>(`/StSoilR/getAll`)
}
/**
 * 获取各市最大雨量
 */
export const getCityMaxRainfallAPI = (
  pageSize: number,
  currentPage: number,
) => {
  return request.get<any, ReservoirResponsData>(
    `/StSoilR/getMax?pageSize=${pageSize}&currentPage=${currentPage}`,
  )
}

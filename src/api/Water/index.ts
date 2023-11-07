import request from '@/utils/request'
import type { ReservoirResponsData } from './type.d'

/**
 * 分页得到水库数据
 */
export const getReservoirDataAPI = (pageSize: number, currentPage: number) => {
  return request.get<any, ReservoirResponsData>(
    `/RsvrR/page?pageSize=${pageSize}&currentPage=${currentPage}`,
  )
}
/**
 * 搜索水库数据
 */
export const searchAPI = (
  stName: string,
  pageSize?: number,
  currentPage?: number,
) => {
  return request.get<any, ReservoirResponsData>(
    `/RsvrR/search?stName=${stName}&pageSize=${pageSize}&currentPage=${currentPage}`,
  )
}
/**
 * 获取所有水库数据
 * @returns
 */
export const getAllAPI = () => {
  return request.get<any, ReservoirResponsData>(`/RsvrR/getAll`)
}

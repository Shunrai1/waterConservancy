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

/**
 * 分页得到河流数据
 */
export const getRiverDataAPI = (pageSize: number, currentPage: number) => {
  return request.get<any, ReservoirResponsData>(
    `/RiverR/page?pageSize=${pageSize}&currentPage=${currentPage}`,
  )
}
/**
 * 搜索河流数据
 */
export const RiverSearchAPI = (
  rivername: string,
  pageSize?: number,
  currentPage?: number,
) => {
  return request.get<any, ReservoirResponsData>(
    `/RiverR/search?rivername=${rivername}&pageSize=${pageSize}&currentPage=${currentPage}`,
  )
}
/**
 * 获取所有河流数据
 * @returns
 */
export const getRiverAllAPI = () => {
  return request.get<any, ReservoirResponsData>(`/RiverR/getAll`)
}

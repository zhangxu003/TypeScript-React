/**
 * @description 资源-试卷包 功能模块相对应的接口
 * https://localhost:8000/resource/package
 */
import { stringify } from 'qs';
import request from '@/utils/request';
import apiUrl from './apiUrl';

export interface PackageListParmsType {
  // 查询条件
  areaCode?: string[]; // 地区
  salesStatus?: string; // 商城状态
  filterWord?: string; // 模糊条件
  // 当前页码
  pageIndex?: number;
  // 每页长度
  pageSize?: number;
}
export const getPackageList = (params: PackageListParmsType): Promise<any> =>
  request.get(apiUrl['CONTENT-651'], { params });

// const urlParams = stringify(params);
// return request.get(`${apiUrl['CONTENT-651']}?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`);

export interface AuthRecordListParmsType {
  // 查询条件
  authType?: string; // 授权方式
  status?: string; // 状态
  filterWord?: string; // 模糊条件
  // 当前页码
  pageIndex?: number;
  // 每页长度
  pageSize?: number;
}

// CONTENT-653：获取试卷包授权信息列表-分页
export const getAuthRecordList = (params: AuthRecordListParmsType): Promise<any> =>
  request.get(apiUrl['CONTENT-653'], { params });

// CONTENT-652：试卷包上下架
export const changeSaleStatus = (params: PackageListParmsType): Promise<any> => {
  const urlParams = stringify(params);
  return request.post(`${apiUrl['CONTENT-652']}?${urlParams}`);
};

// CONTENT-654：获取试卷包信息
export const getPackageDetail = (params: AuthRecordListParmsType): Promise<any> =>
  request.get(apiUrl['CONTENT-654'], { params });

// CONTENT-655：获取试卷信息列表(试卷包内试卷)-分页
export const getPaperList = (params: AuthRecordListParmsType): Promise<any> =>
  request.get(apiUrl['CONTENT-655'], { params });

// CONTENT-661：获取试卷包授权信息
export const getAuthRecordDetail = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-661'], { params });

// CONTENT-662：获取试卷包授权历史信息-分页
export const getAuthRecordHistory = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-662'], { params });

// CONTENT-663：获取试卷包授权关联渠道商-分页
export const getPackageByChannel = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-663'], { params });

// CONTENT-658：获取试卷包授权关联校区-分页
export const getPackageByCampus = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-658'], { params });

// CONTENT-656：学校绑定试卷包
export const bindPackageByCampus = (params: any): Promise<any> =>
  request.post(apiUrl['CONTENT-656'], { data: params });

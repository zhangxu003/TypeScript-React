/**
 * @description 租户-关联试卷包 的 api
 */
// import { stringify } from 'qs';
import request from '@/utils/request';
import apiUrl from './apiUrl';

// export interface PackageListParmsType {
//   // 当前页码
//   pageIndex?: number;
//   // 每页长度
//   pageSize?: number;
// }
// export const getPackageList = (params: PackageListParmsType): Promise<any> => {
//   const urlParams = stringify(params);
//   return request.get(`${apiUrl['CONTENT-651']}?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`);
// };

export interface AuthRecordListParmsType {
  // 查询条件
  authType?: string; // 授权方式
  status?: string; // 状态
  filterWord?: string; // 模糊条件
  // 当前页码
  pageIndex?: number;
  // 每页长度
  pageSize?: number;
  // 校区id
  campusId?: string;
}
// CONTENT-653：获取试卷包授权信息列表-分页
export const getAuthRecordList = (params: AuthRecordListParmsType): Promise<any> =>
  request.get(apiUrl['CONTENT-653'], { params });

// CONTENT-657：学校取消绑定试卷包
export const unbingPackage = (params: any): Promise<any> =>
  request.put(apiUrl['CONTENT-657'], { params });

// CONTENT-306:查询授权给学校的试卷的试卷范围列表
export const getPaperTemplateList = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-306'], { params });

export interface PaperListParmsType {
  // 查询条件
  grade?: string; // 年级
  annual?: string; // 学年
  difficultLevel?: string; // 难易度
  // 当前页码
  pageIndex?: number;
  // 每页长度
  pageSize?: number;
  paperTemplateId?: string;
  isVisible?: string;
  filterWord?: string;
  campusId?: string;
}

// CONTENT-660：获取试卷信息列表(学校已授权试卷)-分页
export const getPaperList = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-660'], { params });

// CONTENT-655：获取试卷信息列表(试卷包内试卷)-分页
export const getPaperListByPackageId = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-655'], { params });

// CONTENT-651：试卷包列表
export const getAddPackagePaperList = (params: any): Promise<any> =>
  request.get(apiUrl['CONTENT-651'], { params });

// CONTENT-604：试卷保密、开放
export const updatePaperStatus = (params: any): Promise<any> =>
  request.put(apiUrl['CONTENT-604'], { params });

/**
 * @description
 * 对应微服务 ===== 5.4 微服务- operate_service =====
 */
import request from '@/utils/request';
import apiUrl from './apiUrl';

// example: 参考下面写法

export interface channelVendorListParmsType {
  filterWord: string;
  pageIndex: number;
  pageSize: number;
}

// OPERATE-101：获取渠道商信息列表-分页
export const getChannelVendorList = (params: channelVendorListParmsType): Promise<any> =>
  request.get(apiUrl['OPERATE-101'], { params });

// OPERATE-104：校区结束试用信息
export const finishTest = (params: any): Promise<any> =>
  request.put(apiUrl['OPERATE-104'], { params });

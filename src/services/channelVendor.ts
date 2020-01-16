/**
 * 渠道商接口请求服务
 * @author tina.zhang
 * @date   2019-11-5 11:01:14
 * https://localhost:8000/tenant/channelvendor
 */
import request from '@/utils/request';
import apiUrl from './apiUrl';

/**
 * OPERATE-101：请求参数定义
 */
export interface IQuery {
  filterWord: string;
  pageIndex: number;
  pageSize: number;
}

/**
 * OPERATE-102：创建渠道商信息
 */
export interface IChannelVendorCreate {
  channelVendorName: string;
}

/**
 * OPERATE-103：请求参数定义
 */
export interface IGetChannelVendorDetail {
  channelVendorId: string;
}

/**
 * 销售区域类型定义
 */
export interface IBusinessScope {
  areaCode: string | Array<string>; // 地区代码,
  areaValue: string; // 地区值
}

/**
 * OPERATE-105：编辑渠道商信息
 */
export interface IUpdateChannelVendor extends IGetChannelVendorDetail, IChannelVendorCreate {
  businessScope: Array<IBusinessScope>; // 销售区域列表
  address: string | null | undefined; // 详细地址/备注
}

/**
 * AUTH-409：分配加密狗
 * AUTH-410：取消分配加密狗
 */
export interface IDistributeDongle {
  channelVendorId: string; // 渠道商ID
  driveIds: string; // 设备ID列表
}

/**
 * OPERATE-101：获取渠道商信息列表-分页
 */
export const getChannelVendorList = (params: IQuery): Promise<any> =>
  request.get(apiUrl['OPERATE-101'], { params });

/**
 * OPERATE-102：创建渠道商信息
 */
export const createChannelVendor = (params: IChannelVendorCreate): Promise<any> =>
  request.post(apiUrl['OPERATE-102'], { data: params });

/**
 * OPERATE-103：获取渠道商信息
 */
export const getChannelVendorDetail = (params: IGetChannelVendorDetail): Promise<any> =>
  request.get(apiUrl['OPERATE-103'], { params });

/**
 * OPERATE-105：编辑渠道商信息
 */
export const updateChannelVendor = (params: IUpdateChannelVendor): Promise<any> =>
  request.put(apiUrl['OPERATE-105'], { data: params });

/**
* AUTH-409：分配加密狗
*/
export const distributeDongle = (params: IDistributeDongle): Promise<any> =>
  request.put(apiUrl['AUTH-409'], { data: params });


/**
* AUTH-410：取消分配加密狗
*/
export const cancelDistributeDongle = (params: IDistributeDongle): Promise<any> =>
  request.put(apiUrl['AUTH-410'], { data: params });

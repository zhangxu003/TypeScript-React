/**
 * @description 资源-加密狗 功能模块相对应的接口
 * https://localhost:8000/resource/dongle
 */
import request from '@/utils/request';
import apiUrl from './apiUrl';

/**
 * AUTH-401：获取加密狗信息列表-分页
 */
export interface DongleListParmsType {
  // '狗类型—选填'; MAIN_DONGLE:主狗  VICE_DONGLE:副狗
  dongleType?: 'MAIN_DONGLE' | 'VICE_DONGLE';
  // '狗状态—选填'INITIAL:已入库;DISTRIBUTED:已分配;BINDED:已绑定;
  // ACTIVATED:已激活; EXPIRED:已到期;WAITING_RECYCLE:待回收;INVALID:已失效;
  dongleStatus?:
    | 'INITIAL'
    | 'DISTRIBUTED'
    | 'BINDED'
    | 'ACTIVATED'
    | 'EXPIRED'
    | 'WAITING_RECYCLE'
    | 'INVALID';
  // 'SN模糊条件—选填';
  filterWord?: string;
  // 渠道商的id
  channelVendorId?: string;
  // 当前页码
  pageIndex: number;
  // 每页长度
  pageSize: number;
}
export const getDongleList = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-401'], { params });

// AUTH-402：获取加密狗信息(根据设备ID)
export const getDongleDetail = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-402'], { params });

// AUTH-416：加密狗信息修改
export const editDongleDetail = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-416'], { data: params });

// AUTH-405：获取加密狗历史信息(根据设备ID)-分页
export const getDongleHistory = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-405'], { params });

// AUTH-406：调整加密狗可激活次数
export const adjustDonglelimit = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-406'], { data: params });

// AUTH-407：获取加密狗关联渠道商(根据设备ID)-分页
export const getChannelHistory = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-407'], { params });

// AUTH-408：获取加密狗关联校区(根据设备ID)-分页
export const getCampusHistory = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-408'], { params });

/**
 * 回收加密狗
 * @param params
 */
export const recycleDongle = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-404'], { data: params });

/**
 * 加密狗入库
 * @param params
 */
export const saveDongleInfo = (params: DongleListParmsType): Promise<any> =>
  request.post(apiUrl['AUTH-403'], { data: params });

/**
 * 更换加密狗
 * @param params
 */
export const changeDongle = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-413'], { data: params });

/**
 * 取消绑定加密狗
 * @param params
 */
export const cancelDongle = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-412'], { data: params });

/**
 * 绑定加密狗
 * @param params
 */
export const bindDongle = (params: DongleListParmsType): Promise<any> =>
  request.put(apiUrl['AUTH-411'], { data: params });

/**
 * 获取SN序列号
 * @param params
 */
export const getDongleSN = (params: DongleListParmsType): Promise<any> =>
  request.get(apiUrl['AUTH-417'], { params });
/**
 * 加密狗有效期调整
 * @param params
 */
export const updateDongLeDate = (params: any): Promise<any> =>
  request.put(apiUrl['AUTH-414'], { data: params });

/**
 * @description 全局的其它类型接口；
 */
import request from '@/utils/request';
import apiUrl from './apiUrl';

/**
 * 根据 字典codes 以逗号分隔的字符串，获取相关字典
 * /dict/type/data-codes?codeTypeList=
 */
export const queryDictionary = (codeTypeList: string): Promise<any> =>
  request.get(apiUrl['DICT-CODES'], { params: { codeTypeList } });

// FILE-600 上传
export const getOSSAuth = (params: any): Promise<any> =>
  request.get(apiUrl['FILE-600'], { data: params });

// FILE-601：上传
export const userHeaderImgOSSAuth = (params: any): Promise<any> =>
  request.get(apiUrl['FILE-601'], { data: params });

// FILE-602：上传
export const fetchFileUrl = (params: any): Promise<any> =>
  request.get(`${apiUrl['FILE-602']}${params.fileId}`, { data: params });

// FILE-102: 获取用户头像下载地址
export const getUserAvatar = (params: any): Promise<any> =>
  request.get(`${apiUrl['FILE-102']}/${params.fileId}`);

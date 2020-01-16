/**
 * @description 租户-校区 功能模块相对应的接口
 * https://localhost:8000/tenant/campus
 */
import request from '@/utils/request';
import apiUrl from './apiUrl';

export interface CampusListParmsType {
  areaCode: string;
  accreditType: string;
  customerType: string;
  subAccreditType: string;
  filterWord: string;
  pageIndex: number;
  pageSize: number;
}

export interface CampusParmsType {
  address: string;
  areaCode: string;
  campusName: string;
}
export interface CampusDetailType {
  campusId: string;
}
export interface CampusEditType {
  accreditType: string;
  address: string;
  areaCode: string;
  campusAlias: string;
  campusId: string;
  campusName: string;
  customerType: string;
  tel: string;
}

export interface TeacherListParmsType {
  // 查询条件
  // 当前页码
  pageIndex?: number;
  // 每页长度
  pageSize?: number;
  paperTemplateId?: string;
  bindStatus?: string;
  filterWord?: string;
  campusId?: string;
}

// CAMPUS-601：获取校区信息列表-分页
export const getCampusList = (params: CampusListParmsType): Promise<any> =>
  request.get(apiUrl['CAMPUS-601'], { params });

// CAMPUS-603-1：创建校区信息并默认配置校区管理员
export const addCampus = (params: CampusParmsType): Promise<any> =>
  request.post(apiUrl['CAMPUS-603-1'], { data: params });

// CAMPUS-602：获取校区信息
export const getCampusDetail = (params: CampusDetailType): Promise<any> =>
  request.get(apiUrl['CAMPUS-602'], { params });

// CAMPUS-604：编辑校区信息
export const editCampusDetail = (params: CampusEditType): Promise<any> =>
  request.put(apiUrl['CAMPUS-604'], { data: params });

// CAMPUS-604-1：编辑校区基础配置信息
export const editCampusBasic = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-604-1'], { data: params });

// CAMPUS-216：修改班级名称格式
export const updateCampusEduPhase = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-216'], { data: params });

// CAMPUS-605：获取老师信息列表-分页
export const getTeacherList = (params: TeacherListParmsType): Promise<any> =>
  request.get(apiUrl['CAMPUS-605'], { params });

// CAMPUS-215：查询所有校区管理员
export const getAllCampusManager = (params: any): Promise<any> => {
  const { campusId } = params;
  return request.get(`${apiUrl['CAMPUS-215']}/${campusId}`);
};

// CAMPUS-207 查询所有年级
export async function getAllGrade(params: any) {
  const { campusId } = params;
  return request(`/api/campus/natural-class/config/allGrade/${campusId}`);
}

// CAMPUS-204-2 输入教师姓名分页搜索-过滤学科管理员+已经绑定
export const getSubjectTeacherList = (params: any): Promise<any> =>
  request.get(apiUrl['CAMPUS-204-2'], { params });

// CAMPUS-608：设置校区管理员
export const setCampusManager = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-608'], { data: params });

// CAMPUS-213：增加校区管理员
export const addSubjectManager = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-213'], { data: params });

// CAMPUS-214：删除校区管理员
export const deleteSubjectManager = (params: any): Promise<any> => {
  const { adminId } = params;
  return request.delete(`${apiUrl['CAMPUS-214']}/${adminId}`);
};

// CAMPUS-606：创建教师信息
export const createTeacher = (params: any): Promise<any> =>
  request.post(apiUrl['CAMPUS-606'], { data: params });

// CAMPUS-104：停用/开启教师
export const changeStatus = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-104'], { data: params });

// CAMPUS-105：删除教师
export const deleteTeacher = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-105'], { params });

// CAMPUS-607：重发教师邀请信息
export const reInviteTeacher = (params: any): Promise<any> =>
  request.put(apiUrl['CAMPUS-607'], { data: params });

// PUT /security/account/password AUTH-008：修改密码
export const changePassword = (params: any): Promise<any> =>
  request.put(`${apiUrl['AUTH-RESET']}`, { data: params });

export const getCampusReport = (params: any): Promise<any> =>
  request.get(apiUrl['REPORT-601'], { params });

export const updateCampusReport = (params: any): Promise<any> =>
  request.put(apiUrl['REPORT-602'], { data: params });

// CAMPUS-106：检查教师信息是否已经存在
export const checkMobileExist = (params: any): Promise<any> =>
  request.post(`${apiUrl['CAMPUS-106']}`, { data: params });

// CAMPUS-606-1：创建教师信息(批量)
export const batchCreate = (params: any): Promise<any> =>
  request.post(`${apiUrl['CAMPUS-606-1']}`, { data: params });

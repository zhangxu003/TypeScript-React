import request from '@/utils/request';
import apiUrl from './apiUrl';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

// 用户登录
export async function fakeAccountLogin(params: any) {
  const formData = new FormData();
  // 设置起本地服务不互踢账号
  const dataObj = process.env.NODE_ENV === 'production' ? params : { ...params, client: 'proxy' };
  // process.env.NODE_ENV === 'production' ? params : { ...params, client: 'pc' };
  Object.keys(dataObj).forEach(item => {
    formData.append(item, dataObj[item]);
  });
  return request.post('/api/uaa/authentication', {
    data: formData,
    headers: {
      // 登录接口必须要带上 指定的token
      Authorization: 'Basic d2ViYXBwMjphZG1pbg==',
    },
  });
}

/**
 * 获取手机验证码
 *
 * @author kobe
 * @date 2019-03-08
 * @export
 */
export async function getValidateCode(params: any) {
  return request.post('/api/uaa/security/sms/validate-code', {
    data: params.telephone,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request.get('/api/login/captcha', { params: { mobile } });
}

// /security/account/check-identityAUTH-306：检查手机注册了几个身份
export async function queryMobileTeacherIdentity(params: { mobile: any }) {
  return request.get('/api/uaa/security/account/check-identity', { params });
}

// /security/sms/check-validate-codeAUTH-308:验证短信验证码
export async function checkSN(params: any) {
  return request.post('/api/uaa/security/sms/check-validate-code', {
    data: params,
  });
}

// 重置密码
export async function userVerifyPassword(params: any) {
  return request('/api/uaa/security/account/password/verify', {
    method: 'PUT',
    data: params,
  });
}

// GET /security/account/{id} 根据主键获得用户信息
// 'AUTH-USER': '/uaa/security/accounts',
export const queryUser = (id: string): Promise<any> => request.get(`${apiUrl['AUTH-USER']}/${id}`);

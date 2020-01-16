import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import {
  fakeAccountLogin,
  getFakeCaptcha,
  getValidateCode,
  queryMobileTeacherIdentity,
  checkSN,
  userVerifyPassword,
} from '@/services/user';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';

export interface StateType {
  status?: 'ok' | 'error'; // 登录状态
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin'; // 当前角色
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    getCaptcha: Effect;
    logout: Effect;
    validateCode: Effect;
    checkSNcode: Effect;
    queryMobileTeacher: Effect;
    fetch: Effect;
  };
  reducers: {
    updateState: Reducer<StateType>;
  };
  subscriptions: { ableUserPage: Subscription };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    // 登录
    *login({ payload }, { call, put }) {
      localStorage.clear();
      try {
        const { auth }: any = yield call(fakeAccountLogin, payload);
        const {
          token_type: tokenType,
          access_token: accessToken,
          userInfo: { id },
        } = auth;
        const token = `${tokenType} ${accessToken}`;
        // 保存token信息
        localStorage.setItem('token', token);
        localStorage.setItem('userId', id);
        // 设置当前当前的角色
        yield put({
          type: 'updateState',
          payload: {
            currentAuthority: 'admin',
            status: 'ok',
          },
        });
        // 判断是否有跳转的来源，有的话会回到原位
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          // 判断跳转的host 是否一致
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } catch (e) {
        throw new Error(e.message);
      }
    },

    // 登出
    *logout(_, { put }) {
      const { redirect } = getPageQuery();
      localStorage.clear();
      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    // 获取验证码
    *validateCode({ payload, callback }, { call }) {
      const response = yield call(getValidateCode, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },

    *checkSNcode({ payload, callback }, { call }) {
      const response = yield call(checkSN, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },

    // 检查手机注册了几个身份
    *queryMobileTeacher({ payload, callback }, { call, put }) {
      const response = yield call(queryMobileTeacherIdentity, payload);
      yield put({
        type: 'saveIndentity',
        payload: response,
      });
      callback(response);
    },

    *fetch({ payload, callback }, { call }) {
      const response = yield call(userVerifyPassword, payload);
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {
    // 更新login
    updateState(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },

  subscriptions: {
    /**
     * 当当前页是 user 目录,则去判断
     * 是否有 token存在，如果有直接去首页
     */
    ableUserPage({ dispatch, history }) {
      const {
        location: { pathname },
      } = history;
      if (pathname.indexOf('/user') === 0) {
        if (localStorage.getItem('token')) {
          dispatch(routerRedux.replace('/'));
        }
      }
    },
  },
};

export default Model;

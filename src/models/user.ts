import { Effect } from 'dva';
import { Reducer } from 'redux';
import { queryUser } from '@/services/user';

type roleObject = object & {
  code: string;
  name: string;
  id: string;
};

export interface UserModelState {
  userId?: string; // 用户id
  avatar?: string; // 头像
  email?: string; // 邮箱
  gender?: string; // 性别
  mobile?: string; // 手机号
  name?: string; // 用户名
  nickname?: string; // 用户别名
  roleList?: roleObject[]; // 用户角色集合
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
  };
  reducers: {
    updateState: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {},

  effects: {
    // 根据用户的id，获取用户的信息
    *fetch({ payload }, { call, put }) {
      if (!payload) return;
      const userId = payload;
      const {
        avatar,
        email,
        gender,
        mobile,
        name,
        nickname,
        id,
        roleCodeList,
        roleIdList,
        roleNameList,
      } = yield call(queryUser, userId);
      // 将角色转换成 对象数组
      const roleList = Array.from({ length: roleCodeList.length }, (_, index) => ({
        code: roleCodeList[index],
        id: roleIdList[index],
        name: roleNameList[index],
      }));
      // 数据写入model
      yield put({
        type: 'updateState',
        payload: {
          userId: id,
          avatar: avatar || id,
          email,
          gender,
          mobile,
          name,
          nickname,
          roleList,
        },
      });
      // 发送全局事件,通知获取用户信息成功
      yield put({ type: 'USE_FETCH_SUCCESS' });
    },
  },

  reducers: {
    // 更新数据
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

export default UserModel;

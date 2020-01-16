import { Reducer } from 'redux';
import { Effect } from 'dva';
import { getUserAvatar } from '@/services/global';

export interface FileModelState {
  userAvatar: string;
}

export interface FileModelType {
  namespace: 'file';
  state: FileModelState;
  effects: {
    avatar: Effect;
  };
  reducers: {
    saveUserAvatar: Reducer<FileModelState>;
  };
}

const FileModel: FileModelType = {
  namespace: 'file',

  state: {
    userAvatar: '', // 头像地址
  },

  effects: {
    // 用户头像
    *avatar({ payload, callback }, { call, put }) {
      const response = yield call(getUserAvatar, payload);
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'saveUserAvatar',
        payload: response,
      });
    },
  },

  reducers: {
    saveUserAvatar(state, action) {
      return {
        ...state,
        userAvatar: action.payload.path,
      };
    },
  },
};

export default FileModel;

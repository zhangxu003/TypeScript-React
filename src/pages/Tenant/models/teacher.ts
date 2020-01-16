/**
 * 校区 相关功能
 * models
 */
import { Reducer } from 'redux';
import { Effect } from 'dva';
import {
  getTeacherList,
  createTeacher,
  changeStatus,
  deleteTeacher,
  changePassword,
  reInviteTeacher,
  checkMobileExist,
  batchCreate,
} from '@/services/campus';

type CampusDetail = {};

export interface TeacherModelState {
  detail?: CampusDetail;
  InstallShow?: boolean;
  channelList?: [];
  dongleList?: [];
  packageList?: [];
  campusReport?: {};
  teacherData: any;
  campusManagerList: [];
  subjectTeacherList: [];
}

export interface CampusModelType {
  namespace: 'teacher';
  state: TeacherModelState;
  effects: {
    getTeacherLists: Effect;
    createTeacherInfo: Effect;
    createTeacherStatus: Effect;
    deleteTeacherInfo: Effect;
    changeTeacherPassword: Effect;
    reInvite: Effect;
    checkMobile: Effect;
    batchCreateTeacher: Effect;
  };
  reducers: {
    updateState: Reducer<TeacherModelState>;
  };
}

const TeacherModel: CampusModelType = {
  namespace: 'teacher',

  state: {
    teacherData: {
      filterWord: '',
      records: [],
      dataCount: 0,
      pageIndex: 1,
      pageSize: 20,
    }, // 列表数据
    detail: {}, // 详情
    InstallShow: false,

    campusManagerList: [], // 校区管理员
    subjectTeacherList: [], // 学科管理员
  },

  effects: {
    *getTeacherLists({ payload }, { put, call }) {
      const response = yield call(getTeacherList, payload);
      yield put({
        type: 'updateState',
        payload: { teacherData: response },
      });
    },

    *createTeacherInfo({ payload }, { call }) {
      const response = yield call(createTeacher, payload);
      return response;
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *createTeacherStatus({ payload }, { call }) {
      const response = yield call(changeStatus, payload);
      return response;
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *deleteTeacherInfo({ payload }, { call }) {
      const response = yield call(deleteTeacher, payload);
      return response;
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *changeTeacherPassword({ payload }, { call }) {
      const response = yield call(changePassword, payload);
      return response;
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *reInvite({ payload }, { call }) {
      const response = yield call(reInviteTeacher, payload);
      return response;
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *checkMobile({ payload, callback }, { call }) {
      const response = yield call(checkMobileExist, payload);
      callback(response);
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },

    *batchCreateTeacher({ payload, callback }, { call }) {
      const response = yield call(batchCreate, payload);
      callback(response);
      // yield put({
      //   type: 'updateState',
      //   payload: { teacherData: response },
      // });
    },
  },

  reducers: {
    /**
     * 基础方法，更新 model
     */
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
export default TeacherModel;

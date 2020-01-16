/**
 * 校区 相关功能
 * models
 */
import { Reducer } from 'redux';
import { Effect, Subscription } from 'dva';
import { ConnectState } from '@/models/connect.d';
import {
  getCampusList,
  CampusListParmsType,
  addCampus,
  getCampusDetail,
  editCampusDetail,
  editCampusBasic,
  updateCampusEduPhase,
  getTeacherList,
  getAllCampusManager,
  getSubjectTeacherList,
  createTeacher,
  changeStatus,
  deleteTeacher,
  changePassword,
  reInviteTeacher,
  getCampusReport,
  updateCampusReport,
  setCampusManager,
  addSubjectManager,
  deleteSubjectManager,
  getAllGrade,
} from '@/services/campus';
import { finishTest } from '@/services/operate';
import { getChannelVendorList } from '@/services/channelVendor';
import { getPackageList, bindPackageByCampus, getAuthRecordList } from '@/services/package';
import { fetchFileUrl } from '@/services/global';
import { getDongleList, bindDongle, updateDongLeDate } from '@/services/dongle';

interface RecordData {
  subAuthType(
    tenantAuthorizeMode: string,
    TENANT_AUTHORIZE_MODE: import('../../../models/dictionary').CodeType[] | undefined,
    subAuthType: any,
  ): string;
  areaCode: string;
  status: string;
  campusAlias: string;
  id: string;
  customerType: string;
  expired: string;
  name: string;
  schoolId: string;
  tenantAuthorizeMode: string;
}

interface CampusPageData extends CampusListParmsType {
  records: RecordData[]; // 列表数据
  dataCount: number; // 当前的页数
}

type CampusDetail = {};

export interface CampusModelState {
  pageData: CampusPageData;
  detail?: CampusDetail;
  InstallShow?: boolean;
  channelList?: [];
  dongleList?: [];
  packageList?: [];
  campusReport?: {};
  teacherData: any;
  campusManagerList: [];
  subjectTeacherList: [];
  gradeList: [];
}

export interface CampusModelType {
  namespace: 'campus';
  state: CampusModelState;
  effects: {
    fetchCampus: [Effect, { type: string }];
    addCampusInfo: Effect;
    CampusDetailInfo: Effect;
    editCampusInfo: Effect;
    initShow: Effect;
    getChannelList: Effect;
    getdongleList: Effect;
    bindDongLeInfo: Effect;
    getPackageLists: Effect;
    bindPaper: Effect;
    editCampusBasicInfo: Effect;
    updateEduPhase: Effect;
    getFile: Effect;
    getTeacherLists: Effect;
    campusManager: Effect;
    subjectTeacherList: Effect;
    createTeacherInfo: Effect;
    createTeacherStatus: Effect;
    deleteTeacherInfo: Effect;
    changeTeacherPassword: Effect;
    reInvite: Effect;
    getCampusReportDetail: Effect;
    updateCampusReportDetail: Effect;
    updateDongDate: Effect;
    finishTestDate: Effect;
    setCampusManager: Effect;
    setSubjectManager: Effect;
    getAuthPaperList: Effect;
    deleteSubjectManager: Effect;
    allGrade: Effect;
  };
  reducers: {
    updateState: Reducer<CampusModelState>;
    updatePageDataState: Reducer<CampusModelState>;
  };
  subscriptions: { setup: Subscription };
}

const CampusModel: CampusModelType = {
  namespace: 'campus',

  state: {
    pageData: {
      areaCode: '',
      accreditType: '',
      customerType: '',
      subAccreditType: '',
      filterWord: '',
      records: [],
      dataCount: 0,
      pageIndex: 1,
      pageSize: 20,
    }, // 列表数据
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
    gradeList: [], // 学校的所有年级
  },

  effects: {
    /**
     * 请求加密狗
     */
    fetchCampus: [
      function* fetchCampus({ payload = {}, callback }, { call, put, select }) {
        // 将请求参数写入 modal
        const { pageIndex = 1 } = payload;
        const pageData = yield select((state: ConnectState) => state.campus.pageData);

        const params = {
          areaCode: payload.areaCode === 'all' ? [] : payload.areaCode || pageData.areaCode,
          accreditType:
            payload.accreditType === 'All' ||
            (!payload.accreditType && pageData.accreditType === 'All')
              ? ''
              : payload.accreditType || pageData.accreditType,
          customerType:
            payload.customerType === 'All' ||
            (!payload.customerType && pageData.customerType === 'All')
              ? ''
              : payload.customerType || pageData.customerType,
          subAccreditType:
            payload.accreditType === 'All' ||
            (!payload.accreditType && pageData.accreditType === 'All')
              ? ''
              : payload.subAccreditType || pageData.subAccreditType,
          filterWord: payload.filterWord,
          pageIndex,
          pageSize: pageData.pageSize,
        };
        // 获取表单
        const data = yield call(getCampusList, { ...params });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        yield put({
          type: 'updatePageDataState',
          payload: {
            records: records.map(
              (item: RecordData): RecordData => {
                const {
                  areaCode,
                  campusAlias,
                  customerType,
                  id,
                  expired,
                  name,
                  schoolId,
                  status,
                  tenantAuthorizeMode,
                  subAuthType,
                } = item;
                return {
                  areaCode,
                  campusAlias,
                  customerType,
                  id,
                  expired,
                  name,
                  schoolId,
                  status,
                  tenantAuthorizeMode,
                  subAuthType,
                };
              },
            ),
            pageIndex: current,
            dataCount: total,
            pageSize: size,
            areaCode: payload.areaCode === 'all' ? [] : payload.areaCode || pageData.areaCode,
            accreditType: payload.accreditType || pageData.accreditType,
            customerType: payload.customerType || pageData.customerType,
            subAccreditType: payload.subAccreditType || pageData.subAccreditType,
            filterWord: payload.filterWord,
          },
        });
        if (callback) {
          callback(data);
        }
      },
      { type: 'takeLatest' },
    ],

    *addCampusInfo({ payload = {}, callback }, { call }) {
      const response = yield call(addCampus, payload);
      if (callback) {
        callback(response);
      }
    },
    *CampusDetailInfo({ payload = {}, callback }, { put, call }) {
      const response = yield call(getCampusDetail, payload);
      yield put({
        type: 'updateState',
        payload: { detail: response || {} },
      });
      if (callback) {
        callback(response);
      }
    },
    *editCampusInfo({ payload = {}, callback }, { call }) {
      const response = yield call(editCampusDetail, payload);
      if (callback) {
        callback(response);
      }
    },
    *initShow({ callback }, { put, select }) {
      const InstallShow = yield select((state: ConnectState) => state.campus.InstallShow);
      yield put({
        type: 'updateState',
        payload: { InstallShow: !InstallShow },
      });

      if (callback) {
        callback();
      }
    },

    *getChannelList({ payload, callback }, { put, call }) {
      const response = yield call(getChannelVendorList, payload);
      yield put({
        type: 'updateState',
        payload: { channelList: response },
      });
      if (callback) {
        callback(response);
      }
    },

    *getdongleList({ payload, callback }, { put, call }) {
      const data = yield call(getDongleList, payload);
      yield put({
        type: 'updateState',
        payload: { dongleList: data },
      });
      if (callback) {
        callback(data);
      }
    },

    *bindDongLeInfo({ payload = {}, callback }, { call }) {
      const response = yield call(bindDongle, payload);
      if (callback) {
        callback(response);
      }
    },
    *getPackageLists({ payload = {}, callback }, { put, call }) {
      const response = yield call(getPackageList, payload);
      yield put({
        type: 'updateState',
        payload: { packageList: response },
      });
      if (callback) {
        callback(response);
      }
    },
    *bindPaper({ payload = {}, callback }, { call }) {
      const response = yield call(bindPackageByCampus, payload);
      if (callback) {
        callback(response);
      }
    },
    *editCampusBasicInfo({ payload = {}, callback }, { call }) {
      try {
        const response = yield call(editCampusBasic, payload);
        if (callback) {
          callback(response);
        }
        return true;
      } catch (err) {
        if (err.status === 462) {
          return err.message;
        }
        err.next();
        return null;
      }
    },
    *updateEduPhase({ payload = {}, callback }, { call }) {
      const response = yield call(updateCampusEduPhase, payload);
      if (callback) {
        callback(response);
      }
    },
    *getFile({ payload = {}, callback }, { call }) {
      const response = yield call(fetchFileUrl, payload);
      if (callback) {
        callback(response);
      }
    },
    *getCampusReportDetail({ payload = {}, callback }, { put, call }) {
      const response = yield call(getCampusReport, payload);
      yield put({
        type: 'updateState',
        payload: { campusReport: response },
      });
      if (callback) {
        callback(response);
      }
    },
    *updateCampusReportDetail({ payload = {}, callback }, { call }) {
      const response = yield call(updateCampusReport, payload);
      if (callback) {
        callback(response);
      }
    },
    *updateDongDate({ payload = {}, callback }, { call }) {
      const response = yield call(updateDongLeDate, payload);
      if (callback) {
        callback(response);
      }
    },
    *finishTestDate({ payload = {}, callback }, { call }) {
      const response = yield call(finishTest, payload);
      if (callback) {
        callback(response);
      }
    },

    *getTeacherLists({ payload }, { put, call }) {
      const response = yield call(getTeacherList, payload);
      yield put({
        type: 'updateState',
        payload: { teacherData: response },
      });
    },

    // 获取校区所有年级
    *allGrade({ payload }, { call, put }) {
      const response = yield call(getAllGrade, payload);
      yield put({
        type: 'updateState',
        payload: { gradeList: response },
      });
    },

    // 获取校区所有管理员
    *campusManager({ payload, callback }, { put, call }) {
      const response = yield call(getAllCampusManager, payload);
      yield put({
        type: 'updateState',
        payload: { campusManagerList: response },
      });

      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },

    // 获取校区所有学科管理员
    *subjectTeacherList({ payload }, { put, call }) {
      const response = yield call(getSubjectTeacherList, payload);
      yield put({
        type: 'updateState',
        payload: { subjectTeacherList: response.records },
      });
    },

    // 设置校区管理员
    *setCampusManager({ payload }, { call }) {
      const response = yield call(setCampusManager, payload);
      return response;
    },

    // 设置学科管理员
    *setSubjectManager({ payload }, { call }) {
      const response = yield call(addSubjectManager, payload);
      return response;
    },

    // 删除学科管理员
    *deleteSubjectManager({ payload }, { call }) {
      const response = yield call(deleteSubjectManager, payload);
      return response;
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
      yield call(changeStatus, payload);
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
    *getAuthPaperList({ payload = {}, callback }, { call }) {
      const response = yield call(getAuthRecordList, payload);
      if (callback) {
        callback(response);
      }
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
    /**
     * 设置列表页面的数据
     */
    updatePageDataState(state, { payload }) {
      const { pageData } = state as CampusModelState;

      return {
        ...state,
        pageData: {
          ...pageData,
          ...payload,
        },
      } as CampusModelState;
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.indexOf('tenant/campus') < 0) {
          dispatch({
            type: 'updateState',
            payload: {
              pageData: {
                areaCode: '',
                accreditType: '',
                customerType: '',
                subAccreditType: '',
                filterWord: '',
                records: [],
                dataCount: 0,
                pageIndex: 1,
                pageSize: 20,
              }, // 列表数据
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
              gradeList: [], // 学校的所有年级
            },
          });
        }
      });
    },
  },
};

export default CampusModel;

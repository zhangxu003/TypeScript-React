/**
 * 租户-校区-关联试卷包 相关功能
 * models
 */
import { Reducer } from 'redux';
import { Effect } from 'dva';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import {
  AuthRecordListParmsType,
  getAuthRecordList,
  unbingPackage,
  getPaperTemplateList,
  PaperListParmsType,
  getPaperList,
  getPaperListByPackageId,
  getAddPackagePaperList,
  updatePaperStatus,
} from '@/services/tenantpackage';

import { bindPackageByCampus } from '@/services/package';

// 授权记录
interface AuthRecordObj {
  id: string;
  serialNumber: string; // 授权序列号
  paperPackageId: string;
  paperPackageName: string; // 试卷包
  authType: string; // 授权类型
  channelVendorName: string; // 渠道商
  channelVendorId: string;
  campusName: string; // 校区名称
  campusId: string;
  status: string; // 状态
  distributeTime: number; // 分配时间
  paperCount: number; // 试卷数量
  bindTime: number; // 绑定时间
}

interface PackagePageData extends AuthRecordListParmsType {
  records: AuthRecordObj[]; // 列表数据
  total: number; // 总条数
  salesStatus?: string;
  areaCodeList?: string[];
}

interface PaperPageData extends PaperListParmsType {
  records: any[]; // 列表数据
  total: number; // 总条数
}

export interface TenantPackageModelState {
  pageData: PackagePageData;
  paperListData: PaperPageData;
  paperTemplateList: [];
  paperList: [];
  addPackagePaperData: PackagePageData;
}

export interface TenantPackageModelType {
  namespace: 'tenantpackage';
  state: TenantPackageModelState;
  effects: {
    fetchRecordList: [Effect, { type: string }];
    fetchPaperList: [Effect, { type: string }];
    fetchAddPackagePaperList: [Effect, { type: string }];
    fetchUnbingPackage: Effect;
    fetchPaperTemplate: Effect;
    fetchPaperListByPackageId: Effect;
    bingPackage: Effect;
    changePaperStatus: Effect;
  };
  reducers: {
    resetState: Reducer<TenantPackageModelState>;
    updateState: Reducer<TenantPackageModelState>;
    updateAuthRecordDataState: Reducer<TenantPackageModelState>;
    updatePaperListDataState: Reducer<TenantPackageModelState>;
    updatePageDataState: Reducer<TenantPackageModelState>;
  };
}

const defaultState = {
  // 列表数据
  pageData: {
    records: [],
    pageIndex: 1,
    pageSize: 20,
    campusId: '',
    total: 0,
  },

  // 试卷结构
  paperTemplateList: [],

  // 试卷列表
  paperListData: {
    grade: '',
    annual: '',
    difficultLevel: '',
    paperTemplateId: '',
    campusId: '',
    isVisible: '',
    filterWord: '',
    records: [],
    pageIndex: 1,
    pageSize: 20,
    total: 0,
  },
  // 纸卷包中的试卷列表
  paperList: [],

  // 试卷包列表数据
  addPackagePaperData: {
    records: [],
    salesStatus: 'LAUNCHED',
    filterWord: '',
    areaCodeList: [],
    pageIndex: 1,
    pageSize: 10,
    total: 0, // 数目总条数
  },
};
const TenantPackageModel: TenantPackageModelType = {
  namespace: 'tenantpackage',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {
    // 试卷包
    fetchRecordList: [
      function* fetchRecordList({ payload = {} }, { call, put, select }) {
        // 将请求参数写入 model
        const oldParams = yield select((state: ConnectState) => state.tenantpackage.pageData);
        const { pageSize, pageIndex, campusId: campus } = oldParams;

        const params = {
          pageIndex,
          pageSize,
          campusId: campus,
          ...payload,
        };

        // 先将参数写入state
        yield put({
          type: 'updateAuthRecordDataState',
          payload: { ...params },
        });

        // 获取列表
        const data = yield call(getAuthRecordList, { ...params });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        yield put({
          type: 'updateAuthRecordDataState',
          payload: {
            records: records.map(
              (item: AuthRecordObj): AuthRecordObj => {
                const {
                  id,
                  serialNumber, // 授权序列号
                  paperPackageName,
                  paperPackageId,
                  authType, // 授权类型
                  channelVendorName, // 渠道商
                  channelVendorId,
                  campusName, // 校区名称
                  campusId,
                  status, // 状态
                  distributeTime,
                  paperCount,
                  bindTime,
                } = item;
                return {
                  id,
                  serialNumber,
                  paperPackageName,
                  paperPackageId,
                  authType,
                  channelVendorName,
                  channelVendorId,
                  campusName,
                  campusId,
                  status,
                  distributeTime,
                  paperCount,
                  bindTime,
                };
              },
            ),
            pageIndex: current,
            total,
            pageSize: size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    // 试卷列表
    fetchPaperList: [
      function* fetchPaperList({ payload = {} }, { call, put, select }) {
        // 将请求参数写入 model
        const oldParams = yield select((state: ConnectState) => state.tenantpackage.paperListData);
        const {
          pageSize,
          pageIndex,
          grade,
          annual,
          campusId,
          difficultLevel,
          paperTemplateId,
          isVisible,
          filterWord,
        } = oldParams;

        const params = {
          pageIndex,
          pageSize,
          grade,
          annual,
          campusId,
          difficultLevel,
          paperTemplateId,
          isVisible,
          filterWord,
          ...payload,
        };

        // 先将参数写入state
        yield put({
          type: 'updatePaperListDataState',
          payload: { ...params },
        });

        // 获取列表
        const data = yield call(getPaperList, { ...params });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        yield put({
          type: 'updatePaperListDataState',
          payload: {
            records,
            pageIndex: current,
            total,
            pageSize: size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    // 解绑试卷包
    *fetchUnbingPackage({ payload = {} }, { put, call }) {
      const response = yield call(unbingPackage, payload);
      if (response === 'SUCCESS') {
        message.success(
          formatMessage({
            id: 'operate.message.unbing.package.success',
            defaultMessage: '您已成功解绑试卷包！',
          }),
        );
        yield put({
          type: 'fetchRecordList',
          payload: { pageIndex: 1 },
        });
      }
    },

    // 校区关联的试卷结构
    *fetchPaperTemplate({ payload = {} }, { call, put }) {
      const response = yield call(getPaperTemplateList, payload);
      yield put({
        type: 'updateState',
        payload: { paperTemplateList: response },
      });
    },

    // 试卷包中的试卷列表
    *fetchPaperListByPackageId({ payload = {} }, { call, put }) {
      const response = yield call(getPaperListByPackageId, payload);
      yield put({
        type: 'updateState',
        payload: {
          paperList: response && response.records ? response.records : [],
        },
      });
    },

    // 添加试卷包弹窗中的试卷列表
    fetchAddPackagePaperList: [
      function* fetchAddPackagePaperList({ payload = {} }, { call, put, select }) {
        // 将请求参数写入 model
        const oldParams = yield select(
          (state: ConnectState) => state.tenantpackage.addPackagePaperData,
        );
        const { pageSize, pageIndex, salesStatus: status, filterWord, areaCodeList } = oldParams;

        const params = {
          pageIndex,
          pageSize,
          areaCodeList,
          salesStatus: status,
          filterWord,
          ...payload,
        };

        // 先将参数写入state
        yield put({
          type: 'updatePageDataState',
          payload: { ...params },
        });

        // 获取列表
        const data = yield call(getAddPackagePaperList, { ...params });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        yield put({
          type: 'updatePageDataState',
          payload: {
            records: records.map((item: any): any => {
              const {
                id,
                code,
                paperPackageName,
                packagerId, // 打包人id
                areaList,
                paperCount,
                salesStatus,
              } = item;
              return {
                id,
                code,
                paperPackageName,
                packagerId,
                areaList,
                paperCount,
                salesStatus,
              };
            }),
            pageIndex: current,
            total,
            pageSize: size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    // 学校绑定试卷包
    *bingPackage({ payload = {} }, { call, put }) {
      try {
        const response = yield call(bindPackageByCampus, payload);
        if (response === 'SUCCESS') {
          yield put({
            type: 'fetchRecordList',
            payload: { pageIndex: 1 },
          });
        }
        return null;
      } catch (err) {
        if (err.status === 460) {
          return err.message;
        }
        err.next();
        return null;
      }
    },

    // 试卷保密公开
    *changePaperStatus({ payload = {} }, { call, put }) {
      const response = yield call(updatePaperStatus, payload);
      if (response === 'SUCCESS') {
        yield put({
          type: 'fetchPaperList',
          payload: { pageIndex: 1 },
        });
      }
    },
  },

  reducers: {
    /**
     * 初始化加数据
     * 目的比如从外部进入
     */
    resetState() {
      return JSON.parse(JSON.stringify(defaultState));
    },
    /**
     * 基础方法，更新 model
     */
    updateState(state, { payload }): TenantPackageModelState {
      return {
        ...state,
        ...payload,
      };
    },

    updateAuthRecordDataState(state, { payload }) {
      const { pageData = {} } = state || {};
      return {
        ...state,
        pageData: {
          ...pageData,
          ...payload,
        },
      } as TenantPackageModelState;
    },

    updatePaperListDataState(state, { payload }) {
      const { paperListData = {} } = state || {};
      return {
        ...state,
        paperListData: {
          ...paperListData,
          ...payload,
        },
      } as TenantPackageModelState;
    },

    updatePageDataState(state, { payload }) {
      const { addPackagePaperData = {} } = state || {};
      return {
        ...state,
        addPackagePaperData: {
          ...addPackagePaperData,
          ...payload,
        },
      } as TenantPackageModelState;
    },
  },
};

export default TenantPackageModel;

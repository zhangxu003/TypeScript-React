/**
 * 试卷包 相关功能
 * models
 */
import { Reducer } from 'redux';
// import { Effect, Subscription } from 'dva';
import { Effect } from 'dva';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import {
  getPackageList,
  PackageListParmsType,
  getAuthRecordList,
  AuthRecordListParmsType,
  changeSaleStatus,
  getPackageDetail,
  getPaperList,
  getAuthRecordDetail,
  getAuthRecordHistory,
  getPackageByChannel,
  getPackageByCampus,
} from '@/services/package';

interface PackageObj {
  id: string;
  code: string; // 试卷包编号
  // packagerId: string;
  paperPackageName: string; // 试卷包名称
  defaultAccreditNum: number; // 默认授权数
  incrementActiveNum: number; // 增量激活数
  salesStatusValue: string;
  salesStatus: string; // 商城状态
  areaCodeValue: string; // 试用地区
  areaCode: string;
}

interface PackagePageData extends PackageListParmsType {
  records: PackageObj[]; // 列表数据
  total: number; // 总条数
}

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
  statusValue: string;
  status: string; // 状态
}

interface AuthRecordPageData extends AuthRecordListParmsType {
  records: AuthRecordObj[]; // 列表数据
  total: number; // 总条数
}

export interface PackageModelState {
  activeTabKey: string;
  pageData: PackagePageData;
  authRecordData: AuthRecordPageData;
  packageDetail: any;
  paperListData: any;
  authRecordDetail: any;
  authHistory: any;
  packageByChannelList: any;
  packageByCampusList: any;
}

export interface PackageModelType {
  namespace: 'resourcepackage';
  state: PackageModelState;
  effects: {
    fetchPackage: [Effect, { type: string }];
    fetchRecordList: [Effect, { type: string }];
    upOrDownPackage: Effect;
    packageDetail: Effect;
    paperList: Effect;
    authRecordDetail: Effect;
    authRecordHistory: Effect;
    packageByChannel: Effect;
    packageByCampus: Effect;
  };
  reducers: {
    resetState: Reducer<PackageModelState>;
    updateState: Reducer<PackageModelState>;
    updatePageDataState: Reducer<PackageModelState>;
    updateAuthRecordDataState: Reducer<PackageModelState>;
    updatePackageDetail: Reducer<PackageModelState>;
    updatePaperList: Reducer<PackageModelState>;
    updateAuthRecordDetail: Reducer<PackageModelState>;
  };
  // subscriptions: { leavePackage: Subscription };
}

const defaultState = {
  activeTabKey: 'paperList',
  // 试卷包列表数据
  pageData: {
    records: [],
    salesStatus: '',
    filterWord: '',
    areaCode: [],
    pageIndex: 1,
    pageSize: 20,
    total: 0, // 数目总条数
  },

  // 授权记录列表
  authRecordData: {
    records: [],
    status: '',
    authType: '',
    filterWord: '',
    pageIndex: 1,
    pageSize: 20,
    total: 0, // 数目总条数
  },

  packageDetail: {},
  paperListData: {},
  authRecordDetail: {},
  authHistory: [],
  packageByChannelList: [],
  packageByCampusList: [],
};

const PackageModel: PackageModelType = {
  namespace: 'resourcepackage',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {
    // 试卷包列表
    fetchPackage: [
      function* fetchPackage({ payload = {} }, { call, put, select }) {
        // 将请求参数写入 model
        const oldParams = yield select((state: ConnectState) => state.resourcepackage.pageData);
        const {
          pageSize,
          pageIndex,
          salesStatus: status,
          filterWord,
          areaCode: areaCodeNew,
        } = oldParams;

        const params = {
          pageIndex,
          pageSize,
          areaCode: areaCodeNew,
          salesStatus: status,
          filterWord,
          ...payload,
        };

        // 先将参数写入state
        yield put({
          type: 'updatePageDataState',
          payload: { ...params },
        });

        // 处理地区字段 传地区的最后节点 地区字段入参修改为areaCode，原来为areaCodeList
        const { areaCode: areaCodeParam } = payload;

        // payload中有地区字段
        const areaNew =
          areaCodeParam && areaCodeParam.length > 0
            ? [areaCodeParam[areaCodeParam.length - 1]]
            : areaCodeParam;

        // payload中无地区字段
        const areaOld =
          areaCodeNew && areaCodeNew.length > 0
            ? [areaCodeNew[areaCodeNew.length - 1]]
            : areaCodeNew;

        const queryParams = {
          pageIndex,
          pageSize,
          salesStatus: status,
          filterWord,
          ...payload,
          areaCode: areaCodeParam ? areaNew : areaOld, // 入参中有地区字段用新传入的数据，没有用原来保存在model中的数据
        };

        // 获取列表
        const data = yield call(getPackageList, { ...queryParams });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        yield put({
          type: 'updatePageDataState',
          payload: {
            records: records.map(
              (item: PackageObj): PackageObj => {
                const {
                  id,
                  code,
                  paperPackageName,
                  defaultAccreditNum,
                  incrementActiveNum,
                  salesStatusValue,
                  salesStatus,
                  areaCodeValue,
                  areaCode,
                } = item;
                return {
                  id,
                  code,
                  paperPackageName,
                  defaultAccreditNum,
                  incrementActiveNum,
                  salesStatusValue,
                  salesStatus,
                  areaCodeValue,
                  areaCode,
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

    // 试卷授权记录
    fetchRecordList: [
      function* fetchRecordList({ payload = {} }, { call, put, select }) {
        // 将请求参数写入 model
        const oldParams = yield select(
          (state: ConnectState) => state.resourcepackage.authRecordData,
        );
        const { pageSize, pageIndex, status: salesStatus, filterWord, authType: type } = oldParams;

        const params = {
          pageIndex,
          pageSize,
          authType: type,
          status: salesStatus,
          filterWord,
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
                  statusValue,
                  status, // 状态
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
                  statusValue,
                  status,
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

    // 上下架试卷包
    *upOrDownPackage({ payload = {} }, { call, put, select }) {
      const response = yield call(changeSaleStatus, payload);

      if (response === 'SUCCESS') {
        const { salesStatus } = payload;
        if (salesStatus === 'LAUNCHED') {
          message.success(
            formatMessage({
              id: 'operate.message.on.shelf.success',
              defaultMessage: '您已成功上架试卷包！',
            }),
          );
        } else {
          message.success(
            formatMessage({
              id: 'operate.message.off.shelf.success',
              defaultMessage: '您已成功下架试卷包！',
            }),
          );
        }

        // 获取最新数据
        const oldParams = yield select((state: ConnectState) => state.resourcepackage.pageData);
        const { pageSize, pageIndex, salesStatus: status, filterWord, areaCode } = oldParams;
        const params = {
          pageIndex,
          pageSize,
          salesStatus: status,
          filterWord,
          areaCode,
        };
        yield put({ type: 'fetchPackage', payload: params });
      }
    },

    // 试卷包详情
    *packageDetail({ payload = {} }, { call, put }) {
      const response = yield call(getPackageDetail, payload);
      yield put({
        type: 'updatePackageDetail',
        payload: { packageDetail: response || {} },
      });
    },

    // 试卷列表
    *paperList({ payload = {} }, { call, put }) {
      const response = yield call(getPaperList, payload);
      yield put({
        type: 'updatePaperList',
        payload: { paperListData: response || {} },
      });
    },

    // 试卷包授权记录详情
    *authRecordDetail({ payload = {} }, { call, put }) {
      const response = yield call(getAuthRecordDetail, payload);
      yield put({
        type: 'updateAuthRecordDetail',
        payload: { authRecordDetail: response || {} },
      });
    },

    // 试卷包授权信息历史记录
    *authRecordHistory({ payload = {} }, { call, put }) {
      const response = yield call(getAuthRecordHistory, payload);
      yield put({
        type: 'updateState',
        payload: { authHistory: response && response.records ? response.records : [] },
      });
    },

    // 试卷包授权关联渠道商
    *packageByChannel({ payload = {} }, { call, put }) {
      const response = yield call(getPackageByChannel, payload);
      yield put({
        type: 'updateState',
        payload: { packageByChannelList: response && response.records ? response.records : [] },
      });
    },

    // 试卷包关联最终用户
    *packageByCampus({ payload = {} }, { call, put }) {
      const response = yield call(getPackageByCampus, payload);
      yield put({
        type: 'updateState',
        payload: { packageByCampusList: response && response.records ? response.records : [] },
      });
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

    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    // 试卷包数据
    updatePageDataState(state, { payload }) {
      const { pageData = {} } = state || {};
      return {
        ...state,
        pageData: {
          ...pageData,
          ...payload,
        },
      } as PackageModelState;
    },

    // 授权记录数据
    updateAuthRecordDataState(state, { payload }) {
      const { authRecordData = {} } = state || {};
      return {
        ...state,
        authRecordData: {
          ...authRecordData,
          ...payload,
        },
      } as PackageModelState;
    },

    // 试卷包详情
    updatePackageDetail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    // 试卷列表
    updatePaperList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    updateAuthRecordDetail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },

  // subscriptions: {
  //   // 当跳出此级菜单时，清除model的数据
  //   leavePackage({ dispatch, history }) {
  //     return history.listen(({ pathname }) => {
  //       if (pathname.indexOf('/resource/package') === -1) {
  //         dispatch({
  //           type: 'updateState',
  //           payload: {
  //             activeTabKey: 'paperList',
  //             pageData: {
  //               records: [],
  //               salesStatus: '',
  //               filterWord: '',
  //               areaCode: [],
  //               pageIndex: 1,
  //               pageSize: 20,
  //               total: 0, // 数目总条数
  //             },

  //             // 授权记录列表
  //             authRecordData: {
  //               records: [],
  //               status: '',
  //               authType: '',
  //               filterWord: '',
  //               pageIndex: 1,
  //               pageSize: 20,
  //               total: 0, // 数目总条数
  //             },
  //           },
  //         });
  //       }
  //     });
  //   },
  // },
};

export default PackageModel;

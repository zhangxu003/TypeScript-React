/**
 * 渠道商 Model
 * @author tina.zhang
 * @date   2019-11-5 11:01:14
 */
import { Reducer } from 'redux';
import { Effect } from 'dva';
import {
  IQuery,
  createChannelVendor,
  getChannelVendorList,
  getChannelVendorDetail,
  updateChannelVendor,
  distributeDongle,
  cancelDistributeDongle,
  IBusinessScope,
} from '@/services/channelVendor';
import { getDongleList, DongleListParmsType, getDongleDetail } from '@/services/dongle';
import { ConnectState } from '@/models/connect';
import { CodeType } from '@/models/dictionary';
import { getAdministrativeLevelCode } from '../utils';

// const delay = (ms) => new Promise((resolve) => {
//   setTimeout(resolve, ms);
// });

/**
 * 渠道商列表查询条件
 */
export interface IQueryChannelVendorParams extends IQuery {
  total: 0;
}

/**
 * 加密狗查询条件
 */
export interface IQueryDongleListParams extends DongleListParmsType {
  total: 0;
}

/**
 * 分页请求响应数据类型定义
 */
export interface IRespPagination<T> {
  current: number; // 当前页码
  pages: number; // 总页数
  records: Array<T>; // 数据
  size: number; // 每页数据条数
  total: number; // 数据总数
  filterWord?: string | null; // 查询关键字
}

/**
 * 渠道商信息基类型
 */
export interface IChannelVendorBase {
  id: string; // ID,
  name: string; // 渠道商名称,
  address: string; // 详细地址/备注
  dongleNum: string; // 加密狗数, 从表auth_service.t_dongle_info表中统计：条件渠道端ID
}

/**
 * 渠道商详情
 */
export interface TChannelVendorDetail extends IChannelVendorBase {
  businessScope: Array<IBusinessScope>;
}

/**
 * 渠道商列表
 */
export interface IChannelVendor extends IChannelVendorBase {
  tenantId: string; // 租户ID,
  tel: string; // 联系电话,
  dongleNum: string; // 加密狗数, 从表auth_service.t_dongle_info表中统计：条件渠道端ID
  mainDongleNum: string; // 主加密狗数
  viceDongleNum: string; // 副加密狗数
  paperPackageSnNum: string; // 试卷包SN数量
}

/**
 * 加密狗列表
 */
export interface IDongle {
  id: string; // ID
  driveId: string; // 设备ID
  sn: string; // SN
  dongleType: string; // 狗类型
  dongleTypeValue: string; // 狗类型名称
  status: string; // 状态
  statusValue: string; // 状态名称
  changeTime: number; // 状态变化时间 操作时间
  campusId: string; // 校区ID
  campusName: string; // 校区名称
}

/**
 * Model State 类型定义
 */
export interface IChannelVendorModelState {
  queryChannelVendorParams: IQueryChannelVendorParams; // 渠道商列表查询条件
  channelVendorList: Array<IChannelVendor> | null; // 渠道商列表
  channelVendorDetail: TChannelVendorDetail | null; // 渠道商详情
  queryDongleListParams: IQueryDongleListParams; // 加密狗查询条件
  dongleList: Array<IDongle> | null; // 加密狗列表
}

/**
 * ChannelVendor Model 定义
 */
export interface IChannelVendorModel {
  namespace: string;
  state: IChannelVendorModelState;
  effects: {
    getChannelVendorList: Effect;
    getChannelVendorDetail: Effect;
    createChannelVendor: Effect;
    updateChannelVendor: Effect;
    getDongleList: Effect;
    getDongleDetail: Effect;
    distributeDongle: Effect;
    cancelDistributeDongle: Effect;
  };
  reducers: {
    saveChannelVendorList: Reducer<IChannelVendorModelState>;
    saveChannelVendorDetail: Reducer<IChannelVendorModelState>;
    saveDongleList: Reducer<IChannelVendorModelState>;
    clearChannelVendor: Reducer<IChannelVendorModelState>;
  };
}

/**
 * channelVendor model
 */
const channelVendorModel: IChannelVendorModel = {
  namespace: 'channelVendor',
  state: {
    queryChannelVendorParams: {
      // 渠道商列表查询条件
      pageIndex: 1,
      pageSize: 20,
      total: 0,
      filterWord: '',
    },
    channelVendorList: null, // 渠道商列表
    channelVendorDetail: null, // 渠道商详情
    queryDongleListParams: {
      // 加密狗查询条件
      pageIndex: 1,
      pageSize: 20,
      total: 0,
      filterWord: '',
      // dongleType: '',
      // dongleStatus: '',
    },
    dongleList: null, // 加密狗列表
  },
  effects: {
    // OPERATE-101：获取渠道商信息列表-分页
    *getChannelVendorList({ payload }, { call, put, select }) {
      const oldParams: IQueryChannelVendorParams = yield select(
        (state: ConnectState) => state.channelVendor.queryChannelVendorParams,
      );
      const { total, ...params } = {
        ...oldParams,
        ...payload,
      } as IQueryChannelVendorParams;

      const resp: IRespPagination<IChannelVendor> = yield call(getChannelVendorList, params);
      yield put({
        type: 'saveChannelVendorList',
        payload: {
          ...resp,
          querychannelVendorParams: params,
        },
      });
      return resp;
    },
    // OPERATE-102：创建渠道商信息
    *createChannelVendor({ payload }, { call }) {
      const resp = yield call(createChannelVendor, payload);
      return resp;
    },
    // OPERATE-103：获取渠道商信息
    *getChannelVendorDetail({ payload }, { call, put, select }) {
      const resp = yield call(getChannelVendorDetail, payload);
      // yield delay(5000);
      // 获取字典中区域数据，重组 TChannelVendorDetail.businessScope
      const dictionary = yield select((state: ConnectState) => state.dictionary);
      const { ADMINISTRATIVE_DIVISION } = dictionary;
      yield put({
        type: 'saveChannelVendorDetail',
        payload: {
          detail: resp,
          ADMINISTRATIVE_DIVISION,
        },
      });
    },
    // OPERATE-105：编辑渠道商信息
    *updateChannelVendor({ payload }, { call, put, select }) {
      const { id: channelVendorId } = yield select(
        (state: ConnectState) => state.channelVendor.channelVendorDetail,
      );
      const resp = yield call(updateChannelVendor, { channelVendorId, ...payload });

      yield put({
        type: 'getChannelVendorDetail',
        payload: { channelVendorId },
      });
      return resp;
    },
    // AUTH-401：获取加密狗信息列表-分页
    *getDongleList({ payload }, { call, put, select }) {
      const { id: channelVendorId } = yield select(
        (state: ConnectState) => state.channelVendor.channelVendorDetail,
      );
      const oldParams: IQueryDongleListParams = yield select(
        (state: ConnectState) => state.channelVendor.queryDongleListParams,
      );
      const { total, ...params } = {
        channelVendorId,
        ...oldParams,
        ...payload,
      } as IQueryDongleListParams;

      const resp = yield call(getDongleList, params);

      // 获取字典中区域数据，重组 TChannelVendorDetail.businessScope
      const dictionary = yield select((state: ConnectState) => state.dictionary);
      const { DONGLE_TYPE, DONGLE_STATUS } = dictionary;
      yield put({
        type: 'saveDongleList',
        payload: {
          ...resp,
          queryDongleListParams: params,
          DONGLE_TYPE,
          DONGLE_STATUS,
        },
      });
    },
    // AUTH-402：获取加密狗信息(根据设备ID)
    *getDongleDetail({ payload }, { call }) {
      const resp = yield call(getDongleDetail, payload);
      return resp;
    },
    // AUTH-409：分配加密狗
    *distributeDongle({ payload }, { call, select }) {
      const { id: channelVendorId } = yield select(
        (state: ConnectState) => state.channelVendor.channelVendorDetail,
      );
      const resp = yield call(distributeDongle, {
        channelVendorId,
        ...payload,
      });
      return resp;
    },
    // AUTH-410：取消分配加密狗
    *cancelDistributeDongle({ payload }, { call, put, select }) {
      const { id: channelVendorId } = yield select(
        (state: ConnectState) => state.channelVendor.channelVendorDetail,
      );
      const resp = yield call(cancelDistributeDongle, {
        channelVendorId,
        ...payload,
      });
      yield put({
        type: 'getDongleList',
      });
      return resp;
    },
  },
  reducers: {
    saveChannelVendorList(state, { payload }) {
      const { total, records, querychannelVendorParams } = payload;
      return {
        ...state,
        queryChannelVendorParams: {
          ...querychannelVendorParams,
          total,
        },
        channelVendorList: records,
      } as IChannelVendorModelState;
    },
    saveChannelVendorDetail(state, { payload }) {
      const { detail, ADMINISTRATIVE_DIVISION } = payload;
      let bussinessScopes: Array<IBusinessScope> = [];
      if (detail.areaCode) {
        const codes = detail.areaCode.split(',');
        bussinessScopes = codes.map(
          (v: string): IBusinessScope => ({
            areaCode: getAdministrativeLevelCode(v, ADMINISTRATIVE_DIVISION),
            areaValue: '',
          }),
        );
      }
      return {
        ...state,
        channelVendorDetail: {
          ...detail,
          businessScope: bussinessScopes,
        },
      } as IChannelVendorModelState;
    },
    saveDongleList(state, { payload }) {
      const {
        total,
        records,
        queryDongleListParams,
        DONGLE_TYPE,
        DONGLE_STATUS,
      }: {
        DONGLE_TYPE: Array<CodeType>;
        DONGLE_STATUS: Array<CodeType>;
        [key: string]: any;
      } = payload;
      let dongleList: Array<IDongle> = records;
      if (records && records.length > 0) {
        dongleList = records.map((v: IDongle) => {
          const dongleType = DONGLE_TYPE.find(c => c.code === v.dongleType);
          const dongleStatus = DONGLE_STATUS.find(s => s.code === v.status);
          return {
            id: v.id,
            driveId: v.driveId,
            sn: v.sn,
            dongleType: v.dongleType,
            dongleTypeValue: dongleType ? dongleType.value : '',
            status: v.status,
            statusValue: dongleStatus ? dongleStatus.value : '',
            changeTime: v.changeTime,
            campusId: v.campusId,
            campusName: v.campusName,
          };
        });
      }
      return {
        ...state,
        queryDongleListParams: {
          ...queryDongleListParams,
          total,
        },
        dongleList,
      } as IChannelVendorModelState;
    },
    clearChannelVendor() {
      return {
        queryChannelVendorParams: {
          pageIndex: 1,
          pageSize: 13,
          total: 0,
          filterWord: '',
        },
        channelVendorList: null, // 渠道商列表
        channelVendorDetail: null, // 渠道商详情
      } as IChannelVendorModelState;
    },
  },
  // subscriptions:{

  // }
};

export default channelVendorModel;

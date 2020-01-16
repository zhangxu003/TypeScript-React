/**
 * 加密狗 相关功能
 * models
 */
import { Reducer } from 'redux';
import { Effect, EffectsCommandMap } from 'dva';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import {
  getDongleList,
  DongleListParmsType,
  getDongleDetail,
  editDongleDetail,
  getDongleHistory,
  adjustDonglelimit,
  getChannelHistory,
  getCampusHistory,
  recycleDongle,
  saveDongleInfo,
  changeDongle,
  cancelDongle,
  getDongleSN,
} from '@/services/dongle';
import filterData from '@/utils/filterData';

// 加密狗分类
type DongleType = 'MAIN_DONGLE' | 'VICE_DONGLE';

// 加密狗状态
type DongleStatus =
  | 'INITIAL' // 已入库
  | 'DISTRIBUTED' // 已分配
  | 'BINDED' // 已绑定
  | 'ACTIVATED' // 已激活
  | 'INVALID' // 已失效
  | 'EXPIRED' // 已到期
  | 'WAITING_RECYCLE'; // 待回收

// 加密狗列表中的对象
interface RecordData {
  sn: string;
  status: DongleStatus;
  changeTime: string;
  id: string;
  driveId: string;
  dongleType: DongleType;
}

// 加密狗列表，相关数据（包括首页条件，分页信息，列表数据）
interface DonglePageData extends DongleListParmsType {
  records: RecordData[]; // 列表数据
  dataCount: number; // 总共的数据条数
}

// 加密狗详情数据
type DongleDetail = {
  sn: string; // sn
  status: DongleStatus; // 加密狗状态
  id: string; // id
  driveId: string; // 设备id
  dongleType: DongleType; // 加密狗类型
  remark?: string; // 备注
  activateCount: number; // 激活次数
  activateCountLimit: number; // 剩余激活次数
};

type CodeType = {
  sn: string;
  ishave?: boolean;
  driveId: string;
  dongleType?: string;
};

export interface DongleModelState {
  pageData: DonglePageData;
  detail: DongleDetail;
  history?: {};
  historyAll?: {};
  dongleArr?: CodeType[];
  historyChannel?: {};
  historyCampus?: {};
}

export interface DongleModelType {
  namespace: 'dongle';
  state: DongleModelState;
  effects: {
    fetchDongle: [
      (action: { payload: DongleListParmsType }, effects: EffectsCommandMap) => void,
      { type: string },
    ];
    fetchDongleDetail: Effect;
    editDongleInfo: Effect;
    fetchDongleHistory: Effect;
    adjustDongleInfo: Effect;
    fetchChannelHistory: Effect;
    fetchCampusHistory: Effect;
    recycleDongleInfo: Effect;
    fetchPhase: Effect;
    saveDongleInfos: Effect;
    changeDongleInfos: Effect;
    cancelDongleInfos: Effect;
    fetchDongleSN: Effect;
  };
  reducers: {
    resetState: Reducer<DongleModelState>;
    updateState: Reducer<DongleModelState>;
    updatePageDataState: Reducer<DongleModelState>;
    updateDongleDetail: Reducer<DongleModelState>;
    updateDetailState: Reducer<DongleModelState>;
  };
}

// 设置初始化的值
// 可以用于后面的初始化
const defaultState = {
  // 加密狗列表数据
  pageData: {
    records: [], // 狗列表数组
    dataCount: 0, // 总共的数据条数
    dongleType: undefined, // 狗类型
    dongleStatus: undefined, // 狗状态
    filterWord: undefined, // 搜索的关键字
    pageIndex: 1, // 当前页码
    pageSize: 20, // 每页显示条数
  },
  // 加密狗详情
  detail: {},
  // 历史轨迹列表
  history: {
    records: [],
  },
  // 激活管理中激活历史列表
  historyAll: {
    records: [],
  },

  dongleArr: [],
  historyChannel: {}, // 渠道商信息
  historyCampus: {}, // 最终用户信息
};

const DongleModel: DongleModelType = {
  namespace: 'dongle',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {
    /**
     * 请求加密狗列表
     */
    fetchDongle: [
      function* fetchDongle({ payload }, { call, put, select }) {
        // 先将参数写入state
        yield put({
          type: 'updatePageDataState',
          payload: { ...payload },
        });
        // 获取modal 中，当前的请求数据获取最新的数据
        const { records: _, ...params } = yield select(
          (state: ConnectState) => state.dongle.pageData,
        );
        // 获取加密狗表单
        const data = yield call(getDongleList, { ...params, ...payload });
        // 将获取的数据，写入modal中
        const { total, size, current, records = [] } = data;
        // 对records 重写并写入modal中
        yield put({
          type: 'updatePageDataState',
          payload: {
            records: filterData(
              records,
              'sn,status,changeTime,id,driveId,dongleType,distributorId,invalidTime,expired',
            ),
            pageIndex: current,
            dataCount: total,
            pageSize: size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    // 获取加密狗详情
    *fetchDongleDetail({ payload = {} }, { call, put }) {
      const response = yield call(getDongleDetail, payload);
      yield put({
        type: 'updateDongleDetail',
        payload: {
          detail: filterData(
            response || {},
            'sn,status,id,driveId,dongleType,remark,activateCount,activateCountLimit',
          ),
        },
      });
    },

    // 获取加密狗历史信息(根据设备ID)-分页
    *fetchDongleHistory({ payload = {} }, { call, put }) {
      const response = yield call(getDongleHistory, payload);
      if (payload.actionType) {
        // 激活历史列表
        yield put({
          type: 'updateDongleDetail',
          payload: { history: response || {} },
        });
      } else {
        // 历史轨迹列表
        yield put({
          type: 'updateDongleDetail',
          payload: { historyAll: response || {} },
        });
      }
    },

    // 获取加密狗关联渠道商(根据设备ID)-分页
    *fetchChannelHistory({ payload = {} }, { call, put }) {
      const response = yield call(getChannelHistory, payload);
      yield put({
        type: 'updateDongleDetail',
        payload: { historyChannel: response || {} },
      });
    },

    // 获取加密狗关联渠道商(根据设备ID)-分页
    *fetchCampusHistory({ payload = {} }, { call, put }) {
      const response = yield call(getCampusHistory, payload);
      yield put({
        type: 'updateDongleDetail',
        payload: { historyCampus: response || {} },
      });
    },

    // 加密狗信息修改
    *editDongleInfo({ payload = {} }, { select, put, call }) {
      const response = yield call(editDongleDetail, payload);
      // 将数据写入
      if (response === 'SUCCESS') {
        message.success(
          formatMessage({ id: 'operate.text.saveSuccess', defaultMessage: '保存成功' }),
        );
      }
      // 获取detail 中的 设备id
      const { driveId } = yield select((state: ConnectState) => state.dongle.detail);
      const { dongleInfoList = [] } = payload;
      // 通过 driveId 找到对应的数据，并缓存到 detail 中。
      const params = dongleInfoList.find((item: any) => item.driveId === driveId);

      yield put({
        type: 'updateDetailState',
        payload: { ...params },
      });
    },

    // 回收加密狗
    *recycleDongleInfo({ payload = {} }, { call, put }) {
      const response = yield call(recycleDongle, payload);
      if (response === 'SUCCESS') {
        message.success(
          formatMessage({
            id: 'operate.text.youHaveSuccessfullyRecoveredEncryptionDog',
            defaultMessage: '您已成功回收加密狗！',
          }),
        );
        yield put({
          type: 'fetchDongle',
          payload: { pageIndex: 1 },
        });
      }
      // yield put({
      //   type: 'updateDongleDetail',
      //   payload: { detail: response || {} },
      // });
    },

    // 加密狗信息修改
    *adjustDongleInfo({ payload = {} }, { call, put }) {
      const response = yield call(adjustDonglelimit, payload);
      if (response === 'SUCCESS') {
        message.success(
          formatMessage({ id: 'operate.text.saveSuccess', defaultMessage: '保存成功' }),
        );
        yield put({
          type: 'updateDetailState',
          payload: { ...payload },
        });
      }
    },

    // 读取加密狗
    *fetchPhase({ payload = {} }, { call, put, select }) {
      const response = yield call(getDongleDetail, payload);

      const { dongleArr } = yield select((state: ConnectState) => state.dongle);
      const newDongleArr = JSON.parse(JSON.stringify(dongleArr));
      const { sn } = yield call(getDongleSN, payload);
      const itemObj = { sn, ishave: false, driveId: payload.driveId };
      if (response) {
        itemObj.ishave = true;
        itemObj.sn = response.sn;
        itemObj.driveId = response.driveId;
      }
      let falg = true;
      newDongleArr.forEach((element: any) => {
        if (element.driveId === itemObj.driveId) {
          falg = false;
        }
      });

      if (falg) {
        newDongleArr.push(itemObj);
        yield put({
          type: 'updateDongleDetail',
          payload: { dongleArr: newDongleArr },
        });
      } else {
        message.warning(
          formatMessage({
            id: 'operate.text.encryptionDogHasRead',
            defaultMessage: '加密狗已读取！',
          }),
        );
      }
    },

    // 读狗
    *fetchDongleSN({ payload = {} }, { call, put, select }) {
      const response = yield call(getDongleDetail, payload);
      const { dongleArr } = yield select((state: ConnectState) => state.dongle);
      const newDongleArr = JSON.parse(JSON.stringify(dongleArr));
      const itemObj = {
        sn: '',
        ishave: false,
        driveId: payload.driveId,
        dongleType: '',
      };

      if (response) {
        itemObj.sn = response.sn;
        itemObj.dongleType = response.dongleType;
      } else {
        return 'FAIL';
      }
      let falg = true;
      newDongleArr.forEach((element: any) => {
        if (element.driveId === itemObj.driveId) {
          falg = false;
        }
      });

      if (falg) {
        newDongleArr.push(itemObj);
        yield put({
          type: 'updateDongleDetail',
          payload: { dongleArr: newDongleArr },
        });
      } else {
        message.warning(
          formatMessage({
            id: 'operate.text.encryptionDogHasRead',
            defaultMessage: '加密狗已读取！',
          }),
        );
      }
      return 'SUCCESS';
    },

    // 回收加密狗
    *saveDongleInfos({ payload = {} }, { call }) {
      const response = yield call(saveDongleInfo, payload);
      return response;
      // yield put({
      //   type: 'updateDongleDetail',
      //   payload: { detail: response || {} },
      // });
    },

    // 更换加密狗
    *changeDongleInfos({ payload = {} }, { call }) {
      const response = yield call(changeDongle, payload);
      return response;
      // yield put({
      //   type: 'updateDongleDetail',
      //   payload: { detail: response || {} },
      // });
    },

    *cancelDongleInfos({ payload = {} }, { call }) {
      const response = yield call(cancelDongle, payload);
      return response;
      // yield put({
      //   type: 'updateDongleDetail',
      //   payload: { detail: response || {} },
      // });
    },
  },

  reducers: {
    /**
     * 初始化加密狗数据
     * 目的比如从外部进入
     */
    resetState() {
      return JSON.parse(JSON.stringify(defaultState));
    },
    /**
     * 基础方法，更新dongle de model
     */
    updateState(state, { payload }): DongleModelState {
      return {
        ...state,
        ...payload,
      };
    },

    /**
     * 加密狗详情
     */
    updateDongleDetail(state, { payload }): DongleModelState {
      return {
        ...state,
        ...payload,
      };
    },

    /**
     * 设置列表页面的数据
     * 替换 pageData 中的数据
     */
    updatePageDataState(state, { payload }): DongleModelState {
      const { pageData } = state as DongleModelState;
      return {
        ...state,
        pageData: {
          ...pageData,
          ...payload,
        },
      } as DongleModelState;
    },

    /**
     * 更改详情中的数据
     * 替换detail中的数据
     */
    updateDetailState(state, { payload }): DongleModelState {
      const { detail } = state as DongleModelState;
      return {
        ...state,
        detail: {
          ...detail,
          ...payload,
        },
      } as DongleModelState;
    },
  },
};

export default DongleModel;

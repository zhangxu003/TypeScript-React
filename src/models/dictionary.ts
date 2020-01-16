/*
 * @Author: jeffery.shi
 * @LastEditors: jeffery.shi
 * @Description: 获取全部的字典库，并且缓存到页面中
 * @Date: 2019-02-27 17:07:52
 * @LastEditTime: 2019-05-06 16:21:31
 */
import { Subscription, Effect } from 'dva';
import { Reducer } from 'redux';
import { queryDictionary } from '@/services/global';
import { ConnectState } from './connect.d';

export type CodeType = object & {
  id: string;
  code: string;
  typeCode: string;
  value: string;
  parentCode?: string;
  addressDetails?: string;
};

export interface DictionaryModelState {
  hasLoad: boolean;
  DONGLE_TYPE: CodeType[];
  DONGLE_STATUS: CodeType[];
  PACKAGE_SALES_STATUS: CodeType[];
  PACKAGE_AUTH_TYPE: CodeType[];
  PACKAGE_AUTH_CODE_STATUS: CodeType[];
  TENANT_AUTHORIZE_MODE: CodeType[];
  DONGLE_CUSTOMER_TYPE: CodeType[];
  DONGLE_OPREATION_TYPE: CodeType[];
  PACKAGE_OPERATION_TYPE: CodeType[];
  CHANNEL_VENDOR_OPERATION_TYPE: CodeType[];
  CAMPUS_OPERATION_TYPE: CodeType[];
  CAMPUS_STATUS: CodeType[];
  DONGLE_ADJUST_REASON: CodeType[];
  PAPER_ISVISIBLE: CodeType[];
  PAPER_PREVIEW: CodeType[];
  TENANT_SUB_AUTHORIZE_MODE: CodeType[];
  ADMINISTRATIVE_DIVISION: CodeType[];
  GRADE: CodeType[];
  ANNUAL: CodeType[];
  DIFFICULT_LVL: CodeType[];
  CLASS_STRUCT: CodeType[];
  EDUCATION_SYSTEM: CodeType[];
  EDUCATION_PHASE: CodeType[];
  CLASS_ALIAS_VIEW_RANGE: CodeType[];
  ACCOUNT_BIND_TYPE: CodeType[];
  SUBJECT: CodeType[];
}

// 需要统一获取的 字典列表
// 额外补充 code， 如下模式即可
const codeList = {
  DONGLE_TYPE: [], // 狗类型
  DONGLE_STATUS: [], // 狗状态
  PACKAGE_SALES_STATUS: [], // 试卷包上下架状态
  PACKAGE_AUTH_TYPE: [], // 试卷包授权方式
  PACKAGE_AUTH_CODE_STATUS: [], // 试卷包授权码状态
  TENANT_AUTHORIZE_MODE: [], // 加密狗授权方式
  DONGLE_CUSTOMER_TYPE: [], // 加密狗客户类型
  DONGLE_OPREATION_TYPE: [], // 加密狗操作类型
  PACKAGE_OPERATION_TYPE: [], // 试卷包操作类型
  CHANNEL_VENDOR_OPERATION_TYPE: [], // 渠道商操作类型
  CAMPUS_OPERATION_TYPE: [], // 校区操作类型
  CAMPUS_STATUS: [], // 校区状态
  DONGLE_ADJUST_REASON: [], // 加密狗更换原因
  PAPER_ISVISIBLE: [], // 试卷保密状态
  PAPER_PREVIEW: [], // 预览状态
  TENANT_SUB_AUTHORIZE_MODE: [], // 加密狗子授权方式
  ADMINISTRATIVE_DIVISION: [], // 地区字典
  GRADE: [], // 年级
  ANNUAL: [], // 学年
  DIFFICULT_LVL: [], // 难易度
  CLASS_STRUCT: [], // 班级架构
  EDUCATION_SYSTEM: [], // 学制
  EDUCATION_PHASE: [], // 学段
  CLASS_ALIAS_VIEW_RANGE: [], // 班级别名可见范围
  ACCOUNT_BIND_TYPE: [], // 教师账号状态
  SUBJECT: [], // 学科
};

export interface DictionaryModelType {
  namespace: 'dictionary';
  state: DictionaryModelState;
  effects: {
    initDictionary: Effect;
    fetchDictionary: Effect;
  };
  reducers: {
    updateState: Reducer<DictionaryModelState>;
  };
  subscriptions: { initDictionary: Subscription };
}

const DictionaryModel: DictionaryModelType = {
  namespace: 'dictionary',

  state: {
    hasLoad: false, // 字典库是否已经加载过了
    ...codeList,
  },

  effects: {
    // 初始化字典库，监听获取用户消息成功的消息
    *initDictionary(_, { take, put }) {
      while (true) {
        yield take('USE_FETCH_SUCCESS');
        // 请求字典库
        yield put({ type: 'fetchDictionary' });
        return false;
      }
    },
    /**
     * 获取字典表
     * 根据 字典名，获取以逗号分隔的多个字典
     * 空字符串则获取全部
     * @param {*} param0
     * @param {*} param1
     */
    *fetchDictionary(_, { call, put, select }) {
      // 判断字典库是否已经获取了，如果获取过了则不再去获取
      const { hasLoad } = yield select((state: ConnectState) => state.dictionary);
      if (hasLoad) return;

      let responseData: CodeType[];
      try {
        // 此接口不需要单独的报错处理
        responseData = yield call(queryDictionary, Object.keys(codeList).join(','));
      } catch (err) {
        return;
      }

      // 遍历数据生成key-value形式
      const result = {};
      responseData.forEach(item => {
        const { id, code, typeCode, value, parentCode, addressDetails } = item;
        const obj = { id, code, typeCode, value, parentCode, addressDetails };
        if (item.typeCode in result) {
          result[item.typeCode].push(obj);
        } else {
          result[item.typeCode] = [obj];
        }
      });

      yield put({
        type: 'updateState',
        payload: {
          ...result,
          hasLoad: true,
        },
      });
    },
  },

  reducers: {
    /**
     * @description: 更新字典表库
     * @param {type}
     * @return:
     */
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },

  subscriptions: {
    /**
     * @description: 加载页面的时候主动的去加载字典库
     * @param {type}
     * @return:
     */
    initDictionary({ dispatch }) {
      // 获取字典库
      dispatch({ type: 'initDictionary' });
    },
  },
};

export default DictionaryModel;

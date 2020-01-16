import React, { useState, useEffect, useCallback } from 'react';
import { AnyAction } from 'redux';
import { Button } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState, ConnectProps } from '@/models/connect';
import { IChannelVendor, IQueryChannelVendorParams } from '../models/channelVendor';
import PageWrapper from '@/components/PageWrapper';
import Search from '@/components/Search';
// import SearchBar from '@/components/SearchBar';
import ChannelVendorList from './Components/ChannelVendorList';
import CreateModal from './Components/CreateModal';
import CreateSuccessModal from './Components/CreateSuccessModal';
import event from '@/utils/event';
import styles from './index.less';

/**
 * 右上角筛选组件
 */
const ExtraReactNode = (params: { onSearch: any; onCreate: any }): React.ReactElement => {
  const { onSearch, onCreate } = params;
  return (
    <div className={styles.rightbar}>
      <div className={styles.searchContainer}>
        <Search
          shape="round"
          placeholder={formatMessage({
            id: 'operate.placeholder.channelvendor.search',
            defaultMessage: '请输入渠道商名称',
          })}
          onSearch={onSearch}
          maxLength={30}
        />
      </div>
      <Button type="primary" shape="round" onClick={() => onCreate()}>
        {formatMessage({
          id: 'operate.button.channelvendor.createlink',
          defaultMessage: '创建渠道商',
        })}
      </Button>
    </div>
  );
};

/**
 * Props 类型定义
 */
export interface IChannelVendorProps extends ConnectProps {
  dispatch<K = any>(action: AnyAction): K;
  queryChannelVendorParams: IQueryChannelVendorParams;
  channelVendorList: Array<IChannelVendor> | null;
  loading: boolean; // 列表 loading
  createChannelVendorSubmitting: boolean; // 创建渠道商提交 loading
}

/**
 * State 类型定义
 */
export interface IChannelVendorState extends ConnectProps {
  showCreateModal: boolean; // 是否显示创建Modal
  createdChannelVendName: string | null; // 新创建渠道商名称，以及用于判断是否显示创建成功弹窗
}

/**
 * @description 渠道商首页
 * @author leo.guo
 * @since 2019-11-5 16:11:10
 */
const ChannelVendor: React.FC<IChannelVendorProps> = props => {
  // State
  const [state, setState] = useState<IChannelVendorState>({
    showCreateModal: false,
    createdChannelVendName: null,
  });

  const {
    loading,
    channelVendorList,
    queryChannelVendorParams,
    createChannelVendorSubmitting,
  } = props;

  // 加载渠道商列表
  const loadChannelVendorList = useCallback(
    (filterWord: string, pageIndex: number) => {
      const { dispatch } = props;
      dispatch({
        type: 'channelVendor/getChannelVendorList',
        payload: {
          ...queryChannelVendorParams,
          filterWord,
          pageIndex,
        },
      });
    },
    [queryChannelVendorParams],
  );

  // didMount
  useEffect(() => {
    const { filterWord, pageIndex } = queryChannelVendorParams;
    loadChannelVendorList(filterWord, pageIndex);
  }, []);

  // 搜索
  const handleSearch = useCallback(
    (value: string): void => {
      // const { pageIndex } = pagination;
      loadChannelVendorList(value, 1);
    },
    [queryChannelVendorParams],
  );

  // 创建渠道商
  const handleCreate = useCallback(() => {
    setState({
      ...state,
      showCreateModal: true,
    });
  }, [state]);

  // 创建渠道商窗口关闭回调
  const handleCreateModalClose = useCallback(
    values => {
      if (!values || !values.name) {
        setState({
          ...state,
          showCreateModal: false,
        });
        return;
      }
      const { dispatch } = props;
      dispatch({
        type: 'channelVendor/createChannelVendor',
        payload: { channelVendorName: values.name },
      }).then(() => {
        setState({
          ...state,
          showCreateModal: false,
          createdChannelVendName: values.name,
        });
      });
    },
    [state],
  );

  // 创建渠道商窗口关闭回调
  const handleSuccessModalClose = useCallback(() => {
    setState({
      ...state,
      createdChannelVendName: null,
    });
    loadChannelVendorList('', 1);
  }, [state]);

  // 分页
  const handlePageChanged = useCallback(
    (index: number) => {
      const { filterWord } = queryChannelVendorParams;
      loadChannelVendorList(filterWord, index);
      // 切换页码时回到顶部
      event.emit('srollPageWarp');
    },
    [queryChannelVendorParams],
  );

  return (
    <PageWrapper extra={<ExtraReactNode onSearch={handleSearch} onCreate={handleCreate} />}>
      {/* 渠道商<Link to="/tenant/channelvendor/manage/detail">详情</Link> */}
      {channelVendorList && (
        <ChannelVendorList
          pagination={queryChannelVendorParams}
          loading={loading}
          dataSource={channelVendorList}
          onPageChanged={handlePageChanged}
        />
      )}
      {state.showCreateModal && (
        <CreateModal
          onModalClose={handleCreateModalClose}
          loading={createChannelVendorSubmitting}
        />
      )}
      {state.createdChannelVendName && (
        <CreateSuccessModal
          channelVendorName={state.createdChannelVendName}
          onModalClose={handleSuccessModalClose}
        />
      )}
    </PageWrapper>
  );
};

export default connect(({ channelVendor, loading }: ConnectState): any => ({
  queryChannelVendorParams: channelVendor.queryChannelVendorParams, // 查询条件
  channelVendorList: channelVendor.channelVendorList, // 渠道商列表
  loading: loading.effects['channelVendor/getChannelVendorList'], // 列表 loading
  createChannelVendorSubmitting: loading.effects['channelVendor/createChannelVendor'], // 创建渠道商提交 loading
}))(ChannelVendor);

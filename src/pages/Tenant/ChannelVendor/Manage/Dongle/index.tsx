import React, { useCallback, useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { AnyAction } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect';
import { CodeType } from '@/models/dictionary';
import { IDongle, IQueryDongleListParams } from '@/pages/Tenant/models/channelVendor';
import DongleFilter from '../../Components/DongleFilter';
import DongleList from '../../Components/DongleList';
import DistributeDongle from '../../Components/DistributeDongle';
import event from '@/utils/event';
import styles from './index.less';

/**
 * Props 类型定义
 */
export interface IDongleProps {
  dispatch<K = any>(action: AnyAction): K;
  queryDongleListParams: IQueryDongleListParams; // 查询条件
  dongleTypeDictionary: Array<CodeType>; // 加密狗类型字典
  dongleStatusDictionary: Array<CodeType>; // 加密狗状态字典
  dongleList: Array<IDongle> | null; // 加密狗列表
  loading: boolean; // 加载状态
}

/**
 * State 类型定义
 */
export interface IDongleState {
  showDistributeDongleModal: boolean; // 是否显示分配加密狗窗口
}

/**
 * 加密狗
 */
const Dongle: React.FC<IDongleProps> = props => {
  const {
    dispatch,
    queryDongleListParams,
    dongleTypeDictionary,
    dongleStatusDictionary,
    dongleList,
    loading,
  } = props;

  const [state, setState] = useState<IDongleState>({
    showDistributeDongleModal: false,
  });

  // 加载列表
  const loadDongleList = useCallback(params => {
    dispatch({
      type: 'channelVendor/getDongleList',
      payload: {
        ...queryDongleListParams,
        ...params,
      },
    });

    // 切换页码时回到顶部
    event.emit('srollPopupWarp');
  }, []);

  // didMount
  useEffect(() => {
    loadDongleList({ ...queryDongleListParams });
  }, []);

  // 搜索
  const handleSearch = useCallback((params: any) => {
    loadDongleList({ ...params, pageIndex: 1 });
  }, []);

  // 分页改变回调
  const handlePageChanged = useCallback(pageIndex => {
    loadDongleList({ pageIndex });
  }, []);

  // 取消分配加密狗
  const handleDongleRemoved = useCallback((driveId: string) => {
    Modal.confirm({
      title: formatMessage({
        id: 'operate.message.donglelist.unassign.confirm',
        defaultMessage: '确认取消分配加密狗？',
      }),
      icon: null,
      className: styles.removeDongleConfirm,
      autoFocusButton: null,
      okButtonProps: {
        shape: 'round',
        type: 'danger',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      okText: formatMessage({ id: 'operate.button.ok', defaultMessage: '确认' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      centered: true,
      onOk: () => {
        dispatch({
          type: 'channelVendor/cancelDistributeDongle',
          payload: {
            driveIds: driveId,
          },
        }).then(() => {
          message.success(
            formatMessage({
              id: 'operate.message..donglelist.unassign.success',
              defaultMessage: '您已成功取消分配加密狗！',
            }),
          );
        });
      },
    });
  }, []);

  // 分配加密狗
  const handleDistributeDongleClick = useCallback(() => {
    setState({
      showDistributeDongleModal: true,
    });
  }, [state]);

  // 分配加密狗弹窗关闭回调
  const handleDistributeDongleModalClose = useCallback(() => {
    setState({
      showDistributeDongleModal: false,
    });
    loadDongleList({ pageIndex: 1 });
  }, [state]);

  return (
    <div className={styles.dongle}>
      <DongleFilter
        dongleStatusDictionary={dongleStatusDictionary}
        dongleTypeDictionary={dongleTypeDictionary}
        onSearch={handleSearch}
        onDistributeDongleClick={handleDistributeDongleClick}
      />
      <DongleList
        pagination={queryDongleListParams}
        loading={loading}
        dataSource={dongleList}
        onPageChanged={handlePageChanged}
        onDongleRemoved={handleDongleRemoved}
      />
      {state.showDistributeDongleModal && (
        <DistributeDongle onModalClose={handleDistributeDongleModalClose} />
      )}
    </div>
  );
};

export default connect(({ dictionary, channelVendor, loading }: ConnectState) => ({
  queryDongleListParams: channelVendor.queryDongleListParams,
  dongleTypeDictionary: dictionary.DONGLE_TYPE,
  dongleStatusDictionary: dictionary.DONGLE_STATUS,
  dongleList: channelVendor.dongleList,
  loading: loading.effects['channelVendor/getDongleList'],
}))(Dongle);

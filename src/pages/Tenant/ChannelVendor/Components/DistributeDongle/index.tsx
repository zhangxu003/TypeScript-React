import React, { useState, useCallback } from 'react';
import { Modal, Button, message } from 'antd';
import { AnyAction } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect';
import { IDongle } from '@/pages/Tenant/models/channelVendor';
import ReadDongle from './ReadDongle';
import DongleList from './DongleList';
import styles from './index.less';
import DistributeSuccess from './DistributeSuccess';

/**
 * Props 类型定义
 */
export interface IDistributeDongleProps {
  dispatch<K = any>(action: AnyAction): K;
  loadingDistribute: boolean; // 分配加密狗提交状态
  onModalClose: () => void; // 弹窗关闭回调
}

/**
 * State 类型定义
 */
export interface IDistributeDongleState {
  showReading: boolean; // 是否显示读狗功能区域
  showSuccess: boolean; // 是否分配成功功能区域
  dongleList: Array<IDongle>; // 已读取加密狗
}

/**
 * 绑定加密狗
 * @author leo.guo
 * @date 2019-11-18 11:43:41
 */
const DistributeDongle: React.FC<IDistributeDongleProps> = props => {
  const { dispatch, loadingDistribute, onModalClose } = props;

  const [state, setState] = useState<IDistributeDongleState>({
    showReading: true,
    showSuccess: false,
    dongleList: [],
  });

  // 读取加密狗回调
  const handleReadDongle = useCallback(
    (dongle: IDongle) => {
      if (state.dongleList.some(v => v.id === dongle.id)) {
        message.warn(
          formatMessage({
            id: 'operate.message.dongle.distribute.repeat',
            defaultMessage: '该加密狗已存在列表中！',
          }),
        );
        return;
      }
      const { dongleList } = state;
      dongleList.push(dongle);
      setState({
        ...state,
        dongleList: [...dongleList],
      });
    },
    [state],
  );

  // 关闭回调
  const handleModalClose = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, [onModalClose]);

  // 删除加密狗
  const handleDongleDelete = useCallback(
    (id: string) => {
      const { dongleList } = state;
      setState({
        ...state,
        dongleList: dongleList.filter(d => d.id !== id),
      });
    },
    [state],
  );

  // 一键分配加密狗
  const handleDistribute = useCallback(() => {
    const { dongleList } = state;
    const driveIds = dongleList.filter(v => v.status === 'INITIAL').map(v => v.driveId);
    if (driveIds && driveIds.length === 0) {
      return;
    }
    dispatch({
      type: 'channelVendor/distributeDongle',
      payload: {
        driveIds: driveIds.join(','),
      },
    }).then(() => {
      setState({
        ...state,
        showReading: false,
        showSuccess: true,
        dongleList: dongleList.filter(v => v.status === 'INITIAL'),
      });
      message.success(
        formatMessage({
          id: 'operate.message.dongle.distribute.success',
          defaultMessage: '分配成功',
        }),
      );
    });
  }, [state]);

  return (
    <Modal
      visible
      centered
      footer={null}
      width={400}
      maskClosable={false}
      className={styles.distributeDongleModal}
      onCancel={handleModalClose}
      destroyOnClose
    >
      <div className={styles.distributeDongle}>
        {state.showReading && <ReadDongle onReadDongle={handleReadDongle} />}
        {state.showSuccess && <DistributeSuccess dongleList={state.dongleList} />}
        {state.dongleList.length > 0 && (
          <>
            <DongleList
              dongleList={state.dongleList}
              onDelete={handleDongleDelete}
              allowedOperation={state.showReading}
            />
            <div className={styles.distributeBtnContainer}>
              {state.showReading && (
                <Button
                  shape="round"
                  className={styles.btnDistribute}
                  onClick={handleDistribute}
                  loading={loadingDistribute}
                >
                  {formatMessage({
                    id: 'operate.button.dongle.distribute',
                    defaultMessage: '一键分配',
                  })}
                </Button>
              )}
              {state.showSuccess && (
                <Button
                  shape="round"
                  type="primary"
                  className={styles.btnKnow}
                  onClick={handleModalClose}
                  loading={loadingDistribute}
                >
                  {formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' })}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default connect(({ loading }: ConnectState) => ({
  loadingDistribute: loading.effects['channelVendor/distributeDongle'],
}))(DistributeDongle);

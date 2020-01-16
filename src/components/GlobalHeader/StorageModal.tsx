import React from 'react';
import { Modal, message, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import copy from 'copy-to-clipboard';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import dongles from '@/assets/dongle.png';
import { getDeviceId } from '@/utils/instructions';
import styles from './index.less';

interface StorageModalProps extends ConnectProps {
  visible: boolean;
  hideModal: () => void;
  dongleArr?: any;
  dongle?: any;
}

@connect(({ dongle }: ConnectState) => {
  const {
    dongleArr, // 当期页数据
  } = dongle;
  return {
    dongleArr,
  };
})
export default class StorageModal extends React.Component<StorageModalProps> {
  state = {
    warntext: '',
  };

  fetchPhase = () => {
    const { dispatch } = this.props;
    if (getDeviceId()) {
      const { deviceId } = getDeviceId();

      if (dispatch && deviceId) {
        dispatch({
          type: 'dongle/fetchDongleSN',
          payload: {
            driveId: deviceId,
          },
        }).then((e: string) => {
          if (e === 'FAIL') {
            this.setState({
              warntext: formatMessage({
                id: 'operate.text.theEncryptionDogHasNotYetBeenPutInStoragePleasePutInStorage',
                defaultMessage: '该加密狗尚未入库，请先入库！',
              }),
            });
          } else {
            this.setState({
              warntext: '',
            });
          }
        });
      }
    }
  };

  /**
   *复制sn号
   *
   * @memberof StorageModal
   */
  clipboardData = (item: any) => {
    // console.log(window);
    // window.Clipboard.setData('Text', item.sn);
    message.success(
      `${formatMessage({
        id: 'operate.text.youHaveSuccessfullyReproduced',
        defaultMessage: '您已成功复制',
      })}${item.sn}`,
    );
  };

  render() {
    const { visible, hideModal, dongleArr } = this.props;
    const Jsx = dongleArr.map((item: any) => (
      <div key={item.sn}>
        <div className={styles.top}>
          <div className={styles.sn}>
            {item && item.dongleType === 'MAIN_DONGLE' ? (
              <div className={styles.right_tips}>
                {formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })}
              </div>
            ) : (
              <div className={styles.v_tips}>
                {formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
              </div>
            )}
            {item.sn}
          </div>
          <CopyToClipboard
            text={item.sn}
            options={{ debug: true }}
            onCopy={(text: string, result: any) => {
              copy(text, result);
              this.clipboardData(item);
            }}
          >
            <Tooltip title={formatMessage({ id: 'operate.text.copy', defaultMessage: '复制' })}>
              <IconFont type="icon-copy" />
            </Tooltip>
          </CopyToClipboard>
        </div>
      </div>
    ));
    return (
      <Modal
        visible={visible}
        onOk={hideModal}
        centered
        maskClosable={false}
        onCancel={() => {
          const { dispatch } = this.props;
          if (dispatch) {
            dispatch({
              type: 'dongle/updateDongleDetail',
              payload: {
                dongleArr: [],
              },
            });
          }
          this.setState({
            warntext: '',
          });
          hideModal();
        }}
        footer={null}
        className={styles.StorageModal}
      >
        <img alt="logo" src={dongles} />
        <div className={styles.title}>
          {formatMessage({
            id: 'operate.text.insert.dongle.and.read',
            defaultMessage: '请先插入狗，进行读狗操作',
          })}
        </div>

        <div className={styles.green_btn} onClick={this.fetchPhase}>
          {formatMessage({ id: 'operate.button.read.dongle', defaultMessage: '读狗' })}
        </div>
        {dongleArr.length !== 0 && <div className={styles.line} />}

        <div className={styles.content}>
          {dongleArr.length !== 0 && (
            <div className={styles.top}>
              <span>
                {formatMessage({ id: 'operate.text.haveReadTheSn', defaultMessage: '已读SN' })}
              </span>
              <div></div>
            </div>
          )}
          <div className={styles.item}>{Jsx}</div>
          <div className={styles.orange}>{this.state.warntext}</div>
        </div>
      </Modal>
    );
  }
}

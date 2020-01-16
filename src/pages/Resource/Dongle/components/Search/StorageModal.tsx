import React from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import dongles from '@/assets/dongle.png';
import { getDeviceId } from '@/utils/instructions';
import styles from './index.less';

const { success } = Modal;

interface StorageModalProps extends ConnectProps {
  visible: boolean;
  hideModal: () => void;
  dongleArr?: any;
  dongle?: any;
  type: string;
  onReload: any;
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
  fetchPhase = () => {
    const { dispatch } = this.props;
    if (getDeviceId()) {
      // const deviceId = getDeviceId()['"deviceId"'];
      const { deviceId } = getDeviceId();
      if (dispatch && deviceId) {
        dispatch({
          type: 'dongle/fetchPhase',
          payload: {
            driveId: deviceId,
          },
        });
      }
    }
  };

  onSave = () => {
    const { dispatch, dongleArr, hideModal, type, onReload } = this.props;
    if (dispatch) {
      const params: any = [];
      dongleArr.forEach((element: any) => {
        if (!element.ishave) {
          params.push({
            ...element,
            dongleType: type,
          });
        }
      });
      dispatch({
        type: 'dongle/saveDongleInfos',
        payload: params,
      }).then((e: string) => {
        if (e === 'SUCCESS') {
          hideModal();
          success({
            content: (
              <div>
                <div className={styles.successconent}>
                  <div className={styles.right}>
                    <IconFont type="icon-right" />
                  </div>
                </div>
                <div className={styles.successtitle}>
                  <span>
                    {formatMessage({
                      id: 'operate.text.successfulInventory',
                      defaultMessage: '成功入库',
                    })}
                  </span>
                  <span className={styles.green}>{params.length}</span>
                  <span>
                    {type === 'MAIN_DONGLE'
                      ? formatMessage({ id: 'operate.text.aMainDog', defaultMessage: '个主狗' })
                      : formatMessage({ id: 'operate.title.aDog', defaultMessage: '个副狗' })}
                  </span>
                </div>
                {params.map((item: any) => (
                  <div key={item.sn} className={styles.itemcontent}>
                    <div className={styles.sn}>{item.sn}</div>
                  </div>
                ))}
              </div>
            ),
            centered: true,
            icon: false,
            className: styles.StorageModal,
            okText: formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' }),
            okButtonProps: {
              shape: 'round',
            },
            onOk() {},
            onCancel() {},
          });
          onReload();
        }
      });
    }
  };

  detele = (item: any) => {
    const { dongleArr, dispatch } = this.props;
    let newDongleArr = JSON.parse(JSON.stringify(dongleArr));
    newDongleArr = newDongleArr.filter((m: any) => m.sn !== item.sn);

    if (dispatch) {
      dispatch({
        type: 'dongle/updateDongleDetail',
        payload: {
          dongleArr: newDongleArr,
        },
      });
    }
  };

  render() {
    const { visible, hideModal, dongleArr } = this.props;

    const Jsx = dongleArr.map((item: any) => (
      <div key={item.sn}>
        <div className={styles.top}>
          <div className={styles.sn}>{item.sn}</div>
          <IconFont
            type="icon-detele"
            onClick={() => {
              this.detele(item);
            }}
          />
        </div>
        {item.ishave && (
          <div className={styles.orange}>
            {formatMessage({
              id: 'operate.text.dongle.has.in.stroage',
              defaultMessage: '该加密狗已存在，无需再次入库',
            })}
          </div>
        )}
      </div>
    ));

    const waitdongleArr = dongleArr.filter((m: any) => !m.ishave);
    return (
      <Modal
        visible={visible}
        onOk={hideModal}
        centered
        onCancel={hideModal}
        maskClosable={false}
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
          {formatMessage({
            id: 'operate.text.read.dongle.create.sn',
            defaultMessage: '读狗，生成SN',
          })}
        </div>
        {dongleArr.length !== 0 && <div className={styles.line} />}

        {dongleArr.length !== 0 && (
          <div className={styles.content}>
            <div className={styles.top}>
              <span>
                {formatMessage({ id: 'operate.text.generateTheSn', defaultMessage: '生成SN' })}
              </span>
              <div>
                <span>
                  {formatMessage({ id: 'operate.text.toBePutInStorage', defaultMessage: '待入库' })}
                  ：
                </span>
                <span className={styles.green}>{waitdongleArr.length}</span>
              </div>
            </div>
            <div className={styles.item}>{Jsx}</div>
          </div>
        )}
        {waitdongleArr.length !== 0 && (
          <div className={styles.yellow_btn} onClick={this.onSave}>
            {formatMessage({ id: 'operate.text.aKeyTreasury', defaultMessage: '一键入库' })}
          </div>
        )}
      </Modal>
    );
  }
}

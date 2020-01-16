import React, { useCallback, useState } from 'react';
import { AnyAction } from 'redux';
import { Button, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { getDeviceId } from '@/utils/instructions';
import { IDongle } from '@/pages/Tenant/models/channelVendor';
import donglepng from '@/assets/dongle.png';
import styles from './index.less';

/**
 * Props 类型定义
 */
export interface IReadDongleProps {
  onReadDongle: (dongle: IDongle) => void;
  dispatch<K = any>(action: AnyAction): K;
}

/**
 * State 类型定义
 */
export interface IReadDongleState {
  reading: boolean; // 加密狗读取状态
}

/**
 * 读取加密狗
 * @author tina.zhang
 * @date 2019-11-19 09:18:52
 */
const ReadDongle: React.FC<IReadDongleProps> = props => {
  const { onReadDongle, dispatch } = props;

  const [state, setState] = useState<IReadDongleState>({
    reading: false,
  });

  // 读取加密狗，请先插入狗，进行读狗操作
  const handleReadDongle = useCallback(() => {
    setState({
      reading: true,
    });
    const vbResult = getDeviceId();
    if (vbResult) {
      const { deviceId } = vbResult;
      if (deviceId && dispatch) {
        dispatch({
          type: 'channelVendor/getDongleDetail',
          payload: {
            driveId: deviceId,
          },
        }).then((res: IDongle) => {
          if (!res) {
            setState({
              ...state,
              reading: false,
            });
            message.warn(
              formatMessage({
                id: 'operate.message.dongle.distribute.uninitial',
                defaultMessage: '当前加密狗未入库，请先入库！',
              }),
            );
            return;
          }
          setState({
            reading: false,
          });
          onReadDongle(res);
        });
      } else {
        setState({
          ...state,
          reading: false,
        });
      }
    } else {
      setState({
        ...state,
        reading: false,
      });
    }
  }, [onReadDongle]);

  return (
    <div className={styles.read}>
      <div
        className={styles.readingImage}
        style={{ background: `url(${donglepng}) no-repeat center` }}
      ></div>
      <div className={styles.readtip}>
        {formatMessage({
          id: 'operate.text.insert.dongle.and.read',
          defaultMessage: '请先插入狗，进行读狗操作',
        })}
      </div>
      <div className={styles.readBtnContainer}>
        <Button
          shape="round"
          type="primary"
          className={styles.btnRead}
          onClick={handleReadDongle}
          loading={state.reading}
        >
          {formatMessage({ id: 'operate.button.read.dongle', defaultMessage: '读狗' })}
        </Button>
      </div>
    </div>
  );
};

export default connect()(ReadDongle);

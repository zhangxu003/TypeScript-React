import React from 'react';
import { Input } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import Button from '@/components/Button';
import styles from './index.less';

const { TextArea } = Input;

type Detail = ConnectState['dongle']['detail'];

interface BaseInfoProps {
  remark: Detail['remark'];
  driveId: Detail['driveId'];
  dongleStatusValue: string;
  loading?: boolean;
}

interface BaseInfoState {
  newRemark?: string;
}

@connect(({ dongle, dictionary, loading }: ConnectState) => {
  const { detail } = dongle;
  const { remark = '', status = '', driveId = '' } = detail || {};
  const { DONGLE_STATUS = [] } = dictionary;
  // 通过 字典库，获取当期 加密狗状态的名称
  const dictObj = DONGLE_STATUS.find(item => item.code === status);
  return {
    remark: remark || '', // 备注  remark 后台返回null
    driveId, // 加密狗设备id
    dongleStatusValue: dictObj ? dictObj.value : status, // 加密狗状态的名称
    loading: loading.effects['dongle/editDongleInfo'], // 保存状态
  };
})
class BaseInfo extends React.Component<BaseInfoProps & ConnectProps, BaseInfoState> {
  static defaultProps: BaseInfoProps;

  state = {
    newRemark: '',
  };

  constructor(props: BaseInfoProps) {
    // 此处代码保证 render 中第一次生成dom的时候，按钮的判断条件已经生效。
    super(props);
    const { remark } = props;
    this.state.newRemark = remark || '';
  }

  onChange = (dsd: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = dsd;
    const value = target && target.value;
    this.setState({ newRemark: value });
  };

  onSave = () => {
    const { dispatch, driveId } = this.props;
    const { newRemark = '' } = this.state;
    if (dispatch && driveId) {
      dispatch({
        type: 'dongle/editDongleInfo',
        payload: {
          dongleInfoList: [
            {
              driveId,
              remark: newRemark.trim(),
            },
          ],
        },
      });
    }
  };

  render() {
    const { remark = '', driveId, dongleStatusValue, loading } = this.props;
    const { newRemark = '' } = this.state;

    // 按钮是否可以点击的状态
    // 1、没有详情数据时
    // 2、备注数据没有改变时
    const disableBtn = !driveId || remark.trim() === newRemark.trim();
    return (
      <div className={styles.listBaseInfoContainer}>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.text.deviceId', defaultMessage: '设备ID' })}
            </div>
            <div className={styles.cont}>{driveId}</div>
          </div>
          <div className={styles.item} style={{ marginLeft: 40 }}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' })}
            </div>
            <div className={styles.cont}>{dongleStatusValue}</div>
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.item2}>
            <div className={styles.tit2}>
              {formatMessage({ id: 'operate.text.note', defaultMessage: '备注' })}
            </div>
            <TextArea
              className={styles.cont2}
              rows={3}
              maxLength={500}
              placeholder={formatMessage({
                id: 'operate.text.pleaseEnterTheNoteInformation',
                defaultMessage: '请输入备注信息',
              })}
              value={newRemark}
              onChange={this.onChange}
            />
          </div>
        </div>

        <div className={styles.line}></div>

        <Button
          className={styles.btn}
          onClick={this.onSave}
          type="primary"
          disabled={disableBtn}
          loading={loading}
        >
          {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
        </Button>
      </div>
    );
  }
}
export default BaseInfo;

import React from 'react';
import { Input, Timeline, message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import PageLoading from '@/components/PageLoading';
import Button from '@/components/Button';
import { newTab } from '@/utils/instructions';
import styles from './index.less';

type Detail = ConnectState['dongle']['detail'];

interface ActivateManageProps extends ConnectProps {
  loading: ConnectState['loading']['effects'];
  adjustLoading: ConnectState['loading']['effects'];
  driveId: Detail['driveId'];
  activateCountLimit: Detail['activateCountLimit'];
  activateCount: Detail['activateCount'];
  history?: any;
}

interface ActivateManageState {
  value: number;
}

@connect(({ dongle, loading }: ConnectState) => {
  const { detail, history } = dongle;
  const { driveId, activateCountLimit, activateCount } = detail;
  return {
    driveId,
    activateCountLimit,
    activateCount,
    history,
    loading: loading.effects['dongle/fetchDongleHistory'], // 获取激活历史loading
    adjustLoading: loading.effects['dongle/adjustDongleInfo'], // 修改可激活次数loading
  };
})
class ActivateManage extends React.Component<ActivateManageProps, ActivateManageState> {
  static defaultProps: ActivateManageProps;

  state = {
    value: 0,
  };

  constructor(props: ActivateManageProps) {
    // 此处代码保证 render 中第一次生成dom的时候，按钮的判断条件已经生效。
    super(props);
    const { activateCountLimit } = props;
    this.state.value = activateCountLimit || 0;
  }

  componentDidMount() {
    const { driveId, dispatch } = this.props;
    if (dispatch && driveId) {
      dispatch({
        type: 'dongle/fetchDongleHistory',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          driveId,
          actionType: 'DOT_6',
        },
      });
    }
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value.replace(/[^\-?\d.]/g, '');
    if (value.includes('-')) {
      message.warn(
        formatMessage({
          id: 'operate.text.pleaseEnterAnIntegerActivationNumberGreaterThanZero',
          defaultMessage: '请输入激活次数大于0的整数',
        }),
      );
      return;
    }
    this.setState({ value: Number(value || 0) });
  };

  // 修改可激活次数
  onSave = () => {
    const { dispatch, driveId, activateCount } = this.props;
    const { value } = this.state;
    if (Number(value) === 0 || Number(value) > 100) {
      message.warn(
        formatMessage({
          id: 'operate.text.pleaseEnterTheActivationNumberIs0And100Integer',
          defaultMessage: '请输入激活的次数为>0且<=100的整数',
        }),
      );
      return;
    }
    if (Number(value) < activateCount) {
      message.warn(
        formatMessage({
          id: 'operate.text.cantLessThanActivationTimesAlready',
          defaultMessage: '不能小于已激活次数哦！',
        }),
      );
      return;
    }
    if (dispatch && driveId) {
      dispatch({
        type: 'dongle/adjustDongleInfo',
        payload: {
          activateCountLimit: value,
          driveId,
        },
      });
    }
  };

  goToDeatil = (id: string) => {
    newTab(`/tenant/campus/manage/${id}/detail`);
    // window.open(`/tenant/campus/manage/${id}/detail`);
    // router.push({ pathname: `tenant/campus/manage/${id}/detail` });
  };

  render() {
    const {
      driveId,
      activateCount,
      activateCountLimit,
      history,
      loading,
      adjustLoading,
    } = this.props;
    const { value } = this.state;

    // 判断可激活次数，能否点击
    const disableBtn = !driveId || activateCountLimit === value;

    // 剩余激活次数, 最小为0，不能为负数
    const number = activateCountLimit - activateCount;
    const surplusNum = number >= 0 ? number : 0;

    const Jsx = history.records.map((item: any) => (
      <Timeline.Item key={item.id}>
        <div className={styles.historyItem}>
          <span className={styles.time}>
            {moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
          <div className={styles.lineItem}>|</div>
          <span className={styles.normal}>
            {formatMessage({ id: 'operate.text.activateTheCampus', defaultMessage: '激活校区' })}:
          </span>
          <span
            className={styles.campusName}
            onClick={() => {
              this.goToDeatil(item.campusId);
            }}
          >
            {item.campusName}
          </span>
        </div>
      </Timeline.Item>
    ));
    return (
      <div className={styles.activateManageContainer}>
        <div className={styles.cell}>
          <div className={styles.toActivateTheNumber}>
            <span>
              {formatMessage({
                id: 'operate.text.toActivateTheNumber',
                defaultMessage: '可激活次数',
              })}
            </span>
            <Input className={styles.toActivateInput} value={value} onChange={this.onChange} />
            <span>{formatMessage({ id: 'operate.text.time', defaultMessage: '次' })}</span>
          </div>
          <div className={styles.hasBeenActivated}>
            <span>
              {formatMessage({ id: 'operate.text.hasBeenActivated', defaultMessage: '已激活' })}
            </span>
            <span>{activateCount}</span>
            <span>
              {formatMessage({
                id: 'operate.text.timeTheRemainingActivation',
                defaultMessage: '次，剩余激活',
              })}
            </span>
            <span>{surplusNum}</span>
            <span>{formatMessage({ id: 'operate.text.time', defaultMessage: '次' })}</span>
          </div>
          <Button
            onClick={this.onSave}
            type="primary"
            disabled={disableBtn}
            loading={adjustLoading}
          >
            {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
          </Button>
        </div>
        {loading ? (
          <PageLoading />
        ) : (
          <div className={styles.history}>
            <div className={styles.activateTheHistoryTitle}>
              {formatMessage({ id: 'operate.text.activateTheHistory', defaultMessage: '激活历史' })}
            </div>
            <div className={styles.timeline}>
              <Timeline>{Jsx}</Timeline>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default ActivateManage;

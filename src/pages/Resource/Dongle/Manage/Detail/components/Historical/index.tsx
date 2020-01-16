import React from 'react';
import { Timeline, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import cs from 'classnames';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import PageLoading from '@/components/PageLoading';
import { newTab } from '@/utils/instructions';
import styles from './index.less';

type Detail = ConnectState['dongle']['detail'];

interface HistoricalProps {
  DONGLE_OPREATION_TYPE: ConnectState['dictionary']['DONGLE_OPREATION_TYPE'];
  historyAll?: any;
  driveId: Detail['driveId'];
  loading: boolean;
}

@connect(({ dongle, dictionary, loading }: ConnectState) => {
  const {
    detail, // 当期页数据
    historyAll,
  } = dongle;
  const { driveId } = detail;
  const { DONGLE_OPREATION_TYPE = [] } = dictionary;
  return {
    driveId,
    historyAll,
    DONGLE_OPREATION_TYPE,
    loading: loading.effects['dongle/fetchDongleHistory'],
  };
})
class Historical extends React.PureComponent<HistoricalProps & ConnectProps> {
  static defaultProps: HistoricalProps;

  componentDidMount() {
    const { driveId, dispatch } = this.props;
    if (dispatch && driveId) {
      dispatch({
        type: 'dongle/fetchDongleHistory',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          driveId,
        },
      });
    }
  }

  goToDeatil = (id: any, type: string) => {
    if (type === 'campusName') {
      newTab(`/tenant/campus/manage/${id}/detail`);
    } else {
      // window.open(`/tenant/channelvendor/manage/${item.channelVendorId}/detail`);
      newTab(`/tenant/channelvendor/manage/${id}/detail`);
    }
    // newTab(`/tenant/campus/manage/${id}/detail`);
  };

  render() {
    const { historyAll, DONGLE_OPREATION_TYPE, loading } = this.props;

    const Jsx = historyAll.records.map((item: any) => {
      const obj = DONGLE_OPREATION_TYPE.find((temp: any) => temp.code === item.actionType) || {
        value: '',
      };
      return (
        <Timeline.Item key={item.id}>
          <div>
            <span className={styles.time}>
              {moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <div className={styles.historyItem}>
              <div>
                <span className={styles.normal}>
                  {formatMessage({ id: 'operate.text.change', defaultMessage: '变动' })}:
                </span>
                <span className={styles.time}>{obj.value}</span>
              </div>
              {item.channelVendorName && (
                <div className={styles.flex}>
                  <div className={styles.lineItem}>|</div>
                  <span className={styles.normal}>
                    {formatMessage({
                      id: 'operate.title.channel.business',
                      defaultMessage: '渠道商',
                    })}
                    ：
                  </span>
                  <Tooltip title={item.channelVendorName}>
                    <div
                      className={cs(styles.campusName, styles.ellipsis)}
                      onClick={() => {
                        this.goToDeatil(item.channelVendorId, 'channelVendorName');
                      }}
                    >
                      {item.channelVendorName}
                    </div>
                  </Tooltip>
                </div>
              )}
              {item.campusName && (
                <div className={styles.flex}>
                  <div className={styles.lineItem}>|</div>
                  <span className={styles.normal}>
                    {formatMessage({ id: 'operate.title.end.user', defaultMessage: '最终用户' })}:
                  </span>
                  <Tooltip title={item.campusName}>
                    <div
                      className={cs(styles.campusName, styles.ellipsis)}
                      onClick={() => {
                        this.goToDeatil(item.campusId, 'campusName');
                      }}
                    >
                      {item.campusName}
                    </div>
                  </Tooltip>
                </div>
              )}
              {item.createByName && (
                <div className={styles.flex}>
                  <div className={styles.lineItem}>|</div>
                  <span className={styles.normal}>
                    {formatMessage({ id: 'operate.text.operationOf', defaultMessage: '操作人' })}:
                  </span>
                  <span className={styles.time}>{item.createByName}</span>
                </div>
              )}
            </div>
          </div>
        </Timeline.Item>
      );
    });

    if (loading) {
      return <PageLoading />;
    }

    return (
      <div className={styles.HistoricalContainer}>
        <div className={styles.history}>
          <div className={styles.timeline}>
            <Timeline>{Jsx}</Timeline>
          </div>
        </div>
      </div>
    );
  }
}
export default Historical;

import React from 'react';
import { Spin } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import styles from './index.less';
import HistoryCard from '../HistoryCard';
import Empty from '@/components/Empty';
import PageLoading from '@/components/PageLoading';
import nonechannel from '../../assets/none／channel.png';

type Detail = ConnectState['dongle']['detail'];

interface HistoricalProps extends ConnectProps {
  loading: boolean;
  driveId: Detail['driveId'];
  historyChannel?: any;
}

@connect(({ dongle, loading }: ConnectState) => {
  const { detail, historyChannel } = dongle;
  const { driveId } = detail;
  return {
    driveId,
    historyChannel,
    loading: loading.effects['dongle/fetchChannelHistory'],
  };
})
class Historical extends React.PureComponent<HistoricalProps> {
  static defaultProps: HistoricalProps;

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch, driveId } = this.props;
    if (dispatch && driveId) {
      dispatch({
        type: 'dongle/fetchChannelHistory',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          driveId,
        },
      });
    }
  };

  render() {
    const { historyChannel, loading } = this.props;
    const { records = [] } = historyChannel;

    if (records.length === 0 && loading) {
      return <PageLoading />;
    }

    if (records.length === 0 && !loading) {
      return (
        <div className={styles.HistoricalContainer}>
          <Empty
            image={nonechannel}
            className={styles.emptys}
            description={formatMessage({
              id: 'operate.text.noDistributors',
              defaultMessage: '暂无渠道商',
            })}
          />
        </div>
      );
    }

    return (
      <div className={styles.HistoricalContainer}>
        <Spin spinning={loading}>
          {records.map((item: any) => (
            <HistoryCard key={item.channelVendorId} data={item} type="channelVendorName" />
          ))}
        </Spin>
      </div>
    );
  }
}
export default Historical;

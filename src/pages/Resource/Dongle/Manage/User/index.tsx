import React from 'react';
import { Spin } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import styles from './index.less';
import HistoryCard from '../HistoryCard';
import Empty from '@/components/Empty';
import PageLoading from '@/components/PageLoading';
import noschool from '../../assets/noschool.png';

type Detail = ConnectState['dongle']['detail'];

interface HistoricalProps extends ConnectProps {
  loading: boolean;
  driveId: Detail['driveId'];
  historyCampus?: any;
}

@connect(({ dongle, loading }: ConnectState) => {
  const { detail, historyCampus } = dongle;
  const { driveId } = detail;
  return {
    driveId,
    historyCampus,
    loading: loading.effects['dongle/fetchCampusHistory'],
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
        type: 'dongle/fetchCampusHistory',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          driveId,
        },
      });
    }
  };

  render() {
    const { historyCampus, loading } = this.props;
    const { records = [] } = historyCampus;

    if (records.length === 0 && loading) {
      return <PageLoading />;
    }

    if (records.length === 0 && !loading) {
      return (
        <div className={styles.HistoricalContainer}>
          <Empty
            image={noschool}
            className={styles.emptys}
            description={formatMessage({
              id: 'operate.text.noTheEndUser',
              defaultMessage: '暂无最终用户',
            })}
          />
        </div>
      );
    }
    return (
      <div className={styles.HistoricalContainer}>
        <Spin spinning={loading}>
          {records.map((item: any) => (
            <HistoryCard key={item.campusId} data={item} type="campusName" />
          ))}
        </Spin>
      </div>
    );
  }
}
export default Historical;

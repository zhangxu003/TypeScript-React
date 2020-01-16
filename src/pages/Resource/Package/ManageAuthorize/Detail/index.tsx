import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import AuthBaseInfo from './components/AuthBaseInfo';
import HistoryTrack from './components/HistoryTrack';
import styles from './index.less';

const { TabPane } = Tabs;

interface AuthDetailProps {
  dispatch?: (e: any) => void;
  match?: any;
  authHistory?: ConnectState['resourcepackage']['authHistory'];
}

@connect(({ resourcepackage, loading }: ConnectState) => {
  const { authHistory } = resourcepackage;
  return {
    authHistory,
    loading: loading.effects['resourcepackage/authRecordHistory'],
  };
})
class AuthDetail extends Component<AuthDetailProps> {
  state = {};

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { pid, snid },
      },
    } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/authRecordHistory',
        payload: {
          paperPackageId: pid,
          serialNumber: snid,
          pageIndex: 1,
          pageSize: 0x7fffffff,
        },
      });
    }
  }

  handleTabChange = (key: string) => {
    console.log(key);
  };

  render() {
    return (
      <div className={styles.authDetailContainer}>
        <Tabs onChange={this.handleTabChange} type="card">
          <TabPane
            tab={formatMessage({ id: 'operate.text.base.info', defaultMessage: '基本信息' })}
            key="1"
          >
            <AuthBaseInfo />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'operate.title.history.track', defaultMessage: '历史轨迹' })}
            key="2"
          >
            <HistoryTrack />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default AuthDetail;

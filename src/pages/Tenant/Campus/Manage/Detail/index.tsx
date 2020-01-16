import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import ListBaseInfo from './components/ListBaseInfo';
import CampusConfig from './components/CampusConfig';
import TeacherList from './components/TeacherList';
import ServerConfig from './components/ServerConfig';
import CampusManager from './components/Manager';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';

const { TabPane } = Tabs;

interface ListDetailProps {
  match?: any;
  dispatch?: Dispatch<AnyAction>;
}

@connect(({ campus }: ConnectState) => {
  const {
    detail, // 详情
  } = campus;

  return {
    detail,
  };
})
class ListDetail extends Component<ListDetailProps> {
  state = {
    activeKey: '1',
  };

  componentDidMount() {
    this.setState({
      activeKey:
        localStorage.getItem('activeKey') === '2' || localStorage.getItem('activeKey') === '3'
          ? '2'
          : localStorage.getItem('activeKey') || '1',
    });
  }

  handleTabChange = (key: string) => {
    this.setState({ activeKey: key });
    localStorage.setItem('activeKey', key);
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/CampusDetailInfo',
        payload: {
          campusId: id,
        },
      });
    }
  };

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { activeKey } = this.state;
    return (
      <div className={styles.listDetailContainer}>
        <Tabs onChange={this.handleTabChange} type="card" activeKey={activeKey}>
          <TabPane
            tab={formatMessage({ id: 'operate.text.base.info', defaultMessage: '基本信息' })}
            key="1"
          >
            <ListBaseInfo />
          </TabPane>
          <TabPane tab="校区配置" key="2">
            <CampusConfig />
          </TabPane>
          <TabPane tab="教师" key="5">
            <TeacherList key={activeKey} />
          </TabPane>
          <TabPane tab="服务配置" key="8">
            <ServerConfig />
          </TabPane>
          <TabPane tab="管理员" key="4">
            <CampusManager activeKey={activeKey} campusId={id} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default ListDetail;

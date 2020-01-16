import React, { Component } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { Tabs } from 'antd';
import Basic from './Basic';
import Report from './Report';
import styles from './index.less';

const { TabPane } = Tabs;

class CampusConfig extends Component {
  state = {
    activeKey: '1',
  };

  componentDidMount() {
    if (localStorage.getItem('activeKey') === '3') {
      this.setState({ activeKey: '2' });
    } else {
      this.setState({ activeKey: '1' });
    }
  }

  handleTabChange = (key: string) => {
    this.setState({ activeKey: key });
  };

  render() {
    const { activeKey } = this.state;
    return (
      <div className={styles.listBaseInfoContainer}>
        <Tabs onChange={this.handleTabChange} activeKey={activeKey}>
          <TabPane
            tab={formatMessage({
              id: 'operate.message.basicConfiguration',
              defaultMessage: '基础配置',
            })}
            key="1"
          >
            <Basic />
          </TabPane>
          <TabPane
            tab={formatMessage({
              id: 'operate.message.reportStrategy',
              defaultMessage: '报告策略',
            })}
            key="2"
          >
            <Report />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default CampusConfig;

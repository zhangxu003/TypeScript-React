import React from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import PageWrapper from '@/components/PageWrapper';
import PaperList from './components/PaperList';
import AuthRecordList from './components/AuthRecordList';
import styles from './index.less';

const { TabPane } = Tabs;

interface ResourcePackageProps {
  dispatch?: (e: any) => void;
  activeTabKey?: ConnectState['resourcepackage']['activeTabKey'];
}

@connect(({ resourcepackage }: ConnectState) => {
  const { activeTabKey } = resourcepackage;

  return {
    activeTabKey,
  };
})
class ResourcePackage extends React.PureComponent<ResourcePackageProps> {
  handleTabChange = (key: string) => {
    const { dispatch } = this.props;
    // 保存activetabkey
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/updateState',
        payload: {
          activeTabKey: key,
        },
      });
    }
  };

  render() {
    const { activeTabKey } = this.props;
    return (
      <PageWrapper extra={null}>
        <div className={styles.packageListContainer}>
          <Tabs defaultActiveKey={activeTabKey} onChange={this.handleTabChange}>
            <TabPane
              tab={formatMessage({
                id: 'operate.title.paper.package.tab.title1',
                defaultMessage: '试卷包列表',
              })}
              key="paperList"
            >
              <PaperList />
            </TabPane>
            <TabPane
              tab={formatMessage({
                id: 'operate.title.paper.package.tab.title2',
                defaultMessage: '试卷包授权记录',
              })}
              key="recordList"
            >
              <AuthRecordList />
            </TabPane>
          </Tabs>
        </div>
      </PageWrapper>
    );
  }
}

export default ResourcePackage;

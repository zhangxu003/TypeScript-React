import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import PackageList from './components/PackageList';
import CheckPaperList from './components/CheckPaperList';
import styles from './index.less';

const { TabPane } = Tabs;

interface RelationPackageProps {
  dispatch?: (e: any) => void;
  match?: any;
  authHistory?: ConnectState['resourcepackage']['authHistory'];
}

@connect(({ tenantpackage, loading }: ConnectState) => {
  const { records = [], total, pageSize, pageIndex } = tenantpackage.paperListData || {};

  return {
    records,
    total,
    pageSize,
    pageIndex,
    loading: loading.effects['tenantpackage/fetchPaperList'],
  };
})
class RelationPackage extends Component<RelationPackageProps> {
  state = {
    activeKey: '1',
  };

  componentDidMount() {}

  handleTabChange = (key: string) => {
    this.setState({ activeKey: key });
    const {
      match: {
        params: { id },
      },
    } = this.props;
    if (key === '2') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'tenantpackage/fetchPaperList',
          payload: { campusId: id, pageIndex: 1 },
        });
      }
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
      <div className={styles.relationPackageContainer}>
        <Tabs onChange={this.handleTabChange} type="card" activeKey={activeKey}>
          <TabPane
            tab={formatMessage({ id: 'operate.title.paper.package', defaultMessage: '试卷包' })}
            key="1"
          >
            <PackageList campusId={id} />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'operate.title.check.papers', defaultMessage: '查看试卷' })}
            key="2"
          >
            <CheckPaperList campusId={id} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default RelationPackage;

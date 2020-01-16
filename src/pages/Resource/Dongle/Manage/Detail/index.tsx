import React from 'react';
import { Tabs } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect.d';
import BaseInfo from './components/BaseInfo';
import ActivateManage from './components/ActivateManage';
import Historical from './components/Historical';
import styles from './index.less';

const { TabPane } = Tabs;

type Detail = ConnectState['dongle']['detail'];

interface ListDetailProps {
  dongleType: Detail['dongleType'];
}

// connect 保持最小大小，及应用中，实际用到哪些，才去传入组件。
@connect(({ dongle }: ConnectState) => {
  const {
    detail: { dongleType },
  } = dongle;
  return { dongleType };
})
class ListDetail extends React.PureComponent<ListDetailProps> {
  static defaultProps: ListDetailProps;

  render() {
    const { dongleType } = this.props;
    return (
      <div className={styles.listDetailContainer}>
        <Tabs type="card">
          <TabPane
            tab={formatMessage({ id: 'operate.text.base.info', defaultMessage: '基本信息' })}
            key="detail"
          >
            <BaseInfo />
          </TabPane>
          {dongleType === 'MAIN_DONGLE' ? (
            <TabPane
              tab={formatMessage({
                id: 'operate.text.active.management',
                defaultMessage: '激活管理',
              })}
              key="manage"
            >
              <ActivateManage />
            </TabPane>
          ) : null}

          <TabPane
            tab={formatMessage({ id: 'operate.text.historical.route', defaultMessage: '历史轨迹' })}
            key="history"
          >
            <Historical />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default ListDetail;

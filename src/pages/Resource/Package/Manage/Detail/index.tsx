import React, { Component } from 'react';
import { Tabs } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import ListBaseInfo from './components/ListBaseInfo';
import PaperList from './components/PaperList';
import styles from './index.less';

const { TabPane } = Tabs;

interface ListDetailProps {
  match?: any;
}

class ListDetail extends Component<ListDetailProps> {
  state = {};

  componentDidMount() {}

  handleTabChange = (key: string) => {
    console.log(key);
  };

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    return (
      <div className={styles.listDetailContainer}>
        <Tabs onChange={this.handleTabChange} type="card">
          <TabPane
            tab={formatMessage({ id: 'operate.text.base.info', defaultMessage: '基本信息' })}
            key="1"
          >
            <ListBaseInfo />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'operate.text.paper.list', defaultMessage: '试卷列表' })}
            key="2"
          >
            <PaperList paperPackageId={id} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default ListDetail;

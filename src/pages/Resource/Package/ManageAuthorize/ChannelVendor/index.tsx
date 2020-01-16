import React, { Component } from 'react';
import { Collapse, Timeline, Divider, Tag, Spin, Empty } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import Hands from '@/assets/paperpackage/hands.png';
import styles from './index.less';

const { Panel } = Collapse;

interface ChannelVendorProps {
  dispatch?: (e: any) => void;
  match?: any;
  loading?: any;
  PACKAGE_OPERATION_TYPE?: ConnectState['dictionary']['PACKAGE_OPERATION_TYPE'];
  packageByChannelList?: ConnectState['resourcepackage']['packageByChannelList'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_OPERATION_TYPE = [] } = dictionary;
  const { packageByChannelList } = resourcepackage;
  return {
    PACKAGE_OPERATION_TYPE,
    packageByChannelList,
    loading: loading.effects['resourcepackage/packageByChannel'],
  };
})
class ChannelVendor extends Component<ChannelVendorProps> {
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
        type: 'resourcepackage/packageByChannel',
        payload: {
          paperPackageId: pid,
          serialNumber: snid,
          pageIndex: 1,
          pageSize: 0x7fffffff,
        },
      });
    }
  }

  render() {
    const { packageByChannelList = [], loading, PACKAGE_OPERATION_TYPE = [] } = this.props;

    // 自定义dot
    const dot = (
      <div className={styles.dotBox}>
        <div className={styles.dot} />
      </div>
    );

    return (
      <div className={styles.channelVendorContainer}>
        {loading && (
          <div className={styles.loadingBox}>
            <Spin spinning={loading} />
          </div>
        )}

        {!loading && packageByChannelList.length > 0 && (
          <div>
            {packageByChannelList.map((channel: any) => {
              const panelHeader = (
                <div className={styles.panelHeader}>
                  <span className={styles.name}>{channel.channelVendorName}</span>
                  {channel.isCurrent && (
                    <Tag>
                      {formatMessage({
                        id: 'operate.text.current.relation',
                        defaultMessage: '当前关联',
                      })}
                    </Tag>
                  )}
                </div>
              );
              return (
                <Collapse accordion expandIconPosition="right" key={channel.channelVendorId}>
                  <Panel header={panelHeader} key="1">
                    <Timeline>
                      {channel.packageHistories.map((history: any) => {
                        const operation = PACKAGE_OPERATION_TYPE.find(
                          tag => tag.code === history.actionType,
                        );

                        return (
                          <Timeline.Item dot={dot} key={history.id}>
                            <div className={styles.info}>
                              <span>
                                {moment(history.actionTime).format('YYYY-MM-DD HH:mm:ss')}
                              </span>
                              <Divider type="vertical" />
                              <span>
                                <span className={styles.tit}>
                                  {formatMessage({
                                    id: 'operate.title.channel.change',
                                    defaultMessage: '变动',
                                  })}
                                  ：
                                </span>
                                <span className={styles.statusCont}>
                                  {operation && operation.value}
                                </span>
                              </span>
                              <Divider type="vertical" />
                              <span>
                                <span className={styles.tit}>
                                  {formatMessage({
                                    id: 'operate.title.operator',
                                    defaultMessage: '操作人',
                                  })}
                                  ：
                                </span>
                                <span className={styles.statusCont}>{history.createByName}</span>
                              </span>
                            </div>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline>
                  </Panel>
                </Collapse>
              );
            })}
          </div>
        )}
        {!loading && packageByChannelList.length === 0 && (
          <div style={{ padding: '20vh 0px' }}>
            <Empty
              description={formatMessage({
                id: 'operate.text.noDistributors',
                defaultMessage: '暂无渠道商',
              })}
              image={Hands}
            />
          </div>
        )}
      </div>
    );
  }
}
export default ChannelVendor;

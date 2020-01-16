import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Collapse, Timeline, Divider, Tag, Spin, Empty } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { newTab } from '@/utils/instructions';
import { ConnectState } from '@/models/connect.d';
import NoneCampus from '@/assets/none_campus.png';

import styles from './index.less';

const { Panel } = Collapse;

interface UserProps {
  dispatch?: (e: any) => void;
  match?: any;
  loading?: any;
  PACKAGE_OPERATION_TYPE?: ConnectState['dictionary']['PACKAGE_OPERATION_TYPE'];
  packageByCampusList?: ConnectState['resourcepackage']['packageByCampusList'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_OPERATION_TYPE = [] } = dictionary;
  const { packageByCampusList } = resourcepackage;
  return {
    PACKAGE_OPERATION_TYPE,
    packageByCampusList,
    loading: loading.effects['resourcepackage/packageByCampus'],
  };
})
class User extends Component<UserProps> {
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
        type: 'resourcepackage/packageByCampus',
        payload: {
          paperPackageId: pid,
          serialNumber: snid,
          pageIndex: 1,
          pageSize: 0x7fffffff,
        },
      });
    }
  }

  // 跳转到用户详情
  goToUserDetail = (id: string) => {
    newTab(`/tenant/campus/manage/${id}/detail`);
  };

  render() {
    const { packageByCampusList = [], loading, PACKAGE_OPERATION_TYPE = [] } = this.props;
    // 自定义dot
    const dot = (
      <div className={styles.dotBox}>
        <div className={styles.dot} />
      </div>
    );

    return (
      <div className={styles.authUserContainer}>
        {loading && (
          <div className={styles.loadingBox}>
            <Spin spinning={loading} />
          </div>
        )}
        {!loading && packageByCampusList.length > 0 && (
          <div>
            {packageByCampusList.map((campus: any) => {
              const panelHeader = (
                <div className={styles.panelHeader}>
                  <span
                    className={styles.name}
                    onClick={() => this.goToUserDetail(campus.campusId)}
                  >
                    {campus.campusName}
                  </span>
                  {campus.isCurrent && (
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
                <Collapse accordion expandIconPosition="right" key={campus.campusId}>
                  <Panel header={panelHeader} key="1">
                    <Timeline>
                      {campus.packageHistories.map((history: any) => {
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
                              {/* 操作人 */}
                              {history.createdByName && (
                                <span>
                                  <Divider type="vertical" />
                                  <span>
                                    {formatMessage({
                                      id: 'operate.title.operator',
                                      defaultMessage: '操作人',
                                    })}
                                    ：
                                  </span>
                                  <span>{history.createdByName}</span>
                                </span>
                              )}
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

        {!loading && packageByCampusList.length === 0 && (
          <div style={{ padding: '20vh 0px' }}>
            <Empty
              description={formatMessage({
                id: 'operate.text.noTheEndUser',
                defaultMessage: '暂无最终用户',
              })}
              image={NoneCampus}
            />
          </div>
        )}
      </div>
    );
  }
}
export default User;

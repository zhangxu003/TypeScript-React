import React, { Component } from 'react';
import { connect } from 'dva';
import { Timeline, Divider, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import { newTab } from '@/utils/instructions';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

interface HistoryTrackProps {
  authHistory?: ConnectState['resourcepackage']['authHistory'];
  PACKAGE_OPERATION_TYPE?: ConnectState['dictionary']['PACKAGE_OPERATION_TYPE'];
}

@connect(({ dictionary, resourcepackage }: ConnectState) => {
  const { PACKAGE_OPERATION_TYPE = [] } = dictionary;
  const { authHistory } = resourcepackage;

  return {
    PACKAGE_OPERATION_TYPE,
    authHistory,
  };
})
class HistoryTrack extends Component<HistoryTrackProps> {
  state = {};

  componentDidMount() {}

  // 跳转到渠道商详情
  goToChannelVendorDetail = (id: string) => {
    newTab(`/tenant/channelvendor/manage/${id}/detail`);
  };

  // 跳转到用户详情
  goToUserDetail = (id: string) => {
    newTab(`/tenant/campus/manage/${id}/detail`);
  };

  render() {
    const { authHistory = [], PACKAGE_OPERATION_TYPE = [] } = this.props;

    // 自定义dot
    const dot = (
      <div className={styles.dotBox}>
        <div className={styles.dot} />
      </div>
    );

    return (
      <div className={styles.historyTrackContainer}>
        <Timeline>
          {authHistory.map((record: any) => {
            const history = PACKAGE_OPERATION_TYPE.find(tag => tag.code === record.actionType);
            return (
              <Timeline.Item dot={dot} key={record.id}>
                <p>{moment(record.actionTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                <div className={styles.info}>
                  {/* 状态 */}
                  <span>
                    <span className={styles.tit}>
                      {formatMessage({
                        id: 'operate.title.paper.auth.status',
                        defaultMessage: '状态',
                      })}
                      ：
                    </span>
                    <span className={styles.statusCont}>{history && history.value}</span>
                  </span>
                  <Divider type="vertical" />

                  {record.channelVendorName && (
                    <span>
                      <span>
                        <span className={styles.tit}>
                          {formatMessage({
                            id: 'operate.title.channel.business',
                            defaultMessage: '渠道商',
                          })}
                          ：
                        </span>
                        <Tooltip title={record.channelVendorName}>
                          <span
                            className={styles.userCont}
                            onClick={() => this.goToChannelVendorDetail(record.channelVendorId)}
                          >
                            {stringFormat(record.channelVendorName, 10)}
                          </span>
                        </Tooltip>
                      </span>
                      <Divider type="vertical" />
                    </span>
                  )}

                  {record.campusName && (
                    <span>
                      <span>
                        <span className={styles.tit}>
                          {formatMessage({
                            id: 'operate.title.end.user',
                            defaultMessage: '最终用户',
                          })}
                          ：
                        </span>
                        <Tooltip title={record.campusName}>
                          <span
                            className={styles.userCont}
                            onClick={() => this.goToUserDetail(record.campusId)}
                          >
                            {stringFormat(record.campusName, 10)}
                          </span>
                        </Tooltip>
                      </span>
                      <Divider type="vertical" />
                    </span>
                  )}

                  <span>
                    <span className={styles.tit}>
                      {formatMessage({ id: 'operate.text.note', defaultMessage: '备注' })}：
                    </span>
                    <span className={styles.statusCont}>--</span>
                  </span>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  }
}
export default HistoryTrack;

import React from 'react';
import { Timeline } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';
import IconFont from '@/components/IconFont';
import { newTab } from '@/utils/instructions';

interface HistoricalProps {
  detail?: any;
  data?: any;
  DONGLE_OPREATION_TYPE?: any;
  type: 'channelVendorName' | 'campusName';
}

interface HistoricalState {
  visible: boolean;
}

@connect(({ dictionary }: ConnectState) => {
  const { DONGLE_OPREATION_TYPE = [] } = dictionary;
  return {
    DONGLE_OPREATION_TYPE,
  };
})
class HistoryCard extends React.Component<HistoricalProps, HistoricalState> {
  state = {
    visible: true,
  };

  componentDidMount() {}

  changeVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  goToDeatil = (item: any, type: string) => {
    if (type === 'campusName') {
      newTab(`/tenant/campus/manage/${item.campusId}/detail`);
    } else {
      // window.open(`/tenant/channelvendor/manage/${item.channelVendorId}/detail`);
      newTab(`/tenant/channelvendor/manage/${item.channelVendorId}/detail`);
    }
  };

  render() {
    const { visible } = this.state;
    const { data, DONGLE_OPREATION_TYPE, type } = this.props;
    const { historyList = [] } = data;
    const Jsx = historyList.map((item: any) => {
      const obj = DONGLE_OPREATION_TYPE.find((temp: any) => temp.code === item.actionType) || {
        value: '',
      };
      return (
        <Timeline.Item key={item.id}>
          <div className={styles.historyItem}>
            <span className={styles.time}>
              {moment(item.actionTime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <div className={styles.lineItem}>|</div>
            <span className={styles.normal}>
              {formatMessage({ id: 'operate.text.change', defaultMessage: '变动' })}:
            </span>
            <span className={styles.time}>{obj.value}</span>
            <div className={styles.lineItem}>|</div>
            <span className={styles.normal}>
              {formatMessage({ id: 'operate.text.operationOf', defaultMessage: '操作人' })}:
            </span>
            <span className={styles.time}>{item.createByName}</span>
          </div>
        </Timeline.Item>
      );
    });
    return (
      <div className={styles.history}>
        <div className={styles.activateTheHistoryTitle}>
          <div>
            <span
              onClick={() => {
                this.goToDeatil(data, type);
              }}
            >
              {data[type]}
            </span>
            {data.isCurrent === 'Y' && <span className={styles.green_tag}>当前关联</span>}
          </div>
          {visible ? (
            <IconFont type="icon-link-arrow-up" onClick={this.changeVisible} />
          ) : (
            <IconFont type="icon-link-arrow-down" onClick={this.changeVisible} />
          )}
        </div>
        {visible && (
          <div className={styles.timeline}>
            <Timeline>{Jsx}</Timeline>
          </div>
        )}
      </div>
    );
  }
}
export default HistoryCard;

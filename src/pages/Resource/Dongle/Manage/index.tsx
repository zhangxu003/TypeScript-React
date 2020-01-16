// 加密狗详情页面

import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import styles from './index.less';

type Detail = ConnectState['dongle']['detail'];

interface DongleProps extends ConnectProps<{ id: string }> {
  loading: ConnectState['loading']['effects'];
  sn: Detail['sn'];
  dongleType: Detail['dongleType'];
}

@connect(({ dongle, loading }: ConnectState) => {
  const {
    detail, // 当期页数据
  } = dongle;
  const { sn, dongleType } = detail || {};
  return {
    sn,
    dongleType,
    loading: loading.effects['dongle/fetchDongleDetail'],
  };
})
class DongleManage extends React.PureComponent<DongleProps> {
  static defaultProps: DongleProps;

  componentDidMount() {
    const { dispatch, computedMatch } = this.props;
    if (computedMatch) {
      const { id } = computedMatch.params;
      if (dispatch) {
        dispatch({
          type: 'dongle/fetchDongleDetail',
          payload: {
            driveId: id,
          },
        });
      }
    }
  }

  // 组件销毁的时候，清除detail缓存
  componentWillUnmount() {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'dongle/updateState',
        payload: {
          // 清空详情
          detail: {},
          // 清空 激活历史
          history: { records: [] },
          // 清空 历史痕迹
          historyAll: { records: [] },
          // 清空 关联渠道商
          historyChannel: { records: [] },
          // 清空 关联最终用户
          historyCampus: { records: [] },
        },
      });
    }
  }

  // 根据id 获取详情
  childrenRender = () => {
    const { children, sn, dongleType, loading } = this.props;
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        // 弹框的title
        title: (
          <div className={styles.DongleManage}>
            <span>{formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}: </span>
            {sn ? (
              <>
                <div className={styles.text}>{sn}</div>
                {dongleType === 'MAIN_DONGLE' ? (
                  <div className={styles.right_tips}>
                    {formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })}
                  </div>
                ) : (
                  <div className={styles.v_tips}>
                    {formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
                  </div>
                )}
              </>
            ) : null}
          </div>
        ),
        // 请求详情的时候，弹框内容区域，loading
        loading,
      });
    }
    return children;
  };

  render() {
    return this.childrenRender();
  }
}

export default DongleManage;

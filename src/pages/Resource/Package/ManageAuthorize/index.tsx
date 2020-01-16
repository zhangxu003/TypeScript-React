// 试卷包授权记录详情页面

import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';

interface PackageAuthorizeManageProps {
  dispatch?: (e: any) => void;
  children: any;
  match?: any;
  loading?: any;
  authRecordDetail: ConnectState['resourcepackage']['packageDetail'];
  PACKAGE_AUTH_TYPE?: ConnectState['dictionary']['PACKAGE_AUTH_TYPE'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_AUTH_TYPE = [] } = dictionary;
  const { authRecordDetail } = resourcepackage;

  return {
    PACKAGE_AUTH_TYPE,
    authRecordDetail,
    loading: loading.effects['resourcepackage/authRecordDetail'],
  };
})
class PackageAuthorizeManage extends React.Component<PackageAuthorizeManageProps> {
  // 根据id 获取详情
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { pid, snid },
      },
    } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/authRecordDetail',
        payload: { paperPackageId: pid, serialNumber: snid },
      });
    }
  }

  // 组件销毁的时候，清除detail缓存
  componentWillUnmount() {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/updateState',
        payload: {
          authRecordDetail: {},
        },
      });
    }
  }

  childrenRender = () => {
    const { children, authRecordDetail = {}, PACKAGE_AUTH_TYPE = [], loading } = this.props;
    const authTypeObj = PACKAGE_AUTH_TYPE.find(tag => tag.code === authRecordDetail.authType);
    return React.cloneElement(children, {
      title: (
        <div className={styles.packageAuthorizeManage}>
          <span>{formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}: </span>
          <div className={styles.text}>{authRecordDetail && authRecordDetail.serialNumber}</div>
          {authTypeObj && <div className={styles.rightTips}>{authTypeObj.value}</div>}
        </div>
      ),
      loading,
    });
  };

  render() {
    return this.childrenRender();
  }
}

export default PackageAuthorizeManage;

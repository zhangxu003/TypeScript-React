// 试卷包详情页面

import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import classNames from 'classnames';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';

interface PackageListManageProps {
  dispatch?: (e: any) => void;
  children: any;
  match?: any;
  loading?: any;
  packageDetail: ConnectState['resourcepackage']['packageDetail'];
}

@connect(({ resourcepackage, loading }: ConnectState) => {
  const { packageDetail } = resourcepackage;

  return {
    packageDetail,
    loading: loading.effects['resourcepackage/packageDetail'],
  };
})
class PackageListManage extends React.Component<PackageListManageProps> {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/packageDetail',
        payload: { paperPackageId: id },
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
          packageDetail: {},
        },
      });
    }
  }

  // 根据id 获取详情
  childrenRender = () => {
    const { children, packageDetail = {}, loading } = this.props;
    return React.cloneElement(children, {
      title: (
        <div className={styles.packageManage}>
          <span>{formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}: </span>
          <div className={styles.text}>
            {packageDetail &&
            packageDetail.paperPackageName &&
            packageDetail.paperPackageName.length > 30
              ? `${packageDetail.paperPackageName.substring(0, 30)}...`
              : packageDetail.paperPackageName}
          </div>
          <div
            className={classNames(
              styles.rightTips,
              packageDetail && packageDetail.salesStatus === 'LAUNCHED'
                ? styles.launched
                : styles.unLaunched,
            )}
          >
            {packageDetail && packageDetail.salesStatus === 'LAUNCHED'
              ? formatMessage({ id: 'operate.text.package.on.shelves', defaultMessage: '已上架' })
              : formatMessage({ id: 'operate.text.package.off.shelves', defaultMessage: '未上架' })}
          </div>
        </div>
      ),
      loading,
    });
  };

  render() {
    return this.childrenRender();
  }
}

export default PackageListManage;

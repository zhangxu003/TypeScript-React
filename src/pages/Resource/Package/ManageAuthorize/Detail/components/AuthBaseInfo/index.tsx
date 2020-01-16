import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import { newTab } from '@/utils/instructions';
import styles from './index.less';

interface AuthBaseInfoProps {
  authRecordDetail?: ConnectState['resourcepackage']['authRecordDetail'];
}

@connect(({ resourcepackage, loading }: ConnectState) => {
  const { authRecordDetail } = resourcepackage;

  return {
    authRecordDetail,
    loading: loading.effects['resourcepackage/authRecordDetail'],
  };
})
class AuthBaseInfo extends Component<AuthBaseInfoProps> {
  state = {};

  componentDidMount() {}

  // 跳转到试卷包详情页面
  goToPackageDetail = () => {
    const { authRecordDetail = {} } = this.props;
    const { paperPackageId } = authRecordDetail;
    newTab(`/resource/package/manage/list/${paperPackageId}/detail`);
  };

  render() {
    const { authRecordDetail = {} } = this.props;
    return (
      <div className={styles.authBaseInfoContainer}>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({
                id: 'operate.title.paper.package.No',
                defaultMessage: '试卷包编号',
              })}
            </div>
            <div className={styles.cont}>{authRecordDetail && authRecordDetail.code}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({
                id: 'operate.title.paper.package.name',
                defaultMessage: '试卷包名称',
              })}
            </div>
            <div
              className={styles.cont}
              style={{ color: '#228EFF', cursor: 'pointer' }}
              onClick={this.goToPackageDetail}
            >
              {authRecordDetail && authRecordDetail.paperPackageName}
            </div>
          </div>
        </div>

        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.auth.time', defaultMessage: '授权时间' })}
            </div>
            {/* 当有distributeTime时显示distributeTime，没有显示bindTime */}
            <div className={styles.cont}>
              {authRecordDetail &&
                moment(
                  authRecordDetail.distributeTime && Number(authRecordDetail.distributeTime) > 0
                    ? authRecordDetail.distributeTime
                    : authRecordDetail.bindTime,
                ).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default AuthBaseInfo;

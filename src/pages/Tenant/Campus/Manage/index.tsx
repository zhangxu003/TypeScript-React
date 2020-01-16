// 校区详情页面

import React from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import InstallModal from '../Components/InstallModal';
import styles from './index.less';

interface CampusDetailProps extends ConnectProps<{ id: string }> {
  detail: any;
  InstallShow: boolean;
  loading?: boolean;
}
@connect(({ campus, loading }: ConnectState) => {
  const {
    detail, // 详情
    InstallShow,
  } = campus;
  return {
    detail,
    InstallShow,
    loading: loading.effects['campus/CampusDetailInfo'],
  };
})
class CampusManage extends React.Component<CampusDetailProps> {
  componentDidMount() {
    const { dispatch, computedMatch } = this.props;
    if (computedMatch) {
      const { id } = computedMatch.params;
      if (dispatch) {
        localStorage.removeItem('activeKey');
        dispatch({
          type: 'campus/CampusDetailInfo',
          payload: {
            campusId: id,
          },
        });
      }
    }
  }

  showInstall = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/initShow',
      });
    }
  };

  // 根据id 获取详情
  childrenRender = () => {
    const { children, detail, InstallShow, loading } = this.props;
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        title: (
          <div className={styles.CampusManage}>
            <span>{formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}: </span>
            <div className={styles.text}>{detail && detail.name}</div>
            {detail.initFlag !== 'P' && <Button onClick={this.showInstall}>安装初始化</Button>}
            {detail.initFlag === 'P' && (
              <IconFont type="icon-info-circle" onClick={this.showInstall} />
            )}
            {InstallShow && <InstallModal visible={InstallShow} />}
          </div>
        ),
        loading,
      });
    }
    return children;
  };

  render() {
    return this.childrenRender();
  }
}

export default CampusManage;

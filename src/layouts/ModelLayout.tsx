import React from 'react';
import { connect } from 'dva';
import { ConnectProps } from '@/models/connect';

@connect()
class ModelLayout extends React.Component<ConnectProps> {
  // 这块理解错误，应该是该组件被销毁的时候在去调用即，
  // 不需要在创建组件的时候去添加
  componentWillUnmount() {
    const { dispatch, computedMatch } = this.props;
    const { path } = computedMatch || {};

    if (!dispatch) return;

    // 进入每个大块的时候，默认还原该modal中的默认的state
    switch (path) {
      // 如果进入的是资源-加密狗页面
      case '/resource/dongle':
        dispatch({ type: 'dongle/resetState' });
        break;
      // 如果进入的是资源-试卷包页面
      case '/resource/package':
        dispatch({ type: 'resourcepackage/resetState' });
        break;
      // 如果进入的是租户-渠道商页面
      case '/tenant/channelvendor':
        dispatch({ type: 'channelvendor/resetState' });
        break;
      // 如果进入的是租户-校区页面
      case '/tenant/campus':
        dispatch({ type: 'campus/resetState' });
        // 租户-校区-关联试卷包model
        dispatch({ type: 'tenantpackage/resetState' });

        break;
      default:
        break;
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export default ModelLayout;

import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import { ConnectState, ConnectProps, UserModelState } from '@/models/connect';
import PageLoading from '@/components/PageLoading';

interface SecurityLayoutProps extends ConnectProps {
  loading: boolean;
  userId: UserModelState['userId'];
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  async componentDidMount() {
    this.init();
  }

  init = async () => {
    const { dispatch } = this.props;
    const userId = localStorage.getItem('userId');
    if (dispatch && userId) {
      // 根据userid，去请求用户信息,如果成功会调用 ready() 方法，如果失败，则阻塞接下来的流程。
      // 并且通过 requset 的异常处理，做相关操作，如 token过期，则跳转页面
      await dispatch({
        type: 'user/fetch',
        payload: userId,
      });
      this.ready();
    } else {
      this.ready();
    }
  };

  ready = () => {
    this.setState({
      isReady: true,
    });
  };

  render() {
    const { isReady } = this.state;
    const { children, loading, userId } = this.props;
    // 准备阶段
    if ((!userId && loading) || !isReady) {
      return <PageLoading />;
    }
    // 未登录状态
    if (!userId) {
      const queryString = stringify({ redirect: window.location.href });
      return <Redirect to={`/user/login?${queryString}`}></Redirect>;
    }
    return children;
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  userId: user.userId,
  loading: loading.effects['user/fetch'],
}))(SecurityLayout);

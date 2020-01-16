import React from 'react';
import { connect } from 'dva';
import LoginForm from './components/LoginForm';
import { ConnectState, ConnectProps } from '@/models/connect';
import { minimize, maximize, close } from '@/utils/instructions';
import Control from '@/components/GlobalHeader/Control';
import styles from './index.less';

interface LoginComponentPops extends ConnectProps {
  submitting: boolean;
}

interface LoginComponentState {
  serviceErr?: string;
  identityType?: string;
}

@connect(({ login, loading }: ConnectState) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginComponent extends React.Component<LoginComponentPops, LoginComponentState> {
  // 登录角色的类型
  identityType = 'ID_OPERATOR'; // 身份

  state = {
    serviceErr: '', // 服务端返回错误信息
  };

  handleSubmit = (values: any) => {
    const { dispatch } = this.props;
    const { username: name = '', password } = values;
    const username = name.trim();
    if (!username || !password) {
      this.setState({
        serviceErr: '',
      });
      return;
    }

    /* 根据账号位数判断是否是账号登录还是高耘号登录 */
    const type = username.length === 11 ? 'ROLE_ACCT' : 'VB_NO';

    const newValues = values;
    if (type === 'ROLE_ACCT') {
      // 账号登录
      newValues.mobile = newValues.username;
      delete newValues.username;
    }

    if (dispatch) {
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          authenticationType: type, // 高耘账号：VB_NO、手机号：ROLE_ACCT
          identityCode: this.identityType,
          client: 'pc',
        },
      }).catch((e: Error) => {
        this.setState({
          serviceErr: e.message,
        });
      });
    }
  };

  render() {
    const { submitting } = this.props;
    const { serviceErr } = this.state;

    return (
      <div className={styles['user-login']}>
        <Control
          className={styles.control}
          onMinimize={minimize}
          onMaximize={maximize}
          onClose={close}
        />
        <LoginForm
          serviceErr={serviceErr}
          loading={submitting}
          onHandleSubmit={this.handleSubmit}
          onClearServiceErr={() => {
            this.setState({
              serviceErr: '',
            });
          }}
        />
      </div>
    );
  }
}

export default LoginComponent;

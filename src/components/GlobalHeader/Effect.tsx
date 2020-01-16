import React from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps } from '@/models/connect';
import { IconButton } from '@/components/IconFont';
import StorageModal from './StorageModal';

// 获取国际化的方法
const getI10n = (): Object => ({
  scan: formatMessage({ id: 'operate.button.read.dongle', defaultMessage: '读狗' }),
  avatar: formatMessage({ id: 'operate.button.user.manage', defaultMessage: '用户管理' }),
  logout: formatMessage({ id: 'operate.button.logout', defaultMessage: '登出' }),
});

interface EffectProps extends ConnectProps {}

@connect()
class Effect extends React.Component<EffectProps> {
  i10n: any = {};

  state: any = {};

  constructor(props: any) {
    super(props);
    this.i10n = getI10n();
    this.state = { visible: false };
  }

  // 扫描
  scan = () => {
    // message.success(this.i10n.scan);
    this.setState({ visible: true });
  };

  // 用户头像
  avatar = () => {
    message.success(this.i10n.avatar);
  };

  // 登出
  logout = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <div style={{ display: 'inline-block' }}>
        <IconButton
          type="icon-scan1"
          title={this.i10n.scan}
          onClick={this.scan}
          style={{ fontSize: '18px' }}
        />
        <IconButton
          type="icon-user"
          title={this.i10n.avatar}
          onClick={this.avatar}
          style={{ fontSize: '18px' }}
        />
        <IconButton
          type="icon-logout"
          title={this.i10n.logout}
          onClick={this.logout}
          style={{ fontSize: '18px' }}
        />
        <StorageModal visible={this.state.visible} hideModal={this.hideModal} />
      </div>
    );
  }
}

export default Effect;

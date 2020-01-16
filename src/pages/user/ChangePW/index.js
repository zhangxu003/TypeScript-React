import React, { Component } from 'react';
import logo from '@/assets/login/logo.png';
import { minimize, maximize, close } from '@/utils/instructions';
import Control from '@/components/GlobalHeader/Control';
import ChangeBox from './ChangeBox/index';
import styles from './index.less';

class ChangePW extends Component {
  state = {
    type: 'teacher',
  };

  componentWillMount() {
    const { match } = this.props;
    const { params } = match;
    const { type } = params;
    this.setState({
      type,
    });
  }

  render() {
    const { type } = this.state;
    return (
      <div className={styles.resetPW}>
        <Control
          className={styles.control}
          onMinimize={minimize}
          onMaximize={maximize}
          onClose={close}
        />
        <div className={styles.logoBox}>
          <img src={logo} alt="logo" />
        </div>
        <div className={styles.right}>
          <ChangeBox type={type} />
        </div>
      </div>
    );
  }
}

export default ChangePW;

import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import { minimize, maximize, close } from '@/utils/instructions';
import Control from './Control';
import Effect from './Effect';
import styles from './index.less';

export default class GlobalHeaderRight extends PureComponent {
  // 最小化
  onMinimize = () => {
    minimize();
  };

  // 最大化
  onMaximize = () => {
    maximize();
  };

  // 关闭
  onClose = () => {
    close();
  };

  render() {
    return (
      <div className={styles.right}>
        <Effect />
        <Divider type="vertical" className={styles.vertical} />
        <Control onMinimize={this.onMinimize} onMaximize={this.onMaximize} onClose={this.onClose} />
      </div>
    );
  }
}

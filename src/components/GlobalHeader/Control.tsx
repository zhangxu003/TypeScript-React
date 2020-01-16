import React from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { IconButton } from '@/components/IconFont';
import styles from './index.less';
import { ConnectProps } from '@/models/connect';

interface ControlProps extends ConnectProps {
  className?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

// 获取国际化的方法
const getI10n = (): Object => ({
  minimize: formatMessage({ id: 'operate.minimize', defaultMessage: '最小化' }),
  maximize: formatMessage({ id: 'operate.maximize', defaultMessage: '最大化' }),
  close: formatMessage({ id: 'operate.close', defaultMessage: '关闭' }),
});

class Control extends React.Component<ControlProps> {
  i10n: any = {};

  constructor(props: any) {
    super(props);
    this.i10n = getI10n();
  }

  // 最小化
  minimize = () => {
    const { onMinimize } = this.props;
    if (onMinimize) {
      onMinimize();
    }
  };

  // 最大化
  maximize = () => {
    const { onMaximize } = this.props;
    if (onMaximize) {
      onMaximize();
    }
  };

  // 关闭
  close = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  };

  render() {
    const { className } = this.props;
    return (
      <div className={className} style={{ display: 'inline-block' }}>
        <IconButton
          type="icon-reduce"
          title={this.i10n.minimize}
          onClick={this.minimize}
          style={{ fontSize: '18px' }}
        />
        <IconButton
          type="icon-max"
          title={this.i10n.maximize}
          onClick={this.maximize}
          style={{ fontSize: '18px' }}
        />
        <IconButton
          type="icon-close"
          title={this.i10n.close}
          onClick={this.close}
          className={styles.close}
          style={{ fontSize: '18px' }}
        />
      </div>
    );
  }
}

export default Control;

/**
 * 改写 antd Select 方式
 * 添加一个额外 属性  shape, 可以设置显示是否弧形
 */
import React from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import cs from 'classnames';
import styles from './index.less';

interface SelfSelectProps extends SelectProps {
  // 模拟button的 shape 模式，
  // round,输入框 椭圆形样式
  // undefined 正常显示样式
  shape?: 'round';
}

class SelfSelect extends React.PureComponent<SelfSelectProps> {
  static Option: typeof Select.Option;

  static OptGroup: typeof Select.OptGroup;

  render() {
    const { className, shape, ...params } = this.props;
    const classNames = cs(
      styles.select,
      { [styles['select-round']]: shape === 'round' },
      className,
    );
    return <Select className={classNames} {...params} />;
  }
}

SelfSelect.Option = Select.Option;
SelfSelect.OptGroup = Select.OptGroup;

export default SelfSelect;

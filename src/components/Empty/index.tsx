/**
 * 改写 antd Empty 方式
 */
import React from 'react';
import { Empty } from 'antd';
import { EmptyProps } from 'antd/lib/empty';
import cs from 'classnames';
import styles from './index.less';

interface SelfEmptyProps extends EmptyProps {}

class SelfEmpty extends React.PureComponent<SelfEmptyProps> {
  render() {
    const { className, ...params } = this.props;
    const classNames = cs(styles.empty, className);
    return <Empty className={classNames} {...params} />;
  }
}

export default SelfEmpty;

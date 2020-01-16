import { Tooltip } from 'antd';
import React from 'react';
import cs from 'classnames';
import IconFont from './basic';
import styles from './index.less';

export interface IconButtonProps {
  type?: string;
  className?: string;
  style?: object;
  title?: string | undefined;
  onClick?: () => void;
}

const IconButton: React.SFC<IconButtonProps> = props => {
  const { type, title, onClick, style, className } = props;
  const classNames = cs(styles['icon-button'], className);
  const iconRender = (
    <IconFont className={classNames} type={type} onClick={onClick} style={style} />
  );

  if (title) {
    return <Tooltip title={title}>{iconRender}</Tooltip>;
  }
  return iconRender;
};

export default IconButton;

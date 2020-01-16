/**
 * 改写 antd Button 方式
 * 添加一个额外 属性  shape, 可以设置显示是否弧形
 * 改写 antdesign 的 Button 按钮，为了满足ui的基础按钮库，改写内容如下：
 * 1、shape 默认 设置为 "round", 圆弧形图标
 * 2、改写所有按钮的样式，包括 hover focus active 等；
 * 3、type 属性 添加两个新的参数，分别是 light: 高亮按钮， minor：次要操作按钮
 * 以上按钮样式，可查看蓝狐：
 * https://lanhuapp.com/web/#/item/project/board/detail?
 * pid=6a88fa27-75c0-4035-88b7-d908280c5918&
 * project_id=6a88fa27-75c0-4035-88b7-d908280c5918&
 * image_id=853840b9-bff3-49f5-bbea-695755483769
 *
 * @example：
 *
 * 1、如果还是引用ant 的 button， 如果需要使用新的类型，如light
 * // type 中本身不包含 light, 故需要强制解释为 ButtonType
 * import { Button } from 'antd';
 * import { ButtonType } from 'antd/lib/button';
 * <Button shape="round" type={'light' as ButtonType} />
 *
 * 2、如果是引用此插件，则：
 * import Button from '@/components/Button';
 * <Button type='light' />
 *
 * 3、按钮类型
 * // 主要操作,有背景
 * <Button type='primary' />
 *
 * // 主要操作，无背景
 * <Button type='default' />
 *
 * // 次要操作
 * <Button type='minor' />
 *
 * // 不可操作
 * <Button disabled />
 *
 * // 高亮操作
 * <Button type="light" />
 *
 * // 警告操作
 * <Button type="danger" />
 */
import React from 'react';
import { Button } from 'antd';
import { ButtonProps, ButtonType } from 'antd/lib/button';
import cs from 'classnames';
import styles from './index.less';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

type SelfSelectProps = Overwrite<ButtonProps, { type?: ButtonType | 'light' | 'minor' }>;

class SelfButton extends React.PureComponent<SelfSelectProps> {
  static Group = Button.Group;

  render() {
    const { className, type, ...params } = this.props;
    const classNames = cs(styles.button, className);
    return <Button className={classNames} shape="round" {...params} type={type as ButtonType} />;
  }
}

export default SelfButton;

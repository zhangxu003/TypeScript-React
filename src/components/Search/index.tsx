/**
 * 改写 antd Input.Search 方式
 * 添加一个额外 属性  shape, 可以设置显示是否弧形
 */
import React from 'react';
import { Input } from 'antd';
import Search, { SearchProps } from 'antd/lib/input/Search';
import cs from 'classnames';
import IconFont from '@/components/IconFont';
import styles from './index.less';

interface SelfSearchProps extends SearchProps {
  // 模拟button的 shape 模式，
  // circle， 只显示圆形搜索按钮点击弹出 输入框( 占位，未开发 )
  // round,输入框 椭圆形样式
  // undefined 正常显示样式
  shape?: 'circle' | 'round' | 'normal';
}

export default class SearchBar extends React.PureComponent<SelfSearchProps> {
  searchRef = React.createRef<Search>();

  state = {
    active: false,
  };

  // 样式框非选中状态
  onBlur = (e: any) => {
    const { onBlur } = this.props;
    this.setState({ active: false }, () => {
      if (onBlur) {
        onBlur(e);
      }
    });
  };

  // 样式框选中事件
  onFocus = (e: any) => {
    const { onFocus } = this.props;
    this.setState({ active: true }, () => {
      if (onFocus) {
        onFocus(e);
      }
    });
  };

  // 选中数据，为了防止同时反复的调用同一个参数，频繁请求
  onSearch = (e: any) => {
    if (this.searchRef.current) {
      const { input } = this.searchRef.current as any;
      setTimeout(() => {
        input.blur();
      }, 0);
    }

    const { onSearch } = this.props;

    if (onSearch) {
      onSearch(e);
    }
  };

  render() {
    const {
      shape = 'round',
      className,
      enterButton,
      onFocus,
      onBlur,
      onSearch,
      ...params
    } = this.props;
    const { active } = this.state;
    const classNames = cs(
      styles.search,
      shape && { circle: styles['search-circle'], round: styles['search-round'] }[shape],
      className,
      { [styles['search-active']]: active },
    );

    const enterButtonRender = enterButton || (
      <IconFont className={styles['search-icon']} type="icon-serach" />
    );

    return (
      <Input.Search
        ref={this.searchRef}
        allowClear
        className={classNames}
        enterButton={enterButtonRender}
        {...params}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onSearch={this.onSearch}
      />
    );
  }
}

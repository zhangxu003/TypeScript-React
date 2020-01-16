import React from 'react';
import IconFont from '@/components/IconFont';

interface SearchBarPops {
  width?: number | string;
  height?: string;
  placeholder?: string;
  onSearch?: (e: string) => void;
  maxLength?: number | undefined;
}

interface SearchBarState {
  value: string;
  showClear: boolean;
}
/**
 * 搜索
 * onSearch 搜索callback
 * @author tina.zhang
 */
export default class SearchBar extends React.Component<SearchBarPops, SearchBarState> {
  searchRef = React.createRef<HTMLInputElement>();

  state = {
    value: '',
    showClear: false,
  };

  search = () => {
    const { onSearch } = this.props;
    const { value } = this.state;
    if (onSearch) {
      onSearch(value);
    }
  };

  clearText = () => {
    this.setState({
      showClear: false,
      value: '',
    });
  };

  onChange = (e: any) => {
    if (e.target.value) {
      this.setState({
        showClear: true,
        value: e.target.value,
      });
    } else {
      this.setState({
        showClear: false,
        value: e.target.value,
      });
    }
  };

  render() {
    const { width, height, placeholder, maxLength } = this.props;
    const { value, showClear } = this.state;
    return (
      <div className="custom-searchbar">
        <div className="ant-input-search Search ant-input-affix-wrapper" style={{ width, height }}>
          <input
            value={value}
            placeholder={placeholder}
            maxLength={maxLength || 100}
            onChange={this.onChange}
            // onBlur={this.search}
            className="ant-input"
            type="text"
            ref={this.searchRef}
          />
          {showClear ? (
            <i className="iconfont icon-error clear" onClick={this.clearText}></i>
          ) : null}

          <div className="ant-input-suffix left-icon" onClick={this.search}>
            <IconFont type="icon-serach" className="ant-input-search-icon" />
          </div>
        </div>
      </div>
    );
  }
}

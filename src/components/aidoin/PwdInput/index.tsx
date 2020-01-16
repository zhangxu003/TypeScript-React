import React from 'react';
import { Input } from 'antd';

interface PwdInputPops {
  value?: string;
  onChange?: (e: string) => void;
  type?: string;
  prefix: any;
  maxLength: any;
  placeholder: string;
}

class PwdInput extends React.Component<PwdInputPops> {
  inputDom = React.createRef<Input>();

  componentDidUpdate(preProps: any) {
    const { value } = this.props;
    if ((!preProps.value && value) || (preProps.value && !value)) {
      // 解决在微软自带输入发下，第一次输入一个数字，会添加两次的问题
      setTimeout(() => {
        if (this.inputDom.current) {
          this.inputDom.current.focus();
          // 光标位置，移动到后面 fixed bug 8114
          this.inputDom.current.input.selectionStart = String(value).length;
        }
      }, 0);
    }
  }

  onChange = (e: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e);
    }

    // 防止切换 输入框类型的时候，输入的第一个值输入两次
    if (e.target.value.length === 1) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  render() {
    const { type = 'password', prefix, placeholder, maxLength, ...params } = this.props;
    const { value = '' } = params;
    return value.length === 0 ? (
      <Input
        autoComplete="off"
        // disableautocomplete="disableautocomplete"
        key="text"
        type="text"
        {...params}
        prefix={prefix}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={this.onChange}
        ref={this.inputDom}
      />
    ) : (
      <Input
        autoComplete="new-password"
        // disableautocomplete="disableautocomplete"
        key="password"
        ref={this.inputDom}
        type={type}
        prefix={prefix}
        maxLength={maxLength}
        {...params}
        onChange={this.onChange}
      />
    );
  }
}

export default PwdInput;

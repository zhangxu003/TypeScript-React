import React, { Component } from 'react';
import { connect } from 'dva';
import { Cascader } from 'antd';
import { ConnectState, ConnectProps } from '@/models/connect';
import styles from './index.less';

export interface RegionSelectProps extends ConnectProps {
  width?: number | string;
  shape?: 'default' | 'normal';
  defaultValue?: string[];
  disableValue?: string[];
  value?: string[];
  isQuery?: boolean; // 是否是查询条件
  onChange: (value: string[]) => void;
  ADMINISTRATIVE_DIVISION?: ConnectState['dictionary']['ADMINISTRATIVE_DIVISION'];
}

/**
 * 地区选择组件
 *
 * @author kobe
 * @date 2019-10-22
 * @export
 * @class RegionSelect
 * @extends {Component<RegionSelectProps>}
 */
@connect(({ dictionary }: ConnectState) => {
  const { ADMINISTRATIVE_DIVISION = [] } = dictionary;
  return {
    ADMINISTRATIVE_DIVISION,
  };
})
export default class RegionSelect extends Component<RegionSelectProps> {
  // static defaultProps = {
  //   width: 100,
  //   onChange: () => { },
  // };

  componentDidMount() {}

  handleRegionChange = (value: string[]) => {
    const { onChange } = this.props;
    onChange(value);
  };

  render() {
    const {
      shape = 'default',
      width = 100,
      ADMINISTRATIVE_DIVISION = [],
      defaultValue,
      disableValue,
      value,
      isQuery = false,
    } = this.props;

    const treeData: any[] = [];
    ADMINISTRATIVE_DIVISION.forEach(item1 => {
      if (!item1.parentCode || item1.parentCode == null) {
        // 第一级
        const obj1 = {
          label: item1.value,
          value: item1.code,
          disabled: disableValue ? disableValue.includes(item1.code) : false,
        };
        treeData.push(obj1);

        ADMINISTRATIVE_DIVISION.forEach(item2 => {
          if (item2.parentCode === item1.code) {
            // 第二级
            const obj2 = {
              label: item2.value,
              value: item2.code,
              disabled: disableValue ? disableValue.includes(item1.code) : false,
            };

            treeData.forEach(item => {
              if (item.value === item2.parentCode) {
                item.children = item.children || [];
                item.children.push(obj2);
              }
            });
          } else {
            // 三级
            const obj3 = {
              label: item2.value,
              value: item2.code,
              disabled: disableValue ? disableValue.includes(item1.code) : false,
            };
            treeData.forEach(item => {
              if (item.value === item1.code) {
                if (item.children) {
                  item.children.forEach((subItem: any) => {
                    if (subItem.value === item2.parentCode) {
                      subItem.children = subItem.children || [];
                      subItem.children.push(obj3);
                    }
                  });
                }
              }
            });
          }
        });
      }
    });

    if (isQuery) {
      treeData.unshift({
        label: '不限',
        value: 'all',
      });
    }
    // 为了默认选中不限 value为[]时默认选中不限，如果为空的，后端会报错
    let selectValue: any;
    if (value && value.length === 0) {
      selectValue = ['all'];
    } else {
      selectValue = value;
    }

    return (
      <span className={styles.regionSelectContainer} id="regionDom">
        <Cascader
          className={shape === 'default' ? styles.round : null}
          defaultValue={defaultValue}
          value={selectValue}
          options={treeData}
          changeOnSelect
          onChange={this.handleRegionChange}
          placeholder="请选择地区"
          style={{ width }}
          allowClear={false}
          getPopupContainer={() => document.getElementById('regionDom') as HTMLElement}
        />
      </span>
    );
  }
}

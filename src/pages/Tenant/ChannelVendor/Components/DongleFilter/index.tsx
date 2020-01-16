import React, { useCallback, useState, useEffect } from 'react';
import { Button } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Search from '@/components/Search';
import Select from '@/components/Select';
import styles from './index.less';
import { CodeType } from '@/models/dictionary';

const { Option } = Select;

/**
 * Props 类型定义
 */
export interface IDongleFilterProps {
  dongleTypeDictionary: Array<CodeType>;
  dongleStatusDictionary: Array<CodeType>;
  onSearch: (params: IDongleFilterState) => void;
  onDistributeDongleClick: () => void;
}

/**
 * state 类型定义
 */
export interface IDongleFilterState {
  isDidMount: boolean; // 首次加载，不执行回调
  filterWord: string;
  dongleStatus: string;
  dongleType: string;
}

/**
 * 加密狗查询条件
 */
const DongleFilter: React.FC<IDongleFilterProps> = props => {
  const { dongleTypeDictionary, dongleStatusDictionary, onSearch, onDistributeDongleClick } = props;

  const [state, setState] = useState<IDongleFilterState>({
    isDidMount: true,
    filterWord: '',
    dongleStatus: '',
    dongleType: '',
  });

  // 统一搜索回调
  useEffect(() => {
    if (state.isDidMount) {
      return;
    }

    if (onSearch && typeof onSearch === 'function') {
      const { isDidMount, ...params } = state;
      onSearch(params as IDongleFilterState);
    }
  }, [state]);

  // 搜索回调
  const handleSearch = useCallback(
    (val: string) => {
      setState({ ...state, isDidMount: false, filterWord: val });
    },
    [state],
  );

  // 类型下拉框回调
  const handleDongleTypeChanged = useCallback(
    val => {
      setState({ ...state, isDidMount: false, dongleType: val });
    },
    [state],
  );

  // 状态下拉框回调
  const handleDongleStatusChanged = useCallback(
    val => {
      setState({ ...state, isDidMount: false, dongleStatus: val });
    },
    [state],
  );

  // 分配加密狗
  const handleDistributeDongleClick = useCallback(() => {
    if (onDistributeDongleClick && typeof onDistributeDongleClick === 'function') {
      onDistributeDongleClick();
    }
  }, [onDistributeDongleClick]);
  const winWidth = document.body.clientWidth || document.documentElement.clientWidth;
  console.log(winWidth);
  return (
    <div
      className={styles.dongleFilter}
      style={winWidth < 1280 ? { display: 'block', lineHeight: 3 } : {}}
    >
      <div>
        <div className={styles.searchContainer}>
          <Search
            placeholder={formatMessage({
              id: 'operate.placeholder.donglefilter.sn',
              defaultMessage: '请输入SN搜索',
            })}
            maxLength={30}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <div id="dongleFilterContainer" className={styles.rightContainer}>
        {formatMessage({ id: 'operate.text.donglefilter.type', defaultMessage: '类型' })}
        <Select
          className={styles.selector}
          shape="round"
          onChange={handleDongleTypeChanged}
          defaultValue=""
          dropdownMatchSelectWidth={false}
          getPopupContainer={() => document.getElementById('dongleFilterContainer') as HTMLElement}
        >
          <Option key="all" value="">
            {formatMessage({ id: 'operate.text.donglefilter.all', defaultMessage: '不限' })}
          </Option>
          {dongleTypeDictionary.map(t => (
            <Option key={t.code} value={t.code}>
              {t.value}
            </Option>
          ))}
        </Select>
        {formatMessage({ id: 'operate.text.donglefilter.status', defaultMessage: '状态' })}
        <Select
          className={styles.selector}
          shape="round"
          onChange={handleDongleStatusChanged}
          defaultValue=""
          dropdownMatchSelectWidth={false}
          getPopupContainer={() => document.getElementById('dongleFilterContainer') as HTMLElement}
        >
          <Option key="all" value="">
            {formatMessage({ id: 'operate.text.donglefilter.all', defaultMessage: '不限' })}
          </Option>
          {dongleStatusDictionary.map(t => (
            <Option key={t.code} value={t.code}>
              {t.value}
            </Option>
          ))}
        </Select>
        <Button shape="round" type="primary" onClick={handleDistributeDongleClick}>
          {formatMessage({
            id: 'operate.button.donglefilter.distributedongle',
            defaultMessage: '分配加密狗',
          })}
        </Button>
      </div>
    </div>
  );
};

export default DongleFilter;

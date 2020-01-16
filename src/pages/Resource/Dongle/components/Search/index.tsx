import React from 'react';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import Search from '@/components/Search';
import Select from '@/components/Select';
import Button from '@/components/Button';
import StorageModal from './StorageModal';
import styles from './index.less';

const { Option } = Select;

interface fetchListParams {
  dongleType?: string;
  dongleStatus?: string;
  filterWord?: string;
}

interface SearchTopProps extends ConnectProps {
  DONGLE_TYPE: ConnectState['dictionary']['DONGLE_TYPE'];
  DONGLE_STATUS: ConnectState['dictionary']['DONGLE_STATUS'];
  dongleType?: string;
  dongleStatus?: string;
  filterWord?: string;
}

interface SearchTopState {
  showDongleType?: string;
  visible: boolean;
}

@connect(({ dongle, loading, dictionary }: ConnectState) => {
  const { DONGLE_TYPE, DONGLE_STATUS } = dictionary;
  const { dongleType, dongleStatus, filterWord } = dongle.pageData;
  return {
    DONGLE_TYPE,
    DONGLE_STATUS,
    dongleType,
    dongleStatus,
    filterWord,
    loading: loading.effects['dongle/fetchDongle'],
  };
})
export default class SearchTop extends React.Component<SearchTopProps, SearchTopState> {
  static defaultProps: SearchTopProps;

  state = {
    visible: false,
    showDongleType: '',
  };

  // 请求加密狗列表
  // 过滤条件变更时，一般都是显示第一页
  fetchList = (params: fetchListParams): void => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'dongle/fetchDongle',
        payload: { ...params, pageIndex: 1 },
      });
    }
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-09-21
   * @copyright 搜索 筛选数据
   * @param     {[type]}    value [description]
   * @return    {[type]}          [description]
   */
  searchData = (value: string) => {
    this.fetchList({ filterWord: value.trim() });
  };

  // 过滤加密狗类型
  onTypeClick = (dongleType: any) => {
    this.fetchList({ dongleType });
  };

  // 过滤加密狗状态
  onStatusClick = (dongleStatus: any) => {
    this.fetchList({ dongleStatus });
  };

  matchValue = (key: any, data: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    return text;
  };

  showModal = (type: string) => {
    this.setState({
      visible: true,
      showDongleType: type,
    });
  };

  hideModal = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'dongle/updateDongleDetail',
        payload: {
          dongleArr: [],
        },
      });
    }
    this.setState({
      visible: false,
    });
  };

  render() {
    const { DONGLE_TYPE, DONGLE_STATUS, dongleType, dongleStatus, filterWord } = this.props;
    const { visible, showDongleType } = this.state;

    return (
      <div className={styles.questionTop}>
        <div className="flex" style={{ flexWrap: 'wrap', lineHeight: 4 }}>
          <Search
            style={{ width: 200 }}
            maxLength={30}
            shape="round"
            placeholder="请输入SN搜索"
            defaultValue={filterWord}
            onSearch={this.searchData}
          />
          <span className="content_quetion_top paddingRight">类型</span>

          <Select
            value={dongleType || ''}
            onSelect={this.onTypeClick}
            shape="round"
            getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
            style={{ width: '100px' }}
          >
            <Option value="">不限</Option>
            {DONGLE_TYPE.map(item => (
              <Option key={item.id} value={item.code}>
                {item.value}
              </Option>
            ))}
          </Select>

          <span className="content_quetion_top paddingRight">状态</span>

          <Select
            value={dongleStatus || ''}
            onSelect={this.onStatusClick}
            shape="round"
            getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
            style={{ width: '100px' }}
          >
            <Option value="">不限</Option>
            {DONGLE_STATUS.map(item => (
              <Option key={item.id} value={item.code}>
                {item.value}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            onClick={() => {
              this.showModal('MAIN_DONGLE');
            }}
            style={{ marginLeft: '8px' }}
          >
            主狗入库
          </Button>

          <Button
            type="primary"
            onClick={() => {
              this.showModal('VICE_DONGLE');
            }}
            style={{ marginLeft: '8px' }}
          >
            副狗入库
          </Button>
          <StorageModal
            visible={visible}
            hideModal={this.hideModal}
            type={showDongleType}
            onReload={() => {
              this.fetchList({});
            }}
          />
        </div>
      </div>
    );
  }
}

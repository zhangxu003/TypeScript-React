import React, { Component } from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import { Dispatch, AnyAction } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect.d';
import Search from '@/components/Search';
import RegionSelect from '@/components/RegionSelect';
import AddCampusModal from '../Components/AddCampusModal';
import styles from './index.less';

interface CampusProps {
  dispatch?: Dispatch<AnyAction>;
  TENANT_AUTHORIZE_MODE?: ConnectState['dictionary']['TENANT_AUTHORIZE_MODE'];
  DONGLE_CUSTOMER_TYPE?: ConnectState['dictionary']['DONGLE_CUSTOMER_TYPE'];
  areaCode?: any;
  accreditType?: any;
  customerType?: any;
  subAccreditType?: any;
  filterWord?: any;
}

@connect(({ campus, dictionary, loading }: ConnectState) => {
  const { TENANT_AUTHORIZE_MODE = [], DONGLE_CUSTOMER_TYPE = [] } = dictionary;
  const {
    pageData: { areaCode, accreditType, customerType, filterWord, subAccreditType }, // 当期数据
  } = campus;
  return {
    TENANT_AUTHORIZE_MODE, // 授权方式
    DONGLE_CUSTOMER_TYPE, // 客户类型
    areaCode,
    accreditType,
    customerType,
    subAccreditType,
    filterWord,
    loading: loading.effects['campus/fetchCampus'],
  };
})
export default class SearchTop extends Component<CampusProps> {
  state = {
    valueInput: '',
    visible: false,
    areaCode: [],
    authType: [
      {
        code: 'All',
        value: formatMessage({ id: 'operate.text.donglefilter.all', defaultMessage: '不限' }),
        type: 'All',
      },
      {
        code: 'RETAIL',
        value: formatMessage({
          id: 'operate.message.roomTheStandardVersion',
          defaultMessage: '机房-标准版',
        }),
        type: 'STANDARD',
      },
      {
        code: 'RETAIL',
        value: formatMessage({
          id: 'operate.message.roomProfessionalEdition',
          defaultMessage: '机房-专业版',
        }),
        type: 'PROFESSIONAL',
      },
      {
        code: 'VOL',
        value: formatMessage({ id: 'operate.title.campusEdition', defaultMessage: '校区版' }),
        type: 'NONE',
      },
    ],
  };

  componentDidMount() {}

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-29
   * @copyright 搜索 筛选数据
   * @param     {[type]}    value [description]
   * @return    {[type]}          [description]
   */
  searchData = (
    value: string,
    areaCode = '',
    customerType = '',
    accreditType = '',
    subAccreditType = '',
  ) => {
    console.log(accreditType, subAccreditType, value.trim());
    const { dispatch } = this.props;
    const params = {
      areaCode,
      customerType,
      accreditType,
      subAccreditType,
      filterWord: value.trim(),
      pageIndex: 1,
    };

    if (dispatch) {
      // if (!value) {
      //   delete params.filterWord;
      // }
      if (!areaCode) {
        delete params.areaCode;
      }
      if (!customerType) {
        delete params.customerType;
      }
      if (!accreditType) {
        delete params.accreditType;
        delete params.subAccreditType;
      }
      dispatch({
        type: 'campus/fetchCampus',
        payload: params,
      });
    }
  };

  // 地区选择
  handleRegionChange = (value: string[]) => {
    this.setState({
      areaCode: value,
    });
    const { valueInput } = this.state;
    this.searchData(valueInput, value[value.length - 1]);
  };

  // 确定创建
  hideModal = () => {
    console.log('1');
  };

  // 创建校区
  addCampus = () => {
    this.setState({
      visible: true,
    });
  };

  saveAddModal = () => {
    this.setState({
      visible: false,
    });
  };

  matchValue = (key: any, data: any) => {
    let text = '';
    const { subAccreditType } = this.props;
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    if (key === 'RETAIL' && subAccreditType === 'STANDARD') {
      text = formatMessage({
        id: 'operate.message.roomTheStandardVersion',
        defaultMessage: '机房-标准版',
      });
    }
    if (key === 'RETAIL' && subAccreditType === 'PROFESSIONAL') {
      text = formatMessage({
        id: 'operate.message.roomProfessionalEdition',
        defaultMessage: '机房-专业版',
      });
    }
    return text;
  };

  // 保存授权方式
  saveAuthMode = (e: any) => {
    const { authType, valueInput } = this.state;
    const current = authType.find(vo => vo.type === e.key) || { code: '' };
    this.searchData(valueInput, '', '', current.code, e.key);
  };

  // 保存客户类型
  saveCutomType = (e: any) => {
    const { valueInput } = this.state;
    this.searchData(valueInput, '', e.key);
  };

  render() {
    const { visible, areaCode, authType } = this.state;
    const {
      TENANT_AUTHORIZE_MODE,
      DONGLE_CUSTOMER_TYPE,

      accreditType,
      customerType,
    } = this.props;
    const customType = (
      <Menu onClick={this.saveCutomType}>
        <Menu.Item key="All">不限</Menu.Item>
        {DONGLE_CUSTOMER_TYPE
          ? DONGLE_CUSTOMER_TYPE.map((vo: any) => <Menu.Item key={vo.code}>{vo.value}</Menu.Item>)
          : ''}
      </Menu>
    );
    const grantAuth = (
      <Menu onClick={this.saveAuthMode}>
        {authType ? authType.map((vo: any) => <Menu.Item key={vo.type}>{vo.value}</Menu.Item>) : ''}
      </Menu>
    );

    return (
      <div className={styles.questionTop}>
        <div className="flex" style={{ flexWrap: 'wrap', lineHeight: 4 }}>
          <Search
            width={300}
            maxLength={30}
            placeholder="请输入校区名称"
            onSearch={(value: string) => {
              this.state.valueInput = value;
              this.searchData(value);
            }}
          />
          <span className="content_quetion_top paddingRight">地区</span>
          <RegionSelect
            onChange={this.handleRegionChange}
            width={100}
            isQuery
            defaultValue={areaCode}
            value={areaCode}
          />
          <span className="content_quetion_top paddingRight">客户类型</span>
          <Dropdown overlay={customType}>
            <div className="Dropdown">
              {this.matchValue(customerType, DONGLE_CUSTOMER_TYPE) || '不限'}
              <Icon type="down" />
            </div>
          </Dropdown>
          <span className="content_quetion_top paddingRight">授权方式</span>
          <Dropdown overlay={grantAuth}>
            <div className="Dropdown">
              {this.matchValue(accreditType, TENANT_AUTHORIZE_MODE) || '不限'} <Icon type="down" />
            </div>
          </Dropdown>
          <div className="option-btn marginRight" onClick={this.addCampus}>
            创建校区
          </div>
        </div>
        {visible && <AddCampusModal visible={visible} saveModal={this.saveAddModal} />}
      </div>
    );
  }
}

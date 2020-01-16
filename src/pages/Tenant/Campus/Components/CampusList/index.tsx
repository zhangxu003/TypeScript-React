import React, { Component } from 'react';
import { Table, Tooltip } from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import { newTab } from '@/utils/instructions';
import { IconButton } from '@/components/IconFont';
import InstallModal from '../InstallModal';
import event from '@/utils/event';
import styles from './index.less';

interface CampusProps {
  dispatch?: Dispatch<AnyAction>;
  loading?: ConnectState['loading']['effects'];
  records?: ConnectState['campus']['pageData']['records'];
  ADMINISTRATIVE_DIVISION?: ConnectState['dictionary']['ADMINISTRATIVE_DIVISION'];
  TENANT_AUTHORIZE_MODE?: ConnectState['dictionary']['TENANT_AUTHORIZE_MODE'];
  DONGLE_CUSTOMER_TYPE?: ConnectState['dictionary']['DONGLE_CUSTOMER_TYPE'];
  dataCount?: ConnectState['campus']['pageData']['dataCount'];
  pageIndex?: ConnectState['campus']['pageData']['pageIndex'];
  InstallShow: boolean;
  filterWord?: ConnectState['campus']['pageData']['filterWord'];
}

@connect(({ campus, loading, dictionary }: ConnectState) => {
  const {
    pageData: { records = [], dataCount, pageIndex, filterWord },
    InstallShow, // 当期页数据
  } = campus;
  const {
    ADMINISTRATIVE_DIVISION = [],
    TENANT_AUTHORIZE_MODE = [],
    DONGLE_CUSTOMER_TYPE = [],
  } = dictionary;
  return {
    records,
    InstallShow,
    dataCount,
    pageIndex,
    filterWord,
    ADMINISTRATIVE_DIVISION,
    DONGLE_CUSTOMER_TYPE,
    TENANT_AUTHORIZE_MODE,
    loading: loading.effects['campus/fetchCampus'],
  };
})
class CampusList extends Component<CampusProps> {
  state = {
    columns: [
      {
        title: formatMessage({ id: 'operate.message.campus', defaultMessage: '校区' }),
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => (
          <div className={styles.campusNameLen}>
            <Tooltip title={name}>{name}</Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.message.region', defaultMessage: '地区' }),
        dataIndex: 'areaCode',
        key: 'areaCode',
        render: (areaCode: string) => (
          <div className={styles.campusNameLen}>
            <Tooltip title={areaCode}>{areaCode}</Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.title.authorization.mode',
          defaultMessage: '授权方式',
        }),
        dataIndex: 'tenantAuthorizeMode',
        key: 'tenantAuthorizeMode',
        render: (tenantAuthorizeMode: string) => <div>{tenantAuthorizeMode || '无'}</div>,
      },
      {
        title: formatMessage({ id: 'operate.message.theCustomerType', defaultMessage: '客户类型' }),
        dataIndex: 'customerType',
        key: 'customerType',
        render: (customerType: string) => <div>{customerType || '无'}</div>,
      },
      {
        title: formatMessage({ id: 'operate.message.serviceMaturity', defaultMessage: '服务到期' }),
        dataIndex: 'expired',
        key: 'expired',
        render: (expired: string) => <div>{expired ? this.translateDate(expired) : ''}</div>,
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => (
          <IconButton
            title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
            type="icon-file"
            onClick={() => this.goToDeatil(id)}
          />
        ),
      },
    ],
  };

  componentDidMount() {
    this.fetchList(1);
  }

  // 转换日期
  translateDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = `${date.getFullYear()}-`;
    const M = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}-` : `${date.getMonth() + 1}-`;
    const D = `${date.getDate()} `;
    return Y + M + D;
  };

  goToDeatil = (id: any) => {
    newTab(`/tenant/campus/manage/${id}`);
  };

  // 请求列表
  fetchList = (current: any) => {
    const { dispatch, filterWord } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/fetchCampus',
        payload: {
          pageIndex: current,
          pageSize: 20,
          areaCode: '',
          filterWord,
        },
      });
    }
  };

  matchValue = (key: any, data: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.addressDetails;
      }
    });
    return text;
  };

  matchValueType = (key: any, data: any, type: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    if (key === 'RETAIL' && type === 'STANDARD') {
      text = formatMessage({
        id: 'operate.message.roomTheStandardVersion',
        defaultMessage: '机房-标准版',
      });
    }
    if (key === 'RETAIL' && type === 'PROFESSIONAL') {
      text = formatMessage({
        id: 'operate.message.roomProfessionalEdition',
        defaultMessage: '机房-专业版',
      });
    }
    return text;
  };

  // 分页
  changePage = (page: any) => {
    this.fetchList(page.current);
    // 切换页码时回到顶部
    event.emit('srollPageWarp');
  };

  render() {
    const { columns } = this.state;
    const {
      ADMINISTRATIVE_DIVISION,
      records,
      InstallShow,
      TENANT_AUTHORIZE_MODE,
      DONGLE_CUSTOMER_TYPE,
      dataCount,
      loading,
      pageIndex,
    } = this.props;
    const data = records
      ? records.map(vo => ({
          ...vo,
          customerType: this.matchValueType(vo.customerType, DONGLE_CUSTOMER_TYPE, vo.subAuthType),
          tenantAuthorizeMode: this.matchValueType(
            vo.tenantAuthorizeMode,
            TENANT_AUTHORIZE_MODE,
            vo.subAuthType,
          ),
          areaCode: this.matchValue(vo.areaCode, ADMINISTRATIVE_DIVISION),
        }))
      : [];
    return (
      <div className={styles.campusList}>
        {/* 表格 */}
        <div className={styles.tableBox}>
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: 20, total: dataCount, current: pageIndex }}
            onChange={this.changePage}
          />
          {InstallShow && <InstallModal visible={InstallShow} />}
        </div>
      </div>
    );
  }
}
export default CampusList;

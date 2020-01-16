import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { Table, Tooltip } from 'antd';
import Select from '@/components/Select';
import Search from '@/components/Search';
import { newTab } from '@/utils/instructions';
import { ConnectState } from '@/models/connect.d';
import { AuthRecordListParmsType } from '@/services/package';
import IconFont from '@/components/IconFont';
import event from '@/utils/event';
import styles from './index.less';

const { Option } = Select;

interface AuthRecordProps {
  dispatch?: (e: any) => void;
  match?: any;
  loading?: ConnectState['loading']['effects'];
  PACKAGE_AUTH_TYPE?: ConnectState['dictionary']['PACKAGE_AUTH_TYPE'];
  PACKAGE_AUTH_CODE_STATUS?: ConnectState['dictionary']['PACKAGE_AUTH_CODE_STATUS'];
  records?: ConnectState['resourcepackage']['authRecordData']['records'];
  pageSize?: ConnectState['resourcepackage']['authRecordData']['pageSize'];
  pageIndex?: ConnectState['resourcepackage']['authRecordData']['pageIndex'];
  total?: ConnectState['resourcepackage']['authRecordData']['total'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_AUTH_TYPE = [], PACKAGE_AUTH_CODE_STATUS = [] } = dictionary;
  const { records = [], total, pageSize, pageIndex } = resourcepackage.authRecordData || {};

  return {
    PACKAGE_AUTH_TYPE,
    PACKAGE_AUTH_CODE_STATUS,
    records,
    total,
    pageSize,
    pageIndex,
    loading: loading.effects['resourcepackage/fetchRecordList'],
  };
})
class AuthRecord extends Component<AuthRecordProps> {
  state = {
    columns: [
      {
        title: 'SN',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width: '40%',
      },

      {
        title: formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' }),
        dataIndex: 'authType',
        key: 'authType',
        width: '12%',
        render: (text: any) => {
          const { PACKAGE_AUTH_TYPE = [] } = this.props;
          let authTypeObj = null;
          if (text) {
            authTypeObj = PACKAGE_AUTH_TYPE.find(tag => tag.code === text);
          } else {
            authTypeObj = PACKAGE_AUTH_TYPE.find(tag => tag.code === 'DEFAULT');
          }
          return <span>{authTypeObj && authTypeObj.value}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' }),
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (text: any) => {
          const { PACKAGE_AUTH_CODE_STATUS = [] } = this.props;
          const statusObj = PACKAGE_AUTH_CODE_STATUS.find(tag => tag.code === text);

          return <span>{statusObj && statusObj.value}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.title.channel.business', defaultMessage: '渠道商' }),
        dataIndex: 'channelVendorName',
        key: 'channelVendorName',
        width: '15%',
        render: (text: any, record: any) => (
          <span>
            {text && (
              <Tooltip title={text}>
                <span
                  style={{ color: '#228EFF', cursor: 'pointer' }}
                  className={styles.cellTxt}
                  onClick={() => this.goToChannelVendorDetail(record.channelVendorId)}
                >
                  {text}
                </span>
              </Tooltip>
            )}
            {!text && <span>--</span>}
          </span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.end.user', defaultMessage: '最终用户' }),
        dataIndex: 'campusName',
        key: 'campusName',
        width: '15%',
        render: (text: any, record: any) => (
          <span>
            {text && (
              <Tooltip title={text}>
                <span
                  className={styles.cellTxt}
                  onClick={() => this.goToUserDetail(record.campusId)}
                  style={{ color: '#228EFF', cursor: 'pointer' }}
                >
                  {text}
                </span>
              </Tooltip>
            )}
            {!text && <span>--</span>}
          </span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '8%',
        render: (text: any, record: any) => (
          <span className={styles.detail}>
            <Tooltip title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}>
              <IconFont
                className={styles['icon-detail']}
                type="icon-file"
                onClick={() => this.goDetail(record.paperPackageId, record.serialNumber)}
              />
            </Tooltip>
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    this.getAuthRecordList({ pageIndex: 1 });
  }

  // 跳转到渠道商详情
  goToChannelVendorDetail = (id: string) => {
    newTab(`/tenant/channelvendor/manage/${id}/detail`);
  };

  // 跳转到用户详情
  goToUserDetail = (id: string) => {
    newTab(`/tenant/campus/manage/${id}/detail`);
  };

  // 跳转到详情页
  goDetail = (paperPackageId: string, serialNumber: string) => {
    newTab(`/resource/package/manage/authorize/${paperPackageId}/${serialNumber}/detail`);
  };

  getAuthRecordList = (params: AuthRecordListParmsType) => {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    const requestParams = {
      ...params,
      paperPackageId: id,
    };
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/fetchRecordList',
        payload: requestParams,
      });
    }
  };

  handleSearch = (value: string) => {
    const params = {
      filterWord: value,
      pageIndex: 1,
    };
    this.getAuthRecordList(params);
  };

  // 方式选择
  typeChange = (value: any) => {
    const params = {
      authType: value,
      pageIndex: 1,
    };
    this.getAuthRecordList(params);
  };

  // 状态变更
  statusChange = (value: any) => {
    const params = {
      status: value,
      pageIndex: 1,
    };
    this.getAuthRecordList(params);
  };

  // 分页变化
  handlePageChange = (page: number) => {
    const params = {
      pageIndex: page,
    };
    this.getAuthRecordList(params);
    // 切换页码时回到顶部
    event.emit('srollPopupWarp');
  };

  render() {
    const { columns } = this.state;
    const {
      loading,
      records = [],
      total,
      pageSize,
      pageIndex,
      PACKAGE_AUTH_CODE_STATUS = [],
      PACKAGE_AUTH_TYPE = [],
    } = this.props;

    const statusList = [{ id: 'all', value: '不限', code: '' }, ...PACKAGE_AUTH_CODE_STATUS];
    const typeList = [{ id: 'all', value: '不限', code: '' }, ...PACKAGE_AUTH_TYPE];

    return (
      <div className={styles.authRecordContainer}>
        <div className={styles.topSortBox}>
          <div className={styles.left}>
            <Search
              placeholder={formatMessage({
                id: 'operate.placeholder.paperpackage.auth.record.search',
                defaultMessage: '请输入SN/渠道商/最终用户',
              })}
              onSearch={value => this.handleSearch(value)}
              style={{ width: 320 }}
              maxLength={30}
            />
          </div>
          <div className={styles.right}>
            <div style={{ marginRight: '10px', position: 'relative' }} id="authTypeDom">
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' })}
              </span>
              <Select
                shape="round"
                style={{ width: 100 }}
                onChange={this.typeChange}
                defaultValue=""
                getPopupContainer={() => document.getElementById('authTypeDom') as HTMLElement}
              >
                {typeList.map((status: any) => (
                  <Option key={status.id} value={status.code}>
                    {status.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div id="authStatusDom" style={{ position: 'relative' }}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' })}
              </span>
              <Select
                shape="round"
                style={{ width: 100 }}
                onChange={this.statusChange}
                defaultValue=""
                getPopupContainer={() => document.getElementById('authStatusDom') as HTMLElement}
              >
                {statusList.map((status: any) => (
                  <Option key={status.id} value={status.code}>
                    {status.value}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {/* 表格 */}
        <div className={styles.tableBox}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={records}
            rowKey={record => record.id}
            pagination={{
              current: pageIndex,
              pageSize,
              total,
              showTotal: () => (
                <span style={{ marginRight: '20px' }}>
                  {formatMessage(
                    { id: 'operate.text.all.count', defaultMessage: '共 {dataCount} 条' },
                    { dataCount: total },
                  )}
                </span>
              ),
              onChange: page => this.handlePageChange(page),
            }}
          />
        </div>
      </div>
    );
  }
}
export default AuthRecord;

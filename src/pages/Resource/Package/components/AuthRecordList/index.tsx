import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { Table, Tooltip } from 'antd';
import Search from '@/components/Search';
import Select from '@/components/Select';
import { newTab } from '@/utils/instructions';
import { ConnectState } from '@/models/connect.d';
import { IconButton } from '@/components/IconFont';
import { AuthRecordListParmsType } from '@/services/package';
import event from '@/utils/event';
import styles from './index.less';

const { Option } = Select;

interface AuthRecordListProps {
  dispatch?: (e: any) => void;
  loading?: ConnectState['loading']['effects'];
  PACKAGE_AUTH_TYPE?: ConnectState['dictionary']['PACKAGE_AUTH_TYPE'];
  PACKAGE_AUTH_CODE_STATUS?: ConnectState['dictionary']['PACKAGE_AUTH_CODE_STATUS'];
  records?: ConnectState['resourcepackage']['authRecordData']['records'];
  pageIndex?: ConnectState['resourcepackage']['authRecordData']['pageIndex'];
  pageSize?: ConnectState['resourcepackage']['authRecordData']['pageSize'];
  total?: ConnectState['resourcepackage']['authRecordData']['total'];
  status?: ConnectState['resourcepackage']['authRecordData']['status'];
  authType?: ConnectState['resourcepackage']['authRecordData']['authType'];
  filterWord?: ConnectState['resourcepackage']['authRecordData']['filterWord'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_AUTH_TYPE = [], PACKAGE_AUTH_CODE_STATUS = [] } = dictionary;
  const { records = [], total, pageIndex, pageSize, status, authType, filterWord } =
    resourcepackage.authRecordData || {};

  return {
    PACKAGE_AUTH_TYPE,
    PACKAGE_AUTH_CODE_STATUS,
    records,
    total,
    pageIndex,
    pageSize,
    status,
    authType,
    filterWord,
    loading: loading.effects['resourcepackage/fetchRecordList'],
  };
})
class AuthRecordList extends Component<AuthRecordListProps> {
  state = {
    columns: [
      {
        title: 'SN',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width: '25%',
        render: (text: any) => (
          <div>
            <Tooltip title={text}>
              <span className={styles.cellTxt}>{text}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.package', defaultMessage: '试卷包' }),
        dataIndex: 'paperPackageName',
        key: 'paperPackageName',
        width: '20%',
        render: (text: any) => (
          <div>
            <Tooltip title={text}>
              <span className={styles.cellTxt}>{text}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' }),
        dataIndex: 'authType',
        key: 'authType',
        width: '10%',
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
        width: '14%',
        render: (text: any, record: any) => (
          <span>
            {text && (
              <div
                style={{ color: '#228EFF', cursor: 'pointer' }}
                onClick={() => this.goToChannelVendorDetail(record.channelVendorId)}
              >
                <Tooltip title={text}>
                  <span className={styles.cellTxt}>{text}</span>
                </Tooltip>
              </div>
            )}
            {!text && <span>--</span>}
          </span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.end.user', defaultMessage: '最终用户' }),
        dataIndex: 'campusName',
        key: 'campusName',
        width: '14%',
        render: (text: any, record: any) => (
          <span>
            {text && (
              <div
                onClick={() => this.goToUserDetail(record.campusId)}
                style={{ color: '#228EFF', cursor: 'pointer' }}
              >
                <Tooltip title={text}>
                  <span className={styles.cellTxt}>{text}</span>
                </Tooltip>
              </div>
            )}
            {!text && <span>--</span>}
          </span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '7%',
        render: (text: any, record: any) => (
          <span className={styles.detail}>
            <IconButton
              title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
              type="icon-file"
              onClick={() => this.goDetail(record.paperPackageId, record.serialNumber)}
            />
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    const { pageIndex } = this.props;
    this.getAuthRecordList({ pageIndex });
  }

  // 跳转到渠道商详情
  goToChannelVendorDetail = (id: string) => {
    newTab(`/tenant/channelvendor/manage/${id}/detail`);
  };

  // 跳转到详情页
  goDetail = (paperPackageId: string, serialNumber: string) => {
    newTab(`/resource/package/manage/authorize/${paperPackageId}/${serialNumber}/detail`);
  };

  // 跳转到用户详情
  goToUserDetail = (id: string) => {
    newTab(`/tenant/campus/manage/${id}/detail`);
  };

  // 获取列表
  getAuthRecordList = (params: AuthRecordListParmsType) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/fetchRecordList',
        payload: params,
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
    event.emit('srollPageWarp');
  };

  render() {
    const { columns } = this.state;
    const {
      loading,
      records = [],
      total,
      pageIndex,
      pageSize,
      PACKAGE_AUTH_CODE_STATUS = [],
      PACKAGE_AUTH_TYPE = [],
      status,
      authType,
      filterWord,
    } = this.props;

    const statusList = [{ id: 'all', value: '不限', code: '' }, ...PACKAGE_AUTH_CODE_STATUS];
    const typeList = [{ id: 'all', value: '不限', code: '' }, ...PACKAGE_AUTH_TYPE];

    return (
      <div className={styles.authRecordListContainer}>
        <div className={styles.topSortBox}>
          <div className={styles.left}>
            <Search
              placeholder={formatMessage({
                id: 'operate.placeholder.package.auth.record.list.search',
                defaultMessage: '请输入SN/试卷包名称/渠道商/最终用户',
              })}
              maxLength={30}
              defaultValue={filterWord}
              onSearch={this.handleSearch}
              style={{ width: 330 }}
            />
          </div>
          <div className={styles.right}>
            <div style={{ marginRight: '10px' }} id="typeDom">
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' })}
              </span>
              <Select
                shape="round"
                style={{ width: 100 }}
                onChange={this.typeChange}
                defaultValue={authType}
                getPopupContainer={() => document.getElementById('typeDom') as HTMLElement}
              >
                {typeList.map((type: any) => (
                  <Option key={type.id} value={type.code}>
                    {type.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div id="paperpackageStatusDom">
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' })}
              </span>
              <Select
                shape="round"
                style={{ width: 100 }}
                onChange={this.statusChange}
                defaultValue={status}
                getPopupContainer={() =>
                  document.getElementById('paperpackageStatusDom') as HTMLElement
                }
              >
                {statusList.map((tag: any) => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
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
export default AuthRecordList;

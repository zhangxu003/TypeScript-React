import React, { Component } from 'react';
import { Button, Table, Tooltip, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import moment from 'moment';
import { newTab } from '@/utils/instructions';
import { ConnectState } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import AddPackageModal from '../AddPackageModal';
import PackageDetailModal from '../PackageDetailModal';
import { AuthRecordListParmsType } from '@/services/tenantpackage';
import styles from './index.less';

const { confirm } = Modal;

interface PackageListProps {
  dispatch?: (e: any) => void;
  campusId: string;
  loading?: ConnectState['loading']['effects'];
  PACKAGE_AUTH_TYPE?: ConnectState['dictionary']['PACKAGE_AUTH_TYPE'];
  records?: ConnectState['tenantpackage']['pageData']['records'];
  pageSize?: ConnectState['tenantpackage']['pageData']['pageSize'];
  pageIndex?: ConnectState['tenantpackage']['pageData']['pageIndex'];
  total?: ConnectState['tenantpackage']['pageData']['total'];
}

@connect(({ dictionary, tenantpackage, loading }: ConnectState) => {
  const { PACKAGE_AUTH_TYPE = [] } = dictionary;
  const { records = [], total, pageSize, pageIndex } = tenantpackage.pageData || {};

  return {
    PACKAGE_AUTH_TYPE,
    records,
    total,
    pageSize,
    pageIndex,
    loading: loading.effects['tenantpackage/fetchRecordList'],
  };
})
class PackageList extends Component<PackageListProps> {
  state = {
    showAddModal: false,
    showPackageDetailModal: false,
    currentPackageId: '',
    serialNumber: '',
    columns: [
      {
        title: 'SN',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width: '25%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },

      {
        title: formatMessage({ id: 'operate.title.paper.package', defaultMessage: '试卷包' }),
        dataIndex: 'paperPackageName',
        key: 'paperPackageName',
        width: '25%',
        render: (text: any, record: any) => (
          <Tooltip title={text}>
            <div
              className={styles.cellTxt}
              style={{ color: '#228EFF', cursor: 'pointer' }}
              onClick={() => this.goToPackageDetail(record.paperPackageId)}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.title.authorization.mode',
          defaultMessage: '授权方式',
        }),
        dataIndex: 'authType',
        key: 'authType',
        width: '15%',
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
        title: formatMessage({ id: 'operate.title.paper.number', defaultMessage: '试卷数' }),
        dataIndex: 'paperCount',
        key: 'paperCount',
        width: '10%',
      },
      {
        title: formatMessage({ id: 'operate.title.operation.time', defaultMessage: '操作时间' }),
        dataIndex: 'distributeTime',
        key: 'distributeTime',
        width: '15%',
        render: (text: any, record: any) => (
          <span>
            {moment(
              record.distributeTime && Number(record.distributeTime) > 0
                ? record.distributeTime
                : record.bindTime,
            ).format('YYYY-MM-DD')}
          </span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (_text: any, record: any) => (
          <span className={styles.detail}>
            <Tooltip title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}>
              <IconFont
                className={styles['icon-detail']}
                type="icon-file"
                style={{ paddingRight: '10px' }}
                onClick={() => this.showPackageDetail(record.paperPackageId, record.serialNumber)}
              />
            </Tooltip>

            {/* 当试卷包授权状态为已绑定(PAS_2)时 */}
            {record.status && record.status === 'PAS_2' && (
              <Tooltip
                title={formatMessage({ id: 'operate.title.unbundling', defaultMessage: '解绑' })}
              >
                <IconFont
                  className={styles['icon-detail']}
                  type="icon-unbind"
                  onClick={() => this.handleUnbunding(record)}
                />
              </Tooltip>
            )}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    this.getAuthRecordList({ pageIndex: 1 });
  }

  // 跳转到试卷包详情
  goToPackageDetail = (id: string) => {
    newTab(`/resource/package/manage/list/${id}/detail`);
  };

  // 获取列表
  getAuthRecordList = (listParams: AuthRecordListParmsType) => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchRecordList',
        payload: { ...listParams, campusId },
      });
    }
  };

  handlePageChange = (page: number) => {
    this.getAuthRecordList({ pageIndex: page });
  };

  addPackage = () => {
    this.setState({
      showAddModal: true,
    });
  };

  showPackageDetail = (id: string, serialNumber: string) => {
    this.setState({
      currentPackageId: id,
      serialNumber,
      showPackageDetailModal: true,
    });
  };

  // 解绑
  handleUnbunding = (item: any) => {
    const that = this;
    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: (
              <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{item.paperPackageName}</span>
            ),
          }}
          {...{
            id: 'operate.message.unbing.package.tip',
            defaultMessage: '确认解绑{element}试卷包吗？',
          }}
        />
      </span>
    );
    confirm({
      title: '',
      content: cont,
      icon: null,
      centered: true,
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okText: formatMessage({ id: 'operate.button.unbundling', defaultMessage: '解绑' }),
      cancelButtonProps: {
        style: {
          color: '#888',
          background: '#fff',
          border: '1px solid #CCCCCC',
          borderRadius: '18px',
        },
      },
      okButtonProps: {
        style: {
          color: '#fff',
          background: 'rgba(255,110,74,1)',
          boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)',
          borderRadius: '18px',
          border: 'none',
        },
      },
      onOk() {
        that.unbing(item.paperPackageId);
      },
      onCancel() {},
    });
  };

  // 解绑试卷包
  unbing = (id: string) => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchUnbingPackage',
        payload: { campusId, paperPackageList: [id] },
      });
    }
  };

  render() {
    const {
      columns,
      showAddModal,
      currentPackageId,
      showPackageDetailModal,
      serialNumber,
    } = this.state;
    const { records = [], pageSize, total, pageIndex, loading, campusId } = this.props;
    return (
      <div className={styles.packageListContainer}>
        <div className={styles.top}>
          <Button type="primary" className={styles.addPackageBtn} onClick={this.addPackage}>
            {formatMessage({
              id: 'operate.button.add.paper.package',
              defaultMessage: '添加试卷包',
            })}
          </Button>
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

        {/* 添加试卷包弹窗 */}
        {showAddModal && (
          <AddPackageModal
            campusId={campusId}
            onClose={() => {
              this.setState({ showAddModal: false });
            }}
          />
        )}

        {/* 试卷包详情弹窗 */}
        {showPackageDetailModal && (
          <PackageDetailModal
            packageId={currentPackageId}
            serialNumber={serialNumber}
            onClose={() => {
              this.setState({ showPackageDetailModal: false });
            }}
          />
        )}
      </div>
    );
  }
}
export default PackageList;

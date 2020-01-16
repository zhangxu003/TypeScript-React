import React, { Component } from 'react';
import { Button, Table, Tooltip, message, Modal, Menu, Dropdown, Icon } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import cs from 'classnames';
import moment from 'moment';
import { connect } from 'dva';
// import router from 'umi/router';
import { ConnectState } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import styles from './index.less';
import InstallModal from '../InstallModal';
import { newTab } from '@/utils/instructions';

const { confirm } = Modal;

interface DongleProps {
  dispatch?: any;
  loading: ConnectState['loading']['effects'];
  records?: ConnectState['dongle']['pageData']['records'];
  DONGLE_TYPE: ConnectState['dictionary']['DONGLE_TYPE'];
  DONGLE_STATUS: ConnectState['dictionary']['DONGLE_STATUS'];
  DONGLE_ADJUST_REASON: ConnectState['dictionary']['DONGLE_ADJUST_REASON'];
  dataCount?: ConnectState['dongle']['pageData']['dataCount'];
  detail: any;
}

@connect(({ dongle, campus, loading, dictionary }: ConnectState) => {
  const {
    pageData: { records = [], dataCount }, // 当期页数据
  } = dongle;
  const { detail } = campus;
  const { DONGLE_TYPE = [], DONGLE_STATUS = [], DONGLE_ADJUST_REASON = [] } = dictionary;
  return {
    records,
    dataCount,
    detail,
    DONGLE_TYPE,
    DONGLE_STATUS,
    DONGLE_ADJUST_REASON,
    loading: loading.effects['dongle/fetchDongle'],
  };
})
class PackageList extends Component<DongleProps> {
  state = {
    value:
      (this.props.DONGLE_ADJUST_REASON &&
        this.props.DONGLE_ADJUST_REASON[0] &&
        this.props.DONGLE_ADJUST_REASON[0].value) ||
      '',
    visible: false,
    InstallShow: false,
    driveId: '',
    selectedRows: [],
    pageIndex: 1,
    columns: [
      {
        title: 'SN',
        dataIndex: 'sn',
        key: 'sn',
        width: '30%',
        render: (text: any) => (
          <div title={text} className={styles.cellTxt}>
            {text}
          </div>
        ),
      },

      {
        title: formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' }),
        dataIndex: 'dongleType',
        key: 'dongleType',
        width: '10%',
        render: (dongleType: string) => {
          const { value }: { value?: string } =
            this.props.DONGLE_TYPE.find(item => item.code === dongleType) || {};
          return <span>{value}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' }),
        dataIndex: 'status',
        key: 'status',
        width: '15%',
        render: (status: string) => {
          const { value }: { value?: string } =
            this.props.DONGLE_STATUS.find(item => item.code === status) || {};
          return <span>{value}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.text.dueToTheTime', defaultMessage: '到期时间' }),
        dataIndex: 'expired',
        key: 'expired',
        width: '15%',
        render: (expired: any) => (
          <span>{(expired && moment(expired).format('YYYY-MM-DD')) || ''}</span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'id',
        key: 'id',
        width: '15%',
        render: (_text: any, record: any) => (
          <span>
            <Tooltip title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}>
              <IconFont
                className={styles['icon-detail']}
                type="icon-file"
                style={{ paddingRight: '10px' }}
                onClick={() => {
                  this.goToDeatil(record.driveId);
                }}
              />
            </Tooltip>

            {record.status === 'BINDED' && (
              <Tooltip title="解绑">
                <IconFont
                  className={styles['icon-detail']}
                  type="icon-unbind"
                  style={{ paddingRight: '10px' }}
                  onClick={() => this.handleUnbunding(record)}
                />
              </Tooltip>
            )}
            {(record.status === 'BINDED' || record.status === 'ACTIVATED') && (
              <Tooltip title="更换">
                <IconFont
                  className={styles['icon-detail']}
                  type="icon-exchange"
                  onClick={() => this.handleChanging(record.driveId)}
                />
              </Tooltip>
            )}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    if (this.props.DONGLE_ADJUST_REASON && this.props.DONGLE_ADJUST_REASON[0]) {
      this.setState({ value: this.props.DONGLE_ADJUST_REASON[0].value });
    }
    this.fetchList();
  }

  goToDeatil = (id: any) => {
    newTab(`/resource/dongle/manage/${id}`);
    // window.open(`/resource/dongle/manage/${id}`);
    // router.push({ pathname: `/resource/dongle/manage/${id}` });
  };

  // 请求列表
  fetchList = (pageNo = 1) => {
    const { dispatch, detail } = this.props;

    if (dispatch) {
      dispatch({
        type: 'dongle/fetchDongle',
        payload: {
          pageIndex: pageNo,
          campusId: detail.id, // detail.id,
          isMainTop: 'Y',
          pageSize: 20,
        },
      });
    }
  };

  addPackage = () => {
    const { detail } = this.props;
    if (detail.tenantAuthorizeMode === 'NONE') {
      message.warn(
        formatMessage({
          id: 'operate.text.firstInitializedToCampus',
          defaultMessage: '请先进行校区初始化操作！',
        }),
      );
    }
    this.setState({ InstallShow: true });
  };

  showPackageDetail = () => {};

  onChange = (e: any) => {
    this.setState({ pageIndex: e });
    this.fetchList(e);
  };

  onreasonClick = (item: any) => {
    this.setState({ value: item.value });
  };

  // 解绑
  handleUnbunding = (item: any) => {
    const { detail } = this.props;
    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{detail.name}</span>,
            elements: <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{1}</span>,
          }}
          {...{
            id: 'operate.text.confirmTheUnbundlingElementelementsADongle',
            defaultMessage: '确认解绑{element}的{elements}个加密狗吗？',
          }}
        />
      </span>
    );

    const self = this;
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
        const { dispatch } = self.props;
        if (dispatch) {
          dispatch({
            type: 'dongle/cancelDongleInfos',
            payload: {
              campusId: detail.id,
              dongleInfo: [
                {
                  channelVendorId: item.distributorId,
                  dongleType: item.dongleType,
                  driveId: item.driveId,
                },
              ],
              initFlag: detail.initFlag,
            },
          }).then((e: string) => {
            if (e === 'SUCCESS') {
              const tips = (
                <span style={{ fontSize: '16px', color: '#333' }}>
                  <FormattedMessage
                    values={{
                      value: <span style={{ padding: '0 5px' }}>{detail.name}</span>,
                    }}
                    {...{
                      id: 'operate.text.youHaveSuccessfullyUnbundlingOfvalueEncryptionDog',
                      defaultMessage: '您已成功解绑{value}的加密狗！',
                    }}
                  />
                </span>
              );
              message.success(tips);

              self.fetchList();
            }
          });
        }
      },
      onCancel() {},
    });
  };

  // 批量解绑
  handleAllUnbunding = () => {
    const { detail } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warn(
        formatMessage({
          id: 'operate.text.pleaseSelectOperationEncryptionDog',
          defaultMessage: '请选择操作加密狗！',
        }),
      );
      return;
    }
    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{detail.name}</span>,
            elements: (
              <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{selectedRows.length}</span>
            ),
          }}
          {...{
            id: 'operate.text.confirmTheUnbundlingElementelementsADongle',
            defaultMessage: '确认解绑{element}的{elements}个加密狗吗？',
          }}
        />
      </span>
    );

    const self = this;
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
        const { dispatch } = self.props;
        let dongleInfo = [];
        dongleInfo = selectedRows.map((items: any) => {
          if (items.driveId) {
            return {
              channelVendorId: items.distributorId,
              dongleType: items.dongleType,
              driveId: items.driveId,
            };
          }
          return null;
        });
        if (dispatch) {
          dispatch({
            type: 'dongle/cancelDongleInfos',
            payload: {
              dongleInfo,
              campusId: detail.id,
              initFlag: detail.initFlag,
            },
          }).then((e: string) => {
            if (e === 'SUCCESS') {
              const tips = (
                <span style={{ fontSize: '16px', color: '#333' }}>
                  <FormattedMessage
                    values={{
                      value: <span style={{ padding: '0 5px' }}>{detail.name}</span>,
                    }}
                    {...{
                      id: 'operate.text.youHaveSuccessfullyUnbundlingOfvalueEncryptionDog',
                      defaultMessage: '您已成功解绑{value}的加密狗！',
                    }}
                  />
                </span>
              );
              message.success(tips);
              self.setState({ selectedRows: [] });
              self.fetchList();
            }
          });
        }
      },
      onCancel() {},
    });
  };

  // 更换
  handleChanging = (id: any) => {
    this.setState({ visible: true, driveId: id });
  };

  hideModal = () => {
    this.setState({
      visible: false,
      InstallShow: false,
    });
  };

  /**
   *更换操作
   *
   * @memberof PackageList
   */
  changeDongle = () => {
    const { dispatch } = this.props;
    const { value, driveId } = this.state;
    if (dispatch) {
      dispatch({
        type: 'dongle/changeDongleInfos',
        payload: {
          driveId,
          reasonFlag: value,
        },
      }).then((e: string) => {
        if (e === 'SUCCESS') {
          message.success('您已成功更换！');
          this.setState({
            visible: false,
            InstallShow: false,
          });
          this.fetchList();
        }
      });
    }
  };

  render() {
    const { columns, InstallShow } = this.state;
    const { records = [], loading, dataCount, DONGLE_ADJUST_REASON } = this.props;
    const { pageIndex } = this.state;
    // const self = this;
    const typeJsx: any = [];
    DONGLE_ADJUST_REASON.forEach((item: any) => {
      typeJsx.push(
        <Menu.Item
          key={item.code}
          onClick={() => {
            this.onreasonClick(item);
          }}
        >
          {item.value}
        </Menu.Item>,
      );
    });

    const menu = <Menu>{typeJsx}</Menu>;

    // rowSelection object indicates the need for row selection
    const rowSelection = {
      onChange: (selectedRowKeys: any, selectedRows: any) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRows,
        });
      },
      getCheckboxProps: (record: any) => ({
        disabled: record.status !== 'BINDED', // Column configuration not to be checked
        sn: record.sn,
      }),
    };

    return (
      <div className={styles.packageListContainer}>
        <div className={styles.top}>
          <Button className={styles.normalBtn} onClick={this.handleAllUnbunding}>
            {formatMessage({
              id: 'operate.text.bulkSolutionToEncryptionDog',
              defaultMessage: '批量解绑加密狗',
            })}
          </Button>
          <Button type="primary" className={styles.addPackageBtn} onClick={this.addPackage}>
            {formatMessage({
              id: 'operate.text.bindingEncryptionDog',
              defaultMessage: '绑定加密狗',
            })}
          </Button>
        </div>
        {/* 表格 */}
        <div className={styles.tableBox}>
          <Table
            rowSelection={rowSelection}
            loading={loading}
            columns={columns}
            dataSource={records}
            rowKey={record => record.id}
            pagination={{
              current: pageIndex,
              pageSize: 20,
              total: dataCount,
              onChange: this.onChange,
              showTotal: () => <span style={{ marginRight: '20px' }}>共 {dataCount} 条</span>,
            }}
          />
        </div>

        <Modal
          visible={this.state.visible}
          centered
          onOk={this.hideModal}
          onCancel={this.hideModal}
          footer={null}
          className={styles.StorageModal}
        >
          <div>
            <span style={{ fontSize: '16px', color: '#333', fontWeight: 600 }}>更换加密狗</span>
            <div className={styles.flex}>
              <span>更换原因</span>
              <span style={{ color: '#FF6E4A', marginRight: '10px' }}>*</span>
              <Dropdown overlay={menu}>
                <div className="Dropdown">
                  {this.state.value} <Icon type="down" />
                </div>
              </Dropdown>
            </div>
          </div>
          <div className={cs('ant-modal-confirm-btns', styles.footer)}>
            <button
              type="button"
              className="ant-btn"
              style={{
                color: '#888',
                background: '#fff',
                border: '1px solid #CCCCCC',
                borderRadius: '18px',
                marginRight: '10px',
              }}
              onClick={this.hideModal}
            >
              <span>{formatMessage({ id: 'operate.text.takeAway', defaultMessage: '取 消' })}</span>
            </button>
            <button
              type="button"
              className="ant-btn ant-btn-primary"
              style={{
                color: '#fff',
                background: 'rgba(255,110,74,1)',
                boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)',
                borderRadius: '18px',
                border: 'none',
              }}
              onClick={this.changeDongle}
            >
              <span>{formatMessage({ id: 'operate.text.moreIn', defaultMessage: '更 换' })}</span>
            </button>
          </div>
        </Modal>
        <InstallModal
          visible={InstallShow}
          hideModal={this.hideModal}
          reload={this.fetchList}
          key={`${InstallShow}`}
        />
      </div>
    );
  }
}
export default PackageList;

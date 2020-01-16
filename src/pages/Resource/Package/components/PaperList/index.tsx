import React, { Component } from 'react';
import { Table, Modal, Tooltip } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import Search from '@/components/Search';
import Select from '@/components/Select';
import { newTab } from '@/utils/instructions';
import { ConnectState } from '@/models/connect.d';
import { IconButton } from '@/components/IconFont';
import RegionSelect from '@/components/RegionSelect';
import { PackageListParmsType } from '@/services/package';
import event from '@/utils/event';
import styles from './index.less';

const { Option } = Select;
const { confirm } = Modal;

interface PaperListProps {
  dispatch?: (e: any) => void;
  loading?: ConnectState['loading']['effects'];
  PACKAGE_SALES_STATUS?: ConnectState['dictionary']['PACKAGE_SALES_STATUS'];
  areaCode?: ConnectState['resourcepackage']['pageData']['areaCode'];
  salesStatus?: ConnectState['resourcepackage']['pageData']['salesStatus'];
  filterWord?: ConnectState['resourcepackage']['pageData']['filterWord'];
  records?: ConnectState['resourcepackage']['pageData']['records'];
  pageIndex?: ConnectState['resourcepackage']['pageData']['pageIndex'];
  pageSize?: ConnectState['resourcepackage']['pageData']['pageSize'];
  total?: ConnectState['resourcepackage']['pageData']['total'];
}

@connect(({ dictionary, resourcepackage, loading }: ConnectState) => {
  const { PACKAGE_SALES_STATUS = [] } = dictionary;
  const {
    pageData: { records = [], total, pageIndex, pageSize, areaCode, salesStatus, filterWord },
  } = resourcepackage;

  return {
    PACKAGE_SALES_STATUS,
    records,
    total,
    pageIndex,
    pageSize,
    areaCode,
    salesStatus,
    filterWord,
    loading: loading.effects['resourcepackage/fetchPackage'],
  };
})
class PaperList extends Component<PaperListProps> {
  state = {
    columns: [
      {
        title: formatMessage({
          id: 'operate.title.paper.package.No',
          defaultMessage: '试卷包编号',
        }),
        dataIndex: 'code',
        key: 'code',
        width: '15%',
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
        title: formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' }),
        dataIndex: 'areaCodeValue',
        key: 'areaCodeValue',
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
        title: formatMessage({
          id: 'operate.title.default.author.number',
          defaultMessage: '默认授权数',
        }),
        dataIndex: 'defaultAccreditNum',
        key: 'defaultAccreditNum',
        width: '10%',
      },
      {
        title: formatMessage({
          id: 'operate.title.incremental.activations',
          defaultMessage: '增量激活数',
        }),
        dataIndex: 'incrementActiveNum',
        key: 'incrementActiveNum',
        width: '10%',
      },
      {
        title: formatMessage({ id: 'operate.title.shop.mall.status', defaultMessage: '商城状态' }),
        dataIndex: 'salesStatus',
        key: 'salesStatus',
        width: '10%',
        render: (text: any) => {
          const { PACKAGE_SALES_STATUS = [] } = this.props;

          let statusObj = null;
          if (text) {
            statusObj = PACKAGE_SALES_STATUS.find(tag => tag.code === text);
          }
          // } else {
          //   statusObj = PACKAGE_SALES_STATUS.find(tag => tag.code === 'DISCONTINUED');
          // }

          return <span>{statusObj && statusObj.value}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (text: any, record: any) => (
          <span className={styles.detail}>
            <IconButton
              title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
              type="icon-file"
              onClick={() => this.goDetail(record.id)}
            />
            {record.salesStatus === 'LAUNCHED' ? (
              <IconButton
                title={formatMessage({ id: 'operate.title.off.shelves', defaultMessage: '下架' })}
                type="icon-UnShelve"
                onClick={() => this.handleDown(record)}
              />
            ) : (
              <IconButton
                title={formatMessage({ id: 'operate.title.on.shelves', defaultMessage: '上架' })}
                type="icon-Putaway"
                onClick={() => this.handleUp(record)}
              />
            )}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    const { pageIndex } = this.props;
    this.getPackageList({
      pageIndex,
    });
  }

  // 跳转到详情页
  goDetail = (id: string) => {
    newTab(`/resource/package/manage/list/${id}/detail`);
  };

  // 下架
  handleDown = (record: any) => {
    const { dispatch } = this.props;

    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: (
              <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{record.paperPackageName}</span>
            ),
          }}
          {...{
            id: 'operate.message.down.package.tip',
            defaultMessage: '是否确认商城下架 {element} 试卷包？',
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
      okText: formatMessage({ id: 'operate.button.down.sales', defaultMessage: '下架' }),
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
        if (dispatch) {
          dispatch({
            type: 'resourcepackage/upOrDownPackage',
            payload: { paperPackageId: record.id, salesStatus: 'DISCONTINUED' },
          });
        }
      },
      onCancel() {},
    });
  };

  // 上架
  handleUp = (record: any) => {
    const { dispatch } = this.props;
    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: (
              <span style={{ padding: '0 5px', color: '#FF6E4A' }}>{record.paperPackageName}</span>
            ),
          }}
          {...{
            id: 'operate.message.up.package.sale.tip',
            defaultMessage: '是否确认商城上架 {element} 试卷包？',
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
      okText: formatMessage({ id: 'operate.button.ok', defaultMessage: '确认' }),
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
          background: '#03C46B',
          boxShadow: '0px 2px 5px 0px rgba(3,196,107,0.5)',
          borderRadius: '18px',
          border: 'none',
        },
      },
      onOk() {
        if (dispatch) {
          dispatch({
            type: 'resourcepackage/upOrDownPackage',
            payload: { paperPackageId: record.id, salesStatus: 'LAUNCHED' },
          });
        }
      },
      onCancel() {},
    });
  };

  // 获取列表
  getPackageList = (params: PackageListParmsType) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'resourcepackage/fetchPackage',
        payload: params,
      });
    }
  };

  // 模糊搜索
  handleSearch = (value: string) => {
    const params = {
      filterWord: value,
      pageIndex: 1,
    };
    this.getPackageList(params);
  };

  // 地区选择
  handleRegionChange = (value: string[]) => {
    // 单独处理 不限 选项
    const allObj = value.find(tag => tag.indexOf('all') !== -1);
    const params = {
      areaCode: allObj ? [] : value,
      pageIndex: 1,
    };
    this.getPackageList(params);
  };

  // 状态变更
  statusChange = (value: any) => {
    const params = {
      salesStatus: value,
      pageIndex: 1,
    };
    this.getPackageList(params);
  };

  // 分页变化
  handlePageChange = (page: number) => {
    const params = {
      pageIndex: page,
    };
    this.getPackageList(params);
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
      PACKAGE_SALES_STATUS = [],
      salesStatus,
      areaCode,
      filterWord,
    } = this.props;
    const statusList = [{ id: 'all', value: '不限', code: '' }, ...PACKAGE_SALES_STATUS];
    return (
      <div className={styles.paperListContainer}>
        <div className={styles.topSortBox}>
          <Search
            placeholder={formatMessage({
              id: 'operate.placeholder.paperpackage.search',
              defaultMessage: '请输入试卷包编号/名称/标签',
            })}
            maxLength={30}
            onSearch={this.handleSearch}
            defaultValue={filterWord}
            style={{ width: 300 }}
          />
          <div className={styles.right}>
            <div style={{ marginRight: '10px' }}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' })}
              </span>
              <RegionSelect
                isQuery
                onChange={this.handleRegionChange}
                width={190}
                value={areaCode}
              />
            </div>
            <div id="statusDiv">
              <span className={styles.tit}>
                {formatMessage({
                  id: 'operate.title.shop.mall.status',
                  defaultMessage: '商城状态',
                })}
              </span>
              <Select
                shape="round"
                style={{ width: 100 }}
                onChange={this.statusChange}
                defaultValue={salesStatus}
                getPopupContainer={() => document.getElementById('statusDiv') as HTMLElement}
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
            rowKey={record => `${record.id}${record.code}`}
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
export default PaperList;

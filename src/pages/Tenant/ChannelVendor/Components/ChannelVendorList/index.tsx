import React, { useCallback, useMemo } from 'react';
import { Table, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { formatMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import { IconButton } from '@/components/IconFont';
import { IChannelVendor, IQueryChannelVendorParams } from '../../../models/channelVendor';
import { newTab } from '@/utils/instructions';
import styles from './index.less';

export interface IChannelVendorListProps {
  loading: boolean;
  pagination: IQueryChannelVendorParams;
  dataSource: Array<IChannelVendor> | any[] | null;
  onPageChanged: ((index: number) => void) | null;
}

/**
 * 渠道商列表
 * @author leo.guo
 * @date   2019-10-25 11:31:50
 */
const ChannelVendorList: React.FC<IChannelVendorListProps> = props => {
  const { loading, dataSource, pagination, onPageChanged } = props;

  // 详情按钮点击
  const handleOnDetailClick = useCallback((item: IChannelVendor) => {
    newTab(`/tenant/channelvendor/manage/${item.id}/detail`);
  }, []);

  // 分页事件
  const handlePageChanged = useCallback(
    pageIndex => {
      if (onPageChanged && typeof onPageChanged === 'function') {
        onPageChanged(pageIndex);
      }
    },
    [onPageChanged],
  );

  // Columns
  const columns: Array<ColumnProps<any>> = useMemo(
    () => [
      {
        title: formatMessage({
          id: 'operate.title.channelvendor.table.name',
          defaultMessage: '渠道商',
        }),
        dataIndex: 'name',
        key: 'name',
        width: '35%',
        render: (name: string) => (
          <Tooltip overlay={name}>
            <span className={styles.name}>{name}</span>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.title.channelvendor.table.createdDatetime',
          defaultMessage: '创建时间',
        }),
        dataIndex: 'createdDatetime',
        key: 'createdDatetime',
        width: '17%',
        align: 'center',
        render: (createdDatetime: number) => {
          if (!createdDatetime) return '';
          const timeFormat = moment(createdDatetime).format('YYYY-MM-DD');
          return <span title={timeFormat}>{timeFormat}</span>;
        },
      },
      {
        title: formatMessage({
          id: 'operate.title.channelvendor.table.dongle',
          defaultMessage: '关联加密狗',
        }),
        width: '20%',
        align: 'center',
        children: [
          {
            title: formatMessage({
              id: 'operate.title.channelvendor.table.dongleNum',
              defaultMessage: '总数',
            }),
            dataIndex: 'dongleNum',
            key: 'dongleNum',
            align: 'center',
            render: (dongleNum: number) => <span title={`${dongleNum}`}>{dongleNum}</span>,
          },
          {
            title: formatMessage({
              id: 'operate.title.channelvendor.table.mainDongleNum',
              defaultMessage: '主狗',
            }),
            dataIndex: 'mainDongleNum',
            key: 'mainDongleNum',
            align: 'center',
            render: (mainDongleNum: number) => (
              <span title={`${mainDongleNum}`}>{mainDongleNum}</span>
            ),
          },
          {
            title: formatMessage({
              id: 'operate.title.channelvendor.table.viceDongleNum',
              defaultMessage: '副狗',
            }),
            dataIndex: 'viceDongleNum',
            key: 'viceDongleNum',
            align: 'center',
            render: (viceDongleNum: number) => (
              <span title={`${viceDongleNum}`}>{viceDongleNum}</span>
            ),
          },
        ],
      },
      {
        title: formatMessage({
          id: 'operate.title.channelvendor.table.paperPackageSnNum',
          defaultMessage: '关联试卷包SN',
        }),
        dataIndex: 'paperPackageSnNum',
        key: 'paperPackageSnNum',
        width: '12%',
        align: 'center',
        render: (viceDongleNum: number) => <span title={`${viceDongleNum}`}>{viceDongleNum}</span>,
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '9%',
        align: 'center',
        render: (_text: any, record: IChannelVendor) => (
          <IconButton
            title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
            type="icon-file"
            onClick={() => handleOnDetailClick(record)}
          />
        ),
      },
    ],
    [],
  );

  return (
    <Table
      className={styles.vendorListTable}
      bordered
      loading={loading}
      columns={columns}
      dataSource={dataSource as any[]}
      rowKey={record => record.id}
      pagination={{
        current: pagination.pageIndex,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showTotal: () => <span style={{ marginRight: '20px' }}>共 {pagination.total} 条</span>,
        onChange: pageIndex => handlePageChanged(pageIndex),
      }}
    />
  );
};

export default ChannelVendorList;

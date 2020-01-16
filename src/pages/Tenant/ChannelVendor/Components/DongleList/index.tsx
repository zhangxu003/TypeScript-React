import React, { useCallback, useMemo } from 'react';
import { Table, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { formatMessage } from 'umi-plugin-react/locale';
import moment from 'moment';
import { IconButton } from '@/components/IconFont';
import { IDongle, IQueryDongleListParams } from '../../../models/channelVendor';
import { newTab } from '@/utils/instructions';
import styles from './index.less';

export interface IDongleListProps {
  loading: boolean;
  pagination: IQueryDongleListParams;
  dataSource: Array<IDongle> | any[] | null;
  onPageChanged: ((index: number) => void) | null;
  onDongleRemoved: ((driveId: string) => void) | null;
}

/**
 * 渠道商列表
 * @author leo.guo
 * @date   2019-10-25 11:31:50
 */
const DongleList: React.FC<IDongleListProps> = props => {
  const { loading, dataSource, pagination, onPageChanged, onDongleRemoved } = props;

  // 详情按钮点击
  const handleOnDetailClick = useCallback((item: IDongle) => {
    newTab(`/resource/dongle/manage/${item.driveId}/detail`);
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

  // 取消分配
  const handleUnassignClick = useCallback(
    (item: IDongle) => {
      if (onDongleRemoved && typeof onDongleRemoved === 'function') {
        onDongleRemoved(item.driveId);
      }
    },
    [onDongleRemoved],
  );

  // 校区详情
  const handleCampusClick = useCallback((campusId: string) => {
    newTab(`/tenant/campus/manage/${campusId}/detail`);
  }, []);

  // Columns
  const columns: Array<ColumnProps<any>> = useMemo(
    () => [
      {
        title: formatMessage({ id: 'operate.title.donglelist.table.sn', defaultMessage: 'SN' }),
        dataIndex: 'sn',
        key: 'sn',
        width: '30%',
        render: (sn: string) => <span title={sn}>{sn}</span>,
      },
      {
        title: formatMessage({
          id: 'operate.title.donglelist.table.dongletype',
          defaultMessage: '类型',
        }),
        dataIndex: 'dongleTypeValue',
        key: 'dongleTypeValue',
        width: '10%',
        align: 'center',
        render: (dongleTypeValue: string) => (
          <span title={`${dongleTypeValue}`}>{dongleTypeValue}</span>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.title.donglelist.table.status',
          defaultMessage: '状态',
        }),
        dataIndex: 'statusValue',
        key: 'statusValue',
        width: '10%',
        align: 'center',
        render: (statusValue: string) => <span title={`${statusValue}`}>{statusValue}</span>,
      },
      {
        title: formatMessage({
          id: 'operate.title.donglelist.table.campusName',
          defaultMessage: '最终用户',
        }),
        dataIndex: 'campusName',
        key: 'campusName',
        width: '25%',
        align: 'center',
        render: (campusName: string, record: IDongle) => {
          if (!campusName) {
            return <span>- -</span>;
          }
          return (
            <Tooltip title={campusName}>
              <span
                className={styles.campusName}
                title={campusName}
                onClick={() => handleCampusClick(record.campusId)}
              >
                {campusName}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: formatMessage({
          id: 'operate.title.donglelist.table.changeTime',
          defaultMessage: '操作时间',
        }),
        dataIndex: 'changeTime',
        key: 'changeTime',
        width: '15%',
        align: 'center',
        render: (changeTime: number) => {
          if (!changeTime) {
            return <span>- -</span>;
          }
          const timeFormat = moment(changeTime).format('YYYY-MM-DD');
          return <span title={timeFormat}>{timeFormat}</span>;
        },
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        align: 'left',
        render: (_text: any, record: IDongle) => (
          <>
            <IconButton
              title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
              type="icon-file"
              onClick={() => handleOnDetailClick(record)}
            />
            {record.status === 'DISTRIBUTED' && (
              <IconButton
                title={formatMessage({
                  id: 'operate.title.donglelist.table.unassign',
                  defaultMessage: '取消分配',
                })}
                type="icon-play-between"
                onClick={() => handleUnassignClick(record)}
              />
            )}
          </>
        ),
      },
    ],
    [],
  );

  return (
    <Table
      className={styles.dongleListTable}
      loading={loading}
      columns={columns}
      dataSource={dataSource as any[]}
      rowKey={record => record.id}
      pagination={{
        current: pagination ? pagination.pageIndex : 0,
        pageSize: pagination ? pagination.pageSize : 0,
        total: pagination ? pagination.total : 0,
        showTotal: () => (
          <span style={{ marginRight: '20px' }}>共 {pagination ? pagination.total : 0} 条</span>
        ),
        onChange: pageIndex => handlePageChanged(pageIndex),
      }}
    />
  );
};

export default DongleList;

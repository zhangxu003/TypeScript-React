import React, { PureComponent } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { Table, Modal, Radio } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { IconButton } from '@/components/IconFont';
import Empty from '@/components/Empty';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import { newTab } from '@/utils/instructions';
import styles from './index.less';
import nonesoftdog from '../../assets/nonesoftdog.png';
import event from '@/utils/event';

const { confirm } = Modal;

type CodeType = ConnectState['dictionary']['DONGLE_TYPE'][0];

// 此处代表connect中传入的props
interface DongleConnectProps extends ConnectProps {
  loading: ConnectState['loading']['effects'];
  records: ConnectState['dongle']['pageData']['records'];
  pageIndex: ConnectState['dongle']['pageData']['pageIndex'];
  DONGLE_TYPE: ConnectState['dictionary']['DONGLE_TYPE'];
  DONGLE_STATUS: ConnectState['dictionary']['DONGLE_STATUS'];
  dataCount: ConnectState['dongle']['pageData']['dataCount'];
}

@connect(({ dongle, loading, dictionary }: ConnectState) => {
  const {
    pageData: { records = [], dataCount, pageIndex }, // 当期页数据
  } = dongle;
  const { DONGLE_TYPE = [], DONGLE_STATUS = [] } = dictionary;
  return {
    records,
    pageIndex,
    dataCount,
    DONGLE_TYPE,
    DONGLE_STATUS,
    loading: loading.effects['dongle/fetchDongle'],
  };
})
class TableList extends PureComponent<DongleConnectProps> {
  // 此处写法，用于 设置 默认的props，可以用来加载从connect引入的props
  // 如此，外部调用此组件的时候，不需要必填
  static defaultProps: DongleConnectProps;

  state = {
    faultFlag: 'Y',
  };

  componentDidMount() {
    // 默认请求加密狗列表
    this.fetchList();
  }

  // 请求加密狗列表
  fetchList = (pageNo: number = 1): void => {
    const { dispatch } = this.props;
    const queryInfo = {
      campusId: '',
    };
    if (dispatch) {
      dispatch({
        type: 'dongle/fetchDongle',
        payload: { pageIndex: pageNo, queryInfo, pageSize: 20 },
      });
    }

    // 切换页码时回到顶部
    event.emit('srollPageWarp');
  };

  // 跳转到详情页
  goToDeatil = (id: string) => {
    newTab(`/resource/dongle/manage/${id}/detail`);
  };

  // 将code转换成字典库中value
  tranDictVale = (list: CodeType[], code: string): string => {
    const { value }: { value?: string } = list.find(item => item.code === code) || {};
    return value || code;
  };

  // 转换时间戳
  timestampToTime = (timestamp?: number) => {
    const formatDate = timestamp ? moment(timestamp).format('YYYY-MM-DD') : null;
    return formatDate;
  };

  // 弹出回收加密狗的弹框
  confirmRecyCle = (id: string): void => {
    confirm({
      title: formatMessage({
        id: 'operate.title.confirm.recycle.dongle',
        defaultMessage: '确认已收到该加密狗',
      }),
      content: (
        <div>
          {formatMessage({ id: 'operate.text.is.there.a.fault', defaultMessage: '是否有故障' })}
          <span>：</span>
          <Radio.Group
            name="radiogroup"
            defaultValue="Y"
            onChange={(e: any) => {
              // console.log(e.target.value);
              this.state.faultFlag = e.target.value;
            }}
          >
            <Radio value="Y">{formatMessage({ id: 'operate.yes', defaultMessage: '是' })}</Radio>
            <Radio value="N">{formatMessage({ id: 'operate.no', defaultMessage: '否' })}</Radio>
          </Radio.Group>
        </div>
      ),
      okText: formatMessage({ id: 'operate.button.recycle', defaultMessage: '回收' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        shape: 'round',
        type: 'danger',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: () => {
        this.recycle(id);
      },
    });
  };

  // 回收加密狗
  recycle = (id: string) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'dongle/recycleDongleInfo',
        payload: {
          driveId: id,
          faultFlag: this.state.faultFlag,
        },
      }).then(() => {
        this.state.faultFlag = 'Y';
      });
    }
  };

  // 生成table 的头
  getColumns = (): any => {
    const { DONGLE_TYPE, DONGLE_STATUS } = this.props;
    return [
      {
        title: 'SN',
        dataIndex: 'sn',
        key: 'sn',
      },
      {
        title: formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' }),
        dataIndex: 'dongleType',
        key: 'dongleType',
        render: (dongleType: string) => this.tranDictVale(DONGLE_TYPE, dongleType),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' }),
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => this.tranDictVale(DONGLE_STATUS, status),
      },
      {
        title: formatMessage({ id: 'operate.title.operation.time', defaultMessage: '操作时间' }),
        dataIndex: 'changeTime',
        key: 'changeTime',
        render: (changeTime: any) => (
          <span>{(changeTime && moment(changeTime).format('YYYY-MM-DD')) || ''}</span>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'driveId',
        key: 'driveId',
        render: (driveId: string, record: any) => (
          <div className={styles.flex}>
            <IconButton
              title={formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' })}
              type="icon-file"
              onClick={() => {
                this.goToDeatil(driveId);
              }}
            />
            {record.status === 'WAITING_RECYCLE' && (
              <IconButton
                title={formatMessage({ id: 'operate.title.recycle', defaultMessage: '回收' })}
                type="icon-recycle"
                onClick={() => this.confirmRecyCle(driveId)}
              />
            )}
          </div>
        ),
      },
    ];
  };

  // render 主页面
  render() {
    const { records = [], loading, dataCount, pageIndex } = this.props;
    if (records.length === 0 && !loading) {
      return (
        <Empty
          image={nonesoftdog}
          description={formatMessage({
            id: 'operate.text.noEncryptionDog',
            defaultMessage: '暂无加密狗',
          })}
        />
      );
    }
    return (
      <Table
        loading={loading}
        columns={this.getColumns()}
        dataSource={records}
        rowKey={record => record.id}
        pagination={{
          current: pageIndex,
          pageSize: 20,
          total: dataCount,
          onChange: this.fetchList,
          showTotal: () => (
            <span style={{ marginRight: '20px' }}>
              {formatMessage(
                { id: 'operate.text.all.count', defaultMessage: '共 {dataCount} 条' },
                { dataCount },
              )}
            </span>
          ),
        }}
      />
    );
  }
}

export default TableList;

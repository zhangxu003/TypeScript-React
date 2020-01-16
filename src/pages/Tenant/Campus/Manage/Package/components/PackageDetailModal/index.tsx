import React, { Component } from 'react';
import { Modal, Table, Tag, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect.d';
import TrueIcon from '@/assets/paperpackage/true.png';
import { matchUnitType } from '@/utils/utils';
import styles from './index.less';

export interface PackageDetailModalProps {
  dispatch?: (e: any) => void;
  loading?: ConnectState['loading']['effects'];
  packageId: string;
  serialNumber: string;
  paperList?: ConnectState['tenantpackage']['paperList'];
  onClose: () => void;
}

@connect(({ tenantpackage, loading }: ConnectState) => {
  const { paperList = [] } = tenantpackage;

  return {
    paperList,
    loading: loading.effects['tenantpackage/fetchPaperListByPackageId'],
  };
})
class PackageDetailModal extends Component<PackageDetailModalProps> {
  state = {
    visible: true,
    columns: [
      {
        title: formatMessage({ id: 'operate.title.paper', defaultMessage: '试卷' }),
        dataIndex: 'paperName',
        key: 'paperName',
        width: '20%',
        render: (text: any, record: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt} style={{ paddingLeft: '10px' }}>
              <span>{text}</span>
              {record.isExamination === 'Y' && <img src={TrueIcon} alt="true" />}
            </div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' }),
        dataIndex: 'areaCodeValue',
        key: 'areaCodeValue',
        width: '20%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.template', defaultMessage: '试卷结构' }),
        dataIndex: 'paperTemplateName',
        key: 'paperTemplateName',
        width: '20%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.scope', defaultMessage: '试卷范围' }),
        dataIndex: 'paperScopeValue',
        key: 'paperScopeValue',
        width: '20%',
        render: (text: any, record: any) => (
          <Tooltip title={matchUnitType(record)}>
            <div className={styles.cellTxt}>{matchUnitType(record)}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.year', defaultMessage: '年份' }),
        dataIndex: 'annual',
        key: 'annual',
        width: '10%',
      },

      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '10%',
        render: (text: any, record: any) => (
          <span>
            {record.isVisible && record.isVisible === 'N' && (
              <Tag>{formatMessage({ id: 'operate.text.secrecy', defaultMessage: '保密' })}</Tag>
            )}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    const { packageId, dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchPaperListByPackageId',
        payload: { pageIndex: 1, pageSize: 0x7fffffff, paperPackageId: packageId },
      });
    }
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleAfterClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { visible, columns } = this.state;
    const { paperList, loading, serialNumber } = this.props;
    // console.log('-----paperList:', paperList);
    const detailTitle = formatMessage({ id: 'operate.title.detail', defaultMessage: '详情' });

    return (
      <Modal
        wrapClassName={styles.packageDetailModal}
        title={`${detailTitle}：${serialNumber}`}
        width={800}
        visible={visible}
        centered
        destroyOnClose
        maskClosable={false}
        onCancel={this.handleCancel}
        afterClose={this.handleAfterClose}
        footer={null}
      >
        <div className={styles.modalContent}>
          {/* 表格 */}
          <div className={styles.tableBox}>
            <Table
              loading={loading}
              rowKey={record => record.paperId}
              columns={columns}
              dataSource={paperList}
              pagination={{
                defaultCurrent: 1,
                pageSize: 20,
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
export default PackageDetailModal;

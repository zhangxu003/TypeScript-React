import React, { Component } from 'react';
import { Modal, Button, Pagination } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import classNames from 'classnames';
import { connect } from 'dva';
import Search from '@/components/Search';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import RegionSelect from '@/components/RegionSelect';
import IconFont from '@/components/IconFont';
import noDataIcon from '@/assets/none_asset_icon.png';
import styles from './index.less';

const { confirm } = Modal;

export interface AddPackageModalProps extends ConnectProps {
  campusId?: string;
  loading?: ConnectState['loading']['effects'];
  addLoading?: ConnectState['loading']['effects'];
  records?: ConnectState['tenantpackage']['addPackagePaperData']['records'];
  pageIndex?: ConnectState['tenantpackage']['addPackagePaperData']['pageIndex'];
  pageSize?: ConnectState['tenantpackage']['addPackagePaperData']['pageSize'];
  total?: ConnectState['tenantpackage']['addPackagePaperData']['total'];
  areaCodeList?: ConnectState['tenantpackage']['addPackagePaperData']['areaCodeList'];
  onClose: () => void;
}

@connect(({ tenantpackage, loading }: ConnectState) => {
  const { records = [], total, pageIndex, pageSize, areaCodeList } =
    tenantpackage.addPackagePaperData || {};

  return {
    records,
    total,
    pageSize,
    pageIndex,
    areaCodeList,
    loading: loading.effects['tenantpackage/fetchAddPackagePaperList'],
    addLoading: loading.effects['tenantpackage/bingPackage'],
  };
})
class AddPackageModal extends Component<AddPackageModalProps> {
  state = {
    visible: true,
    selectedPapers: [],
    errorMgs: '',
  };

  componentDidMount() {
    this.getPackageList({ pageIndex: 1 });
  }

  // 获取试卷包列表
  getPackageList = (params: any) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchAddPackagePaperList',
        payload: params,
      });
    }
  };

  // 成功提示框
  showSuccessModal = () => {
    const { selectedPapers } = this.state;
    const packageObj: any = selectedPapers[0];
    const cont = (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '70px',
            height: '70px',
            margin: '0 auto',
            color: '#fff',
            textAlign: 'center',
            background: '#03C46B',
            borderRadius: '35px',
          }}
        >
          <IconFont type="icon-right" style={{ fontSize: '32px', lineHeight: '70px' }} />
        </div>
        {/* 提示信息 */}
        <div
          style={{
            padding: '20px 0',
            color: '#333',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          <FormattedMessage
            values={{
              element: (
                <span style={{ padding: '0 5px', color: '#FF6E4A' }}>
                  {packageObj && packageObj.paperPackageName}
                </span>
              ),
            }}
            {...{
              id: 'operate.message.add.paper.package.success',
              defaultMessage: '成功添加{element}试卷包',
            }}
          />
        </div>
        <Button
          type="primary"
          onClick={() => {
            Modal.destroyAll();
            this.handleCancel();
          }}
          style={{
            margin: '0 auto',
            background: '#03C46B',
            boxShadow: '0px 2px 5px 0px rgba(3,196,107,0.5)',
            borderRadius: '18px',
          }}
        >
          {formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' })}
        </Button>
      </div>
    );
    confirm({
      title: '',
      content: cont,
      icon: null,
      centered: true,
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      okButtonProps: {
        style: {
          display: 'none',
        },
      },
    });
  };

  handleOk = async () => {
    // 校区绑定试卷包
    const { campusId, dispatch } = this.props;
    const { selectedPapers } = this.state;
    const packageObj: any = selectedPapers[0];
    const idList = [];
    idList.push(packageObj.id);
    const params = {
      campusId,
      initFlag: 'N',
      paperPackageList: idList,
    };
    if (dispatch) {
      const message = await dispatch({
        type: 'tenantpackage/bingPackage',
        payload: params,
      });
      if (message) {
        this.setState({ errorMgs: message });
      } else {
        this.showSuccessModal();
      }
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleAfterClose = () => {
    const { onClose, dispatch } = this.props;
    onClose();

    // 关闭弹窗时初始化数据
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/updateState',
        payload: {
          addPackagePaperData: {
            records: [],
            salesStatus: 'LAUNCHED',
            filterWord: '',
            areaCodeList: [],
            pageIndex: 1,
            pageSize: 10,
            total: 0, // 数目总条数
          },
        },
      });
    }
  };

  // 地区变更
  handleRegionChange = (value: string[]) => {
    // 单独处理 不限 选项
    const allObj = value.find(tag => tag.indexOf('all') !== -1);
    this.getPackageList({ areaCodeList: allObj ? [] : value, pageIndex: 1 });
  };

  // 模糊搜索
  handleSearch = (value: string) => {
    this.getPackageList({ filterWord: value, pageIndex: 1 });
  };

  // 页码变化
  handlePageChange = (page: number) => {
    this.getPackageList({ pageIndex: page });
  };

  handleClick = (item: any) => {
    // 单选
    const selectedList = [];
    selectedList.push(item);

    // 多选
    // const { selectedPapers } = this.state;
    // const selectedList = JSON.parse(JSON.stringify(selectedPapers));
    // const isHas = selectedList.find((tag: { id: any }) => tag.id === item.id);
    // if (isHas) {
    //   selectedList.forEach((el: { id: any }, idx: any) => {
    //     if (el.id === item.id) {
    //       selectedList.splice(idx, 1);
    //     }
    //   });
    // } else {
    //   selectedList.push(item);
    // }

    this.setState({
      selectedPapers: selectedList,
    });
  };

  render() {
    const { visible, selectedPapers, errorMgs } = this.state;
    const { records = [], total, pageIndex, areaCodeList, addLoading, loading } = this.props;

    const footer = (
      <div className={styles.modalFooter}>
        <div className={styles.left}>
          <span style={{ paddingRight: '8px' }}>
            {formatMessage(
              { id: 'operate.text.all.count', defaultMessage: '共 {dataCount} 条' },
              { dataCount: total },
            )}
          </span>
          <Pagination current={pageIndex} total={total} onChange={this.handlePageChange} />
        </div>
        <div className={styles.right}>
          <Button className={styles.cancel} onClick={this.handleCancel}>
            {formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' })}
          </Button>
          <Button
            type="primary"
            loading={addLoading}
            className={styles.ok}
            onClick={this.handleOk}
            disabled={selectedPapers.length === 0}
          >
            {formatMessage({ id: 'operate.text.confirm', defaultMessage: '确认' })}
          </Button>
        </div>
      </div>
    );

    return (
      <div className={styles.packageListContainer}>
        <Modal
          wrapClassName={styles.addPackageModal}
          title={formatMessage({
            id: 'operate.button.add.paper.package',
            defaultMessage: '添加试卷包',
          })}
          width={800}
          visible={visible}
          centered
          destroyOnClose
          maskClosable={false}
          onCancel={this.handleCancel}
          afterClose={this.handleAfterClose}
          footer={footer}
        >
          <div className={styles.modalContent}>
            {/* 顶部搜索 */}
            <div className={styles.topSortBox}>
              <div className={styles.left}>
                <Search
                  placeholder={formatMessage({
                    id: 'operate.placeholder.add.package',
                    defaultMessage: '请输入试卷包编号/名称搜索',
                  })}
                  onSearch={this.handleSearch}
                  style={{ width: 300 }}
                />
              </div>
              <div className={styles.right}>
                <div>
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'operate.title.paper.region',
                      defaultMessage: '适用地区',
                    })}
                  </span>
                  <RegionSelect
                    onChange={this.handleRegionChange}
                    width={176}
                    isQuery
                    value={areaCodeList}
                  />
                </div>
              </div>
            </div>
            {/* 列表 */}
            <div className={styles.listBox}>
              {records.length > 0 && (
                <div className={styles.listHeader}>
                  <div className={styles.serialNumber}>
                    {formatMessage({
                      id: 'operate.title.paper.serial.number',
                      defaultMessage: '编号',
                    })}
                  </div>
                  <div className={styles.paperName}>
                    {formatMessage({ id: 'operate.title.paper.name', defaultMessage: '名称' })}
                  </div>
                  <div className={styles.paperNumber}>
                    {formatMessage({ id: 'operate.title.paper.number', defaultMessage: '试卷数' })}
                  </div>
                </div>
              )}

              <div className={styles.list}>
                {records.map((tag: any) => {
                  const isSelected = selectedPapers.find((item: { id: any }) => item.id === tag.id);
                  return (
                    <div
                      className={classNames(styles.item, isSelected ? styles.selectedItem : null)}
                      key={tag.id}
                      onClick={() => this.handleClick(tag)}
                    >
                      <div className={styles.serialNumber}>{tag.code}</div>
                      <div className={styles.paperName}>{tag.paperPackageName}</div>
                      <div className={styles.paperNumber}>{tag.paperCount}</div>
                    </div>
                  );
                })}
              </div>
              {!loading && records.length === 0 && (
                <div className={styles.noData}>
                  <img src={noDataIcon} alt="noDataIcon" />
                </div>
              )}
            </div>
            {/* 错误信息 */}
            <div className={styles.errTip}>{errorMgs}</div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default AddPackageModal;

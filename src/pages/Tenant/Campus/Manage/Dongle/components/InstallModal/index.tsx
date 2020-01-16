import React from 'react';
import { Modal, List, Tabs, Button, message, Empty, Tooltip } from 'antd';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import Search from '@/components/Search';
import IconFont from '@/components/IconFont';

import noneSoftdog from '../../../../asset/none_softdog.png';
import styles from './index.less';

const { TabPane } = Tabs;
const { success } = Modal;

interface InstallModalProps {
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  hideModal?: any;
  reload?: any;
  key?: any;
  channelList?: any;
  dongleList?: any;
  packageList?: any;
  visible: boolean;
  loading?: boolean;
  loadingDongLe?: boolean;
  TENANT_AUTHORIZE_MODE?: ConnectState['dictionary']['TENANT_AUTHORIZE_MODE'];
  DONGLE_CUSTOMER_TYPE?: ConnectState['dictionary']['DONGLE_CUSTOMER_TYPE'];
}

@connect(({ campus, loading, dictionary }: ConnectState) => {
  const { TENANT_AUTHORIZE_MODE = [], DONGLE_CUSTOMER_TYPE = [] } = dictionary;
  const {
    detail, // 当期页数据
    channelList, // 渠道商列表
    dongleList, // 加密狗列表
    packageList, // 试卷包列表
  } = campus;
  return {
    TENANT_AUTHORIZE_MODE, // 授权方式
    DONGLE_CUSTOMER_TYPE, // 客户类型
    detail,
    channelList,
    dongleList,
    packageList,
    loading: loading.effects['campus/editCampusInfo'],
    loadingDongLe: loading.effects['campus/bindDongLeInfo'],
  };
})
class InstallModal extends React.Component<InstallModalProps> {
  state = {
    checkChannelID: '', // 选择的渠道商ID
    checkDongle: [], // 副狗
    checkMainDongle: [], // 主狗
    filterWords: '',
  };

  componentWillMount() {
    const { dispatch } = this.props;

    if (dispatch) {
      dispatch({
        type: 'campus/getChannelList',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          filterWord: '',
        },
      });
    }
  }

  hideModal = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/initShow',
      });
    }
    this.setState({
      checkChannelID: '', // 选择的渠道商ID
      checkDongle: [], // 副狗
      checkMainDongle: [], // 主狗
      filterWords: '',
    });
  };

  // 获取加密狗列表信息
  getDongLe = (filterWords: any, id: any) => {
    this.setState({
      filterWords,
    });

    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/getdongleList',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          channelVendorId: id,
          filterWord: filterWords,
          dongleStatus: 'DISTRIBUTED',
        },
      });
    }
  };

  // 选择渠道商
  checkChannel = (id: any) => {
    this.setState({
      checkChannelID: id,
    });
    this.getDongLe('', id);
  };

  // 搜索加密狗
  searchDongLe = (value: any) => {
    const { checkChannelID } = this.state;
    if (checkChannelID) {
      this.getDongLe(value, checkChannelID);
    } else {
      message.warning(
        formatMessage({
          id: 'operate.message.pleaseSelectTheCorrespondingDistributorsToSearch',
          defaultMessage: '请选择相应的渠道商进行搜索',
        }),
      );
    }
  };

  // 添加主狗
  checkMainDongle = (item: any) => {
    const check = [];
    const { checkMainDongle } = this.state;
    check.push(item);
    this.setState({
      checkMainDongle:
        checkMainDongle.length > 0 &&
        checkMainDongle.filter((vo: { id: any }) => vo.id === item.id).length > 0
          ? []
          : check,
    });
  };

  // 添加副狗
  checkDongle = (item: any) => {
    const { checkDongle } = this.state;
    const check = checkDongle.filter((vo: any) => vo.id !== item.id);
    const dongleInfo: {
      channelVendorId: any;
      dongleType: any;
      driveId: any;
      id: any;
      distributorId: any;
      sn: any;
    }[] = [];

    dongleInfo.push({
      channelVendorId: item.distributorId,
      dongleType: item.dongleType,
      driveId: item.driveId,
      id: item.id,
      distributorId: item.distributorId,
      sn: item.sn,
    });
    const newArr = [...checkDongle, ...dongleInfo];

    this.setState({
      checkDongle: checkDongle.filter((vo: any) => vo.id === item.id).length > 0 ? check : newArr,
    });
  };

  // 保存加密狗数据
  saveDongLe = () => {
    const { dispatch, detail, hideModal, reload } = this.props;
    // const that = this;
    const { checkMainDongle, checkDongle } = this.state;
    const newData = [...checkMainDongle, ...checkDongle];

    const dongleInfo: { channelVendorId: any; dongleType: any; driveId: any }[] = [];
    newData.forEach((vo: any) => {
      dongleInfo.push({
        channelVendorId: vo.distributorId,
        dongleType: vo.dongleType,
        driveId: vo.driveId,
      });
    });

    const tips = (
      <FormattedMessage
        values={{
          value1: <span className={styles.green}>{checkMainDongle.length}</span>,
          value2: <span className={styles.green}>{checkDongle.length}</span>,
        }}
        {...{
          id: 'operate.text.aSuccessfulBindingvalue1OfPrincipalDogvalue2APairOfDogs',
          defaultMessage: '成功绑定{value1}个主狗，{value2}个副狗',
        }}
      />
    );
    if (dispatch) {
      dispatch({
        type: 'campus/bindDongLeInfo',
        payload: {
          campusId: detail.id,
          dongleInfo,
          // initFlag: 'Y',
        },
        callback: (res: string) => {
          if (res === 'SUCCESS') {
            hideModal();
            reload();
            success({
              content: (
                <div>
                  <div className={styles.successconent}>
                    <div className={styles.right}>
                      <IconFont type="icon-right" />
                    </div>
                  </div>
                  <div className={styles.successtitle}>{tips}</div>
                  {newData.map((item: any) => (
                    <div className={styles.itemcontent}>
                      <div className={styles.sn}>
                        {item && item.dongleType === 'MAIN_DONGLE' ? (
                          <div className={styles.right_tips}>
                            {formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })}
                          </div>
                        ) : (
                          <div className={styles.v_tips}>
                            {formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
                          </div>
                        )}
                        {item.sn}
                      </div>
                    </div>
                  ))}
                </div>
              ),
              centered: true,
              icon: false,
              className: styles.StorageModal,
              okText: formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' }),
              okButtonProps: {
                shape: 'round',
              },
              onOk() {},
              onCancel() {},
            });
          }
        },
      });
    }
  };

  // 空数据
  renderEmpty = () => {
    const { dongleList } = this.props;
    const { filterWords, checkChannelID } = this.state;
    console.log(filterWords, checkChannelID);
    if (checkChannelID === '') {
      return (
        <Empty
          image={noneSoftdog}
          description={
            <span>
              {formatMessage({ id: 'operate.text.noEncryptionDog', defaultMessage: '暂无加密狗' })}
              <br />
              {formatMessage({
                id: 'operate.text.pleaseChooseTheLeftSideOfTheChannelOh',
                defaultMessage: '请先选择左侧渠道商哦',
              })}
            </span>
          }
        />
      );
    }
    if (filterWords !== '') {
      return (
        dongleList &&
        dongleList.records &&
        dongleList.records.length === 0 &&
        filterWords !== '' && <Empty image={noneSoftdog} description="未搜到该加密狗" />
      );
    }
    return (
      dongleList &&
      dongleList.records &&
      dongleList.records.length === 0 &&
      filterWords === '' && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  render() {
    const { visible, channelList, dongleList, loadingDongLe, detail } = this.props;
    const { checkChannelID, checkMainDongle, checkDongle } = this.state;
    return (
      <Modal
        visible={visible}
        title={formatMessage({
          id: 'operate.text.bindingEncryptionDog',
          defaultMessage: '绑定加密狗',
        })}
        maskClosable={false}
        width={800}
        okText={formatMessage({ id: 'operate.text.confirm', defaultMessage: '确认' })}
        onCancel={() => this.props.hideModal()}
        onOk={this.hideModal}
        className={styles.InstallModal}
        okButtonProps={{ disabled: false }}
      >
        <div className={styles.step2}>
          <div className={styles.secondMain}>
            <div className={styles.secondLeft}>
              <h1>
                {formatMessage({
                  id: 'operate.text.pleaseSelectAChannel',
                  defaultMessage: '请选择渠道商',
                })}
              </h1>
              {channelList && (
                <List
                  dataSource={channelList.records}
                  className={styles.channel}
                  renderItem={(item: any) => (
                    <List.Item
                      onClick={() => this.checkChannel(item.id)}
                      className={checkChannelID === item.id ? styles.checked : {}}
                    >
                      <Tooltip title={item.name} className={styles.news}>
                        {item.name}
                      </Tooltip>
                    </List.Item>
                  )}
                />
              )}
            </div>

            <div className={styles.secondRight}>
              <Search
                width={320}
                maxLength={30}
                placeholder={formatMessage({
                  id: 'operate.text.pleaseEnterASearchOfSn',
                  defaultMessage: '请输入SN搜索',
                })}
                onSearch={(value: string) => this.searchDongLe(value)}
              />
              <div className={styles.checkDongList}>
                <div className={styles.checkRight}>
                  {formatMessage({ id: 'operate.text.theDog', defaultMessage: '主狗' })}:
                  <span>
                    {checkMainDongle.length > 0
                      ? formatMessage({ id: 'operate.text.theSelected', defaultMessage: '已选' })
                      : 0}
                  </span>
                  &nbsp;&nbsp;&nbsp;
                  {detail.tenantAuthorizeMode !== 'VOL'
                    ? `${formatMessage({ id: 'operate.text.aDog', defaultMessage: '副狗' })}:`
                    : ''}
                  {detail.tenantAuthorizeMode !== 'VOL' && <span>{checkDongle.length}</span>}
                </div>
                <Tabs defaultActiveKey="1">
                  <TabPane
                    tab={formatMessage({ id: 'operate.text.theDog', defaultMessage: '主狗' })}
                    key="1"
                  >
                    {dongleList &&
                      dongleList.records &&
                      dongleList.records.length > 0 &&
                      checkChannelID !== '' && (
                        <List
                          dataSource={dongleList.records.filter(
                            (vo: any) => vo.dongleType === 'MAIN_DONGLE',
                          )}
                          className={styles.dongle}
                          renderItem={(item: any) => (
                            <List.Item
                              onClick={() => this.checkMainDongle(item)}
                              className={
                                checkMainDongle.length > 0 &&
                                checkMainDongle.filter((vo: any) => vo.id === item.id).length > 0
                                  ? styles.checked
                                  : styles.mainDong
                              }
                            >
                              {item.sn} <IconFont type="icon-right" />
                            </List.Item>
                          )}
                        />
                      )}
                    {this.renderEmpty()}
                  </TabPane>
                  {detail.tenantAuthorizeMode !== 'VOL' && (
                    <TabPane
                      tab={formatMessage({ id: 'operate.text.aDog', defaultMessage: '副狗' })}
                      key="2"
                    >
                      {dongleList &&
                        dongleList.records &&
                        dongleList.records.length > 0 &&
                        checkChannelID !== '' && (
                          <List
                            dataSource={dongleList.records.filter(
                              (vo: any) => vo.dongleType !== 'MAIN_DONGLE',
                            )}
                            className={styles.dongle}
                            renderItem={(item: any) => (
                              <List.Item
                                onClick={() => this.checkDongle(item)}
                                className={
                                  checkDongle &&
                                  checkDongle.filter((vo: any) => vo.id === item.id).length > 0
                                    ? styles.checked
                                    : styles.mainDong
                                }
                              >
                                {item.sn}
                                <IconFont type="icon-right" />
                              </List.Item>
                            )}
                          />
                        )}
                      {this.renderEmpty()}
                    </TabPane>
                  )}
                </Tabs>
              </div>
            </div>
          </div>

          <div className={styles.footerBtn}>
            <Button shape="round" onClick={() => this.props.hideModal()}>
              {formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' })}
            </Button>
            <Button
              type="primary"
              shape="round"
              onClick={this.saveDongLe}
              disabled={
                loadingDongLe ||
                detail.tenantAuthorizeMode === 'NONE' ||
                (checkMainDongle.length === 0 && checkDongle.length === 0)
              }
            >
              {formatMessage({ id: 'operate.text.confirm', defaultMessage: '确认' })}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
export default InstallModal;

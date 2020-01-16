import React from 'react';
import { Modal, Steps, List, Tabs, Button, message, Empty, Tooltip } from 'antd';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import Search from '@/components/Search';
import IconFont from '@/components/IconFont';
import RegionSelect from '@/components/RegionSelect';
import custom from '../../asset/custom.png';
import step from '../../asset/step.png';
import customer from '../../asset/customer.png';
import auth from '../../asset/auth.png';
import author from '../../asset/author.png';
import pro from '../../asset/pro.png';
import noneSoftdog from '../../asset/none_softdog.png';
import styles from './index.less';

const { Step } = Steps;
const { TabPane } = Tabs;

interface InstallModalProps {
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  areaCode?: any;
  channelList?: any;
  dongleList?: any;
  packageList?: any;
  visible: boolean;
  loading?: boolean;
  loadingDongLe?: boolean;
  loadingChannel?: boolean;
  loadingDongLeList?: boolean;
  loadingPaperList?: boolean;
  loadingBindPaper?: boolean;
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
    pageData: { areaCode }, // 当期页数据
  } = campus;
  return {
    TENANT_AUTHORIZE_MODE, // 授权方式
    DONGLE_CUSTOMER_TYPE, // 客户类型
    detail,
    areaCode,
    channelList,
    dongleList,
    packageList,
    loading: loading.effects['campus/editCampusInfo'],
    loadingChannel: loading.effects['campus/getChannelList'],
    loadingDongLe: loading.effects['campus/bindDongLeInfo'],
    loadingDongLeList: loading.effects['campus/getdongleList'],
    loadingPaperList: loading.effects['campus/getPackageLists'],
    loadingBindPaper: loading.effects['campus/bindPaper'],
  };
})
class InstallModal extends React.Component<InstallModalProps> {
  state = {
    current: 0,
    customerType: '',
    accreditType: '',
    checkChannelID: '', // 选择的渠道商ID
    checkDongle: [], // 副狗
    checkMainDongle: [], // 主狗
    filterWords: '',
    checkPaperID: [],
    filterWordPaper: '',
    areaCodeList: [],
    subAuthType: '', // 子授权方式
  };

  componentWillMount() {
    // 判断当前初始化的步骤
    const { detail, dispatch } = this.props;
    const that = this;
    this.setState({
      customerType: detail.customerType,
      accreditType: detail.tenantAuthorizeMode,
      subAuthType: detail.subAuthType,
    });
    if (detail.initFlag === 'D' || detail.initFlag === 'P') {
      // 调401 获取加密狗信息列表
      if (dispatch) {
        dispatch({
          type: 'campus/getdongleList',
          payload: {
            pageIndex: 1,
            pageSize: 10000,
            campusId: detail.id,
          },
          callback: (data: {
            records: {
              filter: {
                (arg0: (vo: { dongleType: string }) => boolean): void;
                (arg0: (vo: { dongleType: string }) => boolean): void;
              };
            };
          }) => {
            if (detail.initFlag === 'D') {
              that.getPaperPageList();
            }

            that.setState({
              checkMainDongle: data.records.filter(
                (vo: { dongleType: string }) => vo.dongleType === 'MAIN_DONGLE',
              ),
              checkDongle: data.records.filter(
                (vo: { dongleType: string }) => vo.dongleType !== 'MAIN_DONGLE',
              ),
            });
          },
        });
      }
    }
    if (detail.initFlag === 'D') {
      this.setState({
        current: 2,
      });
    }
    if (detail.initFlag === 'P') {
      this.setState({
        current: 3,
      });
      if (dispatch) {
        dispatch({
          type: 'campus/getPackageLists',
          payload: {
            pageIndex: 1,
            pageSize: 10000,
            filterWord: '',
            salesStatus: 'LAUNCHED',
          },
          callback: () => {
            // 获取试卷包授权信息列表
            dispatch({
              type: 'campus/getAuthPaperList',
              payload: {
                pageIndex: 1,
                pageSize: 10000,
                campusId: detail.id,
              },
              callback: (data: {
                records: { forEach: (arg0: (vo: { paperPackageId: any }) => void) => void };
              }) => {
                const check: any[] | never[] = [''];
                data.records.forEach((vo: { paperPackageId: any }) => {
                  check.push(vo.paperPackageId);
                });
                that.setState({
                  checkPaperID: check.filter(vo => vo !== ''),
                });
              },
            });
          },
        });
      }
    }
  }

  hideModal = () => {
    const { dispatch, detail, areaCode } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/initShow',
      });
      dispatch({
        type: 'campus/CampusDetailInfo',
        payload: {
          campusId: detail.id,
        },
      });

      dispatch({
        type: 'campus/fetchCampus',
        payload: {
          pageIndex: 1,
          pageSize: 20,
          areaCode,
        },
      });
    }

    this.setState({
      current: 0,
      customerType: '',
      accreditType: '',
      checkChannelID: '', // 选择的渠道商ID
      checkDongle: [], // 副狗
      checkMainDongle: [], // 主狗
      filterWords: '',
      checkPaperID: [],
      filterWordPaper: '',
      areaCodeList: [],
    });
  };

  onChange = (current: any) => {
    this.setState({ current });
  };

  // 地区选择
  handleRegionChange = (value: string[]) => {
    const { filterWordPaper } = this.state;
    console.log(value);
    this.setState({
      areaCodeList: value,
    });
    this.getPaperList(filterWordPaper, value[value.length - 1]);
  };

  // 保存客户类型
  saveCustomer = (value: any) => {
    this.setState({
      customerType: value,
    });
  };

  // 保存授权方式
  saveAuthor = (value: any, subAuthType: any) => {
    this.setState({
      accreditType: value,
      subAuthType,
    });
  };

  // 保存第一步数据
  saveFirst = () => {
    const { dispatch, detail } = this.props;
    const { customerType, accreditType, subAuthType } = this.state;
    const that = this;
    if (dispatch) {
      if (customerType === '') {
        message.warning(
          formatMessage({
            id: 'operate.message.pleaseSelectTheCustomerType',
            defaultMessage: '请选择客户类型',
          }),
        );
      } else if (accreditType === '') {
        message.warning(
          formatMessage({
            id: 'operate.message.pleaseSelectALicensing',
            defaultMessage: '请选择授权方式',
          }),
        );
      } else {
        dispatch({
          type: 'campus/editCampusInfo',
          payload: {
            campusId: detail.id,
            customerType,
            accreditType,
            subAuthType,
            address: detail.address,
            areaCode: detail.areaCode,
            campusName: detail.name,
          },
          callback: () => {
            that.getChannel();
          },
        });
      }
    }
  };

  // 获取渠道商列表
  getChannel = () => {
    const { dispatch } = this.props;
    const that = this;
    if (dispatch) {
      dispatch({
        type: 'campus/getChannelList',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          filterWord: '',
        },
        callback: () => {
          that.setState({
            current: 1,
          });
        },
      });
    }
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
  checkMainDongle = (item: { id: any }) => {
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
  checkDongle = (item: { distributorId: any; dongleType: any; driveId: any; id: any; sn: any }) => {
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
    const { dispatch, detail } = this.props;
    const that = this;
    const { checkMainDongle, checkDongle, accreditType } = this.state;
    if (accreditType !== 'VOL' && checkDongle.length === 0) {
      message.warning(
        formatMessage({
          id: 'operate.message.theBindingAtLeastOnePairOfDogs',
          defaultMessage: '至少绑定一个副狗',
        }),
      );
      return;
    }
    if (accreditType !== 'VOL' && checkMainDongle.length === 0) {
      message.warning(
        formatMessage({
          id: 'operate.message.atLeastOneBoundTheDog',
          defaultMessage: '至少绑定一个主狗',
        }),
      );
      return;
    }
    const newData = [...checkMainDongle, ...checkDongle];
    const dongleInfo: { channelVendorId: any; dongleType: any; driveId: any }[] = [];
    newData.forEach((vo: any) => {
      dongleInfo.push({
        channelVendorId: vo.distributorId,
        dongleType: vo.dongleType,
        driveId: vo.driveId,
      });
    });
    if (dispatch) {
      dispatch({
        type: 'campus/bindDongLeInfo',
        payload: {
          campusId: detail.id,
          dongleInfo,
          initFlag: 'Y',
        },
        callback: () => {
          that.setState({
            current: 2,
          });
          that.getPaperPageList();
        },
      });
    }
  };

  // 获取试卷包列表
  getPaperPageList = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/getPackageLists',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          filterWord: '',
          salesStatus: 'LAUNCHED',
        },
      });
    }
  };

  // 空数据
  renderEmpty = () => {
    const { dongleList, loadingDongLeList } = this.props;
    const { filterWords, checkChannelID } = this.state;

    if (checkChannelID === '') {
      return (
        !loadingDongLeList && (
          <Empty
            image={noneSoftdog}
            description={
              <span>
                {formatMessage({
                  id: 'operate.text.noEncryptionDog',
                  defaultMessage: '暂无加密狗',
                })}
                <br />
                {formatMessage({
                  id: 'operate.text.pleaseChooseTheLeftSideOfTheChannelOh',
                  defaultMessage: '请先选择左侧渠道商哦',
                })}
              </span>
            }
          />
        )
      );
    }
    if (filterWords !== '') {
      return (
        dongleList &&
        dongleList.records &&
        dongleList.records.length === 0 &&
        filterWords !== '' && (
          <Empty
            image={noneSoftdog}
            description={formatMessage({
              id: 'operate.message.noSearchToTheEncryptionDog',
              defaultMessage: '未搜到该加密狗',
            })}
          />
        )
      );
    }
    return (
      dongleList &&
      dongleList.records &&
      dongleList.records.length === 0 &&
      filterWords === '' &&
      !loadingDongLeList && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  // 选择试卷
  selectPaper = (id: any) => {
    const check = [];
    const { checkPaperID } = this.state;
    check.push(id);

    this.setState({
      checkPaperID:
        checkPaperID.length > 0 && checkPaperID.filter((vo: { id: any }) => vo === id).length > 0
          ? []
          : check,
    });
  };

  matchValue = (key: any, data: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    return text;
  };

  matchValueType = (key: any, data: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    const { detail } = this.props;
    if (key === 'RETAIL' && detail.subAuthType === 'STANDARD') {
      text = formatMessage({
        id: 'operate.message.roomTheStandardVersion',
        defaultMessage: '机房-标准版',
      });
    }
    if (key === 'RETAIL' && detail.subAuthType === 'PROFESSIONAL') {
      text = formatMessage({
        id: 'operate.message.roomProfessionalEdition',
        defaultMessage: '机房-专业版',
      });
    }
    return text;
  };

  // 获取试卷包列表
  getPaperList = (filterWordPaper: any, areaCodeList: any) => {
    this.setState({
      filterWordPaper,
    });
    const { dispatch } = this.props;

    const params = {
      pageIndex: 1,
      pageSize: 10000,
      filterWord: filterWordPaper,
      areaCodeList: areaCodeList === 'all' ? '' : areaCodeList,
      salesStatus: 'LAUNCHED',
    };
    if (areaCodeList === 'all') {
      delete params.areaCodeList;
    }
    if (dispatch) {
      dispatch({
        type: 'campus/getPackageLists',
        payload: params,
      });
    }
  };

  searchPaper = (value: any) => {
    const { areaCodeList } = this.state;
    this.getPaperList(value, areaCodeList);
  };

  // 完成
  competeStep = () => {
    const { checkPaperID } = this.state;
    const that = this;
    if (checkPaperID.length === 0) {
      this.setState({
        current: 3,
      });
    } else {
      // 保存数据
      const { dispatch, detail } = this.props;
      if (dispatch) {
        dispatch({
          type: 'campus/bindPaper',
          payload: {
            campusId: detail.id,
            paperPackageList: checkPaperID,
            initFlag: 'Y',
          },
          callback: () => {
            that.setState({
              current: 3,
            });
          },
        });
      }
    }
  };

  chanegStep = () => {
    this.setState({
      current: 2,
    });
  };

  competeStepNo = () => {
    this.setState({
      current: 3,
      checkPaperID: [],
    });
  };

  render() {
    const {
      visible,
      TENANT_AUTHORIZE_MODE,
      DONGLE_CUSTOMER_TYPE,
      channelList,
      dongleList,
      loading,
      loadingDongLe,
      loadingChannel,
      packageList,
      loadingDongLeList,
      loadingPaperList,
      loadingBindPaper,
    } = this.props;
    const {
      current,
      checkPaperID,
      accreditType,
      customerType,
      checkChannelID,
      checkMainDongle,
      checkDongle,
      subAuthType,
      areaCodeList,
    } = this.state;
    return (
      <Modal
        visible={visible}
        title={formatMessage({
          id: 'operate.message.installTheInitialization',
          defaultMessage: '安装初始化',
        })}
        maskClosable={false}
        width={800}
        okText={formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' })}
        onCancel={this.hideModal}
        onOk={this.hideModal}
        className={styles.InstallModal}
        okButtonProps={{ disabled: false }}
      >
        <Steps current={current} size="small">
          <Step
            title={formatMessage({
              id: 'operate.message.campusInformation',
              defaultMessage: '校区信息',
            })}
          />
          <Step
            title={formatMessage({
              id: 'operate.text.bindingEncryptionDog',
              defaultMessage: '绑定加密狗',
            })}
          />
          <Step
            title={formatMessage({
              id: 'operate.message.bindingPaperBag',
              defaultMessage: '绑定试卷包',
            })}
          />
        </Steps>
        {current === 0 && (
          <div className={styles.step1}>
            <div className={styles.customType}>
              <h1>
                {formatMessage({
                  id: 'operate.message.pleaseSelectTheCustomerType',
                  defaultMessage: '请选择客户类型',
                })}
              </h1>
              <ul>
                {DONGLE_CUSTOMER_TYPE
                  ? DONGLE_CUSTOMER_TYPE.map((vo, index) => (
                      <li
                        onClick={() => this.saveCustomer(vo.code)}
                        className={customerType === vo.code ? styles.select : {}}
                      >
                        <img src={index ? customer : custom} alt="" />
                        {vo.value}
                      </li>
                    ))
                  : ''}
              </ul>
              <h1>
                {formatMessage({
                  id: 'operate.message.pleaseSelectALicensing',
                  defaultMessage: '请选择授权方式',
                })}
              </h1>
              <ul>
                <li
                  onClick={() => this.saveAuthor('RETAIL', 'STANDARD')}
                  className={
                    accreditType === 'RETAIL' && subAuthType === 'STANDARD' ? styles.select : {}
                  }
                >
                  <img src={author} alt="" />
                  {formatMessage({
                    id: 'operate.message.roomTheStandardVersion',
                    defaultMessage: '机房-标准版',
                  })}
                </li>
                {TENANT_AUTHORIZE_MODE
                  ? TENANT_AUTHORIZE_MODE.map((vo, index) => (
                      <li
                        onClick={() =>
                          this.saveAuthor(vo.code, vo.code === 'RETAIL' ? 'PROFESSIONAL' : 'NONE')
                        }
                        className={
                          (accreditType === vo.code && subAuthType === 'NONE') ||
                          (vo.code === 'RETAIL' && subAuthType === 'PROFESSIONAL')
                            ? styles.select
                            : {}
                        }
                      >
                        <img src={index ? auth : pro} alt="" />
                        {vo.code === 'RETAIL'
                          ? formatMessage({
                              id: 'operate.message.roomProfessionalEdition',
                              defaultMessage: '机房-专业版',
                            })
                          : vo.value}
                      </li>
                    ))
                  : ''}
              </ul>
            </div>
            <div className={styles.footerBtn}>
              <Button
                type="primary"
                shape="round"
                onClick={this.saveFirst}
                disabled={!(customerType !== 'NONE' && accreditType !== 'NONE') || loading}
              >
                {formatMessage({
                  id: 'operate.text.find.pw.box.next.btn.title',
                  defaultMessage: '下一步',
                })}
              </Button>
            </div>
          </div>
        )}
        {current === 1 && (
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
                    loading={loadingChannel}
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
                  maxLength={100}
                  placeholder={formatMessage({
                    id: 'operate.text.pleaseEnterASearchOfSn',
                    defaultMessage: '请输入SN搜索',
                  })}
                  onSearch={(value: string) => this.searchDongLe(value)}
                />
                <div className={styles.checkDongList}>
                  <div className={styles.checkRight}>
                    {formatMessage({ id: 'operate.message.theDog', defaultMessage: '主狗:' })}
                    <span>
                      {checkMainDongle.length > 0
                        ? formatMessage({ id: 'operate.text.theSelected', defaultMessage: '已选' })
                        : 0}
                    </span>
                    &nbsp;&nbsp;&nbsp;
                    {accreditType !== 'VOL'
                      ? formatMessage({ id: 'operate.message.Dog', defaultMessage: '副狗:' })
                      : ''}
                    {accreditType !== 'VOL' && <span>{checkDongle.length}</span>}
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
                            loading={loadingDongLeList}
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
                    {accreditType !== 'VOL' && (
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
                              loading={loadingDongLeList}
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
              <Button shape="round" onClick={() => this.onChange(0)}>
                {formatMessage({ id: 'operate.message.thePreviousStep', defaultMessage: '上一步' })}
              </Button>
              <Button
                type="primary"
                shape="round"
                onClick={this.saveDongLe}
                disabled={
                  (accreditType !== 'VOL'
                    ? checkDongle.length === 0 && checkMainDongle.length === 0
                    : checkMainDongle.length === 0) || loadingDongLe
                }
              >
                {formatMessage({
                  id: 'operate.text.find.pw.box.next.btn.title',
                  defaultMessage: '下一步',
                })}
              </Button>
            </div>
          </div>
        )}
        {current === 2 && (
          <div className={styles.step3}>
            <div className={styles.searchTop}>
              <Search
                width={320}
                maxLength={100}
                placeholder={formatMessage({
                  id: 'operate.placeholder.add.package',
                  defaultMessage: '请输入试卷包编号/名称搜索',
                })}
                onSearch={(value: string) => this.searchPaper(value)}
              />
              {formatMessage({ id: 'operate.message.region', defaultMessage: '地区' })}
              &nbsp;&nbsp;&nbsp;
              <RegionSelect
                onChange={this.handleRegionChange}
                width={176}
                isQuery
                defaultValue={areaCodeList}
                value={areaCodeList}
              />
            </div>
            <div className={styles.paperTitle}>
              <div className={styles.paperNumber}>
                {formatMessage({ id: 'operate.title.paper.serial.number', defaultMessage: '编号' })}
              </div>
              <div className={styles.paperName}>
                {formatMessage({ id: 'operate.title.paper.name', defaultMessage: '名称' })}
              </div>
              <div className={styles.paperCount}>
                {formatMessage({ id: 'operate.title.paper.number', defaultMessage: '试卷数' })}
              </div>
            </div>
            <div className={styles.paperListInfo}>
              {packageList && (
                <List
                  dataSource={packageList.records}
                  className={styles.paperList}
                  loading={loadingPaperList}
                  renderItem={(item: any) => (
                    <List.Item
                      className={checkPaperID[0] === item.id ? styles.select : {}}
                      onClick={() => this.selectPaper(item.id)}
                    >
                      <div className={styles.paperDetail}>
                        <div className={styles.paperNumber}>{item.code}</div>
                        <div className={styles.paperName}>
                          <Tooltip title={item.paperPackageName}>{item.paperPackageName}</Tooltip>
                        </div>
                        <div className={styles.paperCount}>{item.paperCount}</div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
            <div className={styles.footerBtn}>
              <Button shape="round" onClick={this.competeStepNo}>
                {formatMessage({
                  id: 'operate.message.skipThisStepAndSave',
                  defaultMessage: '跳过此步骤，并保存',
                })}
              </Button>
              <Button
                type="primary"
                shape="round"
                onClick={this.competeStep}
                disabled={checkPaperID.length === 0 || loadingBindPaper}
              >
                {formatMessage({ id: 'operate.text.find.pw.box.step3', defaultMessage: '完成' })}
              </Button>
            </div>
          </div>
        )}
        {current === 3 && (
          <div className={styles.step4}>
            <div className={styles.maxHeight}>
              <div className={styles.customType}>
                <h1>
                  {formatMessage({
                    id: 'operate.message.campusInformation',
                    defaultMessage: '校区信息',
                  })}
                </h1>
                <ul className={styles.campusInfo}>
                  <li className={styles.select}>
                    <img src={customerType === 'DCT_1' ? custom : customer} alt="" />
                    {this.matchValue(customerType, DONGLE_CUSTOMER_TYPE)}
                  </li>
                  <li>
                    <img src={accreditType === 'RETAIL' ? author : auth} alt="" />
                    {this.matchValueType(accreditType, TENANT_AUTHORIZE_MODE)}
                  </li>
                </ul>
              </div>
              <div className={styles.customType}>
                <h1>
                  {formatMessage({
                    id: 'operate.text.bindingEncryptionDog',
                    defaultMessage: '绑定加密狗',
                  })}
                </h1>
                {checkMainDongle.length > 0 && (
                  <List
                    dataSource={checkMainDongle}
                    className={styles.secret}
                    renderItem={(item: { sn: any }) => (
                      <List.Item>
                        <span className={styles.icon}>
                          {formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })}
                        </span>
                        {item.sn}
                      </List.Item>
                    )}
                  />
                )}
                {checkDongle.length > 0 && (
                  <List
                    dataSource={checkDongle}
                    className={styles.secret}
                    renderItem={(item: { sn: any }) => (
                      <List.Item>
                        <span className={styles.iconNo}>
                          {formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
                        </span>
                        {item.sn}
                      </List.Item>
                    )}
                  />
                )}
              </div>
              {checkPaperID.length > 0 && (
                <div className={styles.customType}>
                  <h1>
                    {formatMessage({
                      id: 'operate.message.bindingPaperBag',
                      defaultMessage: '绑定试卷包',
                    })}
                  </h1>
                  <List
                    dataSource={packageList.records.filter(
                      (vo: { id: any }) => vo.id === checkPaperID[0],
                    )}
                    className={styles.paperList}
                    renderItem={(item: any) => (
                      <List.Item>
                        <p className={styles.paperName}>
                          <Tooltip title={item.paperPackageName}>{item.paperPackageName}</Tooltip>
                        </p>
                        <div className={styles.paperDetail}>
                          {formatMessage({ id: 'operate.message.no', defaultMessage: '编号：' })}
                          <span>{item.code}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                          {formatMessage({
                            id: 'operate.title.paper.number',
                            defaultMessage: '试卷数',
                          })}
                          ：<span>{item.paperCount}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )}
              {checkPaperID.length === 0 && (
                <div className={styles.noPaper}>
                  <h1>
                    {formatMessage({
                      id: 'operate.message.bindingPaperBag',
                      defaultMessage: '绑定试卷包',
                    })}
                    <span onClick={this.chanegStep}>
                      {formatMessage({
                        id: 'operate.message.continueToOperate',
                        defaultMessage: '继续操作',
                      })}
                    </span>
                  </h1>
                  <img src={step} alt="" />
                </div>
              )}
            </div>
            <div className={styles.footerBtn}>
              <Button type="primary" shape="round" onClick={this.hideModal}>
                {formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' })}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}
export default InstallModal;

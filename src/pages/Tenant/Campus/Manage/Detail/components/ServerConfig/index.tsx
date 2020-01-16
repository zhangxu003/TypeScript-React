import React, { Component } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import moment from 'moment';
import { Dispatch, AnyAction } from 'redux';
import { DatePicker, Button, Modal, message, List } from 'antd';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';

const { confirm } = Modal;

interface CampusDetailProps {
  TENANT_AUTHORIZE_MODE?: any; // 授权方式
  DONGLE_CUSTOMER_TYPE?: any; // 客户类型
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  dongleList?: any;
  loading?: any;
}
@connect(({ campus, dictionary, loading }: ConnectState) => {
  const {
    detail, // 详情
    dongleList,
  } = campus;
  const { TENANT_AUTHORIZE_MODE, DONGLE_CUSTOMER_TYPE } = dictionary;
  return {
    detail,
    dongleList,
    TENANT_AUTHORIZE_MODE, // 授权方式
    DONGLE_CUSTOMER_TYPE, // 客户类型
    loading: loading.effects['campus/updateDongDate'],
  };
})
class ServerConfig extends Component<CampusDetailProps> {
  state = {
    invalidTime: '',
    visible: false,
    dongList: [],
  };

  componentWillMount() {
    this.getCampusDong();
  }

  // 获取加密狗列表
  getCampusDong = () => {
    const { detail, dispatch } = this.props;
    const that = this;
    if (dispatch) {
      dispatch({
        type: 'campus/getdongleList',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          campusId: detail.id,
          dongleType: 'MAIN_DONGLE',
        },
        callback: (data: { records: { expired: any }[] }) => {
          if (
            data.records.filter(
              (vo: any) =>
                vo.status === 'BINDED' || vo.status === 'ACTIVATED' || vo.status === 'EXPIRED',
            ).length > 0
          ) {
            that.setState({
              invalidTime: data.records.filter(
                (vo: any) =>
                  vo.status === 'BINDED' || vo.status === 'ACTIVATED' || vo.status === 'EXPIRED',
              )[0].expired,
            });
          }
        },
      });
    }
  };

  matchValueType = (key: any, data: any) => {
    let text = '';
    data.forEach((element: any) => {
      if (element.code === key) {
        text = element.value;
      }
    });
    return text;
  };

  onChange = (date: any) => {
    // const { dongleList } = this.props;
    const date1 = new Date(date);
    const time1 = date1.getTime();
    // if (dongleList.records[0].invalidTime > time1) {
    //   message.warning(
    //     formatMessage({
    //       id: 'operate.message.pleaseSelectABiggerThanTheOriginalDateOfTime',
    //       defaultMessage: '请选择比原来日期大的时间',
    //     }),
    //   );
    //   return;
    // }
    if (!time1) {
      message.warning(
        formatMessage({ id: 'operate.title.pleaseSelectADate', defaultMessage: '请选择日期' }),
      );
      return;
    }
    this.setState({
      invalidTime: time1,
    });
  };

  // 结束试用
  stopTest = () => {
    const { detail, dispatch, dongleList } = this.props;
    // if (dongleList && dongleList.records && dongleList.records.length === 0) {
    //   message.warning(
    //     formatMessage({
    //       id: 'operate.message.pleaseMakeSureToConfigureTheEncryptionDog',
    //       defaultMessage: '请确定配置了加密狗',
    //     }),
    //   );
    //   return;
    // }
    confirm({
      title: '',
      centered: true,
      className: 'stopTestModal',
      content: (
        <div className={styles.stopModal}>
          {formatMessage({
            id: 'operate.message.theValidityOfTheRemaining',
            defaultMessage: '有效期剩余',
          })}
          <span className={styles.days}>
            {this.DateDiff(this.translateDate(dongleList.records[0].expired))}
          </span>{' '}
          {formatMessage({
            id: 'operate.message.daysConfirmTheEnd',
            defaultMessage: '天，确认结束',
          })}
          <span className={styles.days}>{detail.name}</span>
          {formatMessage({
            id: 'operate.message.theTrialService',
            defaultMessage: '的试用服务吗？',
          })}
        </div>
      ),
      okText: '结束',
      cancelText: '取消',
      onOk() {
        if (dispatch) {
          dispatch({
            type: 'campus/finishTestDate',
            payload: {
              campusId: detail.id,
            },
            callback: () => {
              localStorage.setItem('activeKey', '8');
              dispatch({
                type: 'campus/CampusDetailInfo',
                payload: {
                  campusId: detail.id,
                },
              });
            },
          });
        }
      },
      onCancel() {},
    });
  };

  // 更改有效期
  changeDate = () => {
    const { detail, dispatch, dongleList } = this.props;
    const { invalidTime } = this.state;
    const that = this;
    if (invalidTime === '') {
      message.warning(
        formatMessage({ id: 'operate.message.pleaseSelectAValid', defaultMessage: '请选择有效期' }),
      );
      return;
    }

    const dateStr = `${this.translateDate(invalidTime)} 23:59:59`;
    const date1 = dateStr.replace(/-/g, '/');
    const time1 = new Date(date1).getTime();
    console.log(dateStr, time1);
    if (dispatch) {
      dispatch({
        type: 'campus/updateDongDate',
        payload: {
          campusId: detail.id,
          customerType: detail.customerType,
          dongleInfo: [
            {
              dongleType: dongleList.records[0].dongleType,
              driveId: dongleList.records[0].driveId,
              invalidTime: time1,
            },
          ],
          invalidTime: time1,
        },
        callback: () => {
          message.success(
            formatMessage({
              id: 'operate.message.updatedSuccessfully',
              defaultMessage: '更新成功！',
            }),
          );
          that.getCampusDong();
        },
      });
    }
  };

  // 续约
  goOn = () => {
    const { dispatch, detail } = this.props;
    const that = this;
    if (dispatch) {
      dispatch({
        type: 'campus/getdongleList',
        payload: {
          pageIndex: 1,
          pageSize: 10000,
          campusId: detail.id,
          isMainTop: 'Y',
        },
        callback: (data: any) => {
          that.setState({
            visible: true,
            dongList: data.records,
          });
        },
      });
    }
  };

  // 隐藏弹窗
  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  // 设置有效期
  saveChangeDate = () => {
    const { detail, dispatch } = this.props;
    const { dongList } = this.state;
    const that = this;
    if (dispatch) {
      const newDong = dongList
        .filter((vo: any) => vo.editFlag)
        .map((vo: any) => {
          const dateStr = `${this.translateDate(vo.invalidTime)} 23:59:59`;
          const date1 = dateStr.replace(/-/g, '/');
          const time1 = new Date(date1).getTime();
          return {
            ...vo,
            invalidTime: time1,
            expired: time1,
          };
        });
      dispatch({
        type: 'campus/updateDongDate',
        payload: {
          campusId: detail.id,
          customerType: detail.customerType,
          dongleInfo: newDong,
        },
        callback: () => {
          that.setState({
            visible: false,
          });
          that.getCampusDong();
          message.success(
            formatMessage({
              id: 'operate.message.theContractSuccessfully',
              defaultMessage: '续约成功',
            }),
          );
        },
      });
    }
  };

  // 转换日期
  translateDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = `${date.getFullYear()}-`;
    const M = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}-` : `${date.getMonth() + 1}-`;
    const D = `${date.getDate()} `;
    return Y + M + D;
  };

  // 计算天数差的函数，通用
  DateDiff = (sDate1: { replace: (arg0: RegExp, arg1: string) => string | number | Date }) => {
    const s1 = new Date(sDate1.replace(/-/g, '/'));
    const s2 = new Date(); // 当前日期：2017-04-24
    const days = s1.getTime() - s2.getTime();
    const time = Math.floor(Number(days / (1000 * 60 * 60 * 24)));
    return time + 1;
  };

  // 弹窗里修改日期
  onChangeList = (id: any, date: string | number | Date) => {
    // const { dongleList } = this.props;
    const { dongList } = this.state;
    // const current = dongleList.records.find((vo: any) => vo.id === id);
    const date1 = new Date(date);
    const time1 = date1.getTime();
    // if (current.invalidTime > time1) {
    //   message.warning(
    //     formatMessage({
    //       id: 'operate.message.pleaseSelectABiggerThanTheOriginalDateOfTime',
    //       defaultMessage: '请选择比原来日期大的时间',
    //     }),
    //   );
    //   return;
    // }
    if (!time1) {
      message.warning(
        formatMessage({ id: 'operate.title.pleaseSelectADate', defaultMessage: '请选择日期' }),
      );
      return;
    }
    const newDong = dongList.map((vo: any) => {
      if (vo.id === id) {
        return {
          ...vo,
          invalidTime: time1,
          expired: time1,
          editFlag: this.translateDate(date) !== this.translateDate(vo.expired) || false,
        };
      }
      return vo;
    });
    this.setState({
      dongList: newDong,
    });
  };

  disabledEndDate = (endValue: any) => {
    const { invalidTime } = this.state;
    if (!endValue || !invalidTime) {
      return false;
    }

    const date1 = new Date(endValue);
    const time1 = date1.getTime();
    const date2 = new Date();
    const time2 = date2.getTime();
    const days = time1 - time2;
    const time = Math.floor(Number(days / (1000 * 60 * 60 * 24)));
    return time + 1 > 30 || time + 1 < 0;
  };

  render() {
    const { detail, DONGLE_CUSTOMER_TYPE, dongleList, loading } = this.props;
    const { visible, dongList, invalidTime } = this.state;
    return (
      <div className={styles.serverContainer}>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.message.theCustomerType', defaultMessage: '客户类型' })}
            </div>
            <div className={styles.cont}>
              {this.matchValueType(detail.customerType, DONGLE_CUSTOMER_TYPE)}
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({
                id: 'operate.message.thePeriodOfValidity',
                defaultMessage: '有效期',
              })}
            </div>
            <div className={styles.datePicker}>
              {invalidTime ? (
                <DatePicker
                  key={invalidTime}
                  disabled={
                    (dongleList &&
                      dongleList.records &&
                      dongleList.records.filter(
                        (vo: any) =>
                          vo.status === 'BINDED' ||
                          vo.status === 'ACTIVATED' ||
                          vo.status === 'EXPIRED',
                      ).length === 0) ||
                    detail.customerType === 'DCT_1'
                  }
                  disabledDate={this.disabledEndDate}
                  onChange={this.onChange}
                  style={{ width: '330px', height: '32px' }}
                  value={moment(this.translateDate(invalidTime))}
                />
              ) : (
                <DatePicker
                  key={invalidTime}
                  disabled={
                    (dongleList &&
                      dongleList.records &&
                      dongleList.records.filter(
                        (vo: any) =>
                          vo.status === 'BINDED' ||
                          vo.status === 'ACTIVATED' ||
                          vo.status === 'EXPIRED',
                      ).length === 0) ||
                    detail.customerType === 'DCT_1'
                  }
                  disabledDate={this.disabledEndDate}
                  onChange={this.onChange}
                  style={{ width: '330px', height: '32px' }}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>&nbsp;</div>
            <div className={styles.stopTest}>
              {detail.customerType === 'DCT_2' ? (
                <Button
                  shape="round"
                  onClick={this.stopTest}
                  disabled={dongleList && dongleList.records && dongleList.records.length === 0}
                >
                  {formatMessage({
                    id: 'operate.message.endOfTheTrial',
                    defaultMessage: '结束试用',
                  })}
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className={styles.item}>
            <div className={styles.tit}>&nbsp;</div>
            <div className={styles.changeDate}>
              {detail.customerType === 'DCT_2' ? (
                <Button
                  shape="round"
                  onClick={this.changeDate}
                  disabled={
                    dongleList &&
                    dongleList.records &&
                    dongleList.records.filter(
                      (vo: any) =>
                        vo.status === 'BINDED' ||
                        vo.status === 'ACTIVATED' ||
                        vo.status === 'EXPIRED',
                    ).length === 0
                  }
                >
                  {formatMessage({
                    id: 'operate.message.changeThePeriodOfValidity',
                    defaultMessage: '更改有效期',
                  })}
                </Button>
              ) : (
                <Button
                  shape="round"
                  onClick={this.goOn}
                  style={{ width: '60px' }}
                  disabled={
                    dongleList &&
                    dongleList.records &&
                    dongleList.records.filter(
                      (vo: any) =>
                        vo.status === 'BINDED' ||
                        vo.status === 'ACTIVATED' ||
                        vo.status === 'EXPIRED',
                    ).length === 0
                  }
                >
                  {formatMessage({ id: 'operate.message.theContract', defaultMessage: '续约' })}
                </Button>
              )}
              {dongleList && dongleList.records.length > 0
                ? this.DateDiff(this.translateDate(dongleList.records[0].expired)) < 31 &&
                  (this.DateDiff(this.translateDate(dongleList.records[0].expired)) === 0
                    ? formatMessage({
                        id: 'operate.message.theLastDay',
                        defaultMessage: '最后一天',
                      })
                    : this.DateDiff(this.translateDate(dongleList.records[0].expired)) > 0 && (
                        <div style={{ display: 'inline' }}>
                          {formatMessage({
                            id: 'operate.message.theRemaining',
                            defaultMessage: '剩余',
                          })}
                          <span className={styles.days} key={dongleList.records[0].expired}>
                            {this.DateDiff(this.translateDate(dongleList.records[0].expired))}
                          </span>
                          {formatMessage({ id: 'operate.message.day', defaultMessage: '天' })}
                        </div>
                      ))
                : ''}
            </div>
          </div>
        </div>
        <Modal
          visible={visible}
          title={formatMessage({
            id: 'operate.message.setThePeriodOfValidity',
            defaultMessage: '设置有效期',
          })}
          maskClosable={false}
          centered
          width={680}
          okText={formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' })}
          onCancel={this.hideModal}
          onOk={this.saveChangeDate}
          className={styles.setDateRange}
          okButtonProps={{
            disabled: loading || dongList.filter((vo: any) => vo.editFlag).length === 0,
          }}
        >
          <div className={styles.paperTitle}>
            <div className={styles.paperNumber}>
              {formatMessage({ id: 'operate.message.SN', defaultMessage: 'SN' })}
            </div>
            <div className={styles.paperName}>
              {formatMessage({ id: 'operate.title.paper.auth.type', defaultMessage: '类型' })}
            </div>
            <div className={styles.paperCount}>
              {formatMessage({
                id: 'operate.message.theRemainingDays',
                defaultMessage: '剩余天数',
              })}
            </div>
            <div className={styles.dateRange}>
              {formatMessage({ id: 'operate.placeholde.dueToTheTime', defaultMessage: '到期时间' })}
            </div>
          </div>
          <div className={styles.paperListInfo}>
            {dongList.length > 0 && (
              <List
                dataSource={dongList.filter((vo: any) => vo.status !== 'WAITING_RECYCLE')}
                className={styles.paperList}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className={styles.paperDetail}>
                      <div className={styles.paperNumber}>{item.sn}</div>
                      <div className={styles.paperName}>
                        {item.dongleType === 'MAIN_DONGLE'
                          ? formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })
                          : formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
                      </div>
                      <div className={styles.paperCount}>
                        {item.expired && this.DateDiff(this.translateDate(item.expired)) > 0
                          ? this.DateDiff(this.translateDate(item.expired))
                          : 0}
                      </div>
                      <div className={styles.dateRange}>
                        {detail.tenantAuthorizeMode === 'RETAIL' &&
                        item.dongleType === 'MAIN_DONGLE'
                          ? this.translateDate(item.expired) || ''
                          : (item.expired && (
                              <DatePicker
                                key={item.id}
                                value={moment(this.translateDate(item.expired))}
                                disabledDate={current =>
                                  current && current < moment().startOf('day')
                                }
                                onChange={(date: any) => this.onChangeList(item.id, date)}
                              />
                            )) || (
                              <DatePicker
                                key={item.id}
                                disabledDate={current =>
                                  current && current < moment().startOf('day')
                                }
                                onChange={(date: any) => this.onChangeList(item.id, date)}
                              />
                            )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </Modal>
      </div>
    );
  }
}
export default ServerConfig;

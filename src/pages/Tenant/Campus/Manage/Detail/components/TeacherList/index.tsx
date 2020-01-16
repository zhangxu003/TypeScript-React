import React, { Component } from 'react';
import { Table, Tooltip, Modal, Input, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import cs from 'classnames';
import Select from '@/components/Select';
import Search from '@/components/Search';
import IconFont from '@/components/IconFont';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import { TeacherListParmsType } from '@/services/campus';
import SwitchEnable from './SwitchEnable';
import ImportModal from './ImportModal';
import event from '@/utils/event';
import styles from './index.less';

const { Option } = Select;
const { confirm } = Modal;

interface TeacherListProps extends ConnectProps {
  // campusId: string;
  loading?: ConnectState['loading']['effects'];
  ACCOUNT_BIND_TYPE?: ConnectState['dictionary']['ACCOUNT_BIND_TYPE'];
  records?: ConnectState['teacher']['teacherData']['records'];
  pageSize?: ConnectState['teacher']['teacherData']['pageSize'];
  total?: ConnectState['teacher']['teacherData']['total'];
  detail?: any;
}

@connect(({ dictionary, campus, teacher, loading }: ConnectState) => {
  const { ACCOUNT_BIND_TYPE = [] } = dictionary;
  const { records = [], total, pageSize } = teacher.teacherData;
  const { detail } = campus;
  return {
    detail,
    ACCOUNT_BIND_TYPE,
    records,
    total,
    pageSize,
    loading: loading.effects['teacher/getTeacherLists'],
  };
})
class TeacherList extends Component<TeacherListProps> {
  teacherNameInput: any;

  passwordInput: any;

  teacherName?: string;

  state = {
    bodyData: {
      bindStatus: '',
      filterWord: '',
      pageSize: 20,
      accountStatus: '',
    },
    visible: false,
    columns: [
      {
        title: formatMessage({ id: 'operate.text.gaoYunNo', defaultMessage: '高耘号' }),
        dataIndex: 'vbNumber',
        key: 'vbNumber',
        width: '20%',
      },
      {
        title: formatMessage({ id: 'operate.text.theName', defaultMessage: '姓名' }),
        dataIndex: 'name',
        key: 'name',
        width: '15%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.text.find.pw.box.step1,phone.placehold',
          defaultMessage: '手机号',
        }),
        dataIndex: 'mobile',
        key: 'mobile',
        width: '25%',
        render: (text: any, record: any) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={text}>
              <div className={styles.cellTxt}>{text}</div>
            </Tooltip>
            <Tooltip
              title={formatMessage({
                id: 'operate.text.verifiedPhoneNumber',
                defaultMessage: '已验证手机号',
              })}
            >
              {text && record.bindStatus === 'BIND' && (
                <IconFont type="icon-success" className={styles.success} />
              )}
            </Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.text.bindingState', defaultMessage: '绑定状态' }),
        dataIndex: 'bindStatus',
        key: 'bindStatus',
        width: '20%',
        render: (text: any) => (
          <div className={styles.cellTxt} title={text}>
            {this.matchValue(text, this.props.ACCOUNT_BIND_TYPE) ||
              formatMessage({ id: 'operate.text.unbounded', defaultMessage: '未绑定' })}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.text.role', defaultMessage: '角色' }),
        dataIndex: 'roleName',
        key: 'roleName',
        width: '20%',
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'status',
        key: 'status',
        width: '30%',
        render: (status: string, record: any) => {
          if (
            !this.matchValue(record.bindStatus, this.props.ACCOUNT_BIND_TYPE) ||
            record.bindStatus === 'UNBIND'
          ) {
            return (
              <span>
                <Tooltip
                  title={formatMessage({ id: 'operate.title.delete', defaultMessage: '删除' })}
                >
                  <IconFont
                    type="icon-detele"
                    className={styles.optionItem}
                    onClick={() => {
                      this.delete(record);
                    }}
                  />
                </Tooltip>
              </span>
            );
          }
          if (record.bindStatus === 'REFUSE') {
            return (
              <span>
                <Tooltip
                  title={formatMessage({ id: 'operate.title.delete', defaultMessage: '删除' })}
                >
                  <IconFont
                    type="icon-detele"
                    className={styles.optionItem}
                    onClick={() => {
                      this.delete(record);
                    }}
                  />
                </Tooltip>
                <Tooltip
                  title={formatMessage({ id: 'operate.text.toInvite', defaultMessage: '重新邀请' })}
                >
                  <IconFont
                    type="icon-plane"
                    className={styles.optionItem}
                    onClick={() => {
                      this.reAsk(record);
                    }}
                  />
                </Tooltip>
              </span>
            );
          }
          if (record.bindStatus === 'BIND') {
            return (
              <span>
                {record.roleCode && record.roleCode.includes('CampusOwner') ? null : (
                  <Tooltip
                    title={formatMessage({ id: 'operate.title.delete', defaultMessage: '删除' })}
                  >
                    <IconFont
                      type="icon-detele"
                      className={styles.optionItem}
                      onClick={() => {
                        this.delete(record);
                      }}
                    />
                  </Tooltip>
                )}

                <Tooltip
                  title={formatMessage({
                    id: 'operate.text.toResetYourPassword',
                    defaultMessage: '重置密码',
                  })}
                >
                  <IconFont
                    type="icon-reset-pw"
                    className={styles.optionItem}
                    onClick={() => {
                      this.resetPassword(record);
                    }}
                  />
                </Tooltip>
                <SwitchEnable status={status} data={record} key={record.accountId} />
              </span>
            );
          }
          return (
            <span>
              <Tooltip
                title={formatMessage({ id: 'operate.title.delete', defaultMessage: '删除' })}
              >
                <IconFont
                  type="icon-detele"
                  className={styles.optionItem}
                  onClick={() => {
                    this.delete(record);
                  }}
                />
              </Tooltip>
              <Tooltip
                title={formatMessage({
                  id: 'operate.text.toResetYourPassword',
                  defaultMessage: '重置密码',
                })}
              >
                <IconFont
                  type="icon-reset-pw"
                  className={styles.optionItem}
                  onClick={() => {
                    this.resetPassword(record);
                  }}
                />
              </Tooltip>
              <SwitchEnable status={status} data={record} key={record.accountId} />
              {!this.matchValue(record.bindStatus, this.props.ACCOUNT_BIND_TYPE) && (
                <Tooltip
                  title={formatMessage({ id: 'operate.text.toInvite', defaultMessage: '重新邀请' })}
                >
                  <IconFont
                    type="icon-plane"
                    className={styles.optionItem}
                    onClick={() => {
                      this.reAsk(record);
                    }}
                  />
                </Tooltip>
              )}
            </span>
          );
        },
      },
    ],
    current: 1,
  };

  componentDidMount() {
    this.gettTeacherList({ pageIndex: 1 });
  }

  // 获取教师列表
  gettTeacherList = (params: TeacherListParmsType) => {
    const { bodyData } = this.state;
    const { dispatch, detail } = this.props;
    if (params && !params.pageIndex) {
      params.pageIndex = 1;
    }
    this.setState({ current: params.pageIndex });
    if (dispatch) {
      dispatch({
        type: 'teacher/getTeacherLists',
        payload: { campusId: detail.id, ...bodyData, ...params },
      });
    }
  };

  // 状态
  statusChange = (value: any) => {
    const { bodyData } = this.state;
    bodyData.bindStatus = value;
    this.gettTeacherList({ bindStatus: value });
  };

  stopStatusChange = (value: any) => {
    const { bodyData } = this.state;
    bodyData.accountStatus = value;
    this.gettTeacherList({ accountStatus: value });
  };

  /**
   *删除教师账号
   *
   * @memberof TeacherList
   */
  delete = (record: any) => {
    confirm({
      content: (
        <div>
          {formatMessage({ id: 'operate.text.confirmTheDeletion', defaultMessage: '确认删除' })}
          <span style={{ padding: '0 5px', color: '#03C46B' }}>{record.name}</span>
          {formatMessage({ id: 'operate.text.teachersAccount', defaultMessage: '教师的账号吗？' })}
        </div>
      ),
      icon: null,
      okText: formatMessage({ id: 'operate.title.delete', defaultMessage: '删除' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        shape: 'round',
        type: 'danger',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: () => {
        const { dispatch } = this.props;
        if (dispatch) {
          dispatch({
            type: 'teacher/deleteTeacherInfo',
            payload: {
              teacherId: record.teacherId,
            },
          }).then((e: string) => {
            if (e === 'SUCCESS') {
              message.success(
                <FormattedMessage
                  id="operate.text.youHaveSuccessfullyRemovevalueTeacherAccount"
                  defaultMessage=" 您已成功删除 {value} 教师的账号！"
                  values={{
                    value: <span style={{ padding: '0 5px' }}>{record.name}</span>,
                  }}
                ></FormattedMessage>,
              );
              this.gettTeacherList({ pageIndex: 1 });
            }
          });
        }
      },
    });
  };

  /**
   *重新邀请
   *
   * @memberof TeacherList
   */
  reAsk = (record: any) => {
    confirm({
      content: (
        <div>
          {formatMessage({ id: 'operate.text.confirmTo', defaultMessage: '确认向' })}
          <span style={{ padding: '0 5px', color: '#03C46B' }}>{record.name}</span>
          {formatMessage({
            id: 'operate.text.teachersResendInvitation',
            defaultMessage: '教师重发邀请吗？',
          })}
        </div>
      ),
      icon: null,
      okText: formatMessage({ id: 'operate.text.confirm', defaultMessage: '确认' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: () => {
        const { dispatch, detail } = this.props;
        if (dispatch) {
          dispatch({
            type: 'teacher/reInvite',
            payload: {
              campusId: detail.id,
              teacherId: record.teacherId,
            },
          }).then((e: string) => {
            if (e === 'SUCCESS') {
              message.success(
                <FormattedMessage
                  id="operate.text.youHaveSuccessfullyResendTovalueTeachersInvited"
                  defaultMessage=" 你已成功向{value}教师重发邀请！"
                  values={{
                    value: <span style={{ padding: '0 5px' }}>{record.name}</span>,
                  }}
                ></FormattedMessage>,
              );
            }
          });
        }
      },
    });
  };

  /**
   *重置账号密码
   *
   * @memberof TeacherList
   */
  resetPassword = (record: any) => {
    confirm({
      title: formatMessage({ id: 'operate.text.toResetYourPassword', defaultMessage: '重置密码' }),
      centered: true,
      content: (
        <div>
          <div className={styles.content}>
            <div style={{ color: '#333333', width: '50px' }}>
              {formatMessage({ id: 'operate.text.theName', defaultMessage: '姓名' })}
            </div>
            <div style={{ color: '#333333', paddingLeft: '10px' }}>{record.name}</div>
          </div>
          <div className={styles.content}>
            <div style={{ color: '#333333', width: '50px' }}>
              {formatMessage({ id: 'operate.text.theNewPassword', defaultMessage: '新密码' })}
            </div>
            <Input
              placeholder={formatMessage({
                id: 'operate.text.pleaseEnterANewPassword',
                defaultMessage: '请输入新密码',
              })}
              className={styles.inputBorder}
              type="password"
              maxLength={20}
              ref={node => {
                this.passwordInput = node;
              }}
            ></Input>
          </div>
        </div>
      ),
      icon: null,
      okText: formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: () =>
        new Promise((resolve, reject) => {
          const { dispatch } = this.props;
          if (dispatch) {
            if (!this.passwordInput.state.value || this.passwordInput.state.value.length < 6) {
              message.warn(
                formatMessage({
                  id: 'operate.message.pleaseEnterThePasswordMoreThanSix',
                  defaultMessage: '请输入密码大于6位！',
                }),
              );
              reject();
              return;
            }
            dispatch({
              type: 'teacher/changeTeacherPassword',
              payload: {
                accountId: record.accountId,
                password: this.passwordInput.state.value,
              },
            }).then((e: string) => {
              if (e) {
                resolve();
                message.success(
                  <FormattedMessage
                    id="operate.text.youHaveSuccessfullyResetvaluePassword"
                    defaultMessage=" 您已成功重置 {value} 的密码！"
                    values={{
                      value: <span style={{ padding: '0 5px' }}>{record.name}</span>,
                    }}
                  ></FormattedMessage>,
                );
              }
            });
          }
        }),
    });
  };

  handlePageChange = (page: number) => {
    this.setState({ current: page });
    this.gettTeacherList({ pageIndex: page });

    // 切换页码时回到顶部
    event.emit('srollPopupWarp');
  };

  handleSearch = (value: string) => {
    const params = {
      filterWord: value,
    };
    const { bodyData } = this.state;
    bodyData.filterWord = value;
    this.gettTeacherList(params);
  };

  hideModal = () => {
    this.setState({ visible: false });
    this.gettTeacherList({ pageIndex: 1 });
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  addTeacher = () => {
    confirm({
      title: formatMessage({ id: 'operate.text.addTheTeacher', defaultMessage: '添加教师' }),
      centered: true,
      content: (
        <div className={styles.content}>
          <span style={{ color: '#333333' }}>
            {formatMessage({ id: 'operate.text.theName', defaultMessage: '姓名' })}
          </span>
          <span style={{ padding: '0 5px', color: '#FF6E4A' }}>*</span>
          <Input
            placeholder={formatMessage({
              id: 'operate.text.pleaseEnterTheTeachersName',
              defaultMessage: '请输入教师姓名',
            })}
            className={styles.inputBorder}
            maxLength={20}
            ref={node => {
              this.teacherNameInput = node;
            }}
          ></Input>
        </div>
      ),
      icon: null,
      okText: formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' }),
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: () =>
        new Promise((resolve, reject) => {
          if (!this.teacherNameInput.state.value) {
            message.warn(
              formatMessage({
                id: 'operate.title.pleaseEnterTheTeachersName',
                defaultMessage: '请输入教师姓名。',
              }),
            );
            reject();
            return;
          }
          const { dispatch, detail } = this.props;
          // console.log(this.teacherNameInput.state.value);
          this.teacherName = this.teacherNameInput.state.value;

          if (dispatch) {
            dispatch({
              type: 'teacher/createTeacherInfo',
              payload: {
                campusId: detail.id,
                teacherName: this.teacherNameInput.state.value,
              },
            }).then((e: string) => {
              resolve();
              if (e === 'SUCCESS') {
                message.success(
                  <FormattedMessage
                    id="operate.text.youHaveSuccessfullyAddedvalueTeacherAccounts"
                    defaultMessage="您已成功添加 {value} 的教师账号！"
                    values={{
                      value: (
                        <span style={{ padding: '0 5px', color: '#03C46B' }}>
                          {this.teacherName}
                        </span>
                      ),
                    }}
                  ></FormattedMessage>,
                );
                this.gettTeacherList({ pageIndex: 1 });
              }
            });
          }
        }),
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

  render() {
    const { columns, current } = this.state;
    const { ACCOUNT_BIND_TYPE = [], records = [], total, loading } = this.props;

    const statusList = [{ id: 'all', value: '不限', code: '' }, ...ACCOUNT_BIND_TYPE];
    const stopList = [
      { id: 'all', value: '不限', code: '' },
      { id: 'Y', value: '已启用', code: 'Y' },
      { id: 'N', value: '已停用', code: 'N' },
    ];
    return (
      <div className={styles.checkPaperListContainer}>
        <div className={styles.top}>
          <div className={styles.left}>
            <Search
              placeholder={formatMessage({
                id: 'operate.text.pleaseEnterTheNamephoneNumberSearch',
                defaultMessage: '请输入姓名/手机号搜索',
              })}
              onSearch={this.handleSearch}
              style={{ width: 300 }}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.text.accountStatus', defaultMessage: '账号状态' })}
              </span>
              <Select
                shape="round"
                className={styles.select}
                onChange={this.stopStatusChange}
                defaultValue=""
              >
                {stopList.map(tag => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.text.bindingState', defaultMessage: '绑定状态' })}
              </span>
              <Select
                shape="round"
                className={styles.select}
                onChange={this.statusChange}
                defaultValue=""
              >
                {statusList.map(tag => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
                  </Option>
                ))}
              </Select>
            </div>

            <div className={cs(styles['option-btn'], styles.selectItem)} onClick={this.addTeacher}>
              {formatMessage({ id: 'operate.text.addTheTeacher', defaultMessage: '添加教师' })}
            </div>
            <div className={styles['normal-btn']} onClick={this.showModal}>
              <IconFont type="icon-upload" />
              {formatMessage({ id: 'operate.text.importTheTeacher', defaultMessage: '导入教师' })}
            </div>
          </div>
        </div>
        {/* 表格 */}
        <div className={styles.tableBox}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={records}
            rowKey={record => record.paperId}
            pagination={{
              current,
              pageSize: 20,
              total,
              showTotal: () => <span style={{ marginRight: '20px' }}>共 {total} 条</span>,
              onChange: page => this.handlePageChange(page),
            }}
          />
        </div>
        <ImportModal visible={this.state.visible} hideModal={this.hideModal}></ImportModal>
      </div>
    );
  }
}
export default TeacherList;

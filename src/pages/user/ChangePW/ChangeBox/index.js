import React, { Component } from 'react';
import { Input, Form, Button } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import { formatMessage, defineMessages, FormattedMessage } from 'umi-plugin-react/locale';
import cs from 'classnames';
import PwdInput from '@/components/aidoin/PwdInput';
import styles from './index.less';
import ImageCode from '@/components/ImageCode/index';
import IconFont from '@/components/IconFont';

const messages = defineMessages({
  tit: { id: 'operate.text.find.pw.box.title', defaultMessage: '找回密码' },
  sendCodeSuccessTip: {
    id: 'operate.text.find.pw.send.code.success.tip',
    defaultMessage: '验证码已发送至{mobile}',
  },
  account: { id: 'operate.text.find.pw.step3.account', defaultMessage: '账号' },
  teacher: { id: 'operate.text.find.pw.step2.teacher', defaultMessage: '教师' },
  student: { id: 'operate.text.find.pw.step2.student', defaultMessage: '学生' },
});

@connect(({ loading }) => ({
  loading: loading.effects['login/queryMobileTeacher'],
  isRegisterLoading: loading.effects['findpassword/isRegister'],
}))
@Form.create()
class ChangeBox extends Component {
  state = {
    step: 1,
    mobile: '', // 手机号
    step1Tip: '', // 第一步提示信息
    validateCodeSuccess: false,
    nextBtnDisable: true, // 下一步按钮的disable
    pwVisibile: false, // 密码是否可见
    confirmPWVisibile: false,
    validateCodeId: '', // 短信验证码发送成功后返回的ID
    validateCode: '', // 输入框中的验证码
    // isManyRoles: false, // 一个手机号是否是多个角色
    checkedTypeValues: [], // 账号类型
    isValidPhone: false,
    iswaiting: true,
    waitTime: 60,
  };

  componentWillMount() {
    const { type } = this.props;
    const checkedTypeValues = [type];
    this.setState({
      checkedTypeValues,
    });
  }

  // 手机号输入框
  handlePhoneChange = e => {
    const { value } = e.target;
    if (value && value.length === 11) {
      this.setState(
        {
          mobile: e.target.value,
        },
        () => {
          this.validateTelephone();
        },
      );
    } else {
      this.setState(
        {
          mobile: e.target.value,
        },
        () => {
          this.validateTelephone();
        },
      );
    }
  };

  handlePhoneBlur = () => {
    // this.validateTelephone();
  };

  // 验证手机号是否正确
  validateTelephone = () => {
    const { form } = this.props;
    form.validateFields(err => {
      if (err && err.mobile && err.mobile.errors.length > 0) {
        this.setState({ step1Tip: err.mobile.errors[0].message, isValidPhone: false });
      } else {
        this.setState({ step1Tip: '', isValidPhone: true });
        // 1.手机号验证通过后 验证是否已注册
        this.checkIsRegister();
      }
    });
  };

  // 第二步验证密码
  validatePW = () => {
    const { form, dispatch } = this.props;
    const { mobile, validateCode, checkedTypeValues, validateCodeId } = this.state;
    form.validateFields((err, values) => {
      if (err) {
        const { confirmPwd, password } = err;
        if (password) {
          this.setState({ step1Tip: password.errors[0].message });
          return;
        }
        if (confirmPwd) {
          this.setState({ step1Tip: confirmPwd.errors[0].message });
        }
      } else {
        const { confirmPwd, password } = values;
        if (password !== confirmPwd) {
          const mgs = formatMessage({
            id: 'operate.text.user.register.confirm.no.equel.tip',
            defaultMessage: '两次密码输入不一致',
          });
          this.setState({ step1Tip: mgs });
          return;
        }

        this.setState({ step1Tip: '' });
        // 验证2次输入的验证码，一致就调用Auth-004

        if (checkedTypeValues.length > 1) {
          // 多个身份 调用多次api
          const params = {
            confirmPwd,
            password,
            mobile,
            validateCodeId,
            validateCode, // 短信验证码
            identityCode: 'ID_OPERATOR', // 身份 老师：ID_TEACHER 学生：ID_STUDENT TODO：如何区分身份
          };
          dispatch({
            type: 'login/fetch',
            payload: params,
            callback: () => {
              // 学生
              const params1 = {
                confirmPwd,
                password,
                mobile,
                validateCodeId,
                validateCode, // 短信验证码
                identityCode: 'ID_OPERATOR', // 身份 老师：ID_TEACHER 学生：ID_STUDENT TODO：如何区分身份
              };
              dispatch({
                type: 'login/fetch',
                payload: params1,
                callback: () => {
                  this.setState({
                    step: 3,
                  });
                },
              });
            },
          });
        } else {
          // 一个身份
          // const role = checkedTypeValues[0];
          const identityCode = 'ID_OPERATOR';
          const params = {
            confirmPwd,
            password,
            mobile,
            validateCodeId,
            validateCode, // 短信验证码
            identityCode, // 身份 老师：ID_TEACHER 学生：ID_STUDENT TODO：如何区分身份
          };
          dispatch({
            type: 'login/fetch',
            payload: params,
            callback: () => {
              this.setState({
                step: 3,
              });
            },
          });
        }
      }
    });
  };

  // 发送验证码
  sendValidateCodeRequest = () => {
    const { dispatch } = this.props;
    const { mobile } = this.state;
    const params = {
      telephone: String(mobile),
    };
    dispatch({
      type: 'login/validateCode',
      payload: params,
      callback: res => {
        this.setState({
          iswaiting: true,
          waitTime: 60,
          validateCodeSuccess: true,
          validateCodeId: res,
          step1Tip: '',
        });

        const myInterval = setInterval(() => {
          const { waitTime } = this.state;
          if (waitTime - 1 === 0) {
            clearInterval(myInterval);
            this.setState({ iswaiting: false, waitTime: 0 });
          } else {
            this.setState({ waitTime: waitTime - 1 });
          }
        }, 1000);
      },
    });
  };

  /**
   * 重新发送验证码
   */
  reSendMessage = () => {
    this.sendValidateCodeRequest();
  };

  // 验证码输入框
  saveCode = e => {
    const { value } = e.target;
    if (value) {
      this.setState({
        nextBtnDisable: false,
        validateCode: value,
      });
    } else {
      this.setState({
        nextBtnDisable: true,
        validateCode: value,
      });
    }
  };

  // 下一步
  nextBtnClick = () => {
    const { step } = this.state;
    if (step === 1) {
      // 第一步的时候下一步激活 此时验证验证码是否正确
      this.checkValidateCode();
    }
    if (step === 2) {
      // 第二步 的下一步
      this.validatePW();
    }
  };

  // 验证码是否正确
  checkValidateCode = () => {
    const { dispatch } = this.props;
    const { mobile, validateCodeId, validateCode } = this.state;
    const params = {
      mobile,
      validateCodeId,
      validateCode,
    };

    dispatch({
      type: 'login/checkSNcode',
      payload: params,
      callback: () => {
        // if (res.responseCode === '200') {
        // 手机号验证码 验证通过 进入步骤2
        this.setState(
          {
            step: 2,
            step1Tip: '',
          },
          () => {
            // this.checkIdentity();
          },
        );
        // }
        // else {
        //   const err = res.data;
        //   this.setState({
        //     step1Tip: err,
        //   });
        // }
      },
    });
  };

  // 账号类型
  onTypeChange = checkedValues => {
    this.setState({
      checkedTypeValues: checkedValues,
    });
  };

  // 检测是否注册
  checkIsRegister = () => {
    const { mobile } = this.state;
    const { dispatch, type } = this.props;
    const params = {
      mobile,
      identityId: type === 'teacher' ? '1' : '2',
    };
    dispatch({
      type: 'findpassword/isRegister',
      payload: params,
      callback: data => {
        if (data) {
          // 已注册
          this.setState({
            step1Tip: '',
          });
        } else {
          // 未注册
          const tip = formatMessage({
            id: 'operate.text.no.register',
            defaultMessage: '该手机号尚未注册，请先注册',
          });
          this.setState({
            step1Tip: tip,
          });
        }
      },
    });
  };

  // AUTH-306：检查手机注册了几个身份
  checkIdentity = () => {
    const { dispatch } = this.props;
    const { mobile } = this.state;
    const self = this;
    dispatch({
      type: 'login/queryMobileTeacher',
      payload: {
        mobile,
      },
      callback: res => {
        if (res.length === 0) {
          self.setState({
            step1Tip: formatMessage({
              id: 'operate.text.no.register',
              defaultMessage: '该手机号尚未注册，请先注册',
            }),
          });
        } else {
          res.forEach(item => {
            if (item.identityCode === 'ID_OPERATOR') {
              this.sendValidateCodeRequest();
            } else {
              self.setState({
                step1Tip: formatMessage({
                  id: 'operate.text.no.register',
                  defaultMessage: '该手机号尚未注册，请先注册',
                }),
              });
            }
          });
        }
      },
    });
  };

  // 密码验证数位
  pwValidate = (rules, value, callback) => {
    const valueLength = String(value).length;
    if (valueLength >= 0 && valueLength > 5) {
      callback();
    } else {
      const mgs = formatMessage({
        id: 'operate.text.user.login.password.tip1',
        defaultMessage: '密码为6位以上非中文字符',
      });
      callback(mgs);
    }
  };

  render() {
    const { style, form, isRegisterLoading } = this.props;
    const {
      step,
      step1Tip,
      mobile,
      validateCodeSuccess,
      nextBtnDisable,
      pwVisibile,
      confirmPWVisibile,

      isValidPhone,
      iswaiting,
      waitTime,
    } = this.state;
    const { getFieldDecorator } = form;
    let lineLeft;
    if (step === 1) {
      lineLeft = '0px';
    } else if (step === 2) {
      lineLeft = '116px';
    } else {
      lineLeft = '232px';
    }

    const phoneSuffix = <IconFont type="icon-mobile" style={{ color: '#888', fontSize: '16px' }} />;
    const messageSuffix = (
      <IconFont type="icon-message" style={{ color: '#888', fontSize: '16px' }} />
    );
    const pwSuffix = <IconFont type="icon-lock" style={{ color: '#888', fontSize: '16px' }} />;

    // const accountValue =
    //   type === 'teacher'
    //     ? formatMessage({ id: 'operate.text.teacher.account', defaultMessage: '教师账号' })
    //     : formatMessage({ id: 'operate.text.student.account', defaultMessage: '学生账号' });
    return (
      <div className={styles.changeBox} style={style}>
        <div className={styles.title}>
          {formatMessage({ id: 'operate.text.find.pw.box.title', defaultMessage: '找回密码' })}
        </div>
        {/* 步骤显示区 */}
        <div className={styles.stepBox}>
          <div className={cs(styles.step, styles.step1, step === 1 ? styles.current : null)}>
            1.
            {formatMessage({ id: 'operate.text.find.pw.box.step1', defaultMessage: '验证手机号' })}
          </div>
          <div className={cs(styles.step, step === 2 ? styles.current : null)}>
            2. {formatMessage({ id: 'operate.text.find.pw.box.step2', defaultMessage: '重设密码' })}
          </div>
          <div className={cs(styles.step, step === 3 ? styles.current : null)}>
            3. {formatMessage({ id: 'operate.text.find.pw.box.step3', defaultMessage: '完成' })}
          </div>
          <div className={styles.hLine} style={{ left: lineLeft }}>
            <div className={styles.sanjiao} />
          </div>
        </div>
        {/* 第一步 */}
        {step === 1 && (
          <div className={styles.step1Box}>
            <Form className="form">
              {!validateCodeSuccess && (
                <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
                  {getFieldDecorator('mobile', {
                    rules: [
                      {
                        required: true,
                        message: formatMessage({
                          id: 'operate.text.account.phone.input.tip',
                          defaultMessage: '请输入手机号',
                        }),
                      },
                      {
                        pattern: /^(1|9)(2|3|4|5|6|7|8|9)\d{9}$/,
                        message: formatMessage({
                          id: 'operate.text.user.login.account.tip1',
                          defaultMessage: '手机输入格式不正确',
                        }),
                      },
                    ],
                  })(
                    <Input
                      placeholder={formatMessage({
                        id: 'operate.text.find.pw.box.step1,phone.placehold',
                        defaultMessage: '手机号',
                      })}
                      prefix={phoneSuffix}
                      onChange={this.handlePhoneChange}
                      onBlur={this.handlePhoneBlur}
                      maxLength={11}
                      autoComplete="off"
                    />,
                  )}
                </Form.Item>
              )}

              {validateCodeSuccess && (
                <div>
                  <p className={styles.sendCode}>
                    <FormattedMessage values={{ mobile }} {...messages.sendCodeSuccessTip} />
                  </p>
                  <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="message-item">
                    {getFieldDecorator('validateCode', {
                      rules: [
                        {
                          required: true,
                          message: formatMessage({
                            id: 'operate.text.account.message.input.placeholder',
                            defaultMessage: '请输入短信验证码',
                          }),
                        },
                      ],
                    })(
                      <Input
                        prefix={messageSuffix}
                        maxLength={20}
                        placeholder={formatMessage({
                          id: 'operate.text.account.message.input.placeholder',
                          defaultMessage: '请输入短信验证码',
                        })}
                        onChange={e => this.saveCode(e)}
                      />,
                    )}
                  </Form.Item>
                  {iswaiting ? (
                    <div className={styles.greybtn} onClick={this.reSendMessage}>
                      {waitTime}s
                    </div>
                  ) : (
                    <div className={styles.btn} onClick={this.reSendMessage}>
                      {formatMessage({ id: 'operate.text.toResend', defaultMessage: '重新发送' })}
                    </div>
                  )}
                </div>
              )}
            </Form>

            <div className={styles.tip}>{step1Tip}</div>
            {/* {
                            !validateCodeSuccess &&
                            <VerificationCode
                              errorInfo={step1Tip}
                              mobile={mobile}
                              validateMobile={() => {
                                    if (step1Tip === '') {
                                        this.validateTelephone();
                                    }

                                }}
                              onMatch={() => {
                                    this.sendValidateCodeRequest();
                                }}
                            />
                    } */}

            {!validateCodeSuccess && !step1Tip && isValidPhone && !isRegisterLoading && (
              <div className={styles.imageCodeBox}>
                <ImageCode
                  styleObj={{ margin: '0 auto' }}
                  onReload={() => {}}
                  onMatch={() => {
                    this.checkIdentity();
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 第二步 */}
        {step === 2 && (
          <div className={styles.step2Box}>
            {/* 提示警告信息 */}
            {/* {!loading && isManyRoles && (
              <div className={styles.accountType}>
                <div className={styles.accountTip}>
                  <div className={styles.tipTxt}>
                    <i className="iconfont icon-warning" style={{ fontSize: '13px' }} />
                    <span style={{ paddingLeft: '6px' }}>
                      {formatMessage({
                        id: 'operate.text.find.pw.step2.tip1',
                        defaultMessage: '检测到本手机号同时注册了',
                      })}
                      <span style={{ padding: '0px 6px' }}>
                        {formatMessage({
                          id: 'operate.text.teacher.account',
                          defaultMessage: '教师账号',
                        })}
                      </span>
                      {formatMessage({
                        id: 'operate.text.find.pw.step2.and',
                        defaultMessage: '和',
                      })}
                      <span style={{ paddingLeft: '6px' }}>
                        {formatMessage({
                          id: 'operate.text.student.account',
                          defaultMessage: '学生账号',
                        })}
                      </span>
                    </span>
                  </div>
                  <div className={styles.tipTxt}>
                    {formatMessage({
                      id: 'operate.text.find.pw.step2.tip2',
                      defaultMessage: '请选择需要修改密码的账号，全选即同时修改两个账号密码。',
                    })}
                  </div>
                  <div className={styles.typeBox}>
                    <Checkbox.Group
                      style={{
                        width: '100%',
                        display: 'flex',
                        marginTop: '10px',
                        justifyContent: 'space-between',
                      }}
                      defaultValue={checkedTypeValues}
                      onChange={this.onTypeChange}
                    >
                      <div className={styles.type}>
                        <Checkbox value="teacher" disabled={type === 'teacher'}>
                          {formatMessage({
                            id: 'operate.text.teacher.account',
                            defaultMessage: '教师账号',
                          })}
                        </Checkbox>
                      </div>
                      <div className={styles.type}>
                        <Checkbox value="student" disabled={type === 'student'}>
                          {formatMessage({
                            id: 'operate.text.student.account',
                            defaultMessage: '学生账号',
                          })}
                        </Checkbox>
                      </div>
                    </Checkbox.Group>
                  </div>
                </div>
              </div>
            )} */}

            <Form className="form">
              <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: 'operate.text.user.login.password.tip',
                        defaultMessage: '请输入密码',
                      }),
                    },
                    {
                      pattern: /[^\u4e00-\u9fa5]+/,
                      message: formatMessage({
                        id: 'operate.text.user.login.password.tip1',
                        defaultMessage: '密码为6位以上非中文字符',
                      }),
                    },
                    {
                      validator: this.pwValidate,
                    },
                  ],
                })(
                  <PwdInput
                    prefix={pwSuffix}
                    type={pwVisibile ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={formatMessage({
                      id: 'operate.text.account.pw.input.placeholder',
                      defaultMessage: '请输入6-20位密码，区分大小写',
                    })}
                  />,
                )}
                <div
                  className="visibile"
                  onClick={() => {
                    this.setState({ pwVisibile: !pwVisibile });
                  }}
                >
                  {/* <IconFont type={pwVisibile ? 'icon-eye' : 'icon-hide'} /> */}
                </div>
              </Form.Item>
              <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
                {getFieldDecorator('confirmPwd', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: 'operate.text.user.register.confirm.password.tip',
                        defaultMessage: '请输入确认密码',
                      }),
                    },
                    {
                      pattern: /[^\u4e00-\u9fa5]+/,
                      message: formatMessage({
                        id: 'operate.text.user.login.password.tip1',
                        defaultMessage: '密码为6位以上非中文字符',
                      }),
                    },
                    {
                      validator: this.pwValidate,
                    },
                  ],
                })(
                  <PwdInput
                    prefix={pwSuffix}
                    type={confirmPWVisibile ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={formatMessage({
                      id: 'operate.text.account.pw.confirm.input.placeholder',
                      defaultMessage: '确认密码',
                    })}
                  />,
                )}
                <div
                  className="visibile"
                  onClick={() => {
                    this.setState({ confirmPWVisibile: !confirmPWVisibile });
                  }}
                >
                  {/* <IconFont type={confirmPWVisibile ? 'icon-eye' : 'icon-hide'} /> */}
                </div>
              </Form.Item>
              <div className={styles.tip}>{step1Tip}</div>
            </Form>
          </div>
        )}

        {/* 第三步 */}
        {step === 3 && (
          <div className={styles.step3Box}>
            <div className={styles.successIcon}>
              <IconFont type="icon-right" />
            </div>
            <div className={styles.step3Tip}>
              {formatMessage({
                id: 'operate.text.find.pw.step3.tip2',
                defaultMessage: '新密码设置成功，请重新登录',
              })}
            </div>
            <div
              className={styles.goLogin}
              onClick={() => {
                router.push({
                  pathname: '/user/login',
                });
              }}
            >
              {formatMessage({
                id: 'operate.text.find.pw.go.login.btn.title',
                defaultMessage: '去登录',
              })}
            </div>
          </div>
        )}
        {step !== 3 && (
          <div>
            <Button
              onClick={this.nextBtnClick}
              disabled={nextBtnDisable}
              className={nextBtnDisable ? styles.nextBtnDisable : styles.nextBtn}
            >
              {formatMessage({
                id: 'operate.text.find.pw.box.next.btn.title',
                defaultMessage: '下一步',
              })}
            </Button>
            <div
              className={styles.backBtnTit}
              onClick={() => {
                router.push({
                  pathname: '/user/login',
                });
              }}
            >
              {formatMessage({
                id: 'operate.text.find.pw.box.next.btn.back.title',
                defaultMessage: '返回登录',
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ChangeBox;

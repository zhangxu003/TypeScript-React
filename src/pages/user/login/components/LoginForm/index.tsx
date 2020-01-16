import React from 'react';
import { Link } from 'dva/router';
import { Input, Form, Button } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import PwdInput from '@/components/aidoin/PwdInput';
import styles from './index.less';
import IconFont from '@/components/IconFont';

interface LoginFormPops {
  onHandleSubmit?: (e: any) => void;
  onClearServiceErr?: () => void;
  form: any;
  style?: any;
  loading?: boolean;
  serviceErr?: string;
  key?: string;
}

interface LoginFormState {
  errorInfo: string;
}

class LoginForm extends React.Component<LoginFormPops, LoginFormState> {
  userNameInput: any;

  state = {
    errorInfo: '',
  };

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.serviceErr) {
      this.setState({
        errorInfo: nextProps.serviceErr,
      });
    }
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
    const { form, onClearServiceErr, onHandleSubmit } = this.props;
    form.validateFields((err: any, values: any) => {
      if (err) {
        if (onClearServiceErr) {
          onClearServiceErr();
        }

        const { username, password } = values;
        const { username: usernameErrorJson, password: pwErrorJson } = err;

        if (username === undefined && password === undefined) {
          const mgs = formatMessage({
            id: 'operate.text.login.account.pw.tip',
            defaultMessage: '请输入账号和密码！',
          });
          this.setState({
            errorInfo: mgs,
          });
          return;
        }

        if (username === undefined) {
          const mgs = formatMessage({
            id: 'operate.text.login.account.tip',
            defaultMessage: '请输入登录账号！',
          });
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        // 有值 校验是否符合规则
        if (usernameErrorJson === undefined) {
          // 数据正常
        } else {
          const { errors } = usernameErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }

        if (password === undefined) {
          const mgs = formatMessage({
            id: 'operate.text.login.password.tip',
            defaultMessage: '请输入密码！',
          });
          this.setState({
            errorInfo: mgs,
          });
          return;
        }

        if (pwErrorJson) {
          const { errors } = pwErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
      }

      if (!err) {
        this.setState({ errorInfo: '' });
        if (onHandleSubmit) {
          onHandleSubmit(values);
        }
      }
    });
  };

  pwValidate = (rules: any, value: any, callback: { (): void; (arg0: string): void }) => {
    const valueLength = String(value).length;
    if (valueLength >= 0 && valueLength > 5) {
      callback();
    } else {
      const mgs = formatMessage({
        id: 'operate.text.login.password.tip1',
        defaultMessage: '密码为6位以上非中文字符！',
      });
      callback(mgs);
    }
  };

  render() {
    const { style, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { errorInfo } = this.state;
    const phoneSuffix = <IconFont type="icon-user" style={{ color: '#888', fontSize: '16px' }} />;
    const pwSuffix = <IconFont type="icon-lock" style={{ color: '#888', fontSize: '16px' }} />;
    return (
      <div className={styles['login-form']} style={style}>
        <div className="form-box">
          <div className={styles.topLogo} />
          <div className={styles.title}>
            {formatMessage({
              id: 'operate.text.welcome',
              defaultMessage: '欢迎登录高耘业务支撑平台',
            })}
          </div>
          <Form onSubmit={this.handleSubmit} className="form" autoComplete="off">
            <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({
                      id: 'operate.text.login.account.tip',
                      defaultMessage: '请输入登录账号！',
                    }),
                  },
                  // {
                  //   pattern: /^[0-9]*$/,
                  //   message: formatMessage(messages.accountTip1),
                  // },
                ],
              })(
                <Input
                  placeholder={formatMessage({
                    id: 'operate.text.login.account.input.placeholder',
                    defaultMessage: '高耘号/手机号',
                  })}
                  prefix={phoneSuffix}
                  maxLength={11}
                  autoComplete="off"
                  ref={node => {
                    this.userNameInput = node;
                  }}
                />,
              )}
            </Form.Item>
            <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-input">
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({
                      id: 'operate.text.login.password.tip',
                      defaultMessage: '请输入密码！',
                    }),
                  },
                  {
                    pattern: /[^\u4e00-\u9fa5]+/,
                    message: formatMessage({
                      id: 'operate.text.login.password.tip1',
                      defaultMessage: '密码为6位以上非中文字符！',
                    }),
                  },
                  // **  TODO 注释代码防止原来的账号不能登录 **/
                  // {
                  //     validator: this.pwValidate
                  // },
                ],
              })(
                <PwdInput
                  prefix={pwSuffix}
                  maxLength={20}
                  placeholder={formatMessage({
                    id: 'operate.text.login.pw.input.placeholder',
                    defaultMessage: '密码',
                  })}
                />,
              )}
              <div className="forgetPW">
                <Link to="/user/resetpw">
                  {formatMessage({
                    id: 'operate.text.forget.pw.title',
                    defaultMessage: '忘记密码？',
                  })}
                </Link>
              </div>
            </Form.Item>
            <Form.Item>{errorInfo && <div className="errorInfo">{errorInfo}</div>}</Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="teacher-login-button"
              >
                {formatMessage({ id: 'operate.text.login.btn.title', defaultMessage: '登 录' })}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create<LoginFormPops>()(LoginForm);

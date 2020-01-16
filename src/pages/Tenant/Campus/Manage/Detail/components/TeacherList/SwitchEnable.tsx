import React, { Component } from 'react';
import { Switch, Modal, message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import styles from './index.less';

const { confirm } = Modal;

interface SwitchEnableProps extends ConnectProps {
  status: string;
  data: any;
}

@connect(({ dictionary, tenantpackage, campus, loading }: ConnectState) => {
  const { ACCOUNT_BIND_TYPE = [] } = dictionary;
  const { records = [], total, pageSize } = campus.teacherData;
  const { paperTemplateList } = tenantpackage;
  const { detail } = campus;
  return {
    detail,
    ACCOUNT_BIND_TYPE,
    paperTemplateList,
    records,
    total,
    pageSize,
    loading: loading.effects['tenantpackage/fetchPaperList'],
  };
})
class SwitchEnable extends Component<SwitchEnableProps> {
  state = {
    checked: this.props.status === 'Y',
  };

  componentDidMount() {}

  /**
   *启用/停用教师账号
   *
   * @memberof TeacherList
   */
  switchabled = (checked: boolean) => {
    const { data } = this.props;
    const tips = checked
      ? formatMessage({ id: 'operate.text.toEnableThe', defaultMessage: '启用' })
      : formatMessage({ id: 'operate.text.disable', defaultMessage: '停用' });
    confirm({
      content: (
        <div>
          {formatMessage({ id: 'operate.text.confirm', defaultMessage: '确认' })}
          {tips}
          <span style={{ padding: '0 5px', color: '#03C46B' }}>{data.name}</span>
          {formatMessage({ id: 'operate.text.teachersAccount', defaultMessage: '教师的账号吗？' })}
        </div>
      ),
      icon: null,
      okText: tips,
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
            type: 'teacher/createTeacherStatus',
            payload: {
              teacherId: data.teacherId,
              status: checked ? 'Y' : 'N',
            },
          }).then((e: string) => {
            if (e === 'SUCCESS') {
              const tipsJsx = (
                <>
                  {formatMessage({
                    id: 'operate.text.youHaveSuccessfully',
                    defaultMessage: '您已成功',
                  })}
                  {tips}
                  <span style={{ padding: '0 5px', color: '#03C46B' }}>{data.name}</span>
                  {formatMessage({
                    id: 'operate.text.theTeacherAccounts',
                    defaultMessage: '的教师账号！',
                  })}
                </>
              );
              message.success(tipsJsx);
            }
          });
        }
        this.setState({ checked });
      },
    });
  };

  render() {
    return (
      <Switch
        checked={this.state.checked}
        checkedChildren={formatMessage({
          id: 'operate.text.toEnableThe',
          defaultMessage: '启用',
        })}
        unCheckedChildren={formatMessage({
          id: 'operate.text.disable',
          defaultMessage: '停用',
        })}
        onChange={checked => {
          this.switchabled(checked);
        }}
        className={styles.optionItem}
      />
    );
  }
}
export default SwitchEnable;

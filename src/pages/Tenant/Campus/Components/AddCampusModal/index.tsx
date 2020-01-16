import React from 'react';
import { Modal, Form } from 'antd';
import { Dispatch, AnyAction } from 'redux';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { FormComponentProps } from 'antd/es/form';
import RegionSelect from '@/components/RegionSelect';
import { ConnectState } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import styles from './index.less';

const { confirm } = Modal;

interface AddCampusModalProps {
  dispatch?: Dispatch<AnyAction>;
  visible: boolean;
  loading?: boolean;
  form: FormComponentProps['form'];
  saveModal: () => void;
}

@connect(({ campus, loading }: ConnectState) => {
  const {
    pageData: { records = [], dataCount, areaCode }, // 当期页数据
  } = campus;
  return {
    records,
    dataCount,
    areaCode,
    loading: loading.effects['campus/addCampusInfo'],
  };
})
class AddCampusModal extends React.Component<AddCampusModalProps> {
  state = {
    campusError: '',
    areaCode: ['100000'],
  };

  hideModal = () => {
    const { saveModal } = this.props;
    saveModal();
  };

  closeModal = () => {
    // 关闭成功弹窗并刷新列表
    const { dispatch, areaCode } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/fetchCampus',
        payload: {
          pageIndex: 1,
          pageSize: 20,
          areaCode,
        },
        callback: () => {
          Modal.destroyAll();
        },
      });
    }
  };

  okModal = () => {
    const that = this;
    const { saveModal, form, dispatch } = this.props;
    form.validateFields((_err, values) => {
      if (values.campusName.trim() === '') {
        that.setState({
          campusError: formatMessage({
            id: 'operate.message.pleaseEnterTheNameOfTheCampus',
            defaultMessage: '请输入校区名称',
          }),
        });
        return;
      }
      if (dispatch) {
        dispatch({
          type: 'campus/addCampusInfo',
          payload: {
            address: values.address,
            areaCode:
              values.areaCode[values.areaCode.length - 1] === '0'
                ? '100000'
                : values.areaCode[values.areaCode.length - 1],
            campusName: values.campusName,
          },
          callback: (res: {
            campusId: React.ReactNode;
            vbNo: React.ReactNode;
            password: React.ReactNode;
          }) => {
            confirm({
              title: '',
              width: 380,
              centered: true,
              className: styles.alreadyAddOk,
              content: (
                <div className={styles.infomations}>
                  <div className={styles.iconClose}>
                    <IconFont type="icon-close" />
                  </div>
                  <div className={styles.iconDetail}>
                    <IconFont type="icon-right" />
                  </div>
                  <div className={styles.proVersion}>
                    {formatMessage({
                      id: 'operate.message.successfullyCreated',
                      defaultMessage: '成功创建',
                    })}
                    <span>{values.campusName}</span>
                    {formatMessage({ id: 'operate.message.campus', defaultMessage: '校区' })}
                  </div>
                  <p className={styles.proInfo}>
                    {formatMessage({
                      id: 'operate.message.theAdministratorGaoYunNo',
                      defaultMessage: '管理员高耘号：',
                    })}
                    {res.vbNo}
                    <span>
                      {formatMessage({ id: 'operate.message.Password', defaultMessage: '密码：' })}
                      {res.password}
                    </span>
                  </p>
                </div>
              ),
              okText: formatMessage({
                id: 'operate.message.installTheInitialization',
                defaultMessage: '安装初始化',
              }),

              onOk() {
                if (dispatch) {
                  dispatch({
                    type: 'campus/CampusDetailInfo',
                    payload: {
                      campusId: res.campusId,
                    },
                    callback: () => {
                      dispatch({
                        type: 'campus/initShow',
                      });
                    },
                  });
                }
              },
              onCancel() {
                that.closeModal();
              },
            });
            saveModal();
          },
        });
      }
    });
  };

  saveCampusName = (e: any) => {
    if (e.target.value.trim() === '') {
      this.setState({
        campusError: formatMessage({
          id: 'operate.message.pleaseEnterTheNameOfTheCampus',
          defaultMessage: '请输入校区名称',
        }),
      });
    } else {
      this.setState({
        campusError: '',
      });
    }
  };

  // 地区选择
  handleRegionChange = (value: string[]) => {
    console.log(value);
    this.setState({
      areaCode: value,
    });
  };

  render() {
    const { visible, form, loading } = this.props;
    const { getFieldDecorator } = form;
    const { campusError, areaCode } = this.state;

    return (
      <Modal
        visible={visible}
        title={formatMessage({ id: 'operate.message.createACampus', defaultMessage: '创建校区' })}
        maskClosable={false}
        width={460}
        centered
        okText={formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' })}
        onCancel={this.hideModal}
        onOk={this.okModal}
        className={styles.AddCampusModal}
        okButtonProps={{ disabled: loading }}
      >
        <Form layout="vertical">
          <Form.Item
            label={formatMessage({
              id: 'operate.message.theNameOfTheCampus',
              defaultMessage: '校区名称',
            })}
          >
            {getFieldDecorator('campusName', {
              initialValue: '',
            })(
              <input
                maxLength={30}
                placeholder={formatMessage({
                  id: 'operate.message.pleaseEnterTheNameOfTheCampus',
                  defaultMessage: '请输入校区名称',
                })}
                onChange={this.saveCampusName}
              />,
            )}
          </Form.Item>

          <Form.Item label="地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区">
            {getFieldDecorator('areaCode', {
              initialValue: areaCode,
            })(
              <RegionSelect
                onChange={this.handleRegionChange}
                width={320}
                value={areaCode}
                defaultValue={areaCode}
              />,
            )}
          </Form.Item>

          <Form.Item
            label={formatMessage({
              id: 'operate.message.detailedAddress',
              defaultMessage: '详细地址',
            })}
          >
            {getFieldDecorator('address', {
              initialValue: '',
            })(
              <input
                maxLength={50}
                placeholder={formatMessage({
                  id: 'operate.message.pleaseEnterTheAddressInDetail',
                  defaultMessage: '请输入详细地址',
                })}
              />,
            )}
          </Form.Item>
        </Form>
        <div className={styles.error}>{campusError}</div>
      </Modal>
    );
  }
}

export default Form.create<AddCampusModalProps>()(AddCampusModal);

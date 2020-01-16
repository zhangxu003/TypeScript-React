import React, { Component } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
// import { router } from 'umi';
import { FormComponentProps } from 'antd/es/form';
import { Input, Button, Form, message } from 'antd';
import { ConnectState } from '@/models/connect.d';
import RegionSelect from '@/components/RegionSelect';
import styles from './index.less';

interface CampusDetailProps {
  TENANT_AUTHORIZE_MODE?: any; // 授权方式
  DONGLE_CUSTOMER_TYPE?: any; // 客户类型
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  ADMINISTRATIVE_DIVISION?: any;
  form: FormComponentProps['form'];
  InstallShow?: any;
}
@connect(({ campus, dictionary }: ConnectState) => {
  const {
    detail, // 详情
    InstallShow,
  } = campus;
  const { ADMINISTRATIVE_DIVISION, TENANT_AUTHORIZE_MODE, DONGLE_CUSTOMER_TYPE } = dictionary;
  return {
    detail,
    ADMINISTRATIVE_DIVISION,
    TENANT_AUTHORIZE_MODE, // 授权方式
    DONGLE_CUSTOMER_TYPE, // 客户类型
    InstallShow,
  };
})
class ListBaseInfo extends Component<CampusDetailProps> {
  state = {
    areaCode: '',
  };

  componentWillMount() {
    const { detail } = this.props;
    this.setState({
      areaCode: detail.areaCode,
    });
  }

  // 地区选择
  handleRegionChange = (value: string[]) => {
    this.setState({
      areaCode: value[value.length - 1],
    });
  };

  matchValue = (key: any, data: any) => {
    const text: any[] = [];
    data.forEach((element: any) => {
      if (element.code === key) {
        if (element.parentCode) {
          const current = data.find((vo: { code: any }) => vo.code === element.parentCode);
          if (current.parentCode) {
            text.push(current.parentCode);
          }
          text.push(element.parentCode);
        }

        text.push(element.code);
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

  // 保存基本信息
  saveCampusDetail = () => {
    const { form, dispatch, detail } = this.props;
    form.validateFields((_err, values) => {
      if (values.campusName.trim() === '') {
        message.warning(
          formatMessage({
            id: 'operate.message.pleaseEnterTheNameOfTheCampus',
            defaultMessage: '请输入校区名称',
          }),
        );
        return;
      }
      // const telephone = values.tel;
      // if (!values.tel || (values.tel && telephone.replace(/(^\s*)/g, '') === '')) {
      //   message.warning(
      //     formatMessage({
      //       id: 'operate.message.pleaseEnterThePhoneNumber',
      //       defaultMessage: '请输入电话号码',
      //     }),
      //   );
      //   return;
      // }
      const re = /^1(3|4|5|7|8)\d{9}$|^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
      if (values.tel && !re.test(values.tel)) {
        message.warning(
          formatMessage({
            id: 'operate.message.phoneInputFormatIsNotCorrect',
            defaultMessage: '电话输入格式不正确',
          }),
        );
        return;
      }
      if (dispatch) {
        dispatch({
          type: 'campus/editCampusInfo',
          payload: {
            campusId: detail.id,
            address: values.address,
            areaCode: values.areaCode[values.areaCode.length - 1],
            campusName: values.campusName,
            campusAlias: values.campusAlias,
            tel: values.tel,
            customerType: detail.customerType,
            accreditType: detail.tenantAuthorizeMode,
            subAuthType: detail.subAuthType,
          },
          callback: () => {
            dispatch({
              type: 'campus/CampusDetailInfo',
              payload: {
                campusId: detail.id,
              },
            });
            message.success(
              formatMessage({ id: 'operate.message.saveSuccess', defaultMessage: '保存成功' }),
            );
            localStorage.setItem('activeKey', '1');
            // router.push('/tenant/campus');
          },
        });
      }
    });
  };

  render() {
    const {
      detail,
      ADMINISTRATIVE_DIVISION,
      form,
      DONGLE_CUSTOMER_TYPE,
      TENANT_AUTHORIZE_MODE,
      InstallShow,
    } = this.props;
    const { areaCode } = this.state;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.listBaseInfoContainer}>
        <Form layout="vertical">
          <Form.Item
            label={formatMessage({ id: 'operate.title.paper.name', defaultMessage: '名称' })}
            className={styles.cell}
          >
            {getFieldDecorator('campusName', {
              initialValue: detail.name,
            })(<Input className={styles.inputTx} maxLength={30} />)}
          </Form.Item>

          <div className={styles.cell}>
            <div className={styles.item}>
              <div className={styles.tit}>
                {formatMessage({
                  id: 'operate.title.authorization.mode',
                  defaultMessage: '授权方式',
                })}
              </div>
              <div className={styles.cont}>
                {this.matchValueType(detail.tenantAuthorizeMode, TENANT_AUTHORIZE_MODE)}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.tit}>
                {formatMessage({
                  id: 'operate.message.theCustomerType',
                  defaultMessage: '客户类型',
                })}
              </div>
              <div className={styles.cont}>
                {this.matchValueType(detail.customerType, DONGLE_CUSTOMER_TYPE)}
              </div>
            </div>
          </div>
          <div className={styles.cell}>
            <Form.Item
              label={formatMessage({ id: 'operate.message.referredToAs', defaultMessage: '简称' })}
              className={styles.item}
            >
              {getFieldDecorator('campusAlias', {
                initialValue: detail.campusAlias,
              })(<Input className={styles.inptx} maxLength={30} />)}
            </Form.Item>

            {!InstallShow && (
              <Form.Item
                label={formatMessage({ id: 'operate.message.region', defaultMessage: '地区' })}
                className={styles.item}
              >
                {getFieldDecorator('areaCode', {
                  initialValue: this.matchValue(detail.areaCode, ADMINISTRATIVE_DIVISION),
                })(
                  <RegionSelect
                    onChange={this.handleRegionChange}
                    width={330}
                    value={this.matchValue(areaCode, ADMINISTRATIVE_DIVISION)}
                  />,
                )}
              </Form.Item>
            )}
          </div>
          <Form.Item
            label={formatMessage({
              id: 'operate.message.detailedAddress',
              defaultMessage: '详细地址',
            })}
            className={styles.cell}
          >
            {getFieldDecorator('address', {
              initialValue: detail.address,
            })(<Input className={styles.inputTx} defaultValue={detail.address} maxLength={50} />)}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'operate.message.thePhone', defaultMessage: '电话' })}
            className={styles.cell}
          >
            {getFieldDecorator('tel', {
              initialValue: detail.tel,
            })(<Input className={styles.inptx} maxLength={20} />)}
          </Form.Item>

          <div className={styles.saveBasic}>
            <Button type="primary" shape="round" onClick={this.saveCampusDetail}>
              {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
export default Form.create<CampusDetailProps>()(ListBaseInfo);

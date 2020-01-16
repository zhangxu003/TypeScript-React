import React, { useCallback, useState } from 'react';
import { AnyAction } from 'redux';
import { connect } from 'dva';
import { match as IMatch } from 'dva/router';
import { uniq, last } from 'lodash';
import { Form, Input, Button, Divider, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { formatMessage } from 'umi-plugin-react/locale';
import IconFont from '@/components/IconFont';
import RegionSelect from '@/components/RegionSelect';
import { TChannelVendorDetail } from '../../../models/channelVendor';
import styles from './index.less';
import { ConnectState } from '@/models/connect';

const { TextArea } = Input;

/**
 * URL 参数类型定义
 */
export interface IUrlParams {
  id: string;
}

/**
 * Props 类型定义
 */
export interface IDetailProps {
  match: IMatch<IUrlParams>; // match
  dispatch<K = any>(action: AnyAction): K; // dispatch
  form: FormComponentProps['form']; // form
  channelVendorDetail: TChannelVendorDetail; // 渠道商详情
  loading: boolean; // 详情价值状态
  submitting: boolean; // 提交请求状态
  ADMINISTRATIVE_DIVISION?: ConnectState['dictionary']['ADMINISTRATIVE_DIVISION']; // 区域
}

/**
 *
 */
interface TAreaCode {
  key: number;
  values: Array<string> | null;
}

/**
 * State 类型定义
 */
interface IDetailState {
  areaCodes: Array<TAreaCode>; // 销售区域Code
  modelError: string | null; // 校验失败信息
}

/**
 * @description 渠道商详情
 * @author tina.zhang
 * @date 2019-11-7 09:47:19
 */
const Detail: React.FC<IDetailProps> = props => {
  // 国际化
  const messages = {
    name: formatMessage({
      id: 'operate.title.channelvendor.detail.name',
      defaultMessage: '名称',
    }),
    namePlaceholder: formatMessage({
      id: 'operate.placeholder.channelvendor.detail.name',
      defaultMessage: '请输入渠道商名称',
    }),
    area: formatMessage({
      id: 'operate.title.channelvendor.detail.area',
      defaultMessage: '销售区域',
    }),
    areaPlaceholder: formatMessage({
      id: 'operate.placeholder.channelvendor.detail.area',
      defaultMessage: '请输入销售区域',
    }),
    remark: formatMessage({
      id: 'operate.title.channelvendor.detail.remark',
      defaultMessage: '备注',
    }),
    btnAdd: formatMessage({
      id: 'operate.button.channelvendor.detail.btnadd',
      defaultMessage: '添加',
    }),
    btnSave: formatMessage({
      id: 'operate.button.channelvendor.detail.btnsave',
      defaultMessage: '保存',
    }),
    lablePlaceholder: formatMessage({
      id: 'operate.text.pleaseEnterTheNoteInformation',
      defaultMessage: '请输入备注信息',
    }),
  };

  const { dispatch, form, channelVendorDetail, submitting } = props;
  const { getFieldDecorator, getFieldValue } = form;

  // State
  const [state, setState] = useState<IDetailState>(() => {
    let areaCodes: any = [
      {
        key: 0,
        values: null,
      },
    ];
    const { businessScope = [] } = channelVendorDetail || {};
    if (businessScope && businessScope.length > 0) {
      areaCodes = businessScope.map((p, idx) => ({
        key: idx,
        values: p.areaCode,
      }));
    }
    return {
      areaCodes,
      modelError: null,
    };
  });

  // 添加区域选择控件
  const handleAddRegionSelect = useCallback(() => {
    const regionKeys = form.getFieldValue('regionKeys');
    const nextRegionKey = state.areaCodes.length;
    const nextKeys = regionKeys.concat(nextRegionKey);
    form.setFieldsValue({
      regionKeys: nextKeys,
    });
    const nextAreaCodes = [...state.areaCodes, { key: nextRegionKey, values: null }];
    setState({
      ...state,
      areaCodes: nextAreaCodes,
    });
  }, [state]);

  // 区域选择事件
  const handleRegionChanged = useCallback(
    (key: number, codes: string[]) => {
      form.setFieldsValue({ [`region${key}`]: codes });
      const areaCodes = state.areaCodes.map(v => ({
        ...v,
        values: v.key === key ? codes : v.values,
      }));
      setState({
        ...state,
        areaCodes,
      });
    },
    [state],
  );

  // 移除销售区域选择控件
  const handleRemoveRegionSelect = useCallback(
    (key: number) => {
      const regionKeys = getFieldValue('regionKeys');
      if (regionKeys.length === 1) {
        return;
      }
      // 更新 form
      form.setFieldsValue({
        regionKeys: regionKeys.filter((k: number) => k !== key),
      });

      // 更新 State
      setState({
        ...state,
        areaCodes: state.areaCodes.filter(p => p.key !== key),
      });
    },
    [state],
  );

  // 渲染销售区域选择控件
  const renderRegionSelects = () => {
    // 初始化第一个区域选择控件
    getFieldDecorator('regionKeys', {
      initialValue: [...Array(state.areaCodes.length)].map((v, idx) => idx),
    });

    const regionKeys = getFieldValue('regionKeys');
    const formItems = regionKeys.map((k: number, idx: number) => {
      const area = state.areaCodes.find(item => item.key === k);
      const values = area ? area.values : [''];
      // 当前已选择的所有区域，用于禁用其他选择框内同一区域
      const selectedValues = state.areaCodes
        .map(a => {
          if (a.values && a.values.length > 0) {
            return last(a.values);
          }
          return null;
        })
        .filter(tag => !!tag);

      // 获取重复值得数组
      const againVal = uniq(selectedValues).filter(
        item => selectedValues.filter(tag => tag === item).length > 1,
      );

      // 是否是重复值
      const noUniq = againVal.includes(last(values));

      return (
        <Form.Item
          // className={idx !== 0 ? styles.regionItem : null}
          key={`region_item_${k}`}
          label={idx === 0 ? messages.area : ' '}
        >
          {getFieldDecorator(`region${k}`, {
            initialValue: values,
            // rules: [{ required: true, message: messages.areaPlaceholder }],
          })(
            <div className={styles.regionContainer}>
              <div className={noUniq ? styles.error : ''} style={{ width: '100%' }}>
                <RegionSelect
                  shape="normal"
                  width="100%"
                  value={values as string[]}
                  onChange={vals => handleRegionChanged(k, vals)}
                  // disableValue={selectedValues as string[]}
                />
              </div>
              {idx !== 0 && (
                <div onClick={() => handleRemoveRegionSelect(k)}>
                  <IconFont type="icon-detele" />
                </div>
              )}
            </div>,
          )}
        </Form.Item>
      );
    });
    return formItems;
  };

  // 提交保存
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      if (!values.name.trim()) {
        form.setFields({
          name: {
            value: '',
            errors: [new Error(messages.namePlaceholder)],
          },
        });
        return;
      }

      const formatValues: any = {
        // channelVendorId: channelVendorDetail ? channelVendorDetail.id : null,
        channelVendorName: values.name.trim(),
        address: values.address,
        businessScope: null,
      };
      const businessScope: any[] = [];
      values.regionKeys.forEach((k: number) => {
        if (values[`region${k}`] && values[`region${k}`].length > 0) {
          businessScope.push({ areaCode: values[`region${k}`][values[`region${k}`].length - 1] });
        }
      });
      formatValues.businessScope = businessScope;
      // 判断是否有重叠数据
      if (businessScope && businessScope.length > 0) {
        const allCode = (formatValues.businessScope || []).map((item: any) => item.areaCode);
        if (uniq(allCode).length !== values.regionKeys.length) {
          message.error('不能重复添加相同的地区！');
          return;
        }
      }

      dispatch({
        type: 'channelVendor/updateChannelVendor',
        payload: formatValues,
      }).then(() => {
        message.success(
          formatMessage({ id: 'operate.message.saveSuccess', defaultMessage: '保存成功' }),
        );
      });
    });
  }, []);

  const formItemLayout = {
    colon: false,
    labelCol: { span: 2 },
    wrapperCol: { span: 22 },
  };

  return (
    <div className={styles.detail}>
      {channelVendorDetail && (
        <Form
          hideRequiredMark
          className={styles.form}
          layout="horizontal"
          onSubmit={handleSubmit}
          {...formItemLayout}
        >
          <Form.Item label={messages.name}>
            {getFieldDecorator('name', {
              initialValue: channelVendorDetail.name,
              rules: [{ required: true, message: messages.namePlaceholder }],
            })(<Input placeholder={messages.namePlaceholder} maxLength={30} />)}
          </Form.Item>
          {renderRegionSelects()}
          <Button
            type="default"
            shape="round"
            className={styles.btnAdd}
            onClick={handleAddRegionSelect}
          >
            <IconFont type="icon-add" />
            {messages.btnAdd}
          </Button>
          <Form.Item label={messages.remark}>
            {getFieldDecorator('address', {
              initialValue: channelVendorDetail.address,
            })(<TextArea rows={4} maxLength={500} placeholder={messages.lablePlaceholder} />)}
          </Form.Item>
          <Divider type="horizontal" />
          <Form.Item>
            <Button type="primary" shape="round" htmlType="submit" loading={submitting}>
              {messages.btnSave}
            </Button>
            <span className={styles.error}>{}</span>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default connect(({ channelVendor, loading, dictionary }: ConnectState) => ({
  channelVendorDetail: channelVendor.channelVendorDetail,
  loading: loading.effects['channelVendor/getChannelVendorDetail'],
  submitting: loading.effects['channelVendor/updateChannelVendor'],
  ADMINISTRATIVE_DIVISION: dictionary.ADMINISTRATIVE_DIVISION,
}))(Form.create<IDetailProps>()(Detail));

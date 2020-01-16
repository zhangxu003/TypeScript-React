import React, { useState, useCallback } from 'react';
import { Form, Modal, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './index.less';

/**
 * Props 类型定义
 */
export interface ICreateModalPorps {
  form: FormComponentProps['form'];
  onModalClose: (values?: object) => void;
  loading: boolean;
}
/**
 * 弹窗按钮事件回调参数
 */
type TClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

/**
 * 创建渠道商弹窗
 * @date 2019-11-11 11:19:20
 * @author leo.guo
 */
const CreateModal: React.FC<ICreateModalPorps> = props => {
  // 国际化
  const messages = {
    title: formatMessage({
      id: 'operate.button.channelvendor.createlink',
      defaultMessage: '创建渠道商',
    }),
    name: formatMessage({
      id: 'operate.title.channelvendor.create.name',
      defaultMessage: '名称',
    }),
    namePlaceholder: formatMessage({
      id: 'operate.placeholder.channelvendor.detail.name',
      defaultMessage: '请输入渠道商名称',
    }),
  };

  const { form, onModalClose, loading } = props;
  const { getFieldDecorator } = form;

  const [modelError, setModelError] = useState<boolean>(false);

  // 确定
  const handleOkClick = useCallback<TClick>(
    e => {
      if (loading) {
        return;
      }
      e.preventDefault();
      form.validateFields((err, values) => {
        const name = values.name.trim();
        if (!name) {
          setModelError(true);
          return;
        }
        setModelError(false);
        if (onModalClose && typeof onModalClose === 'function') {
          onModalClose({ name });
        }
      });
    },
    [onModalClose],
  );

  // 取消
  const handleCancelClick = useCallback<TClick>(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, [onModalClose]);

  return (
    <Modal
      width={460}
      visible
      maskClosable={false}
      centered
      destroyOnClose
      className={styles.createModal}
      title={messages.title}
      onOk={handleOkClick}
      onCancel={handleCancelClick}
      okButtonProps={{ disabled: loading }}
    >
      <Form layout="horizontal">
        <Form.Item
          label={messages.name}
          colon={false}
          labelAlign="left"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          {getFieldDecorator('name', {
            initialValue: '',
            // rules: [{ required: true, message: '请输入渠道商名称 !' }],
          })(<Input maxLength={30} placeholder={messages.namePlaceholder} />)}
        </Form.Item>
      </Form>
      <div className={styles.error}>{modelError && messages.namePlaceholder}</div>
    </Modal>
  );
};

export default Form.create<ICreateModalPorps>()(CreateModal);

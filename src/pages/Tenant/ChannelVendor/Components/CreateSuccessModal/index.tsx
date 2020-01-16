import React, { useCallback } from 'react';
import { Modal, Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import IconFont from '@/components/IconFont';
import styles from './index.less';

/**
 * Props 类型定义
 */
export interface ICreateSuccessModal {
  channelVendorName: string; // 渠道商名称
  onModalClose: () => void; // 关闭弹窗回调
}

/**
 * 渠道商创建成功弹窗
 * @author tina.zhang
 * @date 2019-11-12 15:22:07
 */
const CreateSuccessModal: React.FC<ICreateSuccessModal> = props => {
  const { channelVendorName, onModalClose } = props;

  // 关闭回调
  const handleModalCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, [onModalClose]);

  return (
    <Modal
      visible
      closable
      centered
      maskClosable={false}
      destroyOnClose
      width="400px"
      wrapClassName={styles.createSuccessModal}
      footer={null}
      onCancel={handleModalCancel}
    >
      <div className={styles.content}>
        <div className={styles.successIcon}>
          <IconFont type="icon-right" />
        </div>
        <div className={styles.successText}>
          <FormattedMessage
            id="operate.text.channelvendor.createsuccess.title"
            defaultMessage="成功创建 {content} 渠道商"
            values={{
              content: <span className={styles.info}>{channelVendorName}</span>,
            }}
          />
        </div>
        <div className={styles.footer}>
          <Button shape="round" type="primary" className={styles.okbtn} onClick={handleModalCancel}>
            {formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateSuccessModal;

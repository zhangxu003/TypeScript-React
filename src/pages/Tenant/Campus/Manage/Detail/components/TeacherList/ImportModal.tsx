import React from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import Import from './Import/index';
import styles from './index.less';

interface ImportModalProps extends ConnectProps {
  visible: boolean;
  hideModal: () => void;
}

@connect(({ dongle }: ConnectState) => {
  const {
    dongleArr, // 当期页数据
  } = dongle;
  return {
    dongleArr,
  };
})
export default class ImportModal extends React.Component<ImportModalProps> {
  render() {
    const { visible, hideModal } = this.props;

    return (
      <Modal
        visible={visible}
        onOk={hideModal}
        centered
        onCancel={hideModal}
        footer={false}
        className={styles.ImportModals}
        title={formatMessage({ id: 'operate.text.importTheTeacher', defaultMessage: '导入教师' })}
      >
        <Import onCancel={hideModal} />
      </Modal>
    );
  }
}

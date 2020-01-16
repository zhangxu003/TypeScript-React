import React, { useMemo } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import IconFont from '@/components/IconFont';
import { IDongle } from '@/pages/Tenant/models/channelVendor';
import styles from './index.less';

/**
 * Props 类型定义
 */
export interface IDongleListProps {
  dongleList: Array<IDongle>;
}

/**
 * distributeCount 类型定义
 */
interface IDistributeCount {
  mainCount: number; // 主狗数量
  viceCount: number; // 副狗数量
}

/**
 * 已读加密狗列表
 * @author tina.zhang
 * @date 2019-11-18 16:46:45
 */
const DistributeSuccess: React.FC<IDongleListProps> = props => {
  const { dongleList } = props;

  // 已分配加密狗数量

  const distributeCount = useMemo<IDistributeCount>(() => {
    const distributeDongles = dongleList.filter(v => v.status === 'INITIAL');
    return {
      mainCount: distributeDongles.filter(v => v.dongleType === 'MAIN_DONGLE').length,
      viceCount: distributeDongles.filter(v => v.dongleType === 'VICE_DONGLE').length,
    };
  }, [dongleList]);

  return (
    <div className={styles.distributeSuccess}>
      <div className={styles.successIcon}>
        <IconFont type="icon-right" />
      </div>
      <div className={styles.successText}>
        <FormattedMessage
          id="operate.text.dongle.distribute.success"
          defaultMessage="成功分配 {mainCount} 个主狗，{viceCount} 个副狗"
          values={{
            mainCount: <span className={styles.info}>{distributeCount.mainCount}</span>,
            viceCount: <span className={styles.info}>{distributeCount.viceCount}</span>,
          }}
        />
      </div>
    </div>
  );
};

export default DistributeSuccess;

import React, { useCallback } from 'react';
import { Divider, message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classNames from 'classnames';
import { IDongle } from '@/pages/Tenant/models/channelVendor';
import styles from './index.less';
import IconFont from '@/components/IconFont';

/**
 * Props 类型定义
 */
export interface IDongleListProps {
  dongleList: Array<IDongle>; // 加密狗列表
  allowedOperation: boolean; // 是否允许操作（读狗、分配成功列表区别）
  onDelete?: (id: string) => void; // 删除加密狗回调
}

/**
 * 已读加密狗列表
 * @author leo.guo
 * @date 2019-11-18 16:46:45
 */
const DongleList: React.FC<IDongleListProps> = props => {
  const { dongleList, onDelete, allowedOperation = true } = props;

  // 渲染列表项
  const renderItem = useCallback(
    (dongle: IDongle) => (
      <div className={styles.dongleItem} key={dongle.id}>
        <div className={styles.content}>
          <div className={styles.left}>
            {dongle.dongleType === 'MAIN_DONGLE' && (
              <span className={classNames(styles.tag, styles.maintag)}>
                {formatMessage({ id: 'operate.text.theMain', defaultMessage: '主' })}
              </span>
            )}
            {dongle.dongleType === 'VICE_DONGLE' && (
              <span className={classNames(styles.tag, styles.vicetag)}>
                {formatMessage({ id: 'operate.text.vice', defaultMessage: '副' })}
              </span>
            )}
            {dongle.sn}
          </div>
          {allowedOperation && (
            <div className={styles.right}>
              <IconFont
                type="icon-detele"
                onClick={() => {
                  if (onDelete && typeof onDelete === 'function') {
                    onDelete(dongle.id);
                  }
                }}
              />
              <CopyToClipboard
                text={dongle.sn}
                onCopy={() => {
                  message.success(
                    `${formatMessage({
                      id: 'operate.text.youHaveSuccessfullyReproduced',
                      defaultMessage: '您已成功复制',
                    })} ${dongle.sn}`,
                  );
                }}
              >
                <IconFont type="icon-copy" />
              </CopyToClipboard>
            </div>
          )}
        </div>
        {allowedOperation && dongle.status !== 'INITIAL' && (
          <div className={styles.error}>
            {formatMessage({
              id: 'operate.message.dongle.distribute.notallowed',
              defaultMessage: '当前加密狗不允许分配给渠道商！',
            })}
          </div>
        )}
      </div>
    ),
    [allowedOperation, onDelete],
  );

  // 待分配数量
  const willDistributeCount = dongleList.filter(v => v.status === 'INITIAL').length;

  return (
    <div className={styles.dongleListContainer}>
      {allowedOperation && (
        <>
          <Divider type="horizontal" />
          <div className={styles.title}>
            <div>
              {formatMessage({ id: 'operate.text.haveReadTheSn', defaultMessage: '已读SN' })}
            </div>
            <div>
              {formatMessage({
                id: 'operate.text.dongle.distribute.willdistribute',
                defaultMessage: '待分配：',
              })}
              <span>{willDistributeCount || 0}</span>
            </div>
          </div>
        </>
      )}
      <div className={styles.dongleList}>{dongleList.map(d => renderItem(d))}</div>
    </div>
  );
};

export default DongleList;

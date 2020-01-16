import React, { Component } from 'react';
import { connect } from 'dva';
import { Tag } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import styles from './index.less';

interface ListBaseInfoProps {
  packageDetail?: ConnectState['resourcepackage']['packageDetail'];
}

@connect(({ resourcepackage, loading }: ConnectState) => {
  const { packageDetail } = resourcepackage;

  return {
    packageDetail,
    loading: loading.effects['resourcepackage/packageDetail'],
  };
})
class ListBaseInfo extends Component<ListBaseInfoProps> {
  state = {};

  componentDidMount() {}

  render() {
    const { packageDetail } = this.props;
    const { tags } = packageDetail;
    let tagsList = [];
    if (tags) {
      tagsList = tags.split(',');
    }

    // 适用地区
    // let areas = '';
    // if (areaList) {
    //   areas = areaList.reduce(
    //     (total: string, currentValue: any) => `${total}，${currentValue.areaValue}`,
    //     '',
    //   );
    // }

    return (
      <div className={styles.listBaseInfoContainer}>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.paper.label', defaultMessage: '试卷包编号' })}
            </div>
            <div className={styles.cont}>{packageDetail && packageDetail.code}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.paper.number', defaultMessage: '试卷数' })}
            </div>
            <div className={styles.cont}>{packageDetail && packageDetail.paperCount}</div>
          </div>
        </div>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' })}
            </div>
            <div className={styles.cont} style={{ width: 'calc(100% - 90px)' }}>
              {/* {areas.substring(1, areas.length)} */}
              {packageDetail && packageDetail.areaCodeValue}
            </div>
          </div>
        </div>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({
                id: 'operate.title.default.author.number',
                defaultMessage: '默认授权数',
              })}
            </div>
            <div className={styles.cont}>{packageDetail && packageDetail.defaultAccreditNum}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({
                id: 'operate.title.incremental.activations',
                defaultMessage: '增量激活数',
              })}
            </div>
            <div className={styles.cont}>{packageDetail && packageDetail.incrementActiveNum}</div>
          </div>
        </div>
        <div className={styles.cell}>
          <div className={styles.item}>
            <div className={styles.tit}>
              {formatMessage({ id: 'operate.title.label', defaultMessage: '标签' })}
            </div>
            <div className={styles.tagsList}>
              {tagsList.map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ListBaseInfo;

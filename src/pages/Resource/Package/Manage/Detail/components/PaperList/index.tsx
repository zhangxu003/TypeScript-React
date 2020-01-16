import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Tag, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import TrueIcon from '@/assets/paperpackage/true.png';
import { matchUnitType } from '@/utils/utils';
import event from '@/utils/event';
import styles from './index.less';

interface PaperListProps {
  dispatch?: (e: any) => void;
  paperPackageId: string;
  loading?: ConnectState['loading']['effects'];
  paperListData?: ConnectState['resourcepackage']['paperListData'];
}

@connect(({ resourcepackage, loading }: ConnectState) => {
  const { paperListData } = resourcepackage;

  return {
    paperListData,
    loading: loading.effects['resourcepackage/paperList'],
  };
})
class PaperList extends Component<PaperListProps> {
  state = {
    columns: [
      {
        title: formatMessage({ id: 'operate.title.paper', defaultMessage: '试卷' }),
        dataIndex: 'paperName',
        key: 'paperName',
        width: '17%',
        render: (text: any, record: any) => (
          <div style={{ paddingLeft: '10px' }}>
            <Tooltip title={text}>
              <span className={styles.cellTxt}>{text}</span>
            </Tooltip>
            {record.isExamination === 'Y' && (
              <img className={styles.trueQusetion} src={TrueIcon} alt="true" />
            )}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' }),
        dataIndex: 'areaCodeValue',
        key: 'areaCodeValue',
        width: '17%',
        render: (text: any) => (
          <div>
            <Tooltip title={text}>
              <span className={styles.cellTxt}>{text}</span>
            </Tooltip>
          </div>
        ),
        // render: (text: any, record: any) => {
        //   const { areaList } = record;
        //   let areas = '';
        //   if (areaList) {
        //     areas = areaList.reduce(
        //       (total: string, currentValue: any) => `${total}，${currentValue.areaValue}`,
        //       '',
        //     );
        //   }

        //   return (
        //     <div className={styles.cellTxt} title={text}>
        //       {areas.substring(1, areas.length)}
        //     </div>
        //   );
        // },
      },
      {
        title: formatMessage({ id: 'operate.title.paper.template', defaultMessage: '试卷结构' }),
        dataIndex: 'paperTemplateName',
        key: 'paperTemplateName',
        width: '15%',
        render: (text: any) => (
          <div>
            <Tooltip title={text}>
              <span className={styles.cellTxt}>{text}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.scope', defaultMessage: '试卷范围' }),
        dataIndex: 'paperScopeValue',
        key: 'paperScopeValue',
        width: '15%',
        render: (text: any, record: any) => (
          <div>
            <Tooltip title={matchUnitType(record)}>
              <span className={styles.cellTxt}>{matchUnitType(record)}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.year', defaultMessage: '年份' }),
        dataIndex: 'annual',
        key: 'annual',
        width: '10%',
      },
      {
        title: formatMessage({ id: 'operate.title.paper.facility', defaultMessage: '难易度' }),
        dataIndex: 'difficultLevelValue',
        key: 'difficultLevelValue',
        width: '10%',
      },
      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '16%',
        render: (text: any, record: any) => (
          <span>
            {record.isPreview === 'Y' && (
              <Tag className={styles.reviewTag}>
                {formatMessage({ id: 'operate.text.preview', defaultMessage: '预览' })}
              </Tag>
            )}
            {record.isVisible === 'N' && (
              <Tag className={styles.secrecyTag}>
                {formatMessage({ id: 'operate.text.secrecy', defaultMessage: '保密' })}
              </Tag>
            )}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    this.getList(1);
  }

  handlePageChange = (page: number) => {
    this.getList(page);
    // 切换页码时回到顶部
    event.emit('srollPopupWarp');
  };

  getList = (page: number) => {
    const { dispatch, paperPackageId } = this.props;

    if (dispatch) {
      dispatch({
        type: 'resourcepackage/paperList',
        payload: { paperPackageId, pageIndex: page, pageSize: 10 },
      });
    }
  };

  render() {
    const { columns } = this.state;
    const { paperListData, loading } = this.props;
    // console.log('-----paperListData:', paperListData);
    return (
      <div className={styles.listPaperListContainer}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={paperListData.records}
          rowKey={record => record.paperId}
          pagination={{
            defaultCurrent: 1,
            pageSize: 10,
            total: paperListData.total,
            showTotal: () => (
              <span style={{ marginRight: '20px' }}>
                {formatMessage(
                  { id: 'operate.text.all.count', defaultMessage: '共 {dataCount} 条' },
                  { dataCount: paperListData.total },
                )}
              </span>
            ),
            onChange: page => this.handlePageChange(page),
          }}
        />
      </div>
    );
  }
}
export default PaperList;

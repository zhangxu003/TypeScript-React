import React, { Component } from 'react';
import { Table, Switch, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { connect } from 'dva';
import Select from '@/components/Select';
import Search from '@/components/Search';
import { ConnectState } from '@/models/connect.d';
import { PaperListParmsType } from '@/services/tenantpackage';
import TrueIcon from '@/assets/paperpackage/true.png';
import { matchUnitType } from '@/utils/utils';
import styles from './index.less';

const { Option } = Select;

interface CheckPaperListProps {
  dispatch?: (e: any) => void;
  campusId: string;
  loading?: ConnectState['loading']['effects'];
  GRADE?: ConnectState['dictionary']['GRADE'];
  ANNUAL?: ConnectState['dictionary']['ANNUAL'];
  DIFFICULT_LVL?: ConnectState['dictionary']['DIFFICULT_LVL'];
  PAPER_ISVISIBLE?: ConnectState['dictionary']['PAPER_ISVISIBLE'];
  paperTemplateList?: ConnectState['tenantpackage']['paperTemplateList'];
  records?: ConnectState['tenantpackage']['paperListData']['records'];
  pageSize?: ConnectState['tenantpackage']['paperListData']['pageSize'];
  pageIndex?: ConnectState['tenantpackage']['paperListData']['pageIndex'];
  total?: ConnectState['tenantpackage']['paperListData']['total'];
}

@connect(({ dictionary, tenantpackage, loading }: ConnectState) => {
  const { GRADE = [], ANNUAL = [], DIFFICULT_LVL = [], PAPER_ISVISIBLE = [] } = dictionary;
  const { records = [], total, pageSize, pageIndex } = tenantpackage.paperListData || {};
  const { paperTemplateList } = tenantpackage;

  return {
    GRADE,
    ANNUAL,
    DIFFICULT_LVL,
    PAPER_ISVISIBLE,
    paperTemplateList,
    records,
    total,
    pageSize,
    pageIndex,
    loading: loading.effects['tenantpackage/fetchPaperList'],
  };
})
class CheckPaperList extends Component<CheckPaperListProps> {
  state = {
    columns: [
      {
        title: formatMessage({ id: 'operate.title.paper', defaultMessage: '试卷' }),
        dataIndex: 'paperName',
        key: 'paperName',
        width: '16%',
        render: (text: any, record: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt} style={{ paddingLeft: '10px' }}>
              <span>{text}</span>
              {record.isExamination === 'Y' && <img src={TrueIcon} alt="true" />}
            </div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.region', defaultMessage: '适用地区' }),
        dataIndex: 'areaCodeValue',
        key: 'areaCodeValue',
        width: '12%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'operate.title.paper.package.name',
          defaultMessage: '试卷包名称',
        }),
        dataIndex: 'packageName',
        key: 'packageName',
        width: '14%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.template', defaultMessage: '试卷结构' }),
        dataIndex: 'paperTemplateName',
        key: 'paperTemplateName',
        width: '12%',
        render: (text: any) => (
          <Tooltip title={text}>
            <div className={styles.cellTxt}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.scope', defaultMessage: '试卷范围' }),
        dataIndex: 'paperScopeValue',
        key: 'paperScopeValue',
        width: '16%',
        render: (text: any, record: any) => (
          <Tooltip title={matchUnitType(record)}>
            <div className={styles.cellTxt}>{matchUnitType(record)}</div>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'operate.title.paper.facility', defaultMessage: '难易度' }),
        dataIndex: 'difficultLevelValue',
        key: 'difficultLevelValue',
        width: '10%',
      },
      {
        title: formatMessage({ id: 'operate.title.paper.year', defaultMessage: '年份' }),
        dataIndex: 'annual',
        key: 'annual',
        width: '8%',
      },
      {
        title: formatMessage({ id: 'operate.title.operation', defaultMessage: '操作' }),
        dataIndex: 'action',
        key: 'action',
        width: '12%',
        render: (text: any, record: any) => (
          <Switch
            defaultChecked={record.isVisible === 'Y'}
            checkedChildren={formatMessage({ id: 'operate.title.open', defaultMessage: '公开' })}
            unCheckedChildren={formatMessage({
              id: 'operate.text.secrecy',
              defaultMessage: '保密',
            })}
            onChange={checked => this.handleSwitchChange(record.campusPaperId, checked)}
          />
        ),
      },
    ],
  };

  componentDidMount() {
    this.getPaperTemplate();
    // this.getPaperList({ pageIndex: 1 });
  }

  // 获取试卷结构
  getPaperTemplate = () => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchPaperTemplate',
        payload: { campusId },
      });
    }
  };

  // 获取试卷列表
  getPaperList = (params: PaperListParmsType) => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/fetchPaperList',
        payload: { campusId, ...params },
      });
    }
  };

  // 试卷公开、保密变更
  handleSwitchChange = (paperId: string, checked: boolean) => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'tenantpackage/changePaperStatus',
        payload: { campusPaperId: paperId, status: checked ? 'Y' : 'N' },
      });
    }
  };

  // 年级
  gradeChange = (value: any) => {
    this.getPaperList({ pageIndex: 1, grade: value });
  };

  // 年份
  yearChange = (value: any) => {
    this.getPaperList({ pageIndex: 1, annual: value });
  };

  // 难易度
  facilityChange = (value: any) => {
    this.getPaperList({ pageIndex: 1, difficultLevel: value });
  };

  // 试卷结构
  templateChange = (value: any) => {
    this.getPaperList({ pageIndex: 1, paperTemplateId: value });
  };

  // 状态
  statusChange = (value: any) => {
    this.getPaperList({ pageIndex: 1, isVisible: value });
  };

  handlePageChange = (page: number) => {
    this.getPaperList({ pageIndex: page });
  };

  handleSearch = (value: string) => {
    const params = {
      pageIndex: 1,
      filterWord: value,
    };
    this.getPaperList(params);
  };

  render() {
    const { columns } = this.state;
    const {
      GRADE = [],
      ANNUAL = [],
      DIFFICULT_LVL = [],
      PAPER_ISVISIBLE = [],
      paperTemplateList = [],
      records = [],
      total,
      pageSize,
      pageIndex,
      loading,
    } = this.props;

    const gradeList = [{ id: 'all', value: '不限', code: '' }, ...GRADE];
    const annualList = [{ id: 'all', value: '不限', code: '' }, ...ANNUAL];
    const difficultList = [{ id: 'all', value: '不限', code: '' }, ...DIFFICULT_LVL];
    const statusList = [{ id: 'all', value: '不限', code: '' }, ...PAPER_ISVISIBLE];

    const templateList = [{ id: '', name: '不限' }, ...paperTemplateList];

    return (
      <div className={styles.checkPaperListContainer}>
        <div className={styles.top}>
          <div className={styles.left}>
            <Search
              placeholder={formatMessage({
                id: 'operate.placeholder.search.paper.name',
                defaultMessage: '请输入试卷名称搜索',
              })}
              onSearch={this.handleSearch}
              style={{ width: 180 }}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.grade', defaultMessage: '年级' })}
              </span>
              <Select
                shape="round"
                dropdownMatchSelectWidth={false}
                className={styles.select}
                onChange={this.gradeChange}
                defaultValue=""
                getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
              >
                {gradeList.map(grade => (
                  <Option key={grade.id} value={grade.code}>
                    {grade.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.year', defaultMessage: '年份' })}
              </span>
              <Select
                shape="round"
                className={styles.select}
                onChange={this.yearChange}
                defaultValue=""
                getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
              >
                {annualList.map(tag => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.facility', defaultMessage: '难易度' })}
              </span>
              <Select
                shape="round"
                className={styles.select}
                onChange={this.facilityChange}
                defaultValue=""
                getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
              >
                {difficultList.map(tag => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.template', defaultMessage: '试卷结构' })}
              </span>
              <Select
                shape="round"
                dropdownMatchSelectWidth={false}
                className={styles.select}
                onChange={this.templateChange}
                defaultValue=""
                getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
              >
                {templateList.map(tag => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={styles.selectItem}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.title.paper.auth.status', defaultMessage: '状态' })}
              </span>
              <Select
                shape="round"
                dropdownMatchSelectWidth={false}
                className={styles.select}
                onChange={this.statusChange}
                defaultValue=""
                getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
              >
                {statusList.map(tag => (
                  <Option key={tag.id} value={tag.code}>
                    {tag.value}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {/* 表格 */}
        <div className={styles.tableBox}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={records}
            rowKey={record => `${record.campusPaperId}${record.paperId}`} // 防止后端数据异常导致rowKey一样导致table展示异常
            pagination={{
              current: pageIndex,
              pageSize,
              total,
              showTotal: () => (
                <span style={{ marginRight: '20px' }}>
                  {formatMessage(
                    { id: 'operate.text.all.count', defaultMessage: '共 {dataCount} 条' },
                    { dataCount: total },
                  )}
                </span>
              ),
              onChange: page => this.handlePageChange(page),
            }}
          />
        </div>
      </div>
    );
  }
}
export default CheckPaperList;

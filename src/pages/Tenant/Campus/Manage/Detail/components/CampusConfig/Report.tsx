import React, { Component } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';
import { Radio, Input, Select, Button, Spin, message } from 'antd';
import { connect } from 'dva';
// import { router } from 'umi';
import { Dispatch, AnyAction } from 'redux';
import { ConnectState } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import styles from './index.less';

const { Option } = Select;
interface ReportProps {
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  campusReport?: any;
  loading?: boolean;
  loadingUpdate?: boolean;
}

@connect(({ loading, campus }: ConnectState) => {
  const {
    detail, // 详情
    campusReport, // 报告策略详情
  } = campus;

  return {
    detail,
    campusReport,
    loading: loading.effects['campus/getCampusReportDetail'],
    loadingUpdate: loading.effects['campus/updateCampusReportDetail'],
  };
})
class Report extends Component<ReportProps> {
  state = {
    scoreRange: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    questionRange: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    subQuestionRange: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    orderRange: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    orderWaring: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    orderChange: [
      {
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      },
    ],
    orderSwitch: 0,
    orderNum: '',
    excellentRate: { rangeBegin: '', rangeEnd: '', containBegin: 1, containEnd: 1, isUsed: 1 },
    lowerRate: { rangeBegin: '', rangeEnd: '', containBegin: 1, containEnd: 1, isUsed: 1 },
    passRate: { rangeBegin: '', rangeEnd: '', containBegin: 1, containEnd: 1, isUsed: 1 },
    status: [''],
  };

  componentWillMount() {
    const { dispatch, detail } = this.props;
    const that = this;
    if (dispatch) {
      dispatch({
        type: 'campus/getCampusReportDetail',
        payload: {
          campusId: detail.id,
        },
        callback: (data: {
          scoreRange: any;
          questionRange: any;
          subQuestionRange: any;
          orderRange: any;
          orderWaring: any;
          orderChange: any;
          orderSwitch: any;
          excellentPassRate: any;
          orderNum: any;
        }) => {
          that.setState({
            scoreRange: data.scoreRange,
            questionRange: data.questionRange,
            subQuestionRange: data.subQuestionRange,
            orderRange: data.orderRange,
            orderWaring: data.orderWaring,
            orderChange: data.orderChange,
            orderSwitch: data.orderSwitch,
            orderNum: data.orderNum,
            excellentRate: data.excellentPassRate.excellentRate,
            lowerRate: data.excellentPassRate.lowerRate,
            passRate: data.excellentPassRate.passRate,
          });
        },
      });
    }
  }

  // 删除分段
  delRange = (type: any, index: any) => {
    const {
      scoreRange,
      questionRange,
      subQuestionRange,
      orderRange,
      orderWaring,
      orderChange,
    } = this.state;
    if (type === 'scoreRange' && scoreRange.length > 1) {
      this.setState({
        scoreRange: scoreRange.filter((item, i) => i !== index),
      });
    }
    if (type === 'questionRange' && questionRange.length > 1) {
      this.setState({
        questionRange: questionRange.filter((item, i) => i !== index),
      });
    }
    if (type === 'subQuestionRange' && subQuestionRange.length > 1) {
      this.setState({
        subQuestionRange: subQuestionRange.filter((item, i) => i !== index),
      });
    }
    if (type === 'orderRange' && orderRange.length > 1) {
      this.setState({
        orderRange: orderRange.filter((item, i) => i !== index),
      });
    }
    if (type === 'orderWaring' && orderWaring.length > 1) {
      this.setState({
        orderWaring: orderWaring.filter((item, i) => i !== index),
        orderChange: orderChange.filter((item, i) => i !== index),
      });
    }
  };

  // 添加分段
  addRange = (type: any) => {
    const {
      scoreRange,
      questionRange,
      subQuestionRange,
      orderRange,
      orderWaring,
      orderChange,
    } = this.state;
    if (type === 'scoreRange' && scoreRange.length < 7) {
      scoreRange.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      this.setState({
        scoreRange,
      });
    }
    if (type === 'questionRange' && questionRange.length < 7) {
      questionRange.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      this.setState({
        questionRange,
      });
    }
    if (type === 'subQuestionRange' && subQuestionRange.length < 7) {
      subQuestionRange.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      this.setState({
        subQuestionRange,
      });
    }
    if (type === 'orderRange' && orderRange.length < 7) {
      orderRange.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      this.setState({
        orderRange,
      });
    }
    if (type === 'orderWaring' && orderWaring.length < 7) {
      orderWaring.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      orderChange.push({
        containBegin: 1,
        containEnd: 0,
        isUsed: 1,
        rangeBegin: '',
        rangeEnd: '',
      });
      this.setState({
        orderWaring,
        orderChange,
      });
    }
  };

  // 保存输入框数据
  saveData = (
    type: string,
    param: string,
    index: React.ReactText,
    e: { target: { value: string } },
  ) => {
    const re = /^[0-9]*[0-9][0-9]*|(\.\d{0,3})$/;
    if (e.target.value.trim() !== '' && Number(e.target.value) > 100) {
      return;
    }
    if (e.target.value.trim() !== '' && !re.test(e.target.value)) {
      return;
    }
    const {
      scoreRange,
      questionRange,
      subQuestionRange,
      orderRange,
      orderWaring,
      orderChange,
    } = this.state;
    if (type === 'scoreRange') {
      if (param === 'rangeBegin') {
        scoreRange[index].rangeBegin = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      if (param === 'rangeEnd') {
        scoreRange[index].rangeEnd = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      this.setState({
        scoreRange,
      });
    }
    if (type === 'questionRange') {
      if (param === 'rangeBegin') {
        questionRange[index].rangeBegin =
          e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      if (param === 'rangeEnd') {
        questionRange[index].rangeEnd = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      this.setState({
        questionRange,
      });
    }
    if (type === 'subQuestionRange') {
      if (param === 'rangeBegin') {
        subQuestionRange[index].rangeBegin =
          e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      if (param === 'rangeEnd') {
        subQuestionRange[index].rangeEnd =
          e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      this.setState({
        subQuestionRange,
      });
    }
    if (type === 'orderRange') {
      if (param === 'rangeBegin') {
        orderRange[index].rangeBegin = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      if (param === 'rangeEnd') {
        orderRange[index].rangeEnd = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      this.setState({
        orderRange,
      });
    }
    if (type === 'orderWaring') {
      if (param === 'rangeBegin') {
        orderWaring[index].rangeBegin = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      if (param === 'rangeEnd') {
        orderWaring[index].rangeEnd = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }
      this.setState({
        orderWaring,
      });
    }
    if (type === 'orderChange') {
      if (param === 'rangeBegin') {
        orderChange[index].rangeBegin = e.target.value.trim() === '' ? '' : Number(e.target.value);
      }

      this.setState({
        orderChange,
      });
    }
  };

  // 保存select 数据
  savSelecteData = (type: string, param: string, index: React.ReactText, e: any) => {
    const { scoreRange, questionRange, subQuestionRange, orderRange, orderWaring } = this.state;
    if (type === 'scoreRange') {
      if (param === 'containBegin') {
        scoreRange[index].containBegin = e;
      }
      if (param === 'containEnd') {
        scoreRange[index].containEnd = e;
      }
      this.setState({
        scoreRange,
      });
    }
    if (type === 'questionRange') {
      if (param === 'containBegin') {
        questionRange[index].containBegin = e;
      }
      if (param === 'containEnd') {
        questionRange[index].containEnd = e;
      }
      this.setState({
        questionRange,
      });
    }
    if (type === 'subQuestionRange') {
      if (param === 'containBegin') {
        subQuestionRange[index].containBegin = e;
      }
      if (param === 'containEnd') {
        subQuestionRange[index].containEnd = e;
      }
      this.setState({
        subQuestionRange,
      });
    }
    if (type === 'orderRange') {
      if (param === 'containBegin') {
        orderRange[index].containBegin = e;
      }
      if (param === 'containEnd') {
        orderRange[index].containEnd = e;
      }
      this.setState({
        orderRange,
      });
    }
    if (type === 'orderWaring') {
      if (param === 'containBegin') {
        orderWaring[index].containBegin = e;
      }
      if (param === 'containEnd') {
        orderWaring[index].containEnd = e;
      }
      this.setState({
        orderWaring,
      });
    }
  };

  // 保存输入框的值
  saveRate = (type: string, e: { target: { value: string } }) => {
    const { excellentRate, lowerRate, passRate } = this.state;
    const re = /^[0-9]*[0-9][0-9]*$/;
    if (e.target.value.trim() !== '' && Number(e.target.value) > 100) {
      return;
    }
    if (e.target.value.trim() !== '' && !re.test(e.target.value)) {
      return;
    }
    if (
      e.target.value.trim() !== '' &&
      (!Number(e.target.value.trim()) || !re.test(e.target.value))
    ) {
      message.warning(
        formatMessage({
          id: 'operate.message.pleaseEnterTheNumbers',
          defaultMessage: '请输入数字',
        }),
      );
      return;
    }
    if (type === 'excellentRate') {
      excellentRate.rangeBegin = e.target.value;
      excellentRate.rangeEnd = '100';
      this.setState({
        excellentRate,
      });
    }
    if (type === 'lowerRate') {
      lowerRate.rangeBegin = '0';
      lowerRate.rangeEnd = e.target.value;
      this.setState({
        lowerRate,
      });
    }
    if (type === 'passRate') {
      passRate.rangeBegin = e.target.value;
      passRate.rangeEnd = '100';
      this.setState({
        passRate,
      });
    }
    if (type === 'orderNum') {
      this.setState({
        orderNum: e.target.value,
      });
    }
  };

  // 保存表单 数据
  saveReport = () => {
    // 验证区间
    const {
      excellentRate,
      lowerRate,
      passRate,
      orderChange,
      orderRange,
      orderSwitch,
      orderWaring,
      questionRange,
      scoreRange,
      subQuestionRange,
      orderNum,
    } = this.state;
    const status: string[] = [];
    orderRange.forEach((vo, index) => {
      if (
        !(
          Number(orderRange[0].rangeBegin) === 0 &&
          Number(orderRange[orderRange.length - 1].rangeEnd) === 100 &&
          orderRange[orderRange.length - 1].containEnd === 1
        )
      ) {
        status.push('orderRange');
      }
      if (vo.rangeBegin > vo.rangeEnd) {
        status.push('orderRange');
      }
      if (index + 1 < orderRange.length - 1 || index + 1 === orderRange.length - 1) {
        if (
          vo.rangeEnd !== orderRange[index + 1].rangeBegin ||
          (vo.containEnd === 0 && orderRange[index + 1].containBegin === 0) ||
          (vo.containEnd === 1 && orderRange[index + 1].containBegin === 1)
        ) {
          status.push('orderRange');
        }
      }
    });
    questionRange.forEach((vo, index) => {
      if (
        !(
          Number(questionRange[0].rangeBegin) === 0 &&
          Number(questionRange[questionRange.length - 1].rangeEnd) === 100 &&
          questionRange[questionRange.length - 1].containEnd === 1
        )
      ) {
        status.push('questionRange');
      }
      if (vo.rangeBegin > vo.rangeEnd) {
        status.push('questionRange');
      }
      if (index + 1 < questionRange.length - 1 || index + 1 === questionRange.length - 1) {
        if (
          vo.rangeEnd !== questionRange[index + 1].rangeBegin ||
          (vo.containEnd === 0 && questionRange[index + 1].containBegin === 0) ||
          (vo.containEnd === 1 && questionRange[index + 1].containBegin === 1)
        ) {
          status.push('questionRange');
        }
      }
    });
    scoreRange.forEach((vo, index) => {
      if (
        !(
          Number(scoreRange[0].rangeBegin) === 0 &&
          Number(scoreRange[scoreRange.length - 1].rangeEnd) === 100 &&
          scoreRange[scoreRange.length - 1].containEnd === 1
        )
      ) {
        status.push('scoreRange');
      }
      if (vo.rangeBegin > vo.rangeEnd) {
        status.push('scoreRange');
      }
      if (index + 1 < scoreRange.length - 1 || index + 1 === scoreRange.length - 1) {
        if (
          vo.rangeEnd !== scoreRange[index + 1].rangeBegin ||
          (vo.containEnd === 0 && scoreRange[index + 1].containBegin === 0) ||
          (vo.containEnd === 1 && scoreRange[index + 1].containBegin === 1)
        ) {
          status.push('scoreRange');
        }
      }
    });
    subQuestionRange.forEach((vo, index) => {
      if (
        !(
          Number(subQuestionRange[0].rangeBegin) === 0 &&
          Number(subQuestionRange[subQuestionRange.length - 1].rangeEnd) === 100 &&
          subQuestionRange[subQuestionRange.length - 1].containEnd === 1
        )
      ) {
        status.push('subQuestionRange');
      }
      if (vo.rangeBegin > vo.rangeEnd) {
        status.push('subQuestionRange');
      }
      if (index + 1 < subQuestionRange.length - 1 || index + 1 === subQuestionRange.length - 1) {
        if (
          vo.rangeEnd !== subQuestionRange[index + 1].rangeBegin ||
          (vo.containEnd === 0 && subQuestionRange[index + 1].containBegin === 0) ||
          (vo.containEnd === 1 && subQuestionRange[index + 1].containBegin === 1)
        ) {
          status.push('subQuestionRange');
        }
      }
    });
    orderWaring.forEach((vo, index) => {
      if (
        !(
          Number(orderWaring[0].rangeBegin) === 0 &&
          Number(orderWaring[orderWaring.length - 1].rangeEnd) === 100 &&
          orderWaring[orderWaring.length - 1].containEnd === 1
        )
      ) {
        status.push('orderWaring');
      }
      if (vo.rangeBegin > vo.rangeEnd) {
        status.push('orderWaring');
      }
      if (index + 1 < orderWaring.length - 1 || index + 1 === orderWaring.length - 1) {
        if (
          vo.rangeEnd !== orderWaring[index + 1].rangeBegin ||
          (vo.containEnd === 0 && orderWaring[index + 1].containBegin === 0) ||
          (vo.containEnd === 1 && orderWaring[index + 1].containBegin === 1)
        ) {
          status.push('orderWaring');
        }
      }
    });
    this.setState({
      status,
    });
    if (status.length > 0) {
      return;
    }
    const { dispatch, detail } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/updateCampusReportDetail',
        payload: {
          campusId: detail.id,
          excellentPassRate: {
            excellentRate,
            lowerRate,
            passRate,
          },
          orderChange,
          orderRange,
          orderSwitch,
          orderWaring,
          questionRange,
          scoreRange,
          subQuestionRange,
          orderNum,
        },
        callback: () => {
          message.success(
            formatMessage({ id: 'operate.message.saveSuccess', defaultMessage: '保存成功' }),
          );
          dispatch({
            type: 'campus/CampusDetailInfo',
            payload: {
              campusId: detail.id,
            },
          });
          localStorage.setItem('activeKey', '3');
          // router.push('/tenant/campus');
        },
      });
    }
  };

  // 切换是否对学生公布排名
  switchOrder = (e: any) => {
    this.setState({
      orderSwitch: e.target.value,
    });
  };

  render() {
    const { loading, campusReport, loadingUpdate } = this.props;
    const {
      scoreRange,
      questionRange,
      subQuestionRange,
      orderRange,
      orderWaring,
      orderChange,
      orderSwitch,
      orderNum,
      excellentRate,
      lowerRate,
      passRate,
      status,
    } = this.state;
    return (
      <Spin spinning={loading}>
        <div className={styles.reportSet}>
          <div className={styles.reportTable}>
            {campusReport && (
              <div className={styles.columnOne}>
                <div className={styles.columnTitle}>
                  {formatMessage({ id: 'operate.message.passThe', defaultMessage: '及格' })}
                </div>
                <div className={styles.inputTx}>
                  <span className={styles.symbol}>{'> ='}</span>
                  <Input value={passRate.rangeBegin} onChange={e => this.saveRate('passRate', e)} />
                  <span className={styles.percent}>%</span>
                </div>
                <div className={styles.fine}>
                  {formatMessage({ id: 'operate.message.good', defaultMessage: '优秀' })}
                </div>
                <div className={styles.inputTx}>
                  <span className={styles.symbol}>{'> ='}</span>
                  <Input
                    value={excellentRate.rangeBegin}
                    onChange={e => this.saveRate('excellentRate', e)}
                  />
                  <span className={styles.percent}>%</span>
                </div>
                <div className={styles.fine}>
                  {formatMessage({ id: 'operate.message.lowGrade', defaultMessage: '低分' })}
                </div>
                <div className={styles.inputTx}>
                  <span className={styles.symbol}>{'<'}</span>
                  <Input value={lowerRate.rangeEnd} onChange={e => this.saveRate('lowerRate', e)} />
                  <span className={styles.percent}>%</span>
                </div>
              </div>
            )}
            <div className={styles.columntwo}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.message.scoreSectionupTo7',
                  defaultMessage: '分数分段(最多7段)',
                })}
              </div>
              <div className={styles.scoreList}>
                <ul
                  className={
                    status.filter((vo: any) => vo === 'scoreRange').length > 0
                      ? styles.selected
                      : {}
                  }
                >
                  {scoreRange.length > 0 &&
                    scoreRange.map((vo: any, index: any) => (
                      <li>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeBegin}
                            onChange={e => this.saveData('scoreRange', 'rangeBegin', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <Select
                          value={vo.containBegin}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('scoreRange', 'containBegin', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <span className={styles.score}>
                          {formatMessage({ id: 'operate.message.score', defaultMessage: '分数' })}
                        </span>
                        <Select
                          value={vo.containEnd}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('scoreRange', 'containEnd', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeEnd}
                            onChange={e => this.saveData('scoreRange', 'rangeEnd', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <IconFont
                          type="icon-detele"
                          onClick={() => this.delRange('scoreRange', index)}
                        />
                      </li>
                    ))}
                </ul>
                <div className={styles.scoreAdd}>
                  <IconFont type="icon-add" onClick={() => this.addRange('scoreRange')} />
                </div>
              </div>
            </div>
            <div className={styles.columntwo}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.message.bigScoreSection7Most',
                  defaultMessage: '大题分数分段(最多7段)',
                })}
              </div>
              <div className={styles.scoreList}>
                <ul
                  className={
                    status.filter((vo: any) => vo === 'questionRange').length > 0
                      ? styles.selected
                      : {}
                  }
                >
                  {questionRange.length > 0 &&
                    questionRange.map((vo: any, index: any) => (
                      <li>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeBegin}
                            onChange={e => this.saveData('questionRange', 'rangeBegin', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <Select
                          value={vo.containBegin}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('questionRange', 'containBegin', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <span className={styles.score}>
                          {formatMessage({ id: 'operate.message.score', defaultMessage: '分数' })}
                        </span>
                        <Select
                          value={vo.containEnd}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('questionRange', 'containEnd', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeEnd}
                            onChange={e => this.saveData('questionRange', 'rangeEnd', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <IconFont
                          type="icon-detele"
                          onClick={() => this.delRange('questionRange', index)}
                        />
                      </li>
                    ))}
                </ul>
                <div className={styles.scoreAdd}>
                  <IconFont type="icon-add" onClick={() => this.addRange('questionRange')} />
                </div>
              </div>
            </div>
            <div className={styles.columntwo}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.message.oralItemScoresSection7Most',
                  defaultMessage: '口语题小题分数分段(最多7段)',
                })}
              </div>
              <div className={styles.scoreList}>
                <ul
                  className={
                    status.filter((vo: any) => vo === 'subQuestionRange').length > 0
                      ? styles.selected
                      : {}
                  }
                >
                  {subQuestionRange.length > 0 &&
                    subQuestionRange.map((vo: any, index: any) => (
                      <li>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeBegin}
                            onChange={e =>
                              this.saveData('subQuestionRange', 'rangeBegin', index, e)
                            }
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <Select
                          value={vo.containBegin}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('subQuestionRange', 'containBegin', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <span className={styles.score}>
                          {formatMessage({ id: 'operate.message.score', defaultMessage: '分数' })}
                        </span>
                        <Select
                          value={vo.containEnd}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('subQuestionRange', 'containEnd', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeEnd}
                            onChange={e => this.saveData('subQuestionRange', 'rangeEnd', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <IconFont
                          type="icon-detele"
                          onClick={() => this.delRange('subQuestionRange', index)}
                        />
                      </li>
                    ))}
                </ul>
                <div className={styles.scoreAdd}>
                  <IconFont type="icon-add" onClick={() => this.addRange('subQuestionRange')} />
                </div>
              </div>
            </div>
            <div className={styles.columntwo}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.title.rankingSectionupTo7',
                  defaultMessage: '排名分段(最多7段)',
                })}
              </div>
              <div className={styles.scoreList}>
                <ul
                  className={
                    status.filter((vo: any) => vo === 'orderRange').length > 0
                      ? styles.selected
                      : {}
                  }
                >
                  {orderRange.length > 0 &&
                    orderRange.map((vo: any, index: any) => (
                      <li>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeBegin}
                            onChange={e => this.saveData('orderRange', 'rangeBegin', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <Select
                          value={vo.containBegin}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('orderRange', 'containBegin', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <span className={styles.score}>
                          {formatMessage({ id: 'operate.message.score', defaultMessage: '分数' })}
                        </span>
                        <Select
                          value={vo.containEnd}
                          style={{ width: 56 }}
                          onChange={(e: any) =>
                            this.savSelecteData('orderRange', 'containEnd', index, e)
                          }
                        >
                          <Option value={0}> {'<'}</Option>
                          <Option value={1}>{'<='}</Option>
                        </Select>
                        <div className={styles.percents}>
                          <Input
                            value={vo.rangeEnd}
                            onChange={e => this.saveData('orderRange', 'rangeEnd', index, e)}
                          />
                          <span className={styles.percent}>%</span>
                        </div>
                        <IconFont
                          type="icon-detele"
                          onClick={() => this.delRange('orderRange', index)}
                        />
                      </li>
                    ))}
                </ul>
                <div className={styles.scoreAdd}>
                  <IconFont type="icon-add" onClick={() => this.addRange('orderRange')} />
                </div>
              </div>
            </div>
            <div className={styles.columnthree}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.message.theLowestRankingSectionNumber',
                  defaultMessage: '最低排名分段人数',
                })}
              </div>
              <div className={styles.lowScoreMan}>
                <Input
                  value={orderNum}
                  onChange={e => this.saveRate('orderNum', e)}
                  placeholder={formatMessage({
                    id: 'operate.message.pleaseEnterAnInteger0100',
                    defaultMessage: '请输入0-100的整数',
                  })}
                />
              </div>
            </div>
            <div className={styles.columnfour}>
              <div className={styles.columnTitle}>
                {formatMessage({ id: 'operate.message.noWarning', defaultMessage: '排名预警' })}
              </div>
              <ul
                className={
                  status.filter((vo: any) => vo === 'orderWaring').length > 0 ? styles.selected : {}
                }
              >
                {orderWaring.length > 0 &&
                  orderWaring.map((vo: any, index: any) => (
                    <li>
                      <div className={styles.percents}>
                        <Input
                          value={vo.rangeBegin}
                          onChange={e => this.saveData('orderWaring', 'rangeBegin', index, e)}
                        />
                        <span className={styles.percent}>%</span>
                      </div>
                      <Select
                        value={vo.containBegin}
                        style={{ width: 56 }}
                        onChange={(e: any) =>
                          this.savSelecteData('orderWaring', 'containBegin', index, e)
                        }
                      >
                        <Option value={0}> {'<'}</Option>
                        <Option value={1}>{'<='}</Option>
                      </Select>
                      <span className={styles.score}>
                        {formatMessage({ id: 'operate.message.score', defaultMessage: '分数' })}
                      </span>
                      <Select
                        value={vo.containEnd}
                        style={{ width: 56 }}
                        onChange={(e: any) =>
                          this.savSelecteData('orderWaring', 'containEnd', index, e)
                        }
                      >
                        <Option value={0}> {'<'}</Option>
                        <Option value={1}>{'<='}</Option>
                      </Select>
                      <div className={styles.percents}>
                        <Input
                          value={vo.rangeEnd}
                          onChange={e => this.saveData('orderWaring', 'rangeEnd', index, e)}
                        />
                        <span className={styles.percent}>%</span>
                      </div>
                      ,{formatMessage({ id: 'operate.message.volatility', defaultMessage: '波动' })}
                      <div className={styles.percents}>
                        <Input
                          value={orderChange[index].rangeBegin}
                          onChange={e => this.saveData('orderChange', 'rangeBegin', index, e)}
                        />
                        <span className={styles.percent}>%</span>
                      </div>
                      <IconFont
                        type="icon-detele"
                        onClick={() => this.delRange('orderWaring', index)}
                      />
                    </li>
                  ))}
              </ul>
              <div className={styles.scoreAdd}>
                <IconFont type="icon-add" onClick={() => this.addRange('orderWaring')} />
              </div>
            </div>
            <div className={styles.columnfive}>
              <div className={styles.columnTitle}>
                {formatMessage({
                  id: 'operate.message.whetherPublishRankingsForStudents',
                  defaultMessage: '是否对学生公布排名',
                })}
              </div>
              <div className={styles.open}>
                <Radio.Group value={orderSwitch} onChange={this.switchOrder}>
                  <Radio value={1}>
                    {formatMessage({ id: 'operate.message.published', defaultMessage: '公布' })}
                  </Radio>
                  <Radio value={0}>
                    {formatMessage({
                      id: 'operate.message.doNotPublish',
                      defaultMessage: '不公布',
                    })}
                  </Radio>
                </Radio.Group>
              </div>
            </div>
          </div>
          <div className={styles.saveReport}>
            <Button shape="round" type="primary" onClick={this.saveReport} disabled={loadingUpdate}>
              {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
            </Button>
            {status.filter((vo: any) => vo !== '').length > 0 && (
              <span className={styles.warning}>
                {formatMessage({
                  id: 'operate.message.pleaseCheckWhetherYourSegmentOf0100ContinuousPiecewise',
                  defaultMessage: '请检查您的分段是否为0-100的连续分段！',
                })}
              </span>
            )}
          </div>
        </div>
      </Spin>
    );
  }
}
export default Report;

import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { Radio, Input, Popover, Select, Button, message, Modal } from 'antd';
import { connect } from 'dva';
// import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import IconFont from '@/components/IconFont';
import CustomUpload from '@/components/CustomUpload';
import styles from './index.less';

const { TextArea } = Input;
const { confirm } = Modal;
const { Option } = Select;

const RadioGroup = Radio.Group;

interface BasicProps {
  dispatch?: Dispatch<AnyAction>;
  detail?: any;
  EDUCATION_PHASE?: ConnectState['dictionary']['EDUCATION_PHASE'];
  EDUCATION_SYSTEM?: ConnectState['dictionary']['EDUCATION_SYSTEM'];
  CLASS_STRUCT?: ConnectState['dictionary']['CLASS_STRUCT'];
  CLASS_ALIAS_VIEW_RANGE?: ConnectState['dictionary']['CLASS_ALIAS_VIEW_RANGE'];
}

@connect(({ loading, dictionary, campus }: ConnectState) => {
  const {
    detail, // 详情
  } = campus;
  const {
    EDUCATION_PHASE = [], // 学段
    EDUCATION_SYSTEM = [], // 学制
    CLASS_STRUCT = [], // 班级架构
    CLASS_ALIAS_VIEW_RANGE = [], // 班级别名可见范围
  } = dictionary;
  return {
    EDUCATION_PHASE,
    EDUCATION_SYSTEM,
    CLASS_STRUCT,
    CLASS_ALIAS_VIEW_RANGE,
    detail,
    loading: loading.effects['campus/editCampusInfo'],
  };
})
class Basic extends Component<BasicProps> {
  state = {
    middleSchoolGrade: [
      {
        key: 'grade1',
        value: formatMessage({ id: 'operate.message.theNewMoon', defaultMessage: '初一' }),
      },
      {
        key: 'grade2',
        value: formatMessage({ id: 'operate.message.inTheEarly1', defaultMessage: '初1' }),
      },
      {
        key: 'grade3',
        value: formatMessage({ id: 'operate.message.seven', defaultMessage: '七' }),
      },
      {
        key: 'grade4',
        value: formatMessage({ id: 'operate.message.7', defaultMessage: '7' }),
      },
    ],
    highSchoolGrade: [
      {
        key: 'highGrade1',
        value: formatMessage({ id: 'operate.message.higher', defaultMessage: '高一' }),
      },
      {
        key: 'highGrade2',
        value: formatMessage({ id: 'operate.message.high1', defaultMessage: '高1' }),
      },
    ],
    popoverVisible: false,
    classNamePopoverVisible: false,
    primaryGrade: '',
    primaryClass: '',
    primaryBrackets: '1', // 是否有括号
    primaryBracketsValue: '', // 小学班序样

    middleGrade: '',
    middleClass: '',
    middleBrackets: '1', // 是否有括号
    middleBracketsValue: '', // 初中班序样

    highGrade: '',
    highClass: '',
    highBrackets: '1', // 是否有括号
    highBracketsValue: '', // 高中班序样

    description: '', // 欢迎词
    educationPhaseList: [
      {
        educationPhase: '',
      },
    ], // 学段
    educationSystem: '63', // 学制
    logo: '', // 校区LOGO
    optionalClassAlias: '', // 班级别名是否可见
    // optionalClassSystem: '', // 是否走班
    structure: '', // 班级架构
    path: '',
    errorMgs: '', // 接口返回的错误信息
  };

  componentWillMount() {
    const { detail, dispatch } = this.props;
    detail.educationPhaseList.forEach((item: any) => {
      if (item.educationPhase === '101') {
        // 小学
        const { classNameFormat } = item;
        let formatNameArr = [];
        if (classNameFormat) {
          formatNameArr = classNameFormat.split(',');
          const gradeNum = formatNameArr[0];
          const hasBrackets = formatNameArr[1];
          const classNum = formatNameArr[2];
          const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, false);

          this.setState({
            primaryBracketsValue: showValue,
            primaryGrade: gradeNum,
            primaryClass: classNum,
            primaryBrackets: hasBrackets,
          });
        }
      }
      if (item.educationPhase === '201') {
        // 初中
        const { classNameFormat } = item;
        let formatNameArr = [];
        if (classNameFormat) {
          formatNameArr = classNameFormat.split(',');
          const gradeNum = formatNameArr[0];
          const hasBrackets = formatNameArr[1];
          const classNum = formatNameArr[2];
          const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, false);
          this.setState({
            middleBracketsValue: showValue,
            middleGrade: gradeNum,
            middleClass: classNum,
            middleBrackets: hasBrackets,
          });
        }
      }
      if (item.educationPhase === '301') {
        // 高中
        const { classNameFormat } = item;
        let formatNameArr = [];
        if (classNameFormat) {
          formatNameArr = classNameFormat.split(',');
          const gradeNum = formatNameArr[0];
          const hasBrackets = formatNameArr[1];
          const classNum = formatNameArr[2];
          const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, true);
          this.setState({
            highBracketsValue: showValue,
            highGrade: gradeNum,
            highClass: classNum,
            highBrackets: hasBrackets,
          });
        }
      }
    });
    if (detail.logo) {
      // 有上传过logo
      const params = {
        fileId: detail.logo,
      };
      if (dispatch) {
        dispatch({
          type: 'campus/getFile',
          payload: params,
          callback: (data: any) => {
            if (data) {
              this.setState({
                path: data.path,
              });
            }
          },
        });
      }
    }
    this.setState({
      educationPhaseList: detail.educationPhaseList,
      description: detail.description, // 欢迎词
      educationSystem: detail.educationSystem || '63', // 学制
      logo: detail.logo, // 校区LOGO
      optionalClassAlias: detail.optionalClassAlias || 'N', // 班级别名是否可见
      // optionalClassSystem: detail.optionalClassSystem, // 是否走班
      structure: detail.structure || 'N', // 班级架构
    });
  }

  setClassRange = () => {
    const { popoverVisible } = this.state;
    this.setState({
      popoverVisible: !popoverVisible,
    });
  };

  visibleChange = (visible = false) => {
    this.setState({
      popoverVisible: visible,
    });
  };

  setClassName = () => {
    const { classNamePopoverVisible } = this.state;
    this.setState({
      classNamePopoverVisible: !classNamePopoverVisible,
    });
  };

  classNameVisibleChange = (visible = false) => {
    this.setState({
      classNamePopoverVisible: visible,
    });
  };

  /* 班级名称格式配置 */
  // 切换年级
  primaryGradeChange = (value: string, type: any) => {
    // 重组样
    switch (type) {
      case 1:
        {
          const { primaryBrackets, primaryClass } = this.state;
          const showValue = this.autoInitText(value, primaryClass, primaryBrackets, false);
          this.setState({
            primaryGrade: value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          const { middleBrackets, middleClass, middleSchoolGrade } = this.state;
          const gradeObj = middleSchoolGrade.find(it => it.key === value) || { key: '', value: '' };
          const gradeValue = gradeObj.value;
          const showValue = this.autoInitText(gradeValue, middleClass, middleBrackets, false);
          this.setState({
            middleGrade: gradeValue,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          const { highBrackets, highClass, highSchoolGrade } = this.state;
          const gradeObj = highSchoolGrade.find(it => it.key === value) || { key: '', value: '' };
          const gradeValue = gradeObj.value;
          const showValue = this.autoInitText(gradeValue, highClass, highBrackets, true);
          this.setState({
            highGrade: gradeValue,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  // 切换班级
  primaryClassChange = (value: any, type: any) => {
    switch (type) {
      case 1:
        {
          // 重组样
          const { primaryBrackets, primaryGrade } = this.state;
          const showValue = this.autoInitText(primaryGrade, value, primaryBrackets, false);

          this.setState({
            primaryClass: value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          // 重组样
          const { middleBrackets, middleGrade } = this.state;
          const showValue = this.autoInitText(middleGrade, value, middleBrackets, false);

          this.setState({
            middleClass: value,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          // 重组样
          const { highBrackets, highGrade } = this.state;
          const showValue = this.autoInitText(highGrade, value, highBrackets, true);

          this.setState({
            highClass: value,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  onPrimaryRodioChange = (e: any, type: any) => {
    switch (type) {
      case 1:
        {
          const { primaryGrade, primaryClass } = this.state;
          const showValue = this.autoInitText(primaryGrade, primaryClass, e.target.value, false);
          this.setState({
            primaryBrackets: e.target.value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          const { middleGrade, middleClass } = this.state;
          const showValue = this.autoInitText(middleGrade, middleClass, e.target.value, false);
          this.setState({
            middleBrackets: e.target.value,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          const { highGrade, highClass } = this.state;
          const showValue = this.autoInitText(highGrade, highClass, e.target.value, true);
          this.setState({
            highBrackets: e.target.value,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  // 保存班级名称格式
  saveClassFormat = () => {
    const { dispatch, detail } = this.props;
    const campusId = detail.id;
    const {
      primaryGrade,
      primaryClass,
      primaryBrackets,
      middleGrade,
      middleClass,
      middleBrackets,
      highGrade,
      highClass,
      highBrackets,
      educationPhaseList,
    } = this.state;
    const list = [];
    if (educationPhaseList.filter((vo: any) => vo.educationPhase === '101').length > 0) {
      const obj = {
        campusId,
        educationPhaseCode: '101',
        formatName: `${primaryGrade},${primaryBrackets},${primaryClass}`,
      };
      list.push(obj);
    }
    if (educationPhaseList.filter((vo: any) => vo.educationPhase === '201').length > 0) {
      const obj = {
        campusId,
        educationPhaseCode: '201',
        formatName: `${middleGrade},${middleBrackets},${middleClass}`,
      };
      list.push(obj);
    }
    if (educationPhaseList.filter((vo: any) => vo.educationPhase === '301').length > 0) {
      const obj = {
        campusId,
        educationPhaseCode: '301',
        formatName: `${highGrade},${highBrackets},${highClass}`,
      };
      list.push(obj);
    }
    if (dispatch) {
      dispatch({
        type: 'campus/updateEduPhase',
        payload: list,
        callback: () => {
          message.success(
            formatMessage({
              id: 'operate.message.theClassNameFormatSettingSuccess',
              defaultMessage: '班级名称格式设置成功！',
            }),
          );
        },
      });
    }
  };

  /*  生成显示文本
        isHasBrackets:是否有括号
        isHigh:标识是否是高中，高中不需要拼接年级
    */
  autoInitText = (gradeNum: string, classNum: any, isHasBrackets: any, isHigh: any) => {
    let showValue = '';
    const classN = formatMessage({ id: 'operate.message.class', defaultMessage: '班' });
    const grade = formatMessage({ id: 'operate.title.grade', defaultMessage: '年级' });
    if (Number(isHasBrackets) === 1) {
      // 有括号
      if (isHigh) {
        showValue = `${gradeNum}(${classNum})${classN}`;
      } else if (gradeNum === '七' || gradeNum === '7') {
        showValue = `${gradeNum}${grade}(${classNum})${classN}`;
      } else {
        showValue = `${gradeNum}${grade}(${classNum})${classN}`;
      }
    } else {
      // 无括号
      const { middleSchoolGrade } = this.state;
      const midSchoolGrade1 = middleSchoolGrade[0].value;
      const midSchoolGrade2 = middleSchoolGrade[1].value;
      if (isHigh) {
        showValue = `${gradeNum}${classNum}${classN}`;
      } else if (gradeNum === midSchoolGrade1 || gradeNum === midSchoolGrade2) {
        showValue = `${gradeNum}${classNum}${classN}`;
      } else {
        showValue = `${gradeNum}${grade}${classNum}${classN}`;
      }
    }

    return showValue;
  };

  // 保存欢迎词
  changeWelcome = (e: { target: { value: { length: number } } }) => {
    if (e.target.value.length < 36) {
      this.setState({
        description: e.target.value,
      });
    }
  };

  // 学制
  changeEducation = (e: any) => {
    this.setState({
      educationSystem: e.target.value,
    });
  };

  // 班级架构
  changeClassStruct = (e: any) => {
    const { detail } = this.props;
    const { structure } = this.state;
    const that = this;
    if (detail.structure === 'Y' || structure === 'Y') {
      confirm({
        title: '',
        width: 360,
        centered: true,
        className: styles.changeStruct,
        content: (
          <div className={styles.infomations}>
            {formatMessage({ id: 'operate.message.byShiftsInto', defaultMessage: '由走班制变为' })}{' '}
            <span>
              {formatMessage({
                id: 'operate.message.theTraditionalAdministrativeClass',
                defaultMessage: '传统行政班',
              })}
            </span>
            {formatMessage({
              id:
                'operate.message.TheOriginalOfAllClassesOfTheClassAndReportInvisibleConfirmTheChanges',
              defaultMessage: '，原教学班所有的班级以及报告不可见，是否确认修改？',
            })}
          </div>
        ),
        okText: '确认',
        cancelText: '取消',
        onOk() {
          that.setState({
            structure: e.target.value,
          });
        },
        onCancel() {},
      });
    } else {
      that.setState({
        structure: e.target.value,
      });
    }
  };

  // 班级别名可见范围
  changeClassAlias = (e: any) => {
    this.setState({
      optionalClassAlias: e.target.value,
    });
  };

  // 学段 多选
  changePhase = (value: any) => {
    const { educationPhaseList } = this.state;
    let newEdu = JSON.parse(JSON.stringify(educationPhaseList));
    const current = educationPhaseList.filter((vo: any) => vo.educationPhase === value);
    if (current.length > 0) {
      newEdu = educationPhaseList.filter((vo: any) => vo.educationPhase !== value);
    } else {
      newEdu.push({
        educationPhase: value,
      });
    }
    this.setState({
      educationPhaseList: newEdu,
    });
  };

  // saveDataBasic
  saveDataBasic = async () => {
    const { dispatch, detail } = this.props;
    const {
      description,
      educationPhaseList,
      educationSystem,
      logo,
      optionalClassAlias,
      structure,
    } = this.state;
    console.log(educationPhaseList);
    if (dispatch) {
      const res = await dispatch({
        type: 'campus/editCampusBasicInfo',
        payload: {
          campusId: detail.id,
          description,
          educationPhaseList,
          educationSystem,
          logo,
          optionalClassAlias,
          optionalClassSystem: structure,
          structure,
        },
      });
      if (!res) {
        this.setState({ errorMgs: res });
      } else {
        dispatch({
          type: 'campus/CampusDetailInfo',
          payload: {
            campusId: detail.id,
          },
        });
        message.success(
          formatMessage({ id: 'operate.message.saveSuccess', defaultMessage: '保存成功' }),
        );
        localStorage.setItem('activeKey', '2');
        // router.push('/tenant/campus');
      }
    }
  };

  // 上传成功
  handleSuccess = (id: any, path: any) => {
    this.setState({
      logo: id,
      path,
    });
  };

  // 删除logo
  delLogo = () => {
    this.setState({
      logo: '',
      path: '',
    });
  };

  render() {
    const {
      classNamePopoverVisible,
      primaryBrackets,
      primaryBracketsValue,
      primaryGrade,
      primaryClass,
      middleBrackets,
      middleBracketsValue,
      middleGrade,
      middleClass,
      highBrackets,
      highBracketsValue,
      highGrade,
      highClass,
      middleSchoolGrade,
      highSchoolGrade,
      description,
      educationPhaseList,
      path,
      educationSystem,
      structure,
      errorMgs,
      optionalClassAlias,
    } = this.state;
    const {
      EDUCATION_PHASE,
      EDUCATION_SYSTEM,
      CLASS_STRUCT,
      CLASS_ALIAS_VIEW_RANGE,
      detail,
    } = this.props;
    const nameFormatText = (
      <div className={styles.nameFormatTit}>
        <i className="iconfont icon-warning" />
        <span>
          {formatMessage({
            id: 'operate.message.pleaseSelectTheFollowingOptionsConfigurationForClassNameFormat',
            defaultMessage: '请选择以下选项，进行班级名称格式配置',
          })}
        </span>
      </div>
    );
    const nameFormatContent = (
      <div className={styles.nameFormatContent}>
        <div className={styles.maxHeight}>
          {/* 小学 */}
          {educationPhaseList.filter((vo: any) => vo.educationPhase === '101').length > 0 && (
            <div className={styles.item}>
              <div className={styles.top}>
                <div className={styles.section}>
                  {formatMessage({ id: 'operate.message.primarySchool', defaultMessage: '小学' })}
                </div>
                <div className={styles.yangBox}>
                  <div className={styles.itemYang}>
                    {formatMessage({ id: 'operate.message.sample', defaultMessage: '样' })}
                  </div>
                  <div className={styles.formatName}>
                    <span>{primaryBracketsValue}</span>
                  </div>
                </div>
              </div>
              <div className={styles.middle}>
                <div className={styles.baisc}>
                  <span>
                    {formatMessage({
                      id: 'operate.message.infrastructure',
                      defaultMessage: '基础结构',
                    })}
                    ：
                  </span>
                  <Select
                    defaultValue={primaryGrade}
                    style={{ width: 85 }}
                    onChange={(e: any) => this.primaryGradeChange(e, 1)}
                  >
                    <Option value="一">一</Option>
                    <Option value="1">1</Option>
                  </Select>
                  <span className={styles.grade}>
                    {formatMessage({ id: 'operate.title.grade', defaultMessage: '年级' })}
                  </span>
                </div>
                <div className={styles.class}>
                  <Select
                    defaultValue={primaryClass}
                    style={{ width: 85 }}
                    onChange={(e: any) => this.primaryClassChange(e, 1)}
                  >
                    <Option value="1">1</Option>
                    <Option value="一">一</Option>
                  </Select>
                  <span>
                    {formatMessage({ id: 'operate.message.class', defaultMessage: '班' })}
                  </span>
                </div>
              </div>
              <div className={styles.bottom}>
                <span>
                  {formatMessage({
                    id: 'operate.message.classSequenceStyle',
                    defaultMessage: '班序样式',
                  })}
                  ：
                </span>
                <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 1)} value={primaryBrackets}>
                  <Radio value="1">
                    {formatMessage({
                      id: 'operate.message.haveTheBrackets',
                      defaultMessage: '有括号',
                    })}
                  </Radio>
                  <Radio value="0">
                    {formatMessage({
                      id: 'operate.message.withoutParentheses',
                      defaultMessage: '无括号',
                    })}
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* 初中 */}
          {educationPhaseList.filter((vo: any) => vo.educationPhase === '201').length > 0 && (
            <div className={styles.item}>
              <div className={styles.top}>
                <div className={styles.section}>
                  {formatMessage({
                    id: 'operate.message.juniorHighSchool',
                    defaultMessage: '初中',
                  })}
                </div>
                <div className={styles.yangBox}>
                  <div className={styles.itemYang}>
                    {formatMessage({ id: 'operate.message.sample', defaultMessage: '样' })}
                  </div>
                  <div className={styles.formatName}>
                    <span>{middleBracketsValue}</span>
                  </div>
                </div>
              </div>
              <div className={styles.middle}>
                <div className={styles.baisc}>
                  <span>
                    {formatMessage({
                      id: 'operate.message.infrastructure',
                      defaultMessage: '基础结构',
                    })}
                    ：
                  </span>
                  <Select
                    defaultValue={middleGrade}
                    style={{ width: 85 }}
                    onChange={(e: string) => this.primaryGradeChange(e, 2)}
                  >
                    {middleSchoolGrade.map(tag => (
                      <Option value={tag.key}>{tag.value}</Option>
                    ))}
                  </Select>
                  <span className={styles.grade}>
                    {formatMessage({ id: 'operate.title.grade', defaultMessage: '年级' })}
                  </span>
                </div>
                <div className={styles.class}>
                  <Select
                    defaultValue={middleClass}
                    style={{ width: 85 }}
                    onChange={(e: any) => this.primaryClassChange(e, 2)}
                  >
                    <Option value="1">1</Option>
                    <Option value="一">一</Option>
                  </Select>
                  <span>
                    {formatMessage({ id: 'operate.message.class', defaultMessage: '班' })}
                  </span>
                </div>
              </div>
              <div className={styles.bottom}>
                <span>
                  {formatMessage({
                    id: 'operate.message.classSequenceStyle',
                    defaultMessage: '班序样式',
                  })}
                  ：
                </span>
                <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 2)} value={middleBrackets}>
                  <Radio value="1">
                    {formatMessage({
                      id: 'operate.message.haveTheBrackets',
                      defaultMessage: '有括号',
                    })}
                  </Radio>
                  <Radio value="0">
                    {formatMessage({
                      id: 'operate.message.withoutParentheses',
                      defaultMessage: '无括号',
                    })}
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* 高中 */}
          {educationPhaseList.filter((vo: any) => vo.educationPhase === '301').length > 0 && (
            <div className={styles.item} style={{ borderBottom: 'none' }}>
              <div className={styles.top}>
                <div className={styles.section}>
                  {formatMessage({ id: 'operate.message.highSchool', defaultMessage: '高中' })}
                </div>
                <div className={styles.yangBox}>
                  <div className={styles.itemYang}>
                    {formatMessage({ id: 'operate.message.sample', defaultMessage: '样' })}
                  </div>
                  <div className={styles.formatName}>
                    <span>{highBracketsValue}</span>
                  </div>
                </div>
              </div>
              <div className={styles.middle}>
                <div className={styles.baisc}>
                  <span>
                    {formatMessage({
                      id: 'operate.message.infrastructure',
                      defaultMessage: '基础结构',
                    })}
                    ：
                  </span>
                  <Select
                    defaultValue={highGrade}
                    style={{ width: 85 }}
                    onChange={(e: string) => this.primaryGradeChange(e, 3)}
                  >
                    {highSchoolGrade.map(tag => (
                      <Option value={tag.key}>{tag.value}</Option>
                    ))}
                  </Select>
                  <span className={styles.grade}>
                    {formatMessage({ id: 'operate.title.grade', defaultMessage: '年级' })}
                  </span>
                </div>
                <div className={styles.class}>
                  <Select
                    defaultValue={highClass}
                    style={{ width: 85 }}
                    onChange={(e: any) => this.primaryClassChange(e, 3)}
                  >
                    <Option value="1">1</Option>
                    <Option value="一">一</Option>
                  </Select>
                  <span>
                    {formatMessage({ id: 'operate.message.class', defaultMessage: '班' })}
                  </span>
                </div>
              </div>
              <div className={styles.bottom}>
                <span>
                  {formatMessage({
                    id: 'operate.message.classSequenceStyle',
                    defaultMessage: '班序样式',
                  })}
                  ：
                </span>
                <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 3)} value={highBrackets}>
                  <Radio value="1">
                    {formatMessage({
                      id: 'operate.message.haveTheBrackets',
                      defaultMessage: '有括号',
                    })}
                  </Radio>
                  <Radio value="0">
                    {formatMessage({
                      id: 'operate.message.withoutParentheses',
                      defaultMessage: '无括号',
                    })}
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Button onClick={this.saveClassFormat}>
            {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
          </Button>
        </div>
      </div>
    );

    const primaryBracketsStr = primaryBracketsValue ? `${primaryBracketsValue} | ` : '';
    const middleBracketsStr = middleBracketsValue ? `${middleBracketsValue} | ` : '';
    const highBracketsStr = highBracketsValue ? `${highBracketsValue} | ` : '';
    const bracketsStr = `${primaryBracketsStr}${middleBracketsStr}${highBracketsStr}`;
    const showBracketsStr = bracketsStr.substring(0, bracketsStr.length - 2);

    return (
      <div className={styles.basicSet}>
        <div className={styles.first}>
          <div className={styles.infomation}>
            <span className={styles.tit}>
              {formatMessage({ id: 'operate.message.theSchoolLogo', defaultMessage: '学校Logo' })}:
            </span>
            <div className={styles.logo}>
              <div className={styles.upload}>
                {!path && (
                  <div>
                    <IconFont type="icon-add" />
                    {formatMessage({
                      id: 'operate.message.clickOnTheUploadSchoolLogo',
                      defaultMessage: '点击上传学校LOGO',
                    })}
                    <CustomUpload name="" onSuccess={this.handleSuccess} accept="image/*" />
                  </div>
                )}
                {path && (
                  <div className={styles.del}>
                    <img src={path} alt="" />
                    <IconFont type="icon-detele" onClick={this.delLogo} />
                  </div>
                )}
              </div>
              <p className={styles.msg}>
                {formatMessage({
                  id: 'operate.message.imageSizeLengthAndWidthWithin400PxSupportsJpgPngFormat',
                  defaultMessage: '图片尺寸长、宽400px以内，支持jpg、png格式',
                })}
              </p>
            </div>
          </div>
          <div className={styles.infomation}>
            <span className={styles.tit}>
              {formatMessage({ id: 'operate.message.greeting', defaultMessage: '欢迎词' })}:
            </span>
            <div className={styles.welcome}>
              <TextArea onChange={this.changeWelcome} value={description} />
              <span>{description ? description.length : '0'}/35</span>
            </div>
          </div>
        </div>
        <div className={styles.second}>
          <div className={styles.learnSection}>
            <div className={styles.study}>
              <span className={styles.tit}>
                {formatMessage({ id: 'operate.message.learningPeriod', defaultMessage: '学段' })}:
              </span>
              <div className={styles.learnList}>
                {EDUCATION_PHASE &&
                  EDUCATION_PHASE.length > 0 &&
                  EDUCATION_PHASE.map(vo => (
                    <span
                      onClick={() => this.changePhase(vo.code)}
                      className={
                        educationPhaseList.filter((item: any) => item.educationPhase === vo.code)
                          .length > 0
                          ? styles.selected
                          : {}
                      }
                    >
                      {vo.value}{' '}
                      <em>
                        <IconFont type="icon-right" />
                      </em>
                    </span>
                  ))}
              </div>
            </div>

            {educationPhaseList.filter((item: any) => item.educationPhase !== '301').length > 0 && (
              <div className={styles.studySet}>
                <span className={styles.tit}>
                  {formatMessage({
                    id: 'operate.message.eductionalSystme',
                    defaultMessage: '学制：',
                  })}
                </span>
                <div className={styles.learnSystem}>
                  <Radio.Group onChange={this.changeEducation} defaultValue={educationSystem}>
                    {EDUCATION_SYSTEM &&
                      EDUCATION_SYSTEM.length > 0 &&
                      EDUCATION_SYSTEM.map(vo => <Radio value={vo.code}>{vo.value}</Radio>)}
                  </Radio.Group>
                </div>
              </div>
            )}
          </div>
          <div className={styles.classStruct}>
            <span className={styles.tit}>
              {formatMessage({
                id: 'operate.message.theClassStructure',
                defaultMessage: '班级架构',
              })}
              :
            </span>
            <div className={styles.learnSystem}>
              <Radio.Group onChange={this.changeClassStruct} value={structure}>
                {CLASS_STRUCT &&
                  CLASS_STRUCT.length > 0 &&
                  CLASS_STRUCT.map(vo => <Radio value={vo.code}>{vo.value}</Radio>)}
              </Radio.Group>
            </div>
          </div>
        </div>
        <div className={styles.three}>
          <div className={styles.visibleRange}>
            <span className={styles.tit}>
              {formatMessage({
                id: 'operate.message.classNamesVisibleRange',
                defaultMessage: '班级别称可见范围',
              })}
              :
            </span>
            <Radio.Group onChange={this.changeClassAlias} defaultValue={optionalClassAlias}>
              {CLASS_ALIAS_VIEW_RANGE &&
                CLASS_ALIAS_VIEW_RANGE.length > 0 &&
                CLASS_ALIAS_VIEW_RANGE.map(vo => <Radio value={vo.code}>{vo.value}</Radio>)}
            </Radio.Group>
          </div>
          <div className={styles.visibleRangeSet}>
            <span className={styles.tit}>
              {formatMessage({
                id: 'operate.message.theClassNameFormat',
                defaultMessage: '班级名称格式',
              })}
              :
            </span>
            {/* 班级名称格式 */}
            <div className={styles.classSetting}>
              <div className={styles.itemCont} style={{ display: 'inline' }}>
                <div className={styles.yang}>
                  {formatMessage({ id: 'operate.message.sample', defaultMessage: '样' })}
                </div>
                <div className={styles.formatName} style={{ display: 'inline' }}>
                  {showBracketsStr}
                </div>
              </div>
              <Popover
                overlayClassName={styles.pop}
                placement="topRight"
                title={nameFormatText}
                content={nameFormatContent}
                trigger="click"
                visible={detail.educationPhaseList.length === 0 ? false : classNamePopoverVisible}
                onVisibleChange={this.classNameVisibleChange}
                autoAdjustOverflow={false}
                overlayStyle={{ paddingTop: '2px' }}
              >
                <Button
                  shape="round"
                  onClick={this.setClassName}
                  className={styles.setBtn}
                  disabled={detail.educationPhaseList.length === 0}
                >
                  {formatMessage({ id: 'operate.message.setUpThe', defaultMessage: '设置' })}
                </Button>
              </Popover>
            </div>
          </div>
        </div>
        <div className={styles.submitBtn}>
          <Button shape="round" type="primary" onClick={this.saveDataBasic}>
            {formatMessage({ id: 'operate.text.save', defaultMessage: '保存' })}
          </Button>
          <span className={styles.errorMgs}>{errorMgs}</span>
        </div>
      </div>
    );
  }
}
export default Basic;

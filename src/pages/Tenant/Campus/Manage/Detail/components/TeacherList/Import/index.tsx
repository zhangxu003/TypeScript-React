import React, { Component } from 'react';
import { Col, Table, Button, Input, Form, Modal } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ConnectState, ConnectProps } from '@/models/connect.d';
import { Trim } from '@/pages/Tenant/utils';
import IconFont from '@/components/IconFont';
import excelTeacherPic from '@/pages/Tenant/Campus/asset/excel_teacher_pic.png';
import loadingGif from '@/assets/loading.gif';
import { exportArrayToExcel } from './excel';
import './index.less';

const EditableContext = React.createContext({});

const EditableRow = ({ form, index, ...props }: any) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  cell: any;

  input: any;

  props: any;

  state: {
    inputValue: string;
  };

  constructor(props: any) {
    super(props);
    this.state = {
      inputValue: '',
    };
  }

  handleInputChange = (e: any) => {
    // console.log(e);
    this.setState({
      inputValue: e.target.value,
    });
    const { value } = e.target;
    const { handleInput } = this.props;
    const td = e.target.parentNode;
    const { rowIndex } = td.parentNode;
    const { cellIndex } = td;
    if (!value) {
      handleInput(rowIndex, cellIndex, value);
    }
  };

  handleInputBlur = (e: any) => {
    const { value } = e.target;
    const td = e.target.parentNode;
    const { rowIndex } = td.parentNode;
    const { cellIndex } = td;
    // console.log(rowIndex,cellIndex);
    const { handleInput } = this.props;
    if (value) {
      handleInput(rowIndex, cellIndex, value);
      this.setState({
        inputValue: '',
      });
    }
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      handleInput,
      ...restProps
    } = this.props;

    const { inputValue } = this.state;

    return (
      <td
        ref={node => {
          this.cell = node;
        }}
        {...restProps}
      >
        {editable ? (
          <Input
            ref={node => {
              this.input = node;
            }}
            value={inputValue && inputValue !== '' ? inputValue : record[dataIndex]}
            onChange={this.handleInputChange}
            onBlur={this.handleInputBlur}
            maxLength={dataIndex && dataIndex === 'name' ? 20 : 11}
          />
        ) : (
          restProps.children
        )}
      </td>
    );
  }
}

interface ImportTeachersProps extends ConnectProps {
  campusId: string;
  loading?: ConnectState['loading']['effects'];
  ACCOUNT_BIND_TYPE?: ConnectState['dictionary']['ACCOUNT_BIND_TYPE'];
  records?: ConnectState['teacher']['teacherData']['records'];
  pageSize?: ConnectState['teacher']['teacherData']['pageSize'];
  total?: ConnectState['teacher']['teacherData']['total'];
  detail: any;
  dispatch: any;
  onCancel?: any;
}

interface ImportTeachersState {
  dataSource: any;
  modalVisable: boolean;
  importSuccessVisable: boolean;
  importBtnDisabled: boolean;
  loading: boolean;
  tableData: any;
  teacherNumber: any;
  failNumber: number;
}

@connect(({ dictionary, campus, teacher, loading }: ConnectState) => {
  const { ACCOUNT_BIND_TYPE = [] } = dictionary;
  const { records = [], total, pageSize } = teacher.teacherData;
  const { detail = {} } = campus;
  return {
    detail,
    ACCOUNT_BIND_TYPE,
    records,
    total,
    pageSize,
    loading: loading.effects['teacher/getTeacherLists'],
  };
})
class ImportTeachersComponent extends Component<ImportTeachersProps, ImportTeachersState> {
  errNum: any;

  columns: any;

  state: any;

  teacherNumber: number;

  failNumber: number;

  constructor(props: any) {
    super(props);

    this.errNum = 0; // 错误信息数量
    this.teacherNumber = 0;
    this.failNumber = 0;
    this.columns = () => [
      {
        title: formatMessage({ id: 'operate.text.theName', defaultMessage: '姓名' }),
        dataIndex: 'name',
        key: 'name',
        editable: true,
        width: '20%',
      },
      {
        title:
          this.errNum > 0 ? (
            <span style={{ color: '#FF6E4A', fontSize: '13px' }}>
              <i
                className="iconfont icon-info-circle"
                style={{ fontSize: '15px', paddingRight: '5px' }}
              />
              <FormattedMessage
                values={{ number: this.errNum }}
                {...{
                  id: 'operate.text.numberErrorsDetectedInformation',
                  defaultMessage: '检测到{number}处错误信息',
                }}
              />
            </span>
          ) : (
            ''
          ),
        dataIndex: 'error',
        key: 'error',
        render: (text: any, record: any) => (
          <p className="err" style={{ color: text ? '#FF6E4A' : '#FFB400' }}>
            {text || record.warn}
          </p>
        ),
      },
    ];

    this.state = {
      modalVisable: false, // 取消弹窗
      importSuccessVisable: false, // 导入成功
      importBtnDisabled: true,
      loading: false,
      tableData: [],
      dataSource: [
        {
          error: '',
          key: 0,
          name: '',
          mobile: '',
          warn: '',
        },
      ],
    };
  }

  componentDidMount() {}

  /**
   * 获取粘贴板中的内容
   */
  onHandleTablePaste = (e: any) => {
    if (document.all && window.event) {
      // 判断IE浏览器
      window.event.returnValue = false;
    } else {
      e.preventDefault();
    }

    // 获取粘贴板数据
    let data = null;
    const clipboardData = window.clipboardData || e.clipboardData; // IE || chrome
    // console.log(clipboardData);
    data = clipboardData.getData('Text');
    // console.log(data.replace(/\t/g, '\\t').replace(/\n/g, '\\n')); // data转码

    // 解析数据
    const ecxelData = data
      .split('\n')
      .filter(
        (item: any) =>
          // 兼容Excel行末\n，防止出现多余空行
          item !== '',
      )
      .map((item: any) => item.split('\t'));

    // 数据清洗
    let arrStr = JSON.stringify(ecxelData);
    arrStr = arrStr.replace(/[\\r\\n]/g, ''); // 去掉回车换行
    arrStr = arrStr.replace(/\s*/g, '');
    arrStr = arrStr.replace(/^[\s]+|[\s]+$/g, ''); // 去掉全角半角

    const arr = JSON.parse(arrStr);

    if (arr[0] && arr[0].length > 0) {
      /*
       * 多条字段数据
       */

      const originData = this.state.dataSource;
      const newArr: any = [];
      arr.forEach((item: any, i: any) => {
        const obj: any = {};
        obj.error = '';
        obj.warn = '';
        item.forEach((items: any, index: any) => {
          // 匹配数据 根据提取数据规则 目前没做什么规则 复制的什么就是什么
          obj.key = originData.length + i + 1;
          if (index === 0) {
            obj.name = items;
          } else if (index === 1) {
            obj.mobile = items;
          }
        });
        newArr.push(obj);
      });

      let list;
      if (this.state.dataSource.length > 1) {
        // 有数据

        const oldArr = this.state.dataSource;

        list = [...newArr, ...oldArr];
        this.setState(
          {
            dataSource: list,
          },
          () => {
            this.validateData();
          },
        );
      } else {
        // 无数据

        list = [...this.state.dataSource, ...newArr];
        this.setState(
          {
            dataSource: list,
          },
          () => {
            this.validateData();
          },
        );
      }
    } else {
      /**
       * 单条字段复制
       */
      // 找到当前td
      const td = e.target.parentNode;
      const { rowIndex } = td.parentNode;
      const { cellIndex } = td;
      const { dataSource } = this.state;
      // console.log(rowIndex,cellIndex);

      // 判断是新增一条数据还是更新数据 老版本：this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
      if (rowIndex === 0) {
        const originArr = dataSource;
        originArr.forEach((tag: any, i: any) => {
          if (i === 0) {
            if (cellIndex === 0) {
              const [[name]] = arr;
              tag.name = name;
            }
          }
        });

        this.setState(
          {
            dataSource: originArr,
          },
          () => {
            this.validateData();
          },
        );
      } else {
        console.log('更新数据---------');

        // console.log(arr[0][0]);

        const originArr = this.state.dataSource;
        originArr.forEach((item: any, index: any) => {
          if (index === rowIndex) {
            // 找到对应的数据更新对象属性值
            if (cellIndex === 0) {
              const [[name]] = arr;
              item.name = name;
            }
          }
        });

        this.setState(
          {
            dataSource: JSON.parse(JSON.stringify(originArr)),
          },
          () => {
            this.validateData();
          },
        );
      }
    }
  };

  // 数据校验
  validateData = () => {
    const originArr = JSON.parse(JSON.stringify(this.state.dataSource));
    originArr.forEach((obj: any) => {
      obj.error = '';
      obj.warn = '';
    });

    // 去重处理 TODO 去重复
    const strArr: any = [];
    originArr.forEach((it: any) => {
      // 处理空白数据
      if (it.mobile || it.name) {
        const obj = {
          name: it.name,
          mobile: it.mobile,
        };
        const itStr = JSON.stringify(obj);
        strArr.push(itStr);
      }
    });

    const uniqueArr = new Set(strArr);

    const objArr = Array.from(uniqueArr);

    const arr: any = [];
    objArr.forEach((i: any, n) => {
      const obj = {
        name: JSON.parse(i).name,
        mobile: JSON.parse(i).mobile,
        key: n + 1,
        error: '',
        warn: '',
      };

      arr.push(obj);
    });

    const newArr: any = arr;

    const newObject = arr.reduce(
      (total: any, currentValue: any) => {
        // 1. 必填验证
        const tag = currentValue;
        if (!tag.name || Trim(tag.name, 'g') === '') {
          tag.error = formatMessage({
            id: 'operate.text.nameMissingInformation',
            defaultMessage: '姓名信息缺失',
          });
        } else if (tag.name.length > 20) {
          tag.error = formatMessage({
            id:
              'operate.text.theTeachersNameIsAlreadyAvailableInTheSystemPleaseCheckForTheSamePerson',
            defaultMessage: '系统中已有该教师名称，请检测是否为同一人',
          });
        } else {
          // 都填写了
        }

        const oldName = total.name[currentValue.name] || [];
        total.name[currentValue.name] = [...oldName, currentValue];
        return total;
      },
      {
        name: {},
        mobile: {},
      },
    );

    const nameObj = newObject.name;

    Object.keys(nameObj).forEach(it => {
      const value = nameObj[it];
      if (value.length > 1) {
        value.forEach((tag: any) => {
          tag.warn = formatMessage({
            id: 'operate.text.nameRepetitionPleaseCheckWhetherTheInputIsWrong',
            defaultMessage: '姓名重复，请检查是否录入有误',
          });
        });
      }
    });

    // let hasErr = false;
    if (newArr.length > 0) {
      let hasErr = false;
      hasErr = newArr.some((item: any) => !!item.error);
      if (hasErr) {
        // 统计错误信息数量
        let errNum = 0;
        newArr.forEach((item: any) => {
          if (item.error !== '') {
            errNum = +1;
          }
        });
        this.errNum = errNum;
        this.setState({
          dataSource: newArr,
          importBtnDisabled: true,
        });
      } else {
        // 3.前段验证没错误，开始后端验证手机号是否重复
        const { dispatch } = this.props;
        // 提交的数据
        // newArr.shift();
        const teachers = newArr.map((item: any) => this.initStudentOBJ(item));
        teachers.forEach((tag: any, idx: any) => {
          tag.index = idx;
        });

        dispatch({
          type: 'teacher/checkMobile',
          payload: teachers,
          callback: (res: any) => {
            // 检索出重复手机号
            res.forEach((item: any) => {
              if (item.isSameName) {
                newArr.forEach((it: any, i: any) => {
                  if (item.index === i) {
                    if (!it.warn) {
                      it.warn = formatMessage({
                        id:
                          'operate.text.theTeachersNameIsAlreadyAvailableInTheSystemPleaseCheckForTheSamePerson',
                        defaultMessage: '系统中已有该教师名称，请检测是否为同一人',
                      });
                    }
                  }
                });
              }
            });
            const obj = {
              error: '',
              key: 0,
              name: '',
              mobile: '',
              warn: '',
            };
            newArr.unshift(obj);
            this.errNum = 0;
            this.setState({
              dataSource: newArr,
              importBtnDisabled: false,
            });
          },
        });
      }
    } else {
      this.setState({
        importBtnDisabled: true,
      });
    }
  };

  // 导入按钮
  onHandleImport = () => {
    const arr = this.state.dataSource;
    // arr.pop();

    // 处理空白数据
    const newArr: any = [];
    arr.forEach((item: any) => {
      if (item.mobile || item.name) {
        newArr.push(item);
      }
    });

    this.setState({
      loading: true,
    });
    this.teacherNumber = 0; // 导入成功人数
    this.failNumber = 0; // 导入失败人数
    this.batchCreateTeacher(newArr, 1);
  };

  /**
   *批量导入
   *
   * @memberof ImportTeachersComponent
   */
  batchCreateTeacher = (newArr: any, num: number) => {
    const { dispatch, detail = {} } = this.props;
    const campusId = detail.id;
    // 提交的数据

    const teacherInfoList = newArr
      .slice((num - 1) * 2, num * 2)
      .map((item: any) => this.initTeachersOBJ(item));
    const obj = {
      campusId, // 校区id
      teacherInfoList,
    };
    const list = obj;
    dispatch({
      type: 'teacher/batchCreateTeacher',
      payload: list,
      callback: (res: any) => {
        this.teacherNumber += res.successCount || 0;
        this.state.dataSource = this.state.dataSource.map((item: any) => {
          if (res.successList) {
            res.successList.forEach((m: any) => {
              if (m.teacherName === item.name) {
                item.isSuccess = true;
              }
            });
          }
          return item;
        });
        if (!res.failCount) {
          // 导入成功
          if (num < Math.ceil(newArr.length / 2)) {
            num += 1;
            this.batchCreateTeacher(newArr, num);
          } else {
            this.setState({
              teacherNumber: this.teacherNumber,
              loading: false,
              importSuccessVisable: true,
            });
          }
        } else {
          this.failNumber += res.failCount;
          // 导入失败
          this.setState({
            teacherNumber: this.teacherNumber,
            failNumber: this.failNumber,
            loading: false,
            importSuccessVisable: true,
          });
        }
      },
    });
  };

  initStudentOBJ = (item: any) => {
    const { detail = {} } = this.props;
    const campusId = detail.id;
    const obj = {
      campusId, // 校区id
      name: item.name,
      mobile: item.mobile,
    };
    return obj;
  };

  initTeachersOBJ = (item: any) => {
    const obj = {
      index: '',
      teacherName: item.name,
    };
    return obj;
  };

  // input框监听
  handleInput = (rowIndex: any, cellIndex: any, value: any) => {
    // 老版本判断新增： this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
    if (rowIndex === 0) {
      // 新增一条数据
      console.log(this);
      const { dataSource } = this.state;
      const originArr = dataSource;
      originArr.forEach((tag: any, i: any) => {
        if (i === 0) {
          if (cellIndex === 0) {
            tag.name = value;
          }
        }
      });

      // var new_Arr = new Array();
      // new_Arr.push(obj);

      this.setState(
        {
          dataSource: originArr,
        },
        () => {
          this.validateData();
        },
      );
    } else {
      // console.log('跟新');
      // console.log(this);
      const { dataSource } = this.state;
      const originArr = dataSource;
      // let allFillIn = false;
      originArr.forEach((item: any, index: any) => {
        // console.log(item,index);

        if (index === rowIndex) {
          // 找到对应的数据更新对象属性值
          if (cellIndex === 0) {
            item.name = value;
          }
          // if (item.name && item.mobile) {
          //   allFillIn = true;
          // } else {
          //   allFillIn = false;
          // }
        }
      });
      // 判断是否 已生成一条空数据
      // const emptyObj = originArr.find(it => it.name === '' || it.mobile === '');
      // if (emptyObj) {
      //   allFillIn = false;
      // }
      // if (allFillIn) {
      //   originArr.unshift({
      //     error: '',
      //     key: rowIndex+1,
      //     name: '',
      //     mobile: '',
      //     warn: '',
      //   });
      // }

      this.setState(
        {
          dataSource: originArr,
        },
        () => {
          this.validateData();
        },
      );
    }
  };

  // 取消按钮
  onHandleCancel = () => {
    // const originArr = this.state.dataSource;
    // if (originArr.length > 1) {
    //   this.setState({
    //     modalVisable: true,
    //   });
    // } else {
    //   // this.props.history.goBack();
    // }
    this.props.onCancel();
  };

  // 下载模板方法
  downTempMethod = () => {
    const { tableData } = this.state;
    const params = {
      title: ['姓名'],
      key: ['name'],
      data: tableData,
      autoWidth: true,
      filename: '教师导入',
    };
    exportArrayToExcel(params);
  };

  // 提示信息弹窗
  onHandleModalCancel = () => {
    this.setState({
      modalVisable: false,
    });
  };

  onHandleModalOK = () => {
    this.setState({
      modalVisable: false,
    });
    // this.props.history.goBack();
  };

  render() {
    const { dataSource, importBtnDisabled, loading, teacherNumber, failNumber } = this.state;
    const showData = JSON.parse(JSON.stringify(dataSource));
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const { handleInput } = this;
    const columns = this.columns().map((col: any) => ({
      ...col,
      onCell: (record: any) => ({
        record,
        handleInput,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        // handleSave: this.handleSave,
      }),
    }));

    return (
      <div className="import-teacher-wrapper">
        <div className="import-students-component">
          <div className="content clearfix">
            <Col span={17}>
              <div className="table-box">
                <div className="tip">
                  <p>
                    <IconFont type="icon-tip" />
                    <span>
                      {formatMessage({
                        id:
                          'operate.text.pleaseInputTeachersInformationInThisFormYouCanAlsoDirectlyToExcelTeachersInformationCopyAndPasteIntoTheForm',
                        defaultMessage:
                          '请在表格中输入教师信息，您也可以直接将Excel中教师信息复制粘贴到表格中',
                      })}
                    </span>
                  </p>
                </div>
                <div className="table" onPaste={this.onHandleTablePaste}>
                  {loading ? (
                    <div className="mask">
                      <div className="load-content">
                        <img className="loading" src={loadingGif} alt="loading" />
                        <div className="tip">
                          {formatMessage({
                            id: 'operate.text.areTheImport',
                            defaultMessage: '正在导入…请稍候',
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <Table
                    columns={columns}
                    components={components}
                    dataSource={showData}
                    pagination={false}
                    bordered
                    scroll={{ y: 500 }}
                  />
                </div>
                <div className="btn-group">
                  <Button className="cancel-btn" onClick={this.onHandleCancel}>
                    {formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' })}
                  </Button>
                  <Button
                    className={importBtnDisabled ? 'import-btn-disable' : 'import-btn'}
                    disabled={importBtnDisabled}
                    style={{ marginLeft: 10 }}
                    loading={loading}
                    onClick={this.onHandleImport}
                  >
                    {loading
                      ? formatMessage({
                          id: 'operate.text.beingImported',
                          defaultMessage: '正在导入',
                        })
                      : formatMessage({ id: 'operate.text.theImport', defaultMessage: '导入' })}
                  </Button>
                </div>
              </div>
            </Col>
            <Col span={7} style={{ height: '100%' }}>
              <div className="operation-guidance">
                <h2>
                  {formatMessage({ id: 'operate.text.operationGuide', defaultMessage: '操作引导' })}
                </h2>
                <div className="step-box">
                  <h2 className="title">Step1</h2>
                  <IconFont
                    type="icon-excel"
                    onClick={() => {
                      this.downTempMethod();
                    }}
                  />
                  <a
                    onClick={() => {
                      this.downTempMethod();
                    }}
                  >
                    {formatMessage({
                      id: 'operate.text.downloadTheTemplate',
                      defaultMessage: '下载模板',
                    })}
                  </a>
                </div>
                <div className="step-box">
                  <h2 className="title">Step2</h2>
                  <p>
                    {formatMessage({
                      id:
                        'operate.text.openTheExcelSelectAndCopyNeedToUploadTheTeachersNameInformation',
                      defaultMessage: '打开Excel，选择需要上传的教师姓名信息并复制。',
                    })}
                  </p>
                  <div className="template-table-box clearfix">
                    <img src={excelTeacherPic} alt="" />
                  </div>
                </div>
                <div className="step-box">
                  <h2 className="title">Step3</h2>
                  <p>
                    {formatMessage({
                      id:
                        'operate.text.pressCtrlVpasteClickOnTheLeftSideOfTheFormToFillInInformationForTeachers',
                      defaultMessage: '点击左侧表格按Ctrl+V(粘贴)，填入教师信息。',
                    })}
                  </p>
                </div>
                <div className="step-box">
                  <h2 className="title">Step4</h2>
                  <p>
                    {formatMessage({
                      id: 'operate.text.clickOnTheimportButton',
                      defaultMessage: '点击【导入】按钮',
                    })}
                  </p>
                </div>
              </div>
            </Col>
          </div>

          <Modal
            title=""
            okText={formatMessage({ id: 'operate.text.determine', defaultMessage: '确定' })}
            cancelText={formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' })}
            visible={this.state.modalVisable}
            onCancel={this.onHandleModalCancel}
            onOk={this.onHandleModalOK}
            centered
            closable={false}
            width="380px"
            className="delete-modal"
          >
            <p className="content">
              {formatMessage({
                id: 'operate.text.haveNotSubmittedInformationConfirmToReturn',
                defaultMessage: '有未提交的信息确认要返回吗？',
              })}
            </p>
          </Modal>

          <Modal
            title=""
            okText=""
            cancelText=""
            visible={this.state.importSuccessVisable}
            centered
            closable={false}
            width={260}
            className="import-success-modal"
          >
            <div className="conent">
              <p className="tip">
                <div className="success-icon">
                  <IconFont type="icon-right" />
                </div>
                <FormattedMessage
                  values={{ number: teacherNumber }}
                  {...{
                    id: 'operate.text.numberToImportTheTeacherSuccess',
                    defaultMessage: '导入教师成功 {number}人',
                  }}
                ></FormattedMessage>
              </p>
              {failNumber && (
                <p className="tip">
                  <div className="error-icon">
                    <IconFont type="icon-error" />
                  </div>
                  <FormattedMessage
                    values={{ number: failNumber }}
                    {...{
                      id: 'operate.text.importTheTeachersFailednumber',
                      defaultMessage: '导入教师失败 {number}人',
                    }}
                  ></FormattedMessage>
                </p>
              )}
              <div className="btn-group">
                <Button
                  className="again-import-btn"
                  onClick={() => {
                    let initData = [];

                    initData = this.state.dataSource.filter((item: any) => !item.isSuccess);

                    this.setState({
                      importSuccessVisable: false,
                      importBtnDisabled: true,
                      dataSource: initData,
                    });
                  }}
                >
                  {formatMessage({ id: 'operate.button.know', defaultMessage: '知道了' })}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default ImportTeachersComponent;

import React, { Component } from 'react';
import { Modal, Input, List, Select } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import ManagerAvatarH from '../ManagerAvatarH/index';
import managerIcon from '@/assets/none_teacher.png';
import styles from './index.less';

const { Search } = Input;
const { Option } = Select;

@connect(({ campus, dictionary, loading }) => {
  const { subjectTeacherList, gradeList } = campus;
  const { SUBJECT } = dictionary;
  const addLoading = loading.effects['campus/setSubjectManager'];
  return { subjectTeacherList, gradeList, SUBJECT, addLoading };
})
class AddManagerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      managerList: [],
      selectItem: '',
      searched: false, // 已搜索
      grade: undefined,
      subject: '103',
    };
  }

  componentDidMount() {}

  /**
   * 组件内部方法
   */

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleOk = () => {
    const { selectItem, subject, grade } = this.state;
    const { onAddManager } = this.props;
    onAddManager(selectItem, subject, grade);
  };

  modalClose = () => {
    this.setState({
      selectItem: '',
      managerList: [],
      searched: false, // 已搜索
      grade: undefined,
      subject: '103',
    });
  };

  // 搜索事件
  onSearch = value => {
    const list = this.sortTeacher(value);
    this.setState({
      managerList: list,
      searched: true,
      selectItem: '',
    });
  };

  // 搜索框中的值变化
  handleValueChange = e => {
    const { value } = e.target;
    if (!value) {
      this.setState({
        selectItem: '',
        searched: false,
        managerList: [],
      });
    }
  };

  // 本地搜索
  sortTeacher = value => {
    const { subjectTeacherList } = this.props;
    const list = [];
    if (value) {
      subjectTeacherList.forEach(el => {
        if (el.teacherName && el.teacherName.indexOf(value) !== -1) {
          const obj = list.length > 0 ? list.find(item => item.teacherId === el.teacherId) : null;
          if (!obj) {
            list.push(el);
          }
        }
        // 接口返回手机号数据xxx*****xxxx 精确搜索
        if (value.length === 11) {
          const mobileNo = JSON.stringify(value);
          // eslint-disable-next-line prefer-template
          const mobile = mobileNo.substr(0, 4) + '****' + mobileNo.substr(8);
          const mobileStr = JSON.parse(mobile);
          if (el.mobile && el.mobile.indexOf(mobileStr) !== -1) {
            const obj = list.length > 0 ? list.find(item => item.teacherId === el.teacherId) : null;
            if (!obj) {
              list.push(el);
            }
          }
        }
      });
    }
    return list;
  };

  // 选择一个管理员
  selectManager = item => {
    const { selectItem } = this.state;
    const selectObj = !selectItem || selectItem.teacherId !== item.teacherId ? item : '';
    this.setState({
      selectItem: selectObj,
    });
  };

  // 学科变更
  handleSubjectChange = value => {
    this.setState({ subject: value });
  };

  // 年级变更
  handleGradeChange = value => {
    this.setState({ grade: value });
  };

  render() {
    const { visible, SUBJECT, addLoading, gradeList } = this.props;
    const { selectItem, managerList, searched, subject, grade } = this.state;
    // eslint-disable-next-line no-unneeded-ternary
    const okButtonDisabled = selectItem && grade ? false : true;

    // 目前只展示英语学科
    const subjectList = SUBJECT.filter(tag => tag.code === '103');

    return (
      <Modal
        title={formatMessage({
          id: 'operate.title.add.manager.modal',
          defaultMessage: '指定管理员',
        })}
        okText={formatMessage({
          id: 'operate.button.add.manager.modal.ok.btn.title',
          defaultMessage: '指定Ta',
        })}
        cancelText={formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' })}
        okButtonProps={{ disabled: okButtonDisabled, loading: addLoading }}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className={styles['add-manager-modal']}
        width="376px"
        closable={false}
        centered
        destroyOnClose
        maskClosable={false}
        afterClose={this.modalClose}
      >
        <div className="content">
          <Search
            placeholder={formatMessage({
              id: 'operate.placeholder.add.manager.modal.search',
              defaultMessage: '请输入姓名/手机号搜索',
            })}
            onSearch={value => this.onSearch(value)}
            className="search"
            onChange={this.handleValueChange}
          />

          <div className="search-result-box">
            {/* 搜索结果展示列表 */}
            {managerList.length > 0 && (
              <div className="result">
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={managerList}
                  renderItem={item => (
                    <List.Item>
                      <ManagerAvatarH
                        item={item}
                        key={item.teacherId}
                        selectItem={selectItem}
                        onHandleSelectManager={() => this.selectManager(item)}
                        type="basicConfig"
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
            {/* 搜索不到数据 */}
            {searched && managerList.length === 0 && (
              <div className="notFound">
                <div className="icon">
                  <img src={managerIcon} alt="manager" />
                </div>
                <div className="tip">
                  <FormattedMessage
                    values={{
                      element: (
                        <span style={{ padding: '0 5px', fontWeight: 'bold' }}>
                          {formatMessage({ id: 'operate.text.teacher', defaultMessage: '教师' })}
                        </span>
                      ),
                    }}
                    {...{
                      id: 'operate.text.add.manager.not.find.tip',
                      defaultMessage: '找不到该教师，请先去{element} 添加哦~',
                    }}
                  />
                </div>
              </div>
            )}
            {/* 选择学科和年级 */}
            {(!searched || (searched && managerList.length > 0)) && (
              <div className="subjectAndGrade">
                <div className="item">
                  <div className="title">
                    {formatMessage({
                      id: 'operate.title.choose.subject',
                      defaultMessage: '选择学科',
                    })}
                    <span className="require">*</span>
                  </div>
                  <Select
                    defaultValue={subject}
                    placeholder={formatMessage({
                      id: 'operate.placeholder.select.subject',
                      defaultMessage: '请选择学科',
                    })}
                    style={{ width: 'calc(100% - 70px)' }}
                    onChange={this.handleSubjectChange}
                  >
                    {subjectList.map(tag => (
                      <Option key={tag.id} value={tag.code}>
                        {tag.value}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="item">
                  <div className="title">
                    {formatMessage({
                      id: 'operate.title.choose.grade',
                      defaultMessage: '选择年级',
                    })}
                    <span className="require">*</span>
                  </div>
                  <Select
                    defaultValue={grade}
                    placeholder={formatMessage({
                      id: 'operate.placeholder.select.grade',
                      defaultMessage: '请选择年级',
                    })}
                    style={{ width: 'calc(100% - 70px)' }}
                    onChange={this.handleGradeChange}
                  >
                    {gradeList.map(tag => (
                      <Option key={tag.id} value={tag.id}>
                        {tag.gradeValue}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default AddManagerModal;

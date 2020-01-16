import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { ConnectState } from '@/models/connect.d';
import ManagerCard from './components/ManagerCard';
import IconFont from '@/components/IconFont';
import AddManagerModal from './components/AddManagerModal';
import ChangeCampusManagerModal from './components/ChangeCampusManagerModal';
import styles from './index.less';

const { confirm } = Modal;

interface CampusManagerProps {
  dispatch?: Dispatch<AnyAction>;
  loading?: ConnectState['loading']['effects'];
  campusId?: string;
  activeKey?: string;
  SUBJECT?: [];
  GRADE?: [];
}

interface CampusManagerState {
  addManagerModalVisable?: boolean;
  changeManagerModalVisable?: boolean;
  campusOwner?: any;
  subjectOwners: [];
}

@connect(({ campus, loading, dictionary }: ConnectState) => {
  const { campusManagerList } = campus;
  const { SUBJECT, GRADE } = dictionary;

  return {
    SUBJECT,
    GRADE,
    campusManagerList,
    loading: loading.effects['campus/fetchPaperList'],
  };
})
class CampusManager extends Component<CampusManagerProps, CampusManagerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      addManagerModalVisable: false,
      changeManagerModalVisable: false,
      campusOwner: null, // 校区管理员
      subjectOwners: [], // 学科管理员
    };
  }

  componentDidMount() {
    // 获取校区所有管理员
    this.getCampusManager();

    // 获取校区所有年级
    this.getCampusGrade();
  }

  componentWillReceiveProps(nextProps: any) {
    // 切换tab返回当前tab时重新获取学科老师
    if (nextProps.activeKey === '4') {
      // 获取学科管理老师(所有的，搜索功能是本地搜索)
      this.getTeacherList();
    }
  }

  // 获取校区所有年级
  getCampusGrade = () => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/allGrade',
        payload: { campusId },
      });
    }
  };

  // 获取校区所有管理员
  getCampusManager = () => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      dispatch({
        type: 'campus/campusManager',
        payload: { campusId },
        callback: (res: any) => {
          const campusOwner = res.find((item: any) => item.roleCode === 'CampusOwner');
          const subjectOwners = res.filter(
            (item: any) => item.roleCode === 'CampusAdmin' || item.roleCode === null,
          );
          this.setState({
            campusOwner,
            subjectOwners,
          });
        },
      });
    }
  };

  // 获取学科管理老师(所有的，搜索功能是本地搜索)
  getTeacherList = () => {
    const { dispatch, campusId } = this.props;
    const pageSize = 0x7fffffff; // int类型的最大值
    const params = {
      pageIndex: 1,
      pageSize,
      campusId,
      filterWord: '',
    };
    if (dispatch) {
      dispatch({
        type: 'campus/subjectTeacherList',
        payload: params,
      });
    }
  };

  showAddModal = () => {
    this.setState({ addManagerModalVisable: true });
  };

  showChangeModal = () => {
    this.setState({ changeManagerModalVisable: true });
  };

  // 添加学科管理员
  addSubjectManager = async (item: any, subject: string, grade: string) => {
    const { dispatch, campusId, SUBJECT = [], GRADE = [] } = this.props;
    const { teacherId } = item;
    if (dispatch) {
      const params = { campusId, teacherId, subjectCode: subject, gradeId: grade };
      const res = await dispatch({
        type: 'campus/setSubjectManager',
        payload: params,
      });
      if (res) {
        const gradeObj: any = GRADE.find((tag: any) => tag.code === grade);
        const subjectObj: any = SUBJECT.find((tag: any) => tag.code === subject);

        const mgs = (
          <FormattedMessage
            values={{
              element: (
                <span style={{ padding: '0 5px', fontWeight: 'bold' }}>{item.teacherName}</span>
              ),
              grade: <span>{gradeObj && gradeObj.value}</span>,
              suject: <span>{subjectObj && subjectObj.value}</span>,
            }}
            {...{
              id: 'operate.message.add.suject.manager.success',
              defaultMessage: '您已成功指定{element}为{grade}{suject}学科管理员！',
            }}
          />
        );
        message.success(mgs);
        this.getCampusManager();
        this.setState({ addManagerModalVisable: false });
      }
    }
  };

  // 更换校区管理员
  changeCampusManager = async (item: any) => {
    const { dispatch, campusId } = this.props;
    if (dispatch) {
      const params = { campusId, teacherId: item.teacherId };
      const res = await dispatch({
        type: 'campus/setCampusManager',
        payload: params,
      });
      if (res) {
        const mgs = (
          <FormattedMessage
            values={{
              element: (
                <span style={{ padding: '0 5px', fontWeight: 'bold' }}>{item.teacherName}</span>
              ),
            }}
            {...{
              id: 'operate.message.add.campus.manager.success',
              defaultMessage: '您已成功指定{element}为校区管理员！',
            }}
          />
        );
        message.success(mgs);
        this.getCampusManager();
        this.setState({ changeManagerModalVisable: false });
      }
    }
  };

  // 删除学科管理员提示弹窗
  handleDelete = (item: any) => {
    const that = this;
    const cont = (
      <span style={{ fontSize: '16px', color: '#333' }}>
        <FormattedMessage
          values={{
            element: (
              <span style={{ padding: '0 5px', color: '#03C46B', fontSize: '16px' }}>
                {item.teacherName}
              </span>
            ),
          }}
          {...{
            id: 'operate.text.relieve.subject.manager,tip',
            defaultMessage: '确认解除{element}的学科管理员权限吗？',
          }}
        />
      </span>
    );
    confirm({
      title: '',
      content: cont,
      icon: null,
      centered: true,
      cancelText: formatMessage({ id: 'operate.button.cancel', defaultMessage: '取消' }),
      okText: formatMessage({ id: 'operate.button.relieve', defaultMessage: '解除' }),
      cancelButtonProps: {
        style: {
          color: '#888',
          background: '#fff',
          border: '1px solid #CCCCCC',
          borderRadius: '18px',
        },
      },
      okButtonProps: {
        style: {
          color: '#fff',
          background: 'rgba(255,110,74,1)',
          boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)',
          borderRadius: '18px',
          border: 'none',
        },
      },
      onOk() {
        that.fetchDelete(item);
      },
      onCancel() {},
    });
  };

  // 删除学科管理员
  fetchDelete = async (item: any) => {
    const { dispatch } = this.props;

    if (dispatch) {
      const params = { adminId: item.id };
      const res = await dispatch({
        type: 'campus/deleteSubjectManager',
        payload: params,
      });
      if (res) {
        // 成功提示信息
        const mgs = (
          <FormattedMessage
            values={{
              element: (
                <span style={{ padding: '0 5px', fontWeight: 'bold' }}>{item.teacherName}</span>
              ),
            }}
            {...{
              id: 'operate.message.relieve.subject.manager.success',
              defaultMessage: '您已成功解除{element}的学科管理员权限！',
            }}
          />
        );
        message.success(mgs);
        this.getCampusManager();
      }
    }
  };

  render() {
    const {
      addManagerModalVisable,
      campusOwner,
      subjectOwners,
      changeManagerModalVisable,
    } = this.state;
    return (
      <div className={styles.campusManagerContainer}>
        {/* 校区管理员 */}
        <div className={styles.campusManager}>
          <div className={styles.title}>
            {formatMessage({ id: 'operate.title.campus.manager', defaultMessage: '校区管理员' })}
          </div>
          <div>
            <ManagerCard type="campus" item={campusOwner} onChange={this.showChangeModal} />
          </div>
        </div>
        {/* 学科管理员 */}
        <div className={styles.subjectManager}>
          <div className={styles.title}>
            {formatMessage({ id: 'operate.title.subject.manager', defaultMessage: '学科管理员' })}
          </div>
          <div className={styles.subjectManagerList}>
            {subjectOwners.map((tag: any) => (
              <ManagerCard
                key={tag.accountId}
                type="subject"
                item={tag}
                onDelete={() => this.handleDelete(tag)}
              />
            ))}
            {/* 指定学科管理员按钮 */}
            <div className={styles.addBtn} onClick={this.showAddModal}>
              <div className={styles.addIcon}>
                <IconFont className={styles['icon-add']} type="icon-add" />
              </div>
              <div className={styles.addBtnTitle}>
                {formatMessage({
                  id: 'operate.title.appoint.subject.manager',
                  defaultMessage: '指定学科管理员',
                })}
              </div>
            </div>
          </div>
        </div>
        {/* 添加学科管理员弹窗 */}
        <AddManagerModal
          visible={addManagerModalVisable}
          onCancel={() => {
            this.setState({
              addManagerModalVisable: false,
            });
          }}
          onAddManager={(item: any, subject: string, grade: string) =>
            this.addSubjectManager(item, subject, grade)
          }
        />

        {/* 更换校区管理员 */}
        <ChangeCampusManagerModal
          visible={changeManagerModalVisable}
          onCancel={() => {
            this.setState({
              changeManagerModalVisable: false,
            });
          }}
          onAddManager={(item: any) => this.changeCampusManager(item)}
        />
      </div>
    );
  }
}

export default CampusManager;

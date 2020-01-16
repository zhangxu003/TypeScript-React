import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { connect } from 'dva';
import './index.less';
import TeacherAvatar from '@/assets/avarta_teacher.png';

/**
 *
 * @author kobe
 * @date 2019-04-08
 * @class ManagerAvatarH
 * @extends {React.PureComponent}
 */
@connect(({ file }) => ({
  file,
}))
class ManagerAvatarH extends React.PureComponent {
  state = {
    selectItem: '', // 选中的manager
    currentAvatar: '',
  };

  componentDidMount() {
    // 获取头像
    const { item, dispatch } = this.props;
    if (item.accountId) {
      const params = {
        fileId: item.accountId,
      };
      dispatch({
        type: 'file/avatar',
        payload: params,
        callback: data => {
          if (data) {
            this.setState({
              currentAvatar: data.path,
            });
          }
        },
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectItem } = this.props;
    if (nextProps.selectItem !== selectItem) {
      this.setState({
        selectItem: nextProps.selectItem,
      });
    }
  }

  selectManager = () => {
    const { onHandleSelectManager } = this.props;
    onHandleSelectManager();
  };

  render() {
    const { item } = this.props;
    const { selectItem, currentAvatar } = this.state;
    const selectStyle =
      item.teacherId === selectItem.teacherId ? 'manager-avatar-h selected' : 'manager-avatar-h';
    const styleName = selectStyle;

    // let name = '';
    // if (item.teacherName && item.teacherName.length > 4) {
    //   name = `${item.teacherName.substring(0, 4)}...`;
    // } else {
    //   name = item.teacherName;
    // }

    return (
      <div className={styleName} onClick={this.selectManager} key={item.accountId}>
        <Avatar src={currentAvatar || TeacherAvatar} />
        <div className="right">
          <Tooltip title={item.teacherName}>
            <div
              className="name"
              // title={item.teacherName && item.teacherName.length > 4 ? item.teacherName : ''}
            >
              {item.teacherName}
            </div>
          </Tooltip>
          <div className="mobile">{item.mobile}</div>
        </div>
      </div>
    );
  }
}

export default ManagerAvatarH;

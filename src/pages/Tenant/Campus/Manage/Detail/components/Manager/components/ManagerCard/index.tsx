import React, { PureComponent } from 'react';
import { Avatar, Divider, Tag, Tooltip } from 'antd';
import { connect } from 'dva';
import { Dispatch, AnyAction } from 'redux';
import { ConnectState } from '@/models/connect.d';
import defaultAvatr from '@/assets/avarta_teacher.png';
import Icon from '@/assets/icon_gray.png';
import IconFont from '@/components/IconFont';
import styles from './index.less';

interface ManagerCardProps {
  dispatch?: Dispatch<AnyAction>;
  item?: any;
  type?: 'campus' | 'subject'; // campus:校区管理员 subject：学科管理员
  onChange?: () => void;
  onDelete?: () => void;
  SUBJECT?: [];
  gradeList?: [];
}

@connect(({ dictionary, campus }: ConnectState) => {
  const { SUBJECT } = dictionary;
  const { gradeList } = campus;

  return {
    SUBJECT,
    gradeList,
  };
})
class ManagerCard extends PureComponent<ManagerCardProps> {
  state = {
    currentAvatar: '',
  };

  componentDidMount() {
    // 获取头像
    const { item, dispatch } = this.props;
    if (item && item.accountId) {
      const params = {
        fileId: item.accountId,
      };
      if (dispatch) {
        dispatch({
          type: 'file/avatar',
          payload: params,
          callback: (data: any) => {
            if (data) {
              this.setState({
                currentAvatar: data.path,
              });
            }
          },
        });
      }
    }
  }

  handleChange = () => {
    const { onChange } = this.props;
    if (onChange) {
      onChange();
    }
  };

  handleDelete = () => {
    const { onDelete } = this.props;
    if (onDelete) {
      onDelete();
    }
  };

  render() {
    const { currentAvatar } = this.state;
    const { item, type, gradeList } = this.props;

    const gradeObj: any =
      gradeList && item ? gradeList.find((tag: any) => tag.grade === item.grade) : null;
    // const subjectObj: any = SUBJECT.find((tag: any) => tag.code === item.subjectCode);
    return (
      <div className={styles.managerCardContainer}>
        <div className={styles.infoBox}>
          <Avatar className={styles.avatar} src={currentAvatar || defaultAvatr} />
          <div className={styles.info}>
            <div className={styles.name}>
              <Tooltip title={item && item.teacherName}>{item && item.teacherName}</Tooltip>
            </div>
            <div className={styles.vbNumber}>
              <Avatar className={styles.logo} src={Icon} />
              <Divider type="vertical" />
              <span>{item && item.vbNumber}</span>
            </div>
          </div>
        </div>
        {/* 学科和年级 */}
        {type === 'subject' && (
          <div className={styles.tagsBox}>
            <Tag>{item.subjectValue}</Tag>
            <Tag>{gradeObj && gradeObj.gradeValue}</Tag>
          </div>
        )}
        {/* hover按钮 */}
        {type === 'campus' && (
          <div className={styles.hoverBtn}>
            <Tooltip title="更换">
              <IconFont
                className={styles['icon-change']}
                type="icon-d-rote"
                onClick={this.handleChange}
              />
            </Tooltip>
          </div>
        )}
        {type === 'subject' && (
          <div className={styles.hoverBtn}>
            <Tooltip title="删除">
              <IconFont
                className={styles['icon-detele']}
                type="icon-detele"
                onClick={this.handleDelete}
              />
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

export default ManagerCard;

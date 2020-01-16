/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Avatar, Tooltip } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import IconFont from '@/components/IconFont';
import logo from '@/assets/logo.png';
import logoIco from '@/assets/logo_ico.png';
import styles from './BasicLayout.less';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
  nickname?: string;
  name?: string;
  avatar?: string;
  roleList: [];
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const {
    dispatch,
    children,
    settings,
    nickname,
    name: userName,
    avatar,
    roleList,
    collapsed,
  } = props;

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };

  // 设置角色和样式相关的功能转换规则
  const roleRelationObj = {
    OperationalStaff: {
      icon: 'icon-role-5',
      title: formatMessage({ id: 'operate.role.OperationalStaff', defaultMessage: '运营管理员' }),
      color: '#6975EF',
    },
    WarehouseManager: {
      icon: 'icon-role-6',
      title: formatMessage({ id: 'operate.role.WarehouseManager', defaultMessage: '仓库管理员' }),
      color: '#FF6E4A',
    },
    ChannelVendor: {
      icon: 'icon-role-7',
      title: formatMessage({ id: 'operate.role.ChannelVendor', defaultMessage: '渠道商' }),
      color: '#B643E3',
    },
  };

  /**
   * 重定义左上角的内容
   */
  const menuHeaderRender = (logoNode: any) => (
    <div className={styles['menu-header']}>
      {React.cloneElement(logoNode, { className: styles.logo })}
      <div className={styles.user}>
        <Avatar size={48} icon="user" src={avatar} />
        {collapsed ? null : (
          <div className={styles['user-detail']}>
            <span className={styles['user-detail-name']}>{nickname || userName}</span>
            <br />
            <span className={styles['user-detail-role']}>
              {roleList.map((item: any) => {
                const obj = roleRelationObj[item.code];
                return (
                  <Tooltip title={obj.title} key={item.code}>
                    <IconFont
                      type={obj.icon}
                      className={styles['user-detail-role-icon']}
                      style={{ color: obj.color }}
                    />
                  </Tooltip>
                );
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProLayout
      logo={collapsed ? logoIco : logo}
      siderWidth={200}
      className={styles.menu}
      menuHeaderRender={menuHeaderRender}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: '',
        },
        ...routers,
      ]}
      itemRender={(route, params, routes) => {
        const first = routes.indexOf(route) === 0;
        const last = routes.indexOf(route) === routes.length - 1;
        // 根路径 过滤掉
        if (first) {
          return null;
        }

        // 最后一个路径 放大加黑处理
        if (last) {
          return <span className={styles.h2}>{route.breadcrumbName}</span>;
        }

        return <span>{route.breadcrumbName}</span>;
      }}
      footerRender={false}
      menuDataRender={menuDataRender}
      formatMessage={formatMessage}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
      {children}
    </ProLayout>
  );
};

export default connect(({ global, settings, user }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  nickname: user.nickname,
  avatar: user.avatar,
  name: user.name,
  roleList: user.roleList || [],
}))(BasicLayout);

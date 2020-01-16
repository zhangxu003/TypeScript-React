import React from 'react';
import { Modal, Layout, Menu } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import pathToRegexp from 'path-to-regexp';
import { formatMessage } from 'umi-plugin-react/locale';
import { getMenuData } from '@ant-design/pro-layout';
import { ConnectProps } from '@/models/connect';
import Control from '@/components/GlobalHeader/Control';
import PageLoading from '@/components/PageLoading';
import { isVb, minimize, maximize, close } from '@/utils/instructions';
import event from '@/utils/event';
import styles from './PopupLayout.less';

const { Content, Sider, Header } = Layout;

export interface PopupLayoutProps extends ConnectProps {
  title: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

class PopupLayout extends React.Component<PopupLayoutProps> {
  contentDetailRef?: React.RefObject<HTMLDivElement>;

  state = {
    visible: true,
  };

  constructor(props: PopupLayoutProps) {
    super(props);
    this.contentDetailRef = React.createRef();
    // 进入弹框的时候，将 root 隐藏
    const root = document.getElementById('root');
    if (isVb && root) {
      root.className = 'popupLayout';
    }
  }

  componentDidMount() {
    event.removeAllListeners('srollPopupWarp');
    event.addListener('srollPopupWarp', this.backTop);
  }

  componentWillUnmount() {
    const root = document.getElementById('root');
    if (isVb && root) {
      root.className = '';
    }
    event.removeListener('srollPopupWarp', this.backTop);
  }

  backTop = () => {
    if (this.contentDetailRef && this.contentDetailRef.current) {
      this.contentDetailRef.current.scrollTop = 0;
    }
  };

  // 最小化
  onMinimize = () => {
    minimize();
  };

  // 最大化
  onMaximize = () => {
    maximize();
  };

  // 关闭
  onClose = () => {
    if (isVb) {
      // 如果是 Edge 浏览器，则关闭弹框
      close();
    } else {
      // 如果是正常浏览器，则关闭弹框
      const { location } = this.props;
      const { pathname = '/' } = location || {};
      this.setState(
        {
          visible: false,
        },
        () => {
          // 跳转到父级路由
          router.replace(pathname.substring(0, pathname.indexOf('/manage')) || '/');
        },
      );
    }
  };

  // 弹框关闭后的操作，默认回到当前路由的上一级
  afterClose = () => {};

  // 根据路由生成 弹出层，左侧内容
  menuDataRender = (): React.ReactNode => {
    const { route, match, location } = this.props;
    const params = match ? match.params : {};
    const { routes = [] } = route || {};
    const { pathname = '/' } = location || {};
    const { menuData } = getMenuData(routes, undefined, formatMessage);
    const { path } = routes.find(item => pathToRegexp(item.path).exec(pathname)) || {};
    return (
      <Menu
        mode="inline"
        selectedKeys={path ? [path] : undefined}
        style={{ height: '100%', paddingTop: '20px' }}
      >
        {menuData.map(item => (
          <Menu.Item key={item.path}>
            <Link to={pathToRegexp.compile(item.path)(params)}>{item.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    const { children, title, loading } = this.props;
    const { visible } = this.state;
    // 如果是edge则获取弹出的动态效果
    const params = isVb
      ? {
          transitionName: 'none',
          maskTransitionName: 'none',
        }
      : {};
    return (
      <Modal
        title={null}
        width="auto"
        // forceRender
        visible={visible}
        afterClose={this.afterClose}
        closable={false}
        footer={null}
        maskClosable={false}
        wrapClassName={styles.container}
        destroyOnClose
        {...params}
      >
        <Layout className={styles.layout}>
          <Header className={styles['layout-header']}>
            <span className={styles['layout-header-title']}>{title || '详情'}</span>
            <span className={styles['no-drag']}>
              <Control
                onMinimize={this.onMinimize}
                onMaximize={this.onMaximize}
                onClose={this.onClose}
              />
            </span>
          </Header>
          <Layout style={{ background: '#fff' }}>
            <Sider className={styles['layout-sider']} width={160}>
              {this.menuDataRender()}
            </Sider>
            <Content>
              <div className={styles['layout-content']} ref={this.contentDetailRef}>
                <div className={styles['layout-content-detail']}>
                  {loading ? <PageLoading /> : children}
                </div>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Modal>
    );
  }
}

export default PopupLayout;

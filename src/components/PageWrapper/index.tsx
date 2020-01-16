/**
 * 包裹主页面
 * 包括面包屑
 * 右侧内容
 */
import React from 'react';
import { Breadcrumb } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import cs from 'classnames';
import event from '@/utils/event';
import styles from './index.less';

interface pageWrapperParams {
  extra?: React.ReactNode | undefined | null;
  children?: React.ReactNode | undefined | null;
  className?: string;
}

/**
 * 重写 面包屑的显示内容
 * @param props
 */
const PageHeaderRender = (props: any): React.ReactNode => {
  const { extraContent, breadcrumb } = props;
  const winWidth = document.body.clientWidth || document.documentElement.clientWidth;
  const vhref = window.location.href.indexOf('/tenant/campus');
  const vhref2 = window.location.href.indexOf('/resource/dongle');
  return (
    <div
      className={styles['page-header']}
      style={winWidth < 1280 && (vhref > 0 || vhref2 > 0) ? { display: 'block' } : {}}
    >
      <Breadcrumb className={styles['page-header-breadcrumb']} {...breadcrumb} />
      <div className={styles['page-header-extra']}>{extraContent}</div>
    </div>
  );
};

export default class PageWrapper extends React.PureComponent<pageWrapperParams> {
  continerRef?: React.RefObject<HTMLDivElement>;

  content?: HTMLElement;

  constructor(props: pageWrapperParams) {
    super(props);
    this.continerRef = React.createRef();
  }

  componentDidMount() {
    // 找到dom元素
    if (this.continerRef && this.continerRef.current) {
      const dom = this.continerRef.current.closest('.ant-pro-basicLayout-content');
      if (dom) {
        this.content = dom.querySelector('div') as HTMLElement;
      }
    }

    event.removeAllListeners('srollPageWarp');
    event.addListener('srollPageWarp', this.backTop);
  }

  componentWillUnmount() {
    event.removeListener('srollPageWarp', this.backTop);
  }

  backTop = () => {
    if (this.content) {
      this.content.scrollTop = 0;
    }
  };

  render() {
    const { extra, children, className } = this.props;
    const contentClass = cs(styles.container, className);
    return (
      <PageHeaderWrapper
        extraContent={extra}
        title={false}
        pageHeaderRender={(props: any) => PageHeaderRender(props)}
      >
        <div className={contentClass} ref={this.continerRef}>
          {children}
        </div>
      </PageHeaderWrapper>
    );
  }
}

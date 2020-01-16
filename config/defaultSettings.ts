import { MenuTheme } from 'antd/es/menu/MenuContext';

export type ContentWidth = 'Fluid' | 'Fixed';

export interface DefaultSettings {
  /**
   * theme for nav menu
   */
  navTheme: MenuTheme;
  /**
   * primary color of ant design
   */
  primaryColor: string;
  /**
   * nav menu position: `sidemenu` or `topmenu`
   */
  layout: 'sidemenu' | 'topmenu';
  /**
   * layout of content: `Fluid` or `Fixed`, only works when layout is topmenu
   */
  contentWidth: ContentWidth;
  /**
   * sticky header
   */
  fixedHeader: boolean;
  /**
   * auto hide header
   */
  autoHideHeader: boolean;
  /**
   * sticky siderbar
   */
  fixSiderbar: boolean;
  menu: { locale: boolean };
  title: string;
  pwa: boolean;
  // Your custom iconfont Symbol script Url
  // eg：//at.alicdn.com/t/font_1039637_btcrd5co4w.js
  // 注意：如果需要图标多色，Iconfont 图标项目里要进行批量去色处理
  // Usage: https://github.com/ant-design/ant-design-pro/pull/3517
  iconfontUrl: string;
  i10nUrl: string; // 国际化字体库的下载链接
  colorWeak: boolean;
}

// 国际化id
const i10nIds = [
  // 业务支撑平台国际化
  // https://front-basic-dev.aidoin.com/I10n/detail/5dbbf7b2279509006c454221
  '5dbbf7b2279509006c454221',
  // 后台返回国际化
  // https://front-basic-dev.aidoin.com/I10n/detail/5dbbf2df279509006c4524fe
  '5dbbf2df279509006c4524fe',
];

export default {
  navTheme: 'light',
  primaryColor: '#03C46B',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: true,
  autoHideHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: '支撑平台',
  pwa: false,
  iconfontUrl: '//at.alicdn.com/t/font_775743_bbs3h7xq8pt.js',
  // at.alicdn.com/t/font_1435901_qeghx23nz0r.css
  // at.alicdn.com/t/font_775743_cimuu8qsznu.js
  i10nUrl: `https://front-basic-dev.aidoin.com/api/i10n/down?vids=${i10nIds.join(',')}`,
} as DefaultSettings;

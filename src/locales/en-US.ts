import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

// 菜单项
const projectMenu = {
  'menu.home': '首页',
  'menu.resource': '资源',
  'menu.dongle': '加密狗',
  'menu.package': '试卷包',
  'menu.tenant': '租户',
  'menu.channelvendor': '渠道商',
  'menu.campus': '校区',
};

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...(window.g_locales['en-US'] ? window.g_locales['en-US'] : []),
  // 菜单项
  ...projectMenu,
};

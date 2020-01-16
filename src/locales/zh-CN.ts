import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

// 菜单项
const projectMenu = {
  'menu.login': '登录',
  'menu.findPwd': '找回密码',
  'menu.home': '首页',
  'menu.resource': '资源',
  'menu.resource.dongle': '加密狗',
  'menu.resource.package': '试卷包',
  'menu.tenant': '租户',
  'menu.tenant.channelvendor': '渠道商',
  'menu.tenant.campus': '校区',
  'menu.detail': '详情',
  'menu.relation.channelvendor': '关联渠道商',
  'menu.relation.user': '关联最终用户',
  'menu.authorization.record': '授权记录',
  'menu.dongle': '加密狗',
  'menu.relation.dongle': '关联加密狗',
  'menu.relation.package': '关联试卷包',
};

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...(window.g_locales['zh-CN'] ? window.g_locales['zh-CN'] : []),
  // 菜单项
  ...projectMenu,
};

// 路由配置
export default [
  // 用于角色相关
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {
        path: './',
        redirect: './login',
      },
      // 用户登录
      {
        name: 'login',
        path: './login',
        component: './user/login',
      },
      // 查找密码
      {
        name: 'resetpw',
        path: './resetpw',
        component: './user/ChangePW',
      },
    ],
  },

  // 系统主体
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
        authority: ['admin', 'user'],
        routes: [
          {
            path: '/',
            redirect: '/home',
          },

          // 主页
          {
            path: '/home',
            name: 'home',
            icon: 'icon-home',
            component: './Home',
          },

          // 资源
          {
            path: '/resource',
            name: 'resource',
            icon: 'icon-resource',
            component: '../layouts/BlankLayout',
            routes: [
              {
                path: './',
                redirect: './dongle',
              },
              // 资源-加密狗
              {
                path: './dongle',
                name: 'dongle',
                component: '../layouts/ModelLayout',
                hideChildrenInMenu: true,
                routes: [
                  // 资源-加密狗-首页（列表页面）
                  {
                    path: './',
                    name: '',
                    component: './Resource/Dongle',
                  },
                  // 资源-加密狗-详情
                  // id 狗的id
                  {
                    path: './manage/:id',
                    name: '',
                    component: '../layouts/PopupLayout',
                    Routes: ['src/pages/Resource/Dongle/Manage'],
                    routes: [
                      {
                        path: './',
                        redirect: './detail',
                      },
                      // 资源-加密狗-详情-详情（基本信息，激活管理，历史轨迹）
                      {
                        path: './detail',
                        name: 'detail',
                        component: './Resource/Dongle/Manage/Detail',
                      },
                      // 资源-加密狗-详情-渠道商
                      {
                        path: './channelvendor',
                        name: 'relation.channelvendor',
                        component: './Resource/Dongle/Manage/ChannelVendor',
                      },
                      // 资源-加密狗-详情-最终用户
                      {
                        path: './user',
                        name: 'relation.user',
                        component: './Resource/Dongle/Manage/User',
                      },
                    ],
                  },
                ],
              },

              // 资源-试卷包
              {
                path: './package',
                name: 'package',
                component: '../layouts/ModelLayout',
                hideChildrenInMenu: true,
                routes: [
                  // 资源-试卷包-首页（列表页面）(两个列表-没有特殊需求，可以考虑一个页面完成)
                  {
                    path: './',
                    name: '',
                    component: './Resource/Package',
                  },
                  // 资源-试卷包（试卷包列表类型）-详情
                  // { id 试卷包的id }
                  {
                    path: './manage/list/:id',
                    name: '',
                    component: '../layouts/PopupLayout',
                    Routes: ['src/pages/Resource/Package/Manage'],
                    routes: [
                      {
                        path: './',
                        redirect: './detail',
                      },
                      // 资源-试卷包-（list）详情-详情（基本信息，试卷列表）
                      {
                        path: './detail',
                        name: 'detail',
                        component: './Resource/Package/Manage/Detail',
                      },
                      // 资源-试卷包-(list )详情-授权记录
                      {
                        path: './record',
                        name: 'authorization.record',
                        component: './Resource/Package/Manage/Record',
                      },
                    ],
                  },
                  // 资源-试卷包（授权记录列表类型）-详情
                  // { pid：试卷包的id  snid：SN }
                  {
                    path: './manage/authorize/:pid/:snid',
                    name: '',
                    component: '../layouts/PopupLayout',
                    Routes: ['src/pages/Resource/Package/ManageAuthorize'],
                    routes: [
                      {
                        path: './',
                        redirect: './detail',
                      },
                      // 资源-试卷包-(authorize)详情-详情（基本信息，试卷列表）
                      {
                        path: './detail',
                        name: 'detail',
                        component: './Resource/Package/ManageAuthorize/Detail',
                      },
                      // 资源-试卷包-(authorize)详情-渠道商
                      {
                        path: './channelvendor',
                        name: 'relation.channelvendor',
                        component: './Resource/Package/ManageAuthorize/ChannelVendor',
                      },
                      // 资源-试卷包-(authorize)详情-最终用户
                      {
                        path: './user',
                        name: 'relation.user',
                        component: './Resource/Package/ManageAuthorize/User',
                      },
                    ],
                  },
                  {
                    component: './404',
                  },
                ],
              },
            ],
          },

          // 租户(tenant)
          {
            path: '/tenant',
            name: 'tenant',
            icon: 'icon-client',
            component: '../layouts/BlankLayout',
            routes: [
              {
                path: './',
                redirect: './channelvendor',
              },
              // 租户-渠道商
              {
                path: './channelvendor',
                name: 'channelvendor',
                component: '../layouts/ModelLayout',
                hideChildrenInMenu: true,
                routes: [
                  // 租户-渠道商-首页（列表页面）
                  {
                    path: './',
                    name: '',
                    component: './Tenant/ChannelVendor',
                  },
                  // 租户-渠道商-详情弹框
                  // id: 渠道商的id
                  {
                    path: './manage/:id',
                    name: '',
                    component: '../layouts/PopupLayout',
                    Routes: ['src/pages/Tenant/ChannelVendor/Manage'],
                    routes: [
                      {
                        path: './',
                        redirect: './detail',
                      },
                      // 租户-渠道商-详情弹框-详情
                      {
                        path: './detail',
                        name: 'detail',
                        component: './Tenant/ChannelVendor/Manage/Detail',
                      },
                      // 资源-加密狗-详情弹框-加密狗
                      {
                        path: './dongle',
                        name: 'dongle',
                        component: './Tenant/ChannelVendor/Manage/Dongle',
                      },
                    ],
                  },
                ],
              },

              // 租户-校区
              {
                path: './campus',
                name: 'campus',
                component: '../layouts/ModelLayout',
                hideChildrenInMenu: true,
                routes: [
                  // 租户-校区-首页（列表页面）
                  {
                    path: './',
                    name: '',
                    component: './Tenant/Campus',
                  },
                  // 租户-校区-详情弹框
                  // id 校区id
                  {
                    path: './manage/:id',
                    name: '',
                    component: '../layouts/PopupLayout',
                    Routes: ['src/pages/Tenant/Campus/Manage'],
                    routes: [
                      {
                        path: './',
                        redirect: './detail',
                      },
                      // 租户-校区-详情弹框-详情（基本信息，校区配置，教师，管理员，服务配置）
                      {
                        path: './detail',
                        name: 'detail',
                        component: './Tenant/Campus/Manage/Detail',
                      },
                      // 租户-校区-详情弹框-关联加密狗
                      {
                        path: './dongle',
                        name: 'relation.dongle',
                        component: './Tenant/Campus/Manage/Dongle',
                      },
                      // 租户-校区-详情弹框-关联试卷包
                      {
                        path: './package',
                        name: 'relation.package',
                        component: './Tenant/Campus/Manage/Package',
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            component: './404',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },

  // 404
  {
    component: './404',
  },
];

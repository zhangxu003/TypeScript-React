import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import webpackPlugin from './plugin.config';
import getEnvConfig from './env.config';
import pageRoutes from './router.config';

const envConfig = getEnvConfig();

if (envConfig.https) {
  process.env.HTTPS = 'true';
}

if (envConfig.port) {
  process.env.BASE_PORT = envConfig.port;
}

// 关闭 umi ui 可视化辅助工具
process.env.UMI_UI = 'none';
process.env.UMI_UI_SERVER = 'none';

const { pwa, primaryColor, i10nUrl } = defaultSettings;

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const plugins: IPlugin[] = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
      },
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      //   webpackChunkName: true,
      //   level: 3,
      // },
      pwa: pwa
        ? {
            workboxPluginMode: 'InjectManifest',
            workboxOptions: {
              importWorkboxFrom: 'local',
            },
          }
        : false,
      // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
      // 如果是生成环境，则在head头部，引入public中的 locales.js 文件
      ...(process.env.NODE_ENV !== 'development'
        ? {
            headScripts: [{ src: `/locales.js?${envConfig.gitConfig.commit_id}` }],
          }
        : {}),
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
]; // 针对 preview.pro.ant.design 的 GA 统计代码

if (isAntDesignProPreview) {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
  plugins.push([
    'umi-plugin-pro',
    {
      serverUrl: 'https://ant-design-pro.netlify.com',
    },
  ]);
}

export default {
  plugins,
  // block: {
  //   // 国内用户可以使用码云
  //   // defaultGitUrl: 'https://gitee.com/ant-design/pro-blocks',
  //   defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
  // },
  hash: true,
  targets: {
    ie: 11,
  },
  devtool: isAntDesignProPreview ? 'source-map' : false,
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: pageRoutes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  // theme: {
  //   'primary-color': primaryColor,
  // },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
    ENV_CONFIG: envConfig,
    APP_ENV: process.env.APP_ENV,
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context: {
        resourcePath: string;
      },
      _: string,
      localName: string,
    ) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase())
          .filter((a: string) => !!a);
        return `${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackPlugin,

  proxy: {
    '/api/': {
      target: envConfig.proxy,
      changeOrigin: true,
      secure: false,
    },
    // 由于服务挂载在https上，为了保证 http 和 https 服务的开发环境下，都能使用，故通过代理的形式请求接口
    // 注：生产环境不需要此配置项，是通过打包的时候下载文件到服务中实现功能。
    '/downloadI10n': {
      target: i10nUrl,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/downloadI10n': '' },
    },
  },
} as IConfig;

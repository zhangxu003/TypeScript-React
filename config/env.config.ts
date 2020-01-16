/**
 * @description: 环境配置
 * 三个环境
 * dev：开发环境 启动命令 npm run start:dev
 * sit: 测试环境 启动命令 npm run start:sit
 * pro: 生产环境 启用命令 npm run start:pro
 */

import { argv } from 'yargs';

// 默认配置项
const defaultConfig = {
  // 项目的名
  name: process.env.npm_package_name,
  // 版本号
  version: process.env.npm_package_version,
  // 代理地址
  proxy: '',
  // 环境变量
  https: 'true',
  port: '8000',
  // mock  : "able"   // able  : 启用mock数据  "none" 关闭mock
};

// 开发环境
const devConfig = {
  // 代理地址
  proxy: 'https://gateway-dev.aidoin.com',
};

// 测试环境
const sitConfig = {
  // 代理地址
  proxy: 'https://operate-web-sit.aidoin.com',
};

// 生成环境
const proConfig = {
  // 代理地址
  proxy: 'https://10.18.32.148:8200',
};

// 获取 当前 git 相关的配置
const getGitConfig = () => {
  // TODO
  return {
    // 当期分支
    branch: 'dev',
    // 最后的commit
    commit_id: '',
    // 最后修改的时间
    commit_time: '',
  };
};

// 获取基础配置
export default () => {
  // 命令配置
  let envConfig;
  const type = argv.env;
  if (!type || type === 'dev') {
    envConfig = { ...devConfig };
  } else if (type === 'sit') {
    envConfig = { ...sitConfig };
  } else if (type === 'pro') {
    envConfig = { ...proConfig };
  }

  // git相关配置
  const gitConfig = getGitConfig();

  return {
    ...defaultConfig,
    ...envConfig,
    ...argv,
    env: type,
    gitConfig,
  };
};

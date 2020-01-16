/**
 * 页面中如果使用到了 Edge 的 相关api，
 * 一定需要在这边声明，并从此文件中引用。
 * 不要直接在业务代码中调用 Edge 的相关api
 *
 * 目的：后期如果需要 扩展 api，则这边统一调整即可，
 * 否则需要可能需要到业务代码中调整，不方便的。
 */
import { message } from 'antd';
import router from 'umi/router';

/**
 * 判断是否是 Edga 浏览器
 */
export const isVb = typeof vb === 'object';

/**
 * 提示vb，是否存在
 */
export const getVb = () => {
  try {
    if (isVb) {
      return vb;
    }
    throw new Error('当前设备，不支持该功能！');
  } catch (e) {
    message.warning(e.message);
    return null;
  }
};

/**
 * 读取加密狗的ID
 */
export function getDeviceId() {
  const vb = getVb();
  return vb && vb.getDeviceId();
}

/**
 * 打开新弹窗
 */
export function newTab(url: string, width = 1024, height = 800) {
  if (isVb) {
    vb.newTab({ route: url.substring(1), width, height });
  } else {
    router.push(url);
  }
}

/**
 * 最小化当前窗体
 */
export function minimize() {
  const vb = getVb();
  return vb && vb.minimize();
}

/**
 * 最大化当前窗体
 */
export function maximize() {
  const vb = getVb();
  return vb && vb.maximize();
}

/**
 * 关闭当前窗体
 */
export function close() {
  const vb = getVb();
  return vb && vb.close();
}

export default {
  isVb,
  getVb,
  getDeviceId,
  newTab,
  minimize,
  maximize,
  close,
};

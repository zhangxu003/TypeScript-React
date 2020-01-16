/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification, message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

interface RequsetError extends Error {
  response: Response;
  data: { responseCode: any; data: any };
}

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 提示信息( 后台返回 400 500 的时候显示 )
 */
const notificationFn = (msg?: String) => {
  notification.warning({
    message: msg || '系统开小差了，请稍后再试！',
  });
};

// 网络连接断开的报错，默认在200ms 内只能出现一次
let showMessage = false;
const missNet = () => {
  if (!showMessage) {
    // message.error('网络连接断开！', 3);
    notificationFn();
    showMessage = true;
    setTimeout(() => {
      showMessage = false;
    }, 1000);
  }
};

// 账号过期的保存，默认在200ms 内只执行一次
let noTokenMessage = false;
const noToken = (msg?: string) => {
  if (!noTokenMessage) {
    // message.error('账号已过期，请重新登录！', 3);
    notificationFn(msg || '账号已过期，请重新登录！');
    noTokenMessage = true;
    setTimeout(() => {
      noTokenMessage = false;
    }, 1000);
  }
};

/**
 * handle catch
 * 对最后产出的异常，进行统一的处理，并添加到 error.next 上，
 * 方便 接口  ，自动处理相关错误的业务
 */
const handleCatch = (e: dvaError) => {
  const err = e;
  // 对api的统一的请求做特殊处理
  if (err.type === 'server') {
    err.type = undefined;
    // 阻塞错误默认报错
    if (err.preventDefault) {
      err.preventDefault();
    }
    const { status } = err;

    // 业务错误,用户名密码错误--验证失败,业务警告类状态
    if (status === 460 || status === 461 || status === 462) {
      message.warning(err.message);
      return;
    }

    // 后台错误
    if (status === 400) {
      notificationFn();
      return;
    }

    // 用户名密码--认证失败|token过期--认证失败-跳转到首页( 401,402 )
    if (status === 401 || status === 402 || status === 403) {
      let msg;
      if (status === 403) {
        msg = '当前账号，已在其它设备登录！';
      }
      noToken(msg);
      /* eslint-disable no-underscore-dangle */
      window.g_app._store.dispatch({
        type: 'login/logout',
      });
      return;
    }

    // 请求超时，请求失败，axios 失败 默认为网络断开
    if (status === 'timeout' || Number(status) >= 500) {
      missNet();
      return;
    }

    // 其它类型的错误
    if (Number(status) > 400 && Number(status) < 500) {
      notificationFn();
    }
  }
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response; data: any }): Response => {
  const { response, data } = error;

  const dvaError = {
    type: 'server', // 接口报错
    response,
    data,
    next: () => handleCatch(dvaError),
  } as dvaError;

  if (response && response.status === 200) {
    const { responseCode, data: msg } = data;
    dvaError.message = formatMessage({ id: msg });
    dvaError.status = Number(responseCode);
  } else if (response && response.status) {
    dvaError.message = codeMessage[response.status] || response.statusText;
    dvaError.status = response.status;
  } else if (!response) {
    // 网络超时
    dvaError.message = 'timeout';
    dvaError.status = 'timeout';
  }

  throw dvaError;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  timeout: 20000,
  credentials: 'include', // 默认请求是否带上cookie
});

request.use(
  async (ctx, next) => {
    const { req } = ctx;
    const headers = new Headers(req.options.headers);
    if (!headers || !headers.get('Authorization')) {
      headers.set('Authorization', localStorage.getItem('token') || '');
      req.options.headers = headers;
    }
    await next();
    const { res } = ctx;
    if (!res.ok) {
      return;
    }
    const { responseCode, data, ...other } = await res.clone().json();
    if (responseCode) {
      if (Object.keys(other).length === 0) {
        ctx.res = data;
      } else {
        ctx.res = other;
      }
    }
  },
  { core: true },
);

request.interceptors.response.use(async response => {
  const { responseCode, data: msg } = await response.clone().json();
  if (response.status === 200 && responseCode && responseCode !== '200') {
    const err = new Error() as RequsetError;
    err.response = response;
    err.data = { responseCode, data: msg };
    throw err;
  }
  return response;
});

export default request;

import { parse } from 'querystring';

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * 试卷范围（同统考和线上平台）
 * @param data: any
 */
export function matchUnitType(data: any) {
  if (data.scopeName) {
    return data.scopeName;
  }

  if (data.gradeValue) {
    switch (data.unitId) {
      case 'MID_TERM':
        return `${data.gradeValue}期中`;
      case 'MID_TERM_FIRST':
        return `${data.gradeValue}期中`;
      case 'MID_TERM_SECOND':
        return `${data.gradeValue}期中`;
      case 'END_TERM':
        return `${data.gradeValue}期末`;
      case 'END_TERM_FIRST':
        return `${data.gradeValue}期末`;
      case 'END_TERM_SECOND':
        return `${data.gradeValue}期末`;
      case '':
        return data.gradeValue;
      default:
        return `${data.gradeValue}单元`;
    }
  } else {
    return data.paperScopeValue;
  }
}

/**
 * 格式化字符串
 * 用于文本长度限制，替换指定字符
 * @param {string} str - 原字符串
 * @param {number} length - 限制长度
 * @param {string} replaceStr - 替换字符串，默认'...'
 */
export function stringFormat(str: string, length: number, replaceStr = '...') {
  if (str && str.length > length) {
    return `${str.slice(0, length)}${replaceStr}`;
  }
  return str;
}

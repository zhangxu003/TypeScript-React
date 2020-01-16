import { CodeType } from '@/models/dictionary';

/**
 * 去除空格
 *
 * @author kobe
 * @date 2019-01-09
 * @export
 * @param {*} str
 * @param {*} is_global
 * @returns
 */
export const Trim = (str: string, is_global: string = '') => {
  let result;
  result = str.replace(/(^\s+)|(\s+$)/g, '');

  if (is_global.toLowerCase() === 'g') {
    result = result.replace(/\s/g, '');
  }

  return result;
};

/**
 * 获取行政区域层级code
 * @returns {Array<string>} 返回Code 数组，eg.['1','101','102']
 */
export const getAdministrativeLevelCode = (code: string, source: Array<CodeType>) => {
  const getArea = (_code: string, _source: Array<CodeType>): CodeType =>
    _source.find(p => p.code === _code) as CodeType;

  const areaCodes = [];
  let area = source.find(p => p.code === code) as CodeType;
  areaCodes.push(area.code);
  //  循环获取父级
  while (area && area.parentCode) {
    area = getArea(area.parentCode as string, source);
    if (area) {
      areaCodes.push(area.code);
    }
  }

  return areaCodes.reverse();
};

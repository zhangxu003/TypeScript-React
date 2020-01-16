/**
 * 为了保证modal 中数据的整洁性，已经防止内存溢出，所以需要对
 * 数据源的数据做过滤操作，只保留必要的数据
 * @example
 * 例1：data 是对象
 * const data = {a:1,b:2,c:3}
 * const filter = 'a,b,d';
 * filterData(data,filter);
 * // {a:1,b:2,d:undefined}
 *
 *
 * 例2：data 是对象数组
 * const  data = [{a:1,b:2,c:3},{a:2,b:4,d:9}];
 * const filter = 'a,b,d';
 * filterData(data,filter);
 * // [{a:1,b:2,d:undefined},{a:2,b:4,d:9}]
 *
 *
 * 例3: filter 更改key值
 * const data = {a:1,b:2,c:3}
 * const filter = 'a,b,c:d';
 * filterData(data,filter);
 * // {a:1,b:2,d:3}
 * // 该方法是将 原来 数据中key 值c 换成d 并输出
 */
export default (data: object | object[], filter: string): any => {
  // 如果没有过滤条件，则不过滤
  if (!filter) return data;

  const filterArr = filter
    .split(',')
    .map(item => {
      if (!item) return undefined;
      // 判断过滤词是否需要改写名称
      const tags = item.split(':').map(tag => tag.trim());
      if (tags.length > 1) {
        if (!tags[0] || !tags[1]) {
          // 如果 : 前后是空值,则忽略
          return undefined;
        }
        return tags;
      }
      return item.trim();
    })
    .filter(item => !!item);

  // 对对象进行 过滤操作
  const handleObject = (obj: object) => {
    const result = {};
    filterArr.forEach(tag => {
      if (!tag) return;

      let oldkey: string;
      let newKey: string;

      if (Array.isArray(tag)) {
        [oldkey, newKey] = tag;
      } else {
        oldkey = tag;
        newKey = tag;
      }

      // 如果数据是对象则进行拷贝
      if (typeof obj[oldkey] === 'object') {
        result[newKey] = JSON.parse(JSON.stringify(obj[oldkey]));
      } else {
        result[newKey] = obj[oldkey];
      }
    });
    return result;
  };

  // 如果数据是对象数组
  if (Array.isArray(data)) {
    return data.map(item => handleObject(item));
  }

  // 如果数据是对象
  if (Object.prototype.toString.call(data) === '[object Object]') {
    return handleObject(data);
  }

  return data;
};

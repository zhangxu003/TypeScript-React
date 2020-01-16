/**
 * 项目中，全部请求的集合，
 * 目的：方便请求路径的管理，以后后期 路径过滤等
 */

import Proxy from '@/utils/proxy';

const basicApi = {
  // ===== 5.1 微服务-auth-service =====

  // GET /security/account/{id} 根据主键获得用户信息
  'AUTH-USER': '/uaa/security/account',

  // PUT /security/account/password/reset：重置密码信息
  'AUTH-RESET': '/uaa/security/account/password/reset',

  // AUTH-401：获取加密狗信息列表-分页
  'AUTH-401': '/uaa/operate/dongle-info/page',

  // AUTH-402：获取加密狗信息(根据设备ID)
  'AUTH-402': '/uaa/operate/dongle-info/detail',

  // AUTH-403：加密狗入库
  'AUTH-403': '/uaa/operate/dongle-info/save',

  // AUTH-404：加密狗回收
  'AUTH-404': '/uaa/operate/dongle-recycle',

  // AUTH-405：获取加密狗历史信息(根据设备ID)-分页
  'AUTH-405': '/uaa/operate/dongle-history/page',

  // AUTH-406：调整加密狗可激活次数
  'AUTH-406': '/uaa/operate/activate-count-limit/adjust',

  // AUTH-407：获取加密狗关联渠道商(根据设备ID)-分页
  'AUTH-407': '/uaa/operate/channel-vendor-dongle-history/page',

  // AUTH-408：获取加密狗关联校区(根据设备ID)-分页
  'AUTH-408': '/uaa/operate/campus-dongle-history/page',

  // AUTH-409：分配加密狗
  'AUTH-409': '/uaa/operate/dongle-distribute',

  // AUTH-410：取消分配加密狗
  'AUTH-410': '/uaa/operate/dongle-distribute/cancel',

  // AUTH-411：绑定加密狗
  'AUTH-411': '/uaa/operate/dongle-bind',

  // AUTH-412：取消绑定加密狗
  'AUTH-412': '/uaa/operate/dongle-bind/cancel',

  // AUTH-413：更换加密狗
  'AUTH-413': '/uaa/operate/dongle-change',

  // AUTH-414：加密狗有效期调整
  'AUTH-414': '/uaa/operate/dongle-invalid-time/adjust',

  // AUTH-415：加密狗结束试用
  'AUTH-415': '',

  // AUTH-416：加密狗信息修改
  'AUTH-416': '/uaa/operate/dongle-info/edit',

  // AUTH-417：获取SN序列号
  'AUTH-417': '/uaa/operate/dongle-info/sn',

  // ===== 5.4 微服务- operate_service =====

  // OPERATE-101：获取渠道商信息列表-分页
  'OPERATE-101': '/operate/channel-vendor/channel-vendor-page',

  // OPERATE-102：创建渠道商信息
  'OPERATE-102': '/operate/service-version/create',

  // OPERATE-103：获取渠道商信息
  'OPERATE-103': '/operate/channel-vendor/channel-vendor-detail',

  // OPERATE-104：校区结束试用信息
  'OPERATE-104': '/operate/channel-vendor/finish',

  // OPERATE-105：编辑渠道商信息
  'OPERATE-105': '/operate/service-version/edit',

  // ===== 微服务- dict_service =====
  // 获取相关字典
  'DICT-CODES': '/dict/type/data-codes',

  // CAMPUS-601：获取校区信息列表-分页
  'CAMPUS-601': '/campus/operate/tenant-page',

  // CAMPUS-603-1：创建校区信息并默认配置校区管理员
  'CAMPUS-603-1': '/campus/operate/campus-create/manage-add',

  // CAMPUS-602：获取校区信息
  'CAMPUS-602': '/campus/operate/campus-tenant/info',

  // CAMPUS-604：编辑校区信息
  'CAMPUS-604': '/campus/operate/campus-edit',

  // CAMPUS-604-1：编辑校区基础配置信息
  'CAMPUS-604-1': '/campus/operate/campus-basic-config/edit',

  // CAMPUS-605：获取老师信息列表-分页
  'CAMPUS-605': '/campus/operate/teacher-page',

  // CAMPUS-215：查询所有校区管理员
  'CAMPUS-215': '/campus/campus/config/admin',

  // CAMPUS-204-2 输入教师姓名分页搜索-过滤学科管理员+已经绑定
  'CAMPUS-204-2': '/campus/natural-class/config/teacher-admin-list',

  // CAMPUS-608：设置校区管理员
  'CAMPUS-608': '/campus/operate/teacher-admin/set',

  // CAMPUS-213：增加校区管理员
  'CAMPUS-213': '/campus/campus/config/admin/add',

  // CAMPUS-214：删除校区管理员
  'CAMPUS-214': '/campus/campus/config/admin/delete',

  // CAMPUS-606：创建教师信息
  'CAMPUS-606': '/campus/operate/teacher-create',

  // CAMPUS-607：重发教师邀请信息
  'CAMPUS-607': '/campus/operate/teacher-invite/repeat',

  // CAMPUS-104：停用/开启教师
  'CAMPUS-104': '/campus/teacher/changeStatus',

  // CAMPUS-105：删除教师
  'CAMPUS-105': '/campus/teacher/delete',

  // CAMPUS-106：检查教师信息是否已经存在
  'CAMPUS-106': '/campus/teacher/checkMobileExist',

  // CAMPUS-606-1：创建教师信息(批量)
  'CAMPUS-606-1': '/campus/operate/teacher-create/batch',

  // ========paper-dsl_service =====
  // CONTENT-651：试卷包列表
  'CONTENT-651': '/paper/paper-package/paper-package-detail-list',

  //   CAMPUS-216：修改班级名称格式
  'CAMPUS-216': '/campus/campus/config/eduPhase/update',

  // CONTENT-653：获取试卷包授权信息列表-分页
  'CONTENT-653': '/paper/paper-package/paper-package-authorization-list',

  // FILE-600：上传
  'FILE-600': '/file/file/oss/authorization',

  // FILE-601：上传
  'FILE-601': '/file/file/oss/head-img/authorization',

  // FILE-602：上传
  'FILE-602': '/file/file/',

  // FILE-102: 获取用户头像下载地址
  'FILE-102': '/file/file/head-img',

  // CONTENT-652：试卷包上下架
  'CONTENT-652': '/paper/paper-package/change-sales',

  // CONTENT-654：获取试卷包信息
  'CONTENT-654': '/paper/paper-package/paper-package-detail',

  // CONTENT-655：获取试卷信息列表(试卷包内试卷)-分页
  'CONTENT-655': '/paper/paper-package/paper-detail-list',

  // CONTENT-661：获取试卷包授权信息
  'CONTENT-661': '/paper/paper-package/paper-package-authorization-detail',

  // CONTENT-662：获取试卷包授权历史信息-分页
  'CONTENT-662': '/paper/package-history/page',

  // CONTENT-663：获取试卷包授权关联渠道商-分页
  'CONTENT-663': '/paper/package-history/by-channelVendorId',

  // CONTENT-658：获取试卷包授权关联校区-分页
  'CONTENT-658': '/paper/package-history/by-campus',

  // CONTENT-657：学校取消绑定试卷包
  'CONTENT-657': '/paper/paper-package-authorization/unbind',

  // CONTENT-306:查询授权给学校的试卷的试卷范围列表
  'CONTENT-306': '/paper/paper-template/list-by-campusId',

  // CONTENT-660：获取试卷信息列表(学校已授权试卷)-分页
  'CONTENT-660': '/paper/paper-package/paper-page',

  // CONTENT-656：学校绑定试卷包
  'CONTENT-656': '/paper/paper-package-authorization/bind',
  // REPORT-601：获取校区报告策略信息
  'REPORT-601': '/report/config-range/type',
  // REPORT-602：更新校区报告策略信息
  'REPORT-602': '/report/config-range/type',
  // CONTENT-604：试卷保密、开放
  'CONTENT-604': '/paper/campus-paper/change-status',
};

const apiUrl = new Proxy(basicApi, {
  get(target: Object, key: string) {
    // 当key 前面有 MOCK的数据默认是mock数据
    if (`MOCK-${key}` in target) {
      return `${target[`MOCK-${key}`]}`;
    }

    // 对路由进行分发处理
    if (key in target) {
      return `/api${target[key]}`;
    }

    throw new Error(`don't find api:${key}`);
  },
});

export default apiUrl;

/**
 * 登录用户状态管理
 */
import { defineStore } from 'pinia';
import { toTree, mapTree, isExternalLink } from 'ele-admin-plus/es';
import { getUserInfo } from '@/api/layout';
/** 直接指定菜单数据 */
const USER_MENUS = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'home-outlined',
    children: [
      {
        path: '/dashboard/workplace',
        title: '工作台',
        component: '/dashboard/workplace'
      },
      {
        path: '/dashboard/analysis',
        title: '分析页',
        component: '/dashboard/analysis'
      }
    ]
  },
  {
    path: '/basic',
    title: '基础信息管理',
    icon: 'database-outlined',
    children: [
      {
        path: '/basic/ship',
        title: '船舶基础信息',
        component: '/basic/ship'
      },
      {
        path: '/basic/company',
        title: '经营公司信息',
        component: '/basic/company'
      },
      {
        path: '/basic/port',
        title: '港口泊位信息',
        component: '/basic/port'
      },
      
      {
        path: '/basic/cargo',
        title: '货种信息',
        component: '/basic/cargo'
      },
      {
        path: '/basic/customer',
        title: '用户信息',
        component: '/basic/customer'
      }
    ]
  },
  {
    path: '/config',
    title: '运行图参数配置',
    icon: 'setting-outlined',
    children: [
      {
        path: '/config/background',
        title: '年度运行图底图配置',
        component: '/config/background'
      },
      {
        path: '/config/background-month',
        title: '月度运行图底图配置',
        component: '/config/background-month'
      },
      {
        path: '/config/agi',
        title: 'ai参数配置',
        component: '/config/agi'
      }
    ]
  },
  {
    path: '/plan',
    title: '计划文件管理',
    icon: 'file-outlined',
    children: [
      {
        path: '/plan/annual-production',
        title: '年度生产计划',
        component: '/plan/annual-production'
      },
      {
        path: '/plan/annual-ship',
        title: '年度租船计划',
        component: '/plan/annual-ship'
      },
      {
        path: '/plan/monthly-cargo',
        title: '月度货量计划',
        component: '/plan/monthly-cargo'
      },
      {
        path: '/plan/monthly-capacity',
        title: '月度运力计划',
        component: '/plan/monthly-capacity'
      },
      {
        path: '/plan/maintenance',
        title: '检修加油计划',
        component: '/plan/maintenance'
      }
    ]
  },
  {
    path: '/operation',
    title: '运行图编制调度',
    icon: 'CalendarOutlined',
    children: [
      {
        path: '/operation/sea',
        title: '海运运行图编制',
        component: '/operation/sea'
      },
      {
        path: '/operation/river',
        title: '江运运行图编制',
        component: '/operation/river'
      },
      {
        path: '/operation/foreign',
        title: '外贸运行图编制',
        component: '/operation/foreign'
      },
      {
        path: '/operation/alert',
        title: '预警信息',
        component: '/operation/alert'
      }
    ]
  },
  {
    path: '/evaluation',
    title: '评价分析',
    icon: 'PieChartOutlined',
    children: [
      {
        path: '/evaluation/overview',
        title: '运行图全图评价',
        component: '/evaluation/overview'
      },
      {
        path: '/evaluation/route',
        title: '航线评价',
        component: '/evaluation/route'
      },
      {
        path: '/evaluation/ship',
        title: '船舶评价',
        component: '/evaluation/ship'
      }
    ]
  },/*
  // 原有系统菜单
  {
    path: '/system',
    title: '系统管理',
    icon: 'setting-outlined',
    children: [
      {
        path: '/system/user',
        title: '用户管理',
        component: '/system/user'
      },
      {
        path: '/system/role',
        title: '角色管理',
        component: '/system/role'
      },
      {
        path: '/system/menu',
        title: '菜单管理',
        component: '/system/menu'
      },
      {
        path: '/system/dictionary',
        title: '字典管理',
        component: '/system/dictionary'
      },
      {
        path: '/system/organization',
        title: '机构管理',
        component: '/system/organization'
      },
      {
        path: '/system/loginRecord',
        title: '登录日志',
        component: '/system/loginRecord'
      },
      {
        path: '/system/operRecord',
        title: '操作日志',
        component: '/system/operRecord'
      }
    ]
  },
  {
    path: '/form',
    title: '表单页面',
    icon: 'form-outlined',
    children: [
      {
        path: '/form/basic',
        title: '基础表单',
        component: '/form/basic'
      },
      {
        path: '/form/advanced',
        title: '高级表单',
        component: '/form/advanced'
      },
      {
        path: '/form/step',
        title: '分步表单',
        component: '/form/step'
      },
      {
        path: '/form/build',
        title: '表单设计',
        component: '/form/build'
      }
    ]
  },
  {
    path: '/list',
    title: '列表页面',
    icon: 'table-outlined',
    children: [
      {
        path: '/list/basic',
        title: '基础列表',
        component: '/list/basic'
      },
      {
        path: '/list/card',
        title: '卡片列表',
        component: '/list/card'
      },
      {
        path: '/list/search',
        title: '搜索列表',
        children: [
          {
            path: '/list/search/article',
            title: '文章搜索',
            component: '/list/search/article'
          },
          {
            path: '/list/search/project',
            title: '项目搜索',
            component: '/list/search/project'
          },
          {
            path: '/list/search/application',
            title: '应用搜索',
            component: '/list/search/application'
          }
        ]
      }
    ]
  },
  {
    path: '/result',
    title: '结果页面',
    icon: 'check-circle-outlined',
    children: [
      {
        path: '/result/success',
        title: '成功页',
        component: '/result/success'
      },
      {
        path: '/result/fail',
        title: '失败页',
        component: '/result/fail'
      }
    ]
  },
  {
    path: '/exception',
    title: '异常页面',
    icon: 'warning-outlined',
    children: [
      {
        path: '/exception/403',
        title: '403',
        component: '/exception/403'
      },
      {
        path: '/exception/404',
        title: '404',
        component: '/exception/404'
      },
      {
        path: '/exception/500',
        title: '500',
        component: '/exception/500'
      }
    ]
  },
  {
    path: '/extension',
    title: '扩展组件',
    icon: 'appstore-outlined',
    children: [
      {
        path: '/extension/map',
        title: '地图组件',
        component: '/extension/map'
      },
      {
        path: '/extension/print',
        title: '打印插件',
        component: '/extension/print'
      },
      {
        path: '/extension/upload',
        title: '上传插件',
        component: '/extension/upload'
      },
      {
        path: '/extension/excel',
        title: 'Excel插件',
        component: '/extension/excel'
      },
      {
        path: '/extension/dragsort',
        title: '拖拽排序',
        component: '/extension/dragsort'
      },
      {
        path: '/extension/filemanager',
        title: '文件管理',
        component: '/extension/filemanager'
      },
      {
        path: '/extension/count',
        title: '数字动画',
        component: '/extension/count'
      },
      {
        path: '/extension/editor',
        title: '富文本框',
        component: '/extension/editor'
      },
      {
        path: '/extension/tag',
        title: '标签组件',
        component: '/extension/tag'
      }
    ]
  },
  {
    path: '/user',
    title: '个人中心',
    icon: 'user-outlined',
    hide: true,
    children: [
      {
        path: '/user/profile',
        title: '个人资料',
        component: '/user/profile'
      },
      {
        path: '/user/message',
        title: '我的消息',
        component: '/user/message'
      }
    ]
  }*/
];

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 当前登录用户的信息 */
    info: null,
    /** 当前登录用户的菜单 */
    menus: null,
    /** 当前登录用户的权限 */
    authorities: [],
    /** 当前登录用户的角色 */
    roles: [],
    /** 字典数据缓存 */
    dicts: {}
  }),
  actions: {
    /**
     * 请求登录用户的个人信息/权限/角色/菜单
     */
    async fetchUserInfo() {
      const result = await getUserInfo().catch((e) => console.error(e));
      if (!result) {
        return {};
      }
      // 用户信息
      this.setInfo(result);
      // 用户权限
      if (result.authorities) {
        this.authorities =
          result.authorities.map((d) => d.authority).filter((a) => !!a) ?? [];
      }
      // 用户角色
      this.roles = result.roles?.map?.((d) => d.roleCode) ?? [];
      // 用户菜单, 过滤掉按钮类型并转为children形式
      const { menus, homePath } = formatMenus(
        USER_MENUS ??
          toTree({
            data: result.authorities?.filter?.((d) => d.menuType !== 1),
            idField: 'menuId',
            parentIdField: 'parentId'
          })
      );
      this.setMenus(menus);
      return { menus, homePath };
    },
    /**
     * 更新用户信息
     */
    setInfo(value) {
      this.info = value;
    },
    /**
     * 更新菜单数据
     */
    setMenus(menus) {
      this.menus = menus;
    },
    /**
     * 更新菜单的徽章
     * @param path 菜单地址
     * @param value 徽章值
     * @param type 徽章类型
     */
    setMenuBadge(path, value, type) {
      this.menus = mapTree(this.menus, (m) => {
        if (path === m.path) {
          const meta = m.meta || {};
          return {
            ...m,
            meta: {
              ...meta,
              props: {
                ...meta.props,
                badge: value == null ? void 0 : { value, type }
              }
            }
          };
        }
        return m;
      });
    },
    /**
     * 更新字典数据
     */
    setDicts(value, code) {
      if (code == null) {
        this.dicts = value;
        return;
      }
      this.dicts[code] = value;
    }
  }
});

/**
 * 菜单数据处理为EleProLayout所需要的格式
 * @param data 菜单数据
 * @param childField 子级的字段名称
 */
function formatMenus(data, childField = 'children') {
  let homePath;
  let homeTitle;
  const menus = mapTree(
    data,
    (item) => {
      const meta =
        typeof item.meta === 'string'
          ? JSON.parse(item.meta || '{}')
          : item.meta;
      const menu = {
        path: item.path,
        component: item.component,
        meta: { title: item.title, icon: item.icon, hide: !!item.hide, ...meta }
      };
      const children = item[childField]
        ? item[childField].filter((d) => !(d.meta?.hide ?? d.hide))
        : void 0;
      if (!children?.length) {
        if (!homePath && menu.path && !isExternalLink(menu.path)) {
          homePath = menu.path;
          homeTitle = menu.meta?.title;
        }
      } else {
        const childPath = children[0].path;
        if (childPath) {
          if (!menu.redirect) {
            menu.redirect = childPath;
          }
          if (!menu.path) {
            menu.path = childPath.substring(0, childPath.lastIndexOf('/'));
          }
        }
      }
      if (!menu.path) {
        console.error('菜单path不能为空且要唯一:', item);
        return;
      }
      return menu;
    },
    childField
  );
  return { menus, homePath, homeTitle };
}

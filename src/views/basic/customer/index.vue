<template>
  <ele-page :flex-table="fixedHeight">
    <!-- 搜索表单 -->
    <search-form @search="handleSearch" />
    <ele-card
      :flex-table="fixedHeight"
      :body-style="{ paddingBottom: '4px' }"
      :style="{
        minHeight: fixedHeight ? '380px' : void 0,
        marginBottom: fixedHeight ? '0px' : void 0
      }"
    >
      <!-- 提示信息 -->
      <ele-alert
        show-icon
        :closable="false"
        :style="{ marginBottom: toolDefault ? '12px' : '4px' }"
      >
        <template #title>
          <span>已选择&nbsp;</span>
          <ele-text strong type="primary" tag="span">
            {{ selections.length }}
          </ele-text>
          <span>&nbsp;项数据&emsp;</span>
          <span>其中冻结状态的用户有 </span>
          <b>{{ selections.filter((d) => d.status === 1).length }} 个 &emsp;</b>
          <span>船公司管理员有 </span>
          <b>{{ selections.filter((d) => d.roles.some(r => r.roleName === '船公司管理员')).length }} 个 &emsp;</b>
          <span>物流管理员有 </span>
          <b>{{ selections.filter((d) => d.roles.some(r => r.roleName === '物流管理员')).length }} 个 &emsp;</b>
          <el-link
            type="primary"
            :underline="false"
            style="vertical-align: 0px"
            @click="clearChoose"
          >
            清空
          </el-link>
        </template>
      </ele-alert>
      <!-- 表格 -->
      <ele-pro-table
        ref="tableRef"
        row-key="userId"
        :columns="columns"
        :datasource="datasource"
        v-model:current="current"
        v-model:selections="selections"
        :show-overflow-tooltip="true"
        :export-config="exportConfig"
        :print-config="{ datasource: exportSource }"
        :border="bordered"
        :sticky="!fixedHeight"
        :toolbar="{ theme: toolDefault ? 'default' : 'plain' }"
        :default-sort="{ prop: 'createTime', order: 'ascending' }"
        :footer-style="{ paddingBottom: '12px' }"
        style="padding-bottom: 0"
        class="demo-table"
        cache-key="listBasicTable"
        @done="handleDone"
      >
        <template #toolbar>
          <el-button
            type="primary"
            :icon="PlusOutlined"
            class="ele-btn-icon"
            @click="openEdit()"
          >
            新建
          </el-button>
          <ele-dropdown
            :disabled="!selections.length"
            :items="[
              {
                title: '批量修改',
                command: 'edit',
                icon: EditOutlined
              },
              {
                title: '批量禁用',
                command: 'disabled',
                icon: MinusCircleOutlined
              },
              {
                title: '批量删除',
                command: 'del',
                icon: DeleteOutlined,
                danger: true,
                divided: true
              }
            ]"
            :icon-props="{ size: 15 }"
            placement="bottom-start"
            style="margin-left: 12px"
            @command="handleDropClick"
          >
            <el-button :disabled="!selections.length" class="ele-btn-icon">
              <span>批量操作</span>
              <el-icon :size="12" style="margin: 0 -4px 0 2px">
                <ArrowDown />
              </el-icon>
            </el-button>
          </ele-dropdown>
        </template>
        <!-- 表头工具按钮 -->
        <template #tools>
          <div style="display: flex; align-items: center; flex-wrap: wrap">
            <div>边框&nbsp;</div>
            <el-switch v-model="bordered" size="small" />
            <el-divider direction="vertical" />
            <div>表头背景&nbsp;</div>
            <el-switch v-model="toolDefault" size="small" />
            <el-divider direction="vertical" />
            <div>高度铺满&nbsp;</div>
            <el-switch v-model="fixedHeight" size="small" />
            <el-divider direction="vertical" />
          </div>
        </template>
        <!-- 头像列 -->
        <template #avatar="{ row }">
          <el-avatar
            v-if="row.avatar"
            :src="row.avatar"
            :size="32"
            @click.stop=""
            style="vertical-align: -16px"
          />
          <el-avatar
            v-else
            :size="32"
            style="background: var(--el-color-primary); vertical-align: -2px"
            @click.stop=""
          >
            {{
              row.nickname && row.nickname.length > 2
                ? row.nickname.substring(row.nickname.length - 2)
                : row.nickname
            }}
          </el-avatar>
        </template>
        <!-- 状态列 -->
        <template #status="{ row }">
          <ele-dot v-if="row.status === 0" text="正常" size="8px" />
          <ele-dot
            v-else-if="row.status === 1"
            text="冻结"
            type="danger"
            :ripple="false"
            size="8px"
          />
        </template>
        <!-- 角色列 -->
        <template #roles="{ row }">
          <el-tag
            v-for="item in row.roles"
            :key="item.roleId"
            size="small"
            :disable-transitions="true"
            style="margin-right: 6px"
          >
            {{ item.roleName }}
          </el-tag>
        </template>
        <!-- 操作列 -->
        <template #action="{ row }">
          <el-link
            type="primary"
            :underline="false"
            @click.stop="openEdit(row)"
          >
            修改
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="danger" :underline="false" @click.stop="remove(row)">
            删除
          </el-link>
        </template>
        <!-- 用户名表头 -->
        <template #nicknameHeader="{ column }">
          <div style="display: flex; align-items: center">
            <div style="flex: 1; overflow: hidden; text-overflow: ellipsis">
              {{ column.label }}
            </div>
            <nickname-filter @search="handleNicknameFilter" />
          </div>
        </template>
        <!-- 打印增加额外内容 -->
        <template #printTop>
          <h2 style="text-align: center">还可以自定义打印的顶部区域</h2>
        </template>
        <template #printBottom="{ data }">
          <h2 style="text-align: center">还可以自定义打印的底部区域</h2>
          <div style="text-align: center">
            共打印了 <b style="color: red">{{ data.length }}</b> 条数据
          </div>
        </template>
      </ele-pro-table>
    </ele-card>
  </ele-page>
</template>

<script setup>
  import { ref, reactive, computed, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessageBox } from 'element-plus/es';
  import { EleMessage } from 'ele-admin-plus/es';
  import { useI18n } from 'vue-i18n';
  import {
    PlusOutlined,
    ArrowDown,
    EditOutlined,
    MinusCircleOutlined,
    DeleteOutlined
  } from '@/components/icons';
  import { getExportWorkbook } from '@/config/use-global-config';
  import { download } from '@/utils/common';
  import request from '@/utils/request';
  import { usePageTab } from '@/utils/use-page-tab';
  import { useDictData } from '@/utils/use-dict-data';
  import SearchForm from './components/search-form.vue';
  import NicknameFilter from './components/nickname-filter.vue';
  import { pageUsers, listUsers } from '@/api/system/user';

  defineOptions({ name: 'ListBasic' });

  const { t } = useI18n();
  const { push } = useRouter();
  const { addPageTab } = usePageTab();

  /** 性别字典数据 */
  const [sexDicts] = useDictData(['sex']);

  /** 表格实例 */
  const tableRef = ref(null);

  /** 用户名筛选值 */
  const nicknameFilterValue = ref('');

  /** 表格搜索参数 */
  const lastWhere = reactive({});

  /** 表格列配置 */
  const columns = computed(() => {
    return [
      {
        type: 'selection',
        columnKey: 'selection',
        width: 50,
        align: 'center',
        fixed: 'left'
      },
      {
        type: 'index',
        columnKey: 'index',
        width: 50,
        align: 'center',
        fixed: 'left'
      },
      {
        columnKey: 'avatar',
        prop: 'avatar',
        label: t('list.basic.table.avatar'),
        width: 100,
        align: 'center',
        slot: 'avatar',
        className: 'demo-table-cell-avatar'
      },
      {
        prop: 'username',
        label: t('list.basic.table.username'),
        minWidth: 110,
        sortable: 'custom'
      },
      {
        prop: 'nickname',
        label: t('list.basic.table.nickname'),
        minWidth: 110,
        sortable: 'custom',
        headerSlot: 'nicknameHeader'
      },
      {
        columnKey: 'roles',
        label: t('list.basic.table.roles'),
        minWidth: 150,
        slot: 'roles',
        formatter: (row) => row.roles.map((d) => d.roleName).join(',')
      },
      {
        prop: 'organizationName',
        label: t('list.basic.table.organizationName'),
        minWidth: 110,
        sortable: 'custom'
      },
      {
        prop: 'phone',
        label: t('list.basic.table.phone'),
        minWidth: 120,
        align: 'center',
        sortable: 'custom'
      },
      {
        prop: 'email',
        label: t('list.basic.table.email'),
        minWidth: 150,
        sortable: 'custom'
      },
      {
        columnKey: 'sex',
        prop: 'sexName',
        label: t('list.basic.table.sexName'),
        width: 110,
        align: 'center',
        sortable: 'custom',
        filters: sexDicts.value.map((d) => {
          return { text: d.dictDataName, value: d.dictDataCode };
        }),
        filterMultiple: false
      },
      {
        prop: 'createTime',
        label: t('list.basic.table.createTime'),
        minWidth: 200,
        align: 'center',
        sortable: 'custom'
      },
      {
        prop: 'status',
        label: t('list.basic.table.status'),
        width: 110,
        sortable: 'custom',
        align: 'center',
        slot: 'status',
        filters: [
          { text: '正常', value: '0' },
          { text: '冻结', value: '1' }
        ],
        filterMultiple: false,
        formatter: (row) => (row.status == 0 ? '正常' : '冻结')
      },
      {
        columnKey: 'action',
        label: t('list.basic.table.action'),
        width: 130,
        align: 'center',
        showOverflowTooltip: false,
        resizable: false,
        slot: 'action',
        fixed: 'right',
        hideInPrint: true,
        hideInExport: true
      }
    ];
  });

  /** 表格选中数据 */
  const selections = ref([]);

  /** 表格单选选中数据 */
  const current = ref(null);

  /** 表格是否显示边框 */
  const bordered = ref(true);

  /** 表头工具栏风格 */
  const toolDefault = ref(true);

  /** 表格固定高度 */
  const fixedHeight = ref(false);

  /** 表格数据源 */
  const datasource = ({ pages, where, orders, filters }) => {
    return pageUsersMock({ ...where, ...orders, ...filters, ...pages });
  };

  /** 模拟用户数据 */
  const mockUsers = [
    {
      userId: 1,
      username: 'admin',
      nickname: '系统管理员',
      avatar: '',
      roles: [{ roleId: 1, roleName: '超级管理员' }],
      organizationName: '航运管理系统',
      phone: '13800138000',
      email: 'admin@shipping.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-01-01 00:00:00',
      status: 0
    },
    // 国能远海航运有限公司
    {
      userId: 2,
      username: 'wang.chunyi',
      nickname: '王春毅',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '国能远海航运有限公司',
      phone: '010-57595164',
      email: '20069030@ceic.com',
      sex: '1',
      sexName: '男',
      createTime: '2024-01-01 09:00:00',
      status: 0
    },
    // 国能（天津）航运有限公司
    {
      userId: 3,
      username: 'duan.pengfei',
      nickname: '段鹏飞',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '国能（天津）航运有限公司',
      phone: '',
      email: '',
      sex: '1',
      sexName: '男',
      createTime: '2024-09-20 09:00:00',
      status: 0
    },
    // 天津国能海运有限公司
    {
      userId: 4,
      username: 'le.zailong',
      nickname: '乐再龙',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '天津国能海运有限公司',
      phone: '022-23195001',
      email: 'P0001699@chnenergy.com',
      sex: '1',
      sexName: '男',
      createTime: '2024-06-20 09:00:00',
      status: 0
    },
    // 国能（武汉）航运有限公司
    {
      userId: 5,
      username: 'xin.jie',
      nickname: '辛洁',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '国能（武汉）航运有限公司',
      phone: '18696122716',
      email: '12345@163.com',
      sex: '2',
      sexName: '女',
      createTime: '2024-03-28 09:00:00',
      status: 0
    },
    // 国能香港远洋运输有限公司（示例，因无具体负责人信息，暂用英文名）
    {
      userId: 6,
      username: 'hk.manager',
      nickname: '香港远洋负责人',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '国能香港远洋运输有限公司',
      phone: '',
      email: '',
      sex: '1',
      sexName: '男',
      createTime: '2024-11-28 09:00:00',
      status: 0
    },
    {
      userId: 7,
      username: 'zhang.ming',
      nickname: '张明',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '中远海运集装箱运输有限公司',
      phone: '13812345678',
      email: 'zhang.ming@coscoshipping.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-02-15 09:30:00',
      status: 0
    },
    {
      userId: 8,
      username: 'li.qiang',
      nickname: '李强',
      avatar: '',
      roles: [{ roleId: 3, roleName: '物流管理员' }],
      organizationName: '中远海运物流有限公司',
      phone: '021-23456789',
      email: 'li.qiang@cosco-logistics.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-03-10 14:20:00',
      status: 0
    },
    {
      userId: 9,
      username: 'wang.fang',
      nickname: '王芳',
      avatar: '',
      roles: [{ roleId: 4, roleName: '货代管理员' }],
      organizationName: '上海远洋国际货运代理有限公司',
      phone: '13765432109',
      email: 'wang.fang@shipping-agent.cn',
      sex: '2',
      sexName: '女',
      createTime: '2023-04-05 11:15:00',
      status: 0
    },
    {
      userId: 10,
      username: 'john.smith',
      nickname: 'John Smith',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '马士基航运有限公司',
      phone: '13987654321',
      email: 'john.smith@maersk.com.cn',
      sex: '1',
      sexName: '男',
      createTime: '2023-05-20 16:45:00',
      status: 0
    },
    {
      userId: 11,
      username: 'marco.rossi',
      nickname: 'Marco Rossi',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '地中海航运（上海）有限公司',
      phone: '021-45678901',
      email: 'marco.rossi@msc-china.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-06-12 10:30:00',
      status: 1
    },
    {
      userId: 12,
      username: 'pierre.martin',
      nickname: 'Pierre Martin',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '达飞轮船（中国）有限公司',
      phone: '13678901234',
      email: 'pierre.martin@cma-cgm.cn',
      sex: '1',
      sexName: '男',
      createTime: '2023-07-08 13:20:00',
      status: 0
    },
    {
      userId: 13,
      username: 'chen.zm',
      nickname: '陈志明',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '长荣海运股份有限公司上海分公司',
      phone: '13567890123',
      email: 'chen.zm@evergreen.com.cn',
      sex: '1',
      sexName: '男',
      createTime: '2023-08-15 15:10:00',
      status: 0
    },
    {
      userId: 14,
      username: 'liu.wei',
      nickname: '刘伟',
      avatar: '',
      roles: [{ roleId: 3, roleName: '物流管理员' }],
      organizationName: '上海锦程国际物流有限公司',
      phone: '021-78901234',
      email: 'liu.wei@jc-logistics.cn',
      sex: '1',
      sexName: '男',
      createTime: '2023-09-22 09:45:00',
      status: 0
    },
    {
      userId: 15,
      username: 'zhang.hh',
      nickname: '张海华',
      avatar: '',
      roles: [{ roleId: 4, roleName: '货代管理员' }],
      organizationName: '上海海华国际货运代理有限公司',
      phone: '13456789012',
      email: 'zhang.hh@haihua-shipping.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-10-18 14:30:00',
      status: 0
    },
    {
      userId: 16,
      username: 'hans.schmidt',
      nickname: 'Hans Schmidt',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '赫伯罗特船务（中国）有限公司',
      phone: '021-90123456',
      email: 'hans.schmidt@hpl-china.com',
      sex: '1',
      sexName: '男',
      createTime: '2023-11-05 11:20:00',
      status: 0
    },
    {
      userId: 17,
      username: 'wang.yh',
      nickname: '王远航',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '上海远洋运输有限公司',
      phone: '13345678901',
      email: 'wang.yh@cosco-shipping.cn',
      sex: '1',
      sexName: '男',
      createTime: '2023-12-01 16:15:00',
      status: 1
    },
    {
      userId: 18,
      username: 'li.gs',
      nickname: '李港生',
      avatar: '',
      roles: [{ roleId: 4, roleName: '货代管理员' }],
      organizationName: '上海港国际货运有限公司',
      phone: '13234567890',
      email: 'li.gs@port-logistics.com.cn',
      sex: '1',
      sexName: '男',
      createTime: '2024-01-10 10:30:00',
      status: 0
    },
    {
      userId: 19,
      username: 'zhao.yd',
      nickname: '赵运达',
      avatar: '',
      roles: [{ roleId: 3, roleName: '物流管理员' }],
      organizationName: '上海中外运物流有限公司',
      phone: '021-23456701',
      email: 'zhao.yd@sinotrans-logistics.cn',
      sex: '1',
      sexName: '男',
      createTime: '2024-02-14 13:45:00',
      status: 0
    },
    {
      userId: 20,
      username: 'lin.ym',
      nickname: '林阳明',
      avatar: '',
      roles: [{ roleId: 2, roleName: '船公司管理员' }],
      organizationName: '阳明海运股份有限公司上海分公司',
      phone: '13123456789',
      email: 'lin.ym@yangming.com.cn',
      sex: '1',
      sexName: '男',
      createTime: '2024-03-08 15:20:00',
      status: 0
    },
    {
      userId: 21,
      username: 'zhou.ht',
      nickname: '周海通',
      avatar: '',
      roles: [{ roleId: 3, roleName: '物流管理员' }],
      organizationName: '上海海通国际物流有限公司',
      phone: '13012345678',
      email: 'zhou.ht@haitong-logistics.cn',
      sex: '1',
      sexName: '男',
      createTime: '2024-04-12 09:10:00',
      status: 0
    },
    {
      userId: 22,
      username: 'li.jing',
      nickname: '李静',
      avatar: '',
      roles: [{ roleId: 5, roleName: '客服专员' }],
      organizationName: '航运管理系统',
      phone: '13800138001',
      email: 'li.jing@shipping.com',
      sex: '2',
      sexName: '女',
      createTime: '2024-05-20 14:30:00',
      status: 0
    },
    {
      userId: 23,
      username: 'zhang.wei',
      nickname: '张伟',
      avatar: '',
      roles: [{ roleId: 6, roleName: '财务专员' }],
      organizationName: '航运管理系统',
      phone: '13800138002',
      email: 'zhang.wei@shipping.com',
      sex: '1',
      sexName: '男',
      createTime: '2024-06-15 11:45:00',
      status: 0
    },
    {
      userId: 24,
      username: 'wang.li',
      nickname: '王丽',
      avatar: '',
      roles: [{ roleId: 7, roleName: '运营专员' }],
      organizationName: '航运管理系统',
      phone: '13800138003',
      email: 'wang.li@shipping.com',
      sex: '2',
      sexName: '女',
      createTime: '2024-07-10 16:20:00',
      status: 0
    },
    {
      userId: 25,
      username: 'chen.gang',
      nickname: '陈刚',
      avatar: '',
      roles: [{ roleId: 8, roleName: '技术专员' }],
      organizationName: '航运管理系统',
      phone: '13800138004',
      email: 'chen.gang@shipping.com',
      sex: '1',
      sexName: '男',
      createTime: '2024-08-05 10:15:00',
      status: 0
    }
  ];

  /** 分页查询用户列表（模拟） */
  const pageUsersMock = ({ page = 1, size = 10, where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 模拟后端分页查询
      let data = [...mockUsers];
      
      // 处理搜索条件
      if (where.username) {
        data = data.filter(item => item.username.includes(where.username));
      }
      if (where.nickname) {
        data = data.filter(item => item.nickname.includes(where.nickname));
      }
      if (where.organizationName) {
        data = data.filter(item => item.organizationName.includes(where.organizationName));
      }
      if (where.phone) {
        data = data.filter(item => item.phone.includes(where.phone));
      }
      if (where.email) {
        data = data.filter(item => item.email.includes(where.email));
      }
      if (where.createTimeStart) {
        data = data.filter(item => item.createTime >= where.createTimeStart);
      }
      if (where.createTimeEnd) {
        data = data.filter(item => item.createTime <= where.createTimeEnd);
      }
      if (where.status !== undefined) {
        data = data.filter(item => item.status === where.status);
      }
      
      // 处理排序
      if (orders.prop) {
        data.sort((a, b) => {
          const valueA = a[orders.prop];
          const valueB = b[orders.prop];
          return orders.order === 'ascending' ? 
            (valueA > valueB ? 1 : -1) : 
            (valueA < valueB ? 1 : -1);
        });
      }
      
      // 处理筛选
      if (filters.sex) {
        data = data.filter(item => filters.sex.includes(item.sex));
      }
      if (filters.status) {
        data = data.filter(item => filters.status.includes(String(item.status)));
      }
      
      // 分页
      const start = (page - 1) * size;
      const end = start + size;
      const list = data.slice(start, end);
      
      resolve({
        list,
        total: data.length,
        page,
        size
      });
    });
  };

  /** 获取所有用户列表（用于导出） */
  const listUsersMock = ({ where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 复用分页查询的逻辑，但不进行分页
      pageUsersMock({ page: 1, size: 999999, where, orders, filters })
        .then(res => resolve(res.list));
    });
  };

  /** 表格数据请求完成事件 */
  const handleDone = () => {
    // 回显 id 为 45、47、48 的数据的复选框
    nextTick(() => {
      const ids = [45, 47, 48];
      tableRef.value?.setSelectedRowKeys?.(ids);
    });
  };

  /** 搜索事件 */
  const handleSearch = (where) => {
    Object.assign(lastWhere, where);
    doReload();
  };

  /** 刷新表格 */
  const reload = (where) => {
    tableRef.value?.reload?.({ page: 1, where });
  };

  /** 清空选择 */
  const clearChoose = () => {
    tableRef.value?.clearSelection?.();
  };

  /** 编辑 */
  const openEdit = (row) => {
    const path = row ? `/list/basic/edit/${row.userId}` : '/list/basic/add';
    if (row) {
      addPageTab({
        title: `修改用户[${row.nickname}]`,
        key: path,
        closable: true,
        meta: { icon: 'LinkOutlined' }
      });
    }
    push(path);
  };

  /** 删除 */
  const remove = (row) => {
    ElMessageBox.confirm(`确定要删除"${row.username}"吗?`, '系统提示', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        EleMessage.success('点击了删除');
      })
      .catch(() => {});
  };

  /** 下拉按钮点击 */
  const handleDropClick = (command) => {
    if (command === 'del') {
      EleMessage.error('点击了批量删除');
    } else if (command === 'edit') {
      EleMessage.info({ message: '点击了批量修改', plain: true });
    } else if (command === 'disabled') {
      EleMessage.info({ message: '点击了批量禁用', plain: true });
    }
  };

  /** 表格搜索 */
  const doReload = () => {
    if (nicknameFilterValue.value) {
      reload({
        ...lastWhere,
        nickname: nicknameFilterValue.value
      });
    } else {
      reload(lastWhere);
    }
  };

  /** 用户名筛选事件 */
  const handleNicknameFilter = (nickname) => {
    nicknameFilterValue.value = nickname;
    doReload();
  };

  /** 导出和打印全部数据的数据源 */
  const exportSource = ({ where, orders, filters }) => {
    return listUsersMock({ ...where, ...orders, ...filters });
  };

  /** 导出配置 */
  const exportConfig = reactive({
    fileName: '基础列表数据',
    datasource: exportSource,
    beforeExport: (params) => {
      const { fileName, closeModal, bodyCols, bodyData, headerData } = params;
      const workbook = getExportWorkbook(params);
      const sheet = workbook.getWorksheet('Sheet1');

      const getBuffer = async () => {
        // 添加头像列图片
        const avatarColIndex = bodyCols.findIndex(
          (c) => c.dataKey === 'avatar'
        );
        if (sheet != null && avatarColIndex !== -1) {
          const avatarBuffers = await Promise.all(
            bodyData.map(async (row) => {
              const url = row[avatarColIndex].text;
              if (!url) {
                return;
              }
              const res = await request({ url, responseType: 'arraybuffer' });
              return res.data;
            })
          );
          avatarBuffers.forEach((buffer, index) => {
            const rowIndex = index + headerData.length;
            if (buffer != null) {
              const imgId = workbook.addImage({ buffer, extension: 'png' });
              sheet.addImage(imgId, {
                tl: { col: avatarColIndex + 0.4, row: rowIndex + 0.2 },
                ext: { width: 48, height: 48 }
              });
              sheet.getCell(rowIndex + 1, avatarColIndex + 1).value = '';
            }
            sheet.getRow(rowIndex + 1).height = 42;
            sheet.getColumn(avatarColIndex + 1).width = 8;
          });
        }
        // 输出workbook
        const data = await workbook.xlsx.writeBuffer();
        return data;
      };

      getBuffer().then((data) => {
        download(data, `${fileName}.xlsx`);
        closeModal();
      });
      return false;
    }
  });
</script>

<style lang="scss" scoped>
  .demo-table :deep(td.demo-table-cell-avatar) {
    padding: 0;
    font-size: 0;
  }
</style>

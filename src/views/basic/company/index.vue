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
          <span>其中暂停运营的公司有 </span>
          <b>{{ selections.filter((d) => d.status === 1).length }} 个 &emsp;</b>
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
        row-key="companyId"
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
        :default-sort="{ prop: 'establishDate', order: 'ascending' }"
        :footer-style="{ paddingBottom: '12px' }"
        :pagination="{
          total: total,
          current: page,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true
        }"
        style="padding-bottom: 0"
        class="demo-table"
        cache-key="companyListTable"
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
        <!-- 公司logo列 -->
        <template #logo="{ row }">
          <el-avatar
            v-if="row.logo"
            :src="row.logo"
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
              row.companyName && row.companyName.length > 2
                ? row.companyName.substring(0, 2)
                : row.companyName
            }}
          </el-avatar>
        </template>
        <!-- 状态列 -->
        <template #status="{ row }">
          <ele-dot v-if="row.status === 0" text="正常运营" size="8px" />
          <ele-dot
            v-else-if="row.status === 1"
            text="暂停运营"
            type="danger"
            :ripple="false"
            size="8px"
          />
          <ele-dot
            v-else-if="row.status === 2"
            text="已注销"
            type="info"
            :ripple="false"
            size="8px"
          />
        </template>
        <!-- 业务类型列 -->
        <template #businessTypes="{ row }">
          <el-tag
            v-for="item in row.businessTypes"
            :key="item"
            size="small"
            :disable-transitions="true"
            style="margin-right: 6px"
          >
            {{ item }}
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

  /** 公司类型字典数据 */
  const [companyTypeDicts] = useDictData(['company_type']);

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
        columnKey: 'logo',
        prop: 'logo',
        label: '公司Logo',
        width: 100,
        align: 'center',
        slot: 'logo',
        className: 'demo-table-cell-avatar'
      },
      {
        prop: 'companyName',
        label: '公司名称',
        minWidth: 150,
        sortable: 'custom'
      },
      {
        prop: 'companyCode',
        label: '统一社会信用代码',
        minWidth: 180,
        sortable: 'custom'
      },
      {
        columnKey: 'companyType',
        prop: 'companyTypeName',
        label: '公司类型',
        width: 120,
        align: 'center',
        sortable: 'custom',
        filters: companyTypeDicts.value.map((d) => {
          return { text: d.dictDataName, value: d.dictDataCode };
        }),
        filterMultiple: false
      },
      {
        columnKey: 'businessTypes',
        label: '业务类型',
        minWidth: 150,
        slot: 'businessTypes',
        formatter: (row) => row.businessTypes.join(',')
      },
      {
        prop: 'contactPerson',
        label: '联系人',
        minWidth: 100,
        sortable: 'custom'
      },
      {
        prop: 'contactPhone',
        label: '联系电话',
        minWidth: 120,
        align: 'center',
        sortable: 'custom'
      },
      {
        prop: 'email',
        label: '电子邮箱',
        minWidth: 150,
        sortable: 'custom'
      },
      {
        prop: 'address',
        label: '公司地址',
        minWidth: 200,
        sortable: 'custom',
        hideInTable: true
      },
      {
        prop: 'licenseNo',
        label: '营业执照号',
        minWidth: 150,
        sortable: 'custom',
        hideInTable: true
      },
      {
        prop: 'operationLicenseNo',
        label: '经营许可证号',
        minWidth: 150,
        sortable: 'custom',
        hideInTable: true
      },
      {
        prop: 'establishDate',
        label: '成立日期',
        minWidth: 120,
        align: 'center',
        sortable: 'custom'
      },
      {
        prop: 'registeredCapital',
        label: '注册资本',
        minWidth: 120,
        align: 'right',
        sortable: 'custom'
      },
      {
        prop: 'status',
        label: '运营状态',
        width: 110,
        sortable: 'custom',
        align: 'center',
        slot: 'status',
        filters: [
          { text: '正常运营', value: '0' },
          { text: '暂停运营', value: '1' },
          { text: '已注销', value: '2' }
        ],
        filterMultiple: false,
        formatter: (row) => {
          const statusMap = { 0: '正常运营', 1: '暂停运营', 2: '已注销' };
          return statusMap[row.status] || '';
        }
      },
      {
        columnKey: 'action',
        label: '操作',
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

  /** 模拟公司数据 */
  const mockCompanies = [
    {
      companyId: 1,
      companyName: '中远海运集装箱运输有限公司',
      companyCode: '91310000132165478A',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '内贸运输', '多式联运'],
      contactPerson: '张明',
      contactPhone: '13812345678',
      email: 'zhang.ming@coscoshipping.com',
      address: '上海市浦东新区福山路450号',
      licenseNo: '91310000132165478A',
      operationLicenseNo: 'MOC-MU000001',
      establishDate: '2005-06-18',
      registeredCapital: '500000000',
      status: 0
    },
    {
      companyId: 2,
      companyName: '马士基航运有限公司',
      companyCode: '91310000607368789B',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '多式联运'],
      contactPerson: 'John Smith',
      contactPhone: '13987654321',
      email: 'john.smith@maersk.com.cn',
      address: '上海市浦东新区世纪大道88号',
      licenseNo: '91310000607368789B',
      operationLicenseNo: 'MOC-MU000002',
      establishDate: '1995-03-15',
      registeredCapital: '300000000',
      status: 0
    },
    {
      companyId: 3,
      companyName: '中远海运物流有限公司',
      companyCode: '91310000132165479B',
      companyType: '2',
      companyTypeName: '物流公司',
      logo: '',
      businessTypes: ['国际物流', '仓储配送', '供应链管理'],
      contactPerson: '李强',
      contactPhone: '021-23456789',
      email: 'li.qiang@cosco-logistics.com',
      address: '上海市虹口区东大名路700号',
      licenseNo: '91310000132165479B',
      operationLicenseNo: 'MOC-MU000003',
      establishDate: '2008-09-20',
      registeredCapital: '200000000',
      status: 0
    },
    {
      companyId: 4,
      companyName: '上海远洋国际货运代理有限公司',
      companyCode: '91310000607368790C',
      companyType: '3',
      companyTypeName: '货代公司',
      logo: '',
      businessTypes: ['国际货运代理', '报关报检', '订舱服务'],
      contactPerson: '王芳',
      contactPhone: '13765432109',
      email: 'wang.fang@shipping-agent.cn',
      address: '上海市黄浦区中山东一路13号',
      licenseNo: '91310000607368790C',
      operationLicenseNo: 'MOC-MU000004',
      establishDate: '2010-12-01',
      registeredCapital: '50000000',
      status: 0
    },
    {
      companyId: 5,
      companyName: '地中海航运（上海）有限公司',
      companyCode: '91310000607368791D',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '多式联运'],
      contactPerson: 'Marco Rossi',
      contactPhone: '021-45678901',
      email: 'marco.rossi@msc-china.com',
      address: '上海市浦东新区陆家嘴环路1000号',
      licenseNo: '91310000607368791D',
      operationLicenseNo: 'MOC-MU000005',
      establishDate: '2000-08-15',
      registeredCapital: '250000000',
      status: 1
    },
    {
      companyId: 6,
      companyName: '达飞轮船（中国）有限公司',
      companyCode: '91310000607368792E',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '多式联运', '冷链运输'],
      contactPerson: 'Pierre Martin',
      contactPhone: '13678901234',
      email: 'pierre.martin@cma-cgm.cn',
      address: '上海市浦东新区陆家嘴环路1000号',
      licenseNo: '91310000607368792E',
      operationLicenseNo: 'MOC-MU000006',
      establishDate: '1998-05-20',
      registeredCapital: '280000000',
      status: 0
    },
    {
      companyId: 7,
      companyName: '长荣海运股份有限公司上海分公司',
      companyCode: '91310000607368793F',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '内贸运输'],
      contactPerson: '陈志明',
      contactPhone: '13567890123',
      email: 'chen.zm@evergreen.com.cn',
      address: '上海市浦东新区张杨路500号',
      licenseNo: '91310000607368793F',
      operationLicenseNo: 'MOC-MU000007',
      establishDate: '2002-11-08',
      registeredCapital: '150000000',
      status: 0
    },
    {
      companyId: 8,
      companyName: '上海锦程国际物流有限公司',
      companyCode: '91310000607368794G',
      companyType: '2',
      companyTypeName: '物流公司',
      logo: '',
      businessTypes: ['国际物流', '仓储配送', '供应链管理', '跨境电商物流'],
      contactPerson: '刘伟',
      contactPhone: '021-78901234',
      email: 'liu.wei@jc-logistics.cn',
      address: '上海市虹口区东大名路888号',
      licenseNo: '91310000607368794G',
      operationLicenseNo: 'MOC-MU000008',
      establishDate: '2012-03-15',
      registeredCapital: '80000000',
      status: 0
    },
    {
      companyId: 9,
      companyName: '上海海华国际货运代理有限公司',
      companyCode: '91310000607368795H',
      companyType: '3',
      companyTypeName: '货代公司',
      logo: '',
      businessTypes: ['国际货运代理', '报关报检', '订舱服务', '危险品运输'],
      contactPerson: '张海华',
      contactPhone: '13456789012',
      email: 'zhang.hh@haihua-shipping.com',
      address: '上海市黄浦区中山东二路555号',
      licenseNo: '91310000607368795H',
      operationLicenseNo: 'MOC-MU000009',
      establishDate: '2015-07-20',
      registeredCapital: '30000000',
      status: 0
    },
    {
      companyId: 10,
      companyName: '赫伯罗特船务（中国）有限公司',
      companyCode: '91310000607368796I',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '多式联运', '冷藏运输'],
      contactPerson: 'Hans Schmidt',
      contactPhone: '021-90123456',
      email: 'hans.schmidt@hpl-china.com',
      address: '上海市浦东新区世纪大道1号',
      licenseNo: '91310000607368796I',
      operationLicenseNo: 'MOC-MU000010',
      establishDate: '2003-09-10',
      registeredCapital: '200000000',
      status: 0
    },
    {
      companyId: 11,
      companyName: '上海远洋运输有限公司',
      companyCode: '91310000607368797J',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '内贸运输', '散货运输'],
      contactPerson: '王远航',
      contactPhone: '13345678901',
      email: 'wang.yh@cosco-shipping.cn',
      address: '上海市虹口区东大名路700号',
      licenseNo: '91310000607368797J',
      operationLicenseNo: 'MOC-MU000011',
      establishDate: '1990-12-25',
      registeredCapital: '350000000',
      status: 1
    },
    {
      companyId: 12,
      companyName: '上海港国际货运有限公司',
      companyCode: '91310000607368798K',
      companyType: '3',
      companyTypeName: '货代公司',
      logo: '',
      businessTypes: ['国际货运代理', '港口物流', '集装箱堆场', '报关报检'],
      contactPerson: '李港生',
      contactPhone: '13234567890',
      email: 'li.gs@port-logistics.com.cn',
      address: '上海市浦东新区外高桥保税区',
      licenseNo: '91310000607368798K',
      operationLicenseNo: 'MOC-MU000012',
      establishDate: '2007-06-18',
      registeredCapital: '100000000',
      status: 0
    },
    {
      companyId: 13,
      companyName: '上海中外运物流有限公司',
      companyCode: '91310000607368799L',
      companyType: '2',
      companyTypeName: '物流公司',
      logo: '',
      businessTypes: ['国际物流', '仓储配送', '供应链管理', '跨境电商物流', '保税物流'],
      contactPerson: '赵运达',
      contactPhone: '021-23456701',
      email: 'zhao.yd@sinotrans-logistics.cn',
      address: '上海市浦东新区金桥出口加工区',
      licenseNo: '91310000607368799L',
      operationLicenseNo: 'MOC-MU000013',
      establishDate: '2009-08-30',
      registeredCapital: '120000000',
      status: 0
    },
    {
      companyId: 14,
      companyName: '阳明海运股份有限公司上海分公司',
      companyCode: '91310000607368800M',
      companyType: '1',
      companyTypeName: '船公司',
      logo: '',
      businessTypes: ['国际海运', '多式联运'],
      contactPerson: '林阳明',
      contactPhone: '13123456789',
      email: 'lin.ym@yangming.com.cn',
      address: '上海市浦东新区张杨路800号',
      licenseNo: '91310000607368800M',
      operationLicenseNo: 'MOC-MU000014',
      establishDate: '2001-04-15',
      registeredCapital: '180000000',
      status: 0
    },
    {
      companyId: 15,
      companyName: '上海海通国际物流有限公司',
      companyCode: '91310000607368801N',
      companyType: '2',
      companyTypeName: '物流公司',
      logo: '',
      businessTypes: ['国际物流', '仓储配送', '供应链管理', '汽车物流'],
      contactPerson: '周海通',
      contactPhone: '13012345678',
      email: 'zhou.ht@haitong-logistics.cn',
      address: '上海市嘉定区安亭镇',
      licenseNo: '91310000607368801N',
      operationLicenseNo: 'MOC-MU000015',
      establishDate: '2013-11-20',
      registeredCapital: '60000000',
      status: 0
    }
  ];

  /** 分页参数 */
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  /** 分页查询公司列表 */
  const pageCompanies = ({ page, size, where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 模拟后端分页查询
      let data = [...mockCompanies];
      
      // 处理搜索条件
      if (where.companyName) {
        data = data.filter(item => item.companyName.includes(where.companyName));
      }
      if (where.companyType) {
        data = data.filter(item => item.companyType === where.companyType);
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
      if (filters.companyType) {
        data = data.filter(item => filters.companyType.includes(item.companyType));
      }
      if (filters.status) {
        data = data.filter(item => filters.status.includes(String(item.status)));
      }
      
      // 分页
      const start = (page - 1) * size;
      const end = start + size;
      const list = data.slice(start, end);
      
      // 更新总数
      total.value = data.length;
      
      resolve({
        list,
        total: data.length,
        page,
        size
      });
    });
  };

  /** 获取所有公司列表（用于导出） */
  const listCompanies = ({ where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 复用分页查询的逻辑，但不进行分页
      pageCompanies({ page: 1, size: 999999, where, orders, filters })
        .then(res => resolve(res.list));
    });
  };

  /** 表格数据源 */
  const datasource = ({ page, size, where, orders, filters }) => {
    return pageCompanies({ 
      page: page || 1, 
      size: size || 10, 
      where, 
      orders, 
      filters 
    });
  };

  /** 表格数据请求完成事件 */
  const handleDone = (res) => {
    // 更新分页信息
    if (res) {
      page.value = res.page;
      pageSize.value = res.size;
      total.value = res.total;
    }
  };

  /** 搜索事件 */
  const handleSearch = (where) => {
    Object.assign(lastWhere, where);
    page.value = 1; // 重置页码
    doReload();
  };

  /** 刷新表格 */
  const reload = (where) => {
    tableRef.value?.reload?.({ 
      page: page.value, 
      size: pageSize.value, 
      where 
    });
  };

  /** 清空选择 */
  const clearChoose = () => {
    tableRef.value?.clearSelection?.();
  };

  /** 编辑 */
  const openEdit = (row) => {
    const path = row ? `/company/edit/${row.companyId}` : '/company/add';
    if (row) {
      addPageTab({
        title: `修改公司[${row.companyName}]`,
        key: path,
        closable: true,
        meta: { icon: 'LinkOutlined' }
      });
    }
    push(path);
  };

  /** 删除 */
  const remove = (row) => {
    ElMessageBox.confirm(`确定要删除"${row.companyName}"吗?`, '系统提示', {
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
    return listCompanies({ ...where, ...orders, ...filters });
  };

  /** 导出配置 */
  const exportConfig = reactive({
    fileName: '经营公司信息数据',
    datasource: exportSource,
    beforeExport: (params) => {
      const { fileName, closeModal, bodyCols, bodyData, headerData } = params;
      const workbook = getExportWorkbook(params);
      const sheet = workbook.getWorksheet('Sheet1');

      const getBuffer = async () => {
        // 添加头像列图片
        const avatarColIndex = bodyCols.findIndex(
          (c) => c.dataKey === 'logo'
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

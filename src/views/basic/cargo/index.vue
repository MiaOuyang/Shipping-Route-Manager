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
          <span>其中不可用的货种有 </span>
          <b>{{ selections.filter((d) => d.status === 0).length }} 个 &emsp;</b>
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
        row-key="cargoType"
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
        :default-sort="{ prop: 'cargoType', order: 'ascending' }"
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
        cache-key="cargoListTable"
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
        <!-- 状态列 -->
        <template #status="{ row }">
          <ele-dot v-if="row.status === 1" text="可用" size="8px" />
          <ele-dot
            v-else-if="row.status === 0"
            text="不可用"
            type="danger"
            :ripple="false"
            size="8px"
          />
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

  defineOptions({ name: 'CargoList' });

  const { t } = useI18n();
  const { push } = useRouter();
  const { addPageTab } = usePageTab();

  /** 货物分类字典数据 */
  const [cargoCategoryDicts] = useDictData(['cargo_category']);

  /** 表格实例 */
  const tableRef = ref(null);

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
        prop: 'cargoType',
        label: '货物类型',
        minWidth: 120,
        sortable: 'custom'
      },
      {
        prop: 'cargoNameCn',
        label: '货物中文名',
        minWidth: 150,
        sortable: 'custom'
      },
      {
        prop: 'cargoNameEn',
        label: '货物英文名',
        minWidth: 150,
        sortable: 'custom'
      },
      {
        prop: 'cargoCategory',
        label: '货物分类',
        width: 120,
        align: 'center',
        sortable: 'custom',
        filters: cargoCategoryDicts.value.map((d) => {
          return { text: d.dictDataName, value: d.dictDataCode };
        }),
        filterMultiple: false
      },
      {
        prop: 'sapCategory',
        label: 'SAP货物分类',
        minWidth: 120,
        sortable: 'custom'
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        sortable: 'custom',
        align: 'center',
        slot: 'status',
        filters: [
          { text: '可用', value: '1' },
          { text: '不可用', value: '0' }
        ],
        filterMultiple: false,
        formatter: (row) => {
          const statusMap = { 1: '可用', 0: '不可用' };
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

  /** 模拟货种数据 */
  const mockCargos = [
    {
      cargoType: '22008',
      cargoNameCn: '外购4500',
      cargoNameEn: '外购4500',
      cargoCategory: '1',
      sapCategory: '煤炭',
      status: 1
    },
    {
      cargoType: '20071',
      cargoNameCn: '块矿',
      cargoNameEn: '块矿',
      cargoCategory: '0',
      sapCategory: '铁矿石',
      status: 1
    },
    // ... 其他数据
  ];

  /** 分页参数 */
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  /** 分页查询货种列表 */
  const pageCargos = ({ page, size, where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 模拟后端分页查询
      let data = [...mockCargos];
      
      // 处理搜索条件
      if (where.cargoNameCn) {
        data = data.filter(item => item.cargoNameCn.includes(where.cargoNameCn));
      }
      if (where.cargoCategory) {
        data = data.filter(item => item.cargoCategory === where.cargoCategory);
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
      if (filters.cargoCategory) {
        data = data.filter(item => filters.cargoCategory.includes(item.cargoCategory));
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

  /** 获取所有货种列表（用于导出） */
  const listCargos = ({ where = {}, orders = {}, filters = {} }) => {
    return new Promise((resolve) => {
      // 复用分页查询的逻辑，但不进行分页
      pageCargos({ page: 1, size: 999999, where, orders, filters })
        .then(res => resolve(res.list));
    });
  };

  /** 表格数据源 */
  const datasource = ({ page, size, where, orders, filters }) => {
    return pageCargos({ 
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
    const path = row ? `/cargo/edit/${row.cargoType}` : '/cargo/add';
    if (row) {
      addPageTab({
        title: `修改货种[${row.cargoNameCn}]`,
        key: path,
        closable: true,
        meta: { icon: 'LinkOutlined' }
      });
    }
    push(path);
  };

  /** 删除 */
  const remove = (row) => {
    ElMessageBox.confirm(`确定要删除"${row.cargoNameCn}"吗?`, '系统提示', {
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
    reload(lastWhere);
  };

  /** 导出和打印全部数据的数据源 */
  const exportSource = ({ where, orders, filters }) => {
    return listCargos({ ...where, ...orders, ...filters });
  };

  /** 导出配置 */
  const exportConfig = reactive({
    fileName: '货种信息数据',
    datasource: exportSource,
    beforeExport: (params) => {
      const { fileName, closeModal } = params;
      const workbook = getExportWorkbook(params);
      const data = workbook.xlsx.writeBuffer();
      download(data, `${fileName}.xlsx`);
      closeModal();
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

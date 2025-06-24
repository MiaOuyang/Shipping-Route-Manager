<template>
  <div class="annual-plan-wrapper">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>年度计划运量表</span>
          <div style="display: flex; align-items: center">
            <el-select
              v-model="searchYear"
              placeholder="请选择年份"
              style="width: 160px"
              clearable
              @change="readExcelFile"
            >
              <el-option
                v-for="item in yearOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-button
              v-if="loadError"
              type="primary"
              size="small"
              @click="readExcelFile()"
              style="margin-left: 10px"
            >
              重新加载数据
            </el-button>
          </div>
        </div>
      </template>
      <ele-pro-table
        :columns="columns"
        :datasource="tableData"
        :loading="loading"
        row-key="id"
        :style="{ width: '100%' }"
        height="auto"
      >
        <template #empty>
          <div class="empty-data">
            <el-empty
              :description="loadError ? '数据加载失败，请重试' : '暂无数据'"
            />
          </div>
        </template>
      </ele-pro-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { ElMessage } from 'element-plus';

// 定义组件名称（重要）
defineOptions({
  name: 'PlanAnnual'
});

// 表格数据
const tableData = ref([]);
// 表格列配置
const columns = ref([]);
// 加载状态
const loading = ref(false);
// 加载错误状态
const loadError = ref(false);
// 搜索年份
const searchYear = ref('');
// 存储整个工作簿的数据
const workbookData = ref(null);
// 年份选项
const yearOptions = ref([]);

// 初始化默认表头
const initDefaultColumns = () => {
  // 设置默认表头，根据实际需求调整
  columns.value = [
    { prop: 'id', label: '序号', width: 80, align: 'center' },
    { prop: 'year', label: '年份', minWidth: 120, align: 'center' },
    { prop: 'month', label: '月份', minWidth: 120, align: 'center' },
    { prop: 'volume', label: '运量', minWidth: 120, align: 'center' },
    { prop: 'remark', label: '备注', minWidth: 150, align: 'center' }
  ];
};

// 读取Excel文件
const readExcelFile = async (year) => {
  loading.value = true;
  loadError.value = false;

  try {
    // 仅在首次加载时获取文件
    if (!workbookData.value) {
      const response = await fetch('/data/运量表.xlsx');
      if (!response.ok) {
        throw new Error(`文件加载失败: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      workbookData.value = XLSX.read(arrayBuffer, { type: 'array' });
      // 首次加载时，填充年份选项
      yearOptions.value = workbookData.value.SheetNames;
    }

    const workbook = workbookData.value;
    // 如果没有指定年份(比如初始加载)，默认使用第一个工作表名
    const sheetNameToLoad = year === undefined ? workbook.SheetNames[0] : year;

    // 如果用户清空了选择（year 为 ''），则清空表格
    if (!sheetNameToLoad) {
      tableData.value = [];
      initDefaultColumns();
      searchYear.value = '';
      loading.value = false;
      return;
    }

    // 检查工作表是否存在
    if (!workbook.SheetNames.includes(sheetNameToLoad)) {
      ElMessage.warning(`未找到年份为 "${sheetNameToLoad}" 的数据表`);
      // 如果工作表不存在，清空表格
      tableData.value = [];
      initDefaultColumns();
      loading.value = false;
      return;
    }

    // 更新当前选中的年份
    searchYear.value = sheetNameToLoad;

    const worksheet = workbook.Sheets[sheetNameToLoad];

    // 将工作表转换为JSON数据
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (json.length > 0) {
      // 提取表头作为列配置
      columns.value = json[0].map((header) => ({
        prop: header,
        label: header,
        align: 'center',
        minWidth: 120
      }));

      // 转换数据格式
      tableData.value = json.slice(1).map((row, index) => {
        const item = { id: index + 1 };
        json[0].forEach((header, colIndex) => {
          item[header] = row[colIndex];
        });
        return item;
      });

      ElMessage.success(`"${sheetNameToLoad}"年数据加载成功`);
    } else {
      // 如果Excel文件中没有数据，使用默认表头并清空数据
      initDefaultColumns();
      tableData.value = [];
      ElMessage.warning('Excel工作表中没有数据');
    }
  } catch (error) {
    console.error('读取Excel文件失败, 详细错误:', error);
    // 加载失败时，设置错误状态，使用默认表头并清空数据
    loadError.value = true;
    workbookData.value = null; // 清除缓存，以便重新加载
    initDefaultColumns();
    tableData.value = [];
    ElMessage.error('读取Excel文件失败，请检查文件或网络连接');
  } finally {
    loading.value = false;
  }
};

// 页面加载时读取Excel数据
onMounted(() => {
  // 初始化默认表头
  initDefaultColumns();
  // 读取Excel数据
  readExcelFile();
});
</script>

<style scoped>
.annual-plan-wrapper {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.empty-data {
  padding: 30px 0;
}
</style> 
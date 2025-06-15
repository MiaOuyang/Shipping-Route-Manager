<template>
  <div class="annual-plan-wrapper">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>年度计划运量表</span>
          <el-button
            v-if="loadError"
            type="primary"
            size="small"
            @click="readExcelFile"
          >
            重新加载数据
          </el-button>
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
const readExcelFile = async () => {
  loading.value = true;
  loadError.value = false;
  
  // 添加调试信息
  console.log('开始加载Excel文件: /data/运量表.xlsx');
  
  try {
    // 修改为绝对路径
    const response = await fetch('/data/运量表.xlsx');
    console.log('文件请求状态:', response.status, response.statusText);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('文件读取成功, 大小:', arrayBuffer.byteLength, '字节');
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('Excel解析成功, 工作表:', workbook.SheetNames);
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 将工作表转换为JSON数据
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('数据转换成功, 行数:', json.length, '条目数据示例:', json[0]);
    
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
      
      ElMessage.success('数据加载成功');
    } else {
      // 如果Excel文件中没有数据，使用默认表头并清空数据
      initDefaultColumns();
      tableData.value = [];
      ElMessage.warning('Excel文件中没有数据');
    }
  } catch (error) {
    console.error('读取Excel文件失败, 详细错误:', error);
    // 加载失败时，设置错误状态，使用默认表头并清空数据
    loadError.value = true;
    initDefaultColumns();
    tableData.value = [];
    ElMessage.error('读取Excel文件失败，请检查文件路径是否正确');
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
<template>
  <!-- 租船年度计划：统计卡 + 表格 -->
  <ele-page :key="$route.name">
    <!-- ① 统计卡片 -->
    <ele-card>
      <el-row>
        <el-col :sm="8" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">公司数量</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ companyCount }} 家</ele-text>
          </div>
        </el-col>
        <el-col :sm="8" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">租船总艘数</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalShips }} 艘</ele-text>
          </div>
        </el-col>
        <el-col :sm="8" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">租船总航次</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalVoyages }} 次</ele-text>
          </div>
        </el-col>
      </el-row>
    </ele-card>

    <!-- ② 表格卡片 -->
    <ele-card>
      <ele-toolbar title="年度租船计划" :title-props="{ size: 'md' }">
        <template #tools>
          <el-select v-model="filterYear" placeholder="年份" style="width: 100px" @change="applyFilter">
            <el-option v-for="y in yearOptions" :key="y" :value="y" :label="y" />
          </el-select>
          <el-button type="primary" size="small" style="margin-left:12px" @click="readExcelFile">刷新</el-button>
        </template>
      </ele-toolbar>

      <ele-pro-table
        :columns="columns"
        :datasource="filteredData"
        :loading="loading"
        row-key="序号"
        style="width:100%"
        height="auto"
      >
        <template #empty>
          <el-empty :description="loadError ? '数据加载失败，请重试' : '暂无数据'" />
        </template>
      </ele-pro-table>
    </ele-card>
  </ele-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'AnnualCharterPlan' });

/* ---------------- 状态 ---------------- */
const rawData   = ref([]);          // Excel 原始数据
const columns   = ref([]);          // 表头
const loading   = ref(false);
const loadError = ref(false);

/* 过滤条件 */
const filterYear  = ref('全部');
const yearOptions = ref([]);

/* 过滤后的数据 */
const filteredData = computed(() => {
  return rawData.value.filter(r => {
    if (filterYear.value !== '全部' && String(r.年份) !== String(filterYear.value)) return false;
    return true;
  });
});

/* 统计指标 */
const companyCount = computed(() => new Set(rawData.value.map(r => r.公司)).size);
const totalShips   = computed(() => filteredData.value.reduce((s, r) => s + Number(r['租船数量'] || 0), 0));
const totalVoyages = computed(() => filteredData.value.reduce((s, r) => s + Number(r['租船航次'] || 0), 0));

/* 默认表头 */
function initDefaultColumns () {
  columns.value = [
    { prop: '序号',     label: '序号', width: 80,  align: 'center' },
    { prop: '年份',     label: '年份', minWidth: 100, align: 'center' },
    { prop: '公司',     label: '公司', minWidth: 120, align: 'center' },
    { prop: '租船数量', label: '租船数量', minWidth: 100, align: 'center' },
    { prop: '租船航次', label: '租船航次', minWidth: 100, align: 'center' }
  ];
}

/* 读取 Excel */
async function readExcelFile () {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await fetch('/data/租船计划.xlsx');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const wb = XLSX.read(await res.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json  = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!json.length) throw new Error('空工作表');

    // 列头
    columns.value = json[0].map((h, i) => ({ prop: h || `COL_${i}`, label: h || `COL_${i}`, minWidth: 100, align: 'center' }));

    // 数据
    rawData.value = json.slice(1).map((row, idx) => {
      const obj = { id: idx + 1 };
      json[0].forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    // 年份选项
    yearOptions.value = Array.from(new Set(rawData.value.map(r => r.年份)));
    yearOptions.value.unshift('全部');

    ElMessage.success('数据加载成功');
  } catch (err) {
    console.error(err);
    loadError.value = true;
    initDefaultColumns();
    rawData.value = [];
    ElMessage.error('读取 Excel 失败');
  } finally {
    loading.value = false;
  }
}

function applyFilter () {
  // computed 自动刷新
}

onMounted(() => {
  initDefaultColumns();
  readExcelFile();
});
</script>

<style scoped>
.stat-box {
  text-align: center;
}
</style>

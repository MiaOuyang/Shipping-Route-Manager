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
            <ele-text type="placeholder">租船总数</ele-text>
            <ele-text size="xl" style="margin-top:6px"
              >{{ totalCharterCount }} 艘</ele-text
            >
          </div>
        </el-col>
        <el-col :sm="8" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">租船总运力</ele-text>
            <ele-text size="xl" style="margin-top:6px"
              >{{ totalDWT }} 万吨</ele-text
            >
          </div>
        </el-col>
      </el-row>
    </ele-card>

    <!-- ② 表格卡片 -->
    <ele-card>
      <ele-toolbar title="年度租船计划" :title-props="{ size: 'md' }">
        <template #tools>
          <span style="margin-right: 8px">年份:</span>
          <el-select
            v-model="filterYear"
            placeholder="请选择年份"
            style="width: 120px"
            clearable
            @change="applyFilter"
          >
            <el-option
              v-for="y in yearOptions"
              :key="y"
              :value="y"
              :label="y"
            />
          </el-select>
          <span style="margin-left: 12px; margin-right: 8px">公司:</span>
          <el-select
            v-model="filterCompany"
            placeholder="公司"
            style="width: 140px"
            clearable
          >
            <el-option
              v-for="c in companyOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
          <span style="margin-left: 12px; margin-right: 8px">船型:</span>
          <el-select
            v-model="filterShipType"
            placeholder="船型"
            style="width: 120px"
            clearable
          >
            <el-option
              v-for="s in shipTypeOptions"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
          <span style="margin-left: 12px; margin-right: 8px">租期:</span>
          <el-select
            v-model="filterCharterPeriod"
            placeholder="租期"
            style="width: 120px"
            clearable
          >
            <el-option
              v-for="p in charterPeriodOptions"
              :key="p"
              :label="p"
              :value="p"
            />
          </el-select>
          <el-button
            type="primary"
            size="small"
            style="margin-left: 12px"
            @click="refreshData"
            >刷新</el-button
          >
        </template>
      </ele-toolbar>

      <ele-pro-table
        :columns="columns"
        :datasource="filteredData"
        :loading="loading"
        row-key="序号"
        style="width: 100%"
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
const workbookData = ref(null);

/* 过滤条件 */
const filterYear = ref('');
const yearOptions = ref([]);
const filterCompany = ref('');
const companyOptions = ref([]);
const filterShipType = ref('');
const shipTypeOptions = ref([]);
const filterCharterPeriod = ref('');
const charterPeriodOptions = ref([]);

/* 过滤后的数据 */
const filteredData = computed(() => {
  return rawData.value.filter((r) => {
    if (
      filterCompany.value &&
      filterCompany.value !== '全部' &&
      r.公司 !== filterCompany.value
    ) {
      return false;
    }
    if (
      filterShipType.value &&
      filterShipType.value !== '全部' &&
      r.船型 !== filterShipType.value
    ) {
      return false;
    }
    if (
      filterCharterPeriod.value &&
      filterCharterPeriod.value !== '全部' &&
      r.租期 !== filterCharterPeriod.value
    ) {
      return false;
    }
    return true;
  });
});

/* 统计指标 */
const companyCount = computed(() => new Set(rawData.value.map((r) => r.公司)).size);
const totalCharterCount = computed(() => filteredData.value.length);
const totalDWT = computed(() =>
  filteredData.value.reduce((sum, row) => {
    // 从 "3万吨" 这样的字符串中提取数字
    const tonnage = parseInt(row['船型']) || 0;
    return sum + tonnage;
  }, 0)
);

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
async function readExcelFile(year) {
  loading.value = true;
  loadError.value = false;
  try {
    // 仅在首次加载时获取文件
    if (!workbookData.value) {
      const res = await fetch('/data/租船计划.xlsx');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const wb = XLSX.read(await res.arrayBuffer(), { type: 'array' });
      workbookData.value = wb;
      // 首次加载时，填充年份选项
      yearOptions.value = wb.SheetNames;
    }

    const workbook = workbookData.value;
    // 如果没有指定年份(比如初始加载)，默认使用第一个工作表名
    const sheetNameToLoad = year === undefined ? workbook.SheetNames[0] : year;

    // 如果用户清空了选择（year 为 ''），则清空表格
    if (!sheetNameToLoad) {
      rawData.value = [];
      initDefaultColumns();
      filterYear.value = '';
      // 清空筛选选项
      companyOptions.value = [];
      shipTypeOptions.value = [];
      charterPeriodOptions.value = [];
      loading.value = false;
      return;
    }

    // 检查工作表是否存在
    if (!workbook.SheetNames.includes(sheetNameToLoad)) {
      ElMessage.warning(`未找到年份为 "${sheetNameToLoad}" 的数据表`);
      rawData.value = [];
      initDefaultColumns();
      loading.value = false;
      return;
    }

    filterYear.value = sheetNameToLoad;

    const sheet = workbook.Sheets[sheetNameToLoad];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (json.length > 0) {
      // 列头
      columns.value = json[0].map((h, i) => ({
        prop: h || `COL_${i}`,
        label: h || `COL_${i}`,
        minWidth: 100,
        align: 'center'
      }));

      // 数据
      rawData.value = json.slice(1).map((row, idx) => {
        const obj = { id: idx + 1 };
        json[0].forEach((h, i) => {
          // trim() an whitespace from header
          const header = typeof h === 'string' ? h.trim() : h;
          obj[header] = row[i];
        });
        return obj;
      });

      // 更新筛选选项
      companyOptions.value = [
        '全部',
        ...new Set(rawData.value.map((r) => r.公司).filter(Boolean))
      ];
      shipTypeOptions.value = [
        '全部',
        ...new Set(rawData.value.map((r) => r.船型).filter(Boolean))
      ];
      charterPeriodOptions.value = [
        '全部',
        ...new Set(rawData.value.map((r) => r.租期).filter(Boolean))
      ];

      // 重置筛选器
      filterCompany.value = '';
      filterShipType.value = '';
      filterCharterPeriod.value = '';

      ElMessage.success(`"${sheetNameToLoad}"年数据加载成功`);
    } else {
      ElMessage.warning('Excel工作表中没有数据');
      rawData.value = [];
      initDefaultColumns();
    }
  } catch (err) {
    console.error(err);
    loadError.value = true;
    workbookData.value = null; // 清除缓存，以便重新加载
    initDefaultColumns();
    rawData.value = [];
    ElMessage.error('读取 Excel 失败, 请检查文件或网络连接');
  } finally {
    loading.value = false;
  }
}

function refreshData() {
  workbookData.value = null; // 清空缓存以强制重新获取文件
  readExcelFile();
}

function applyFilter(year) {
  readExcelFile(year);
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

<template>
  <!-- 月度货量计划：统计卡 + 表格 -->
  <ele-page :key="$route.name">
    <!-- ① 统计卡片 -->
    <ele-card>
      <el-row>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">公司数量</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ companyCount }} 家</ele-text>
          </div>
        </el-col>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">已加载月份</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ loadedMonths }} 个月</ele-text>
          </div>
        </el-col>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">总运量</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalVolume }} 万吨</ele-text>
          </div>
        </el-col>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">总租船艘次</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalVoyages }} 次</ele-text>
          </div>
        </el-col>
      </el-row>
    </ele-card>

    <!-- ② 表格卡片 -->
    <ele-card>
      <ele-toolbar title="月度货量计划" :title-props="{ size: 'md' }">
        <template #tools>
          <div style="display:flex;align-items:center">
            <el-select v-model="filterCompany" placeholder="公司" style="width:120px" @change="applyFilter">
              <el-option value="全部" label="全部" />
              <el-option v-for="c in companyOptions" :key="c" :value="c" :label="c" />
            </el-select>
            <el-select v-model="filterMonth" placeholder="月份" style="width:100px;margin-left:8px" @change="applyFilter">
              <el-option value="全部" label="全部" />
              <el-option v-for="m in monthOptions" :key="m" :value="m" :label="m" />
            </el-select>
            <el-button type="primary" size="small" style="margin-left:12px" @click="readExcelFile">刷新</el-button>
          </div>
        </template>
      </ele-toolbar>

      <ele-pro-table
        :columns="columns"
        :datasource="filteredData"
        :loading="loading"
        row-key="序号"
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

defineOptions({ name: 'MonthlyCargoPlan' });

/* ---------------- 状态 ---------------- */
const rawData   = ref([]);
const columns   = ref([]);
const loading   = ref(false);
const loadError = ref(false);

/* 过滤 */
const filterCompany = ref('全部');
const filterMonth   = ref('全部');
const companyOptions = ref([]);
const monthOptions   = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

/* 过滤后的数据 */
const filteredData = computed(() => {
  return rawData.value.filter(r => {
    if (filterCompany.value !== '全部' && r.公司 !== filterCompany.value) return false;
    if (filterMonth.value   !== '全部' && r.月份 !== filterMonth.value)   return false;
    return true;
  });
});

/* 统计 */
const companyCount = computed(() => new Set(rawData.value.map(r => r.公司)).size);
const loadedMonths = computed(() => new Set(rawData.value.map(r => r.月份)).size);
const totalVolume  = computed(() => filteredData.value.reduce((s,r)=>s+Number(r['预计运输量（万吨）']||0),0));
const totalVoyages = computed(() => filteredData.value.reduce((s,r)=>s+Number(r['总航行天数']||0),0));

/* 默认列 */
function initDefaultColumns(){
  columns.value=[
    {prop:'序号',label:'序号',width:60,align:'center'},
    {prop:'公司',label:'公司',minWidth:120,align:'center'},
    {prop:'月份',label:'月份',minWidth:80,align:'center'},
    {prop:'预计运输量（万吨）',label:'预计运输量(万吨)',minWidth:120,align:'center'},
    {prop:'计划租船艘次',label:'租船艘次',minWidth:100,align:'center'},
    {prop:'船型',label:'船型',minWidth:80,align:'center'},
    {prop:'平均航次天数',label:'平均天/航次',minWidth:100,align:'center'},
    {prop:'总航行天数',label:'总航行天数',minWidth:110,align:'center'}
  ];
}

/* 读取 Excel 文件 */
async function readExcelFile(){
  loading.value = true;
  loadError.value = false;
  try {
    // 根据实际部署路径调整文件名
    const res = await fetch('/data/月度货量计划.xlsx');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const wb = XLSX.read(await res.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json  = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!json.length) throw new Error('空工作表');

    // 表头 → 列配置（与默认列字段保持一致即可）
    const header = json[0];
    columns.value = header.map((h,i)=>({
      prop: h || `COL_${i}`,
      label: h || `COL_${i}`,
      minWidth: 100,
      align: 'center'
    }));

    // 数据行
    rawData.value = json.slice(1).map((row,idx)=>{
      const obj = { 序号: idx+1 };
      header.forEach((h,i)=>{ obj[h] = row[i]; });
      return obj;
    });

    // 公司选项
    companyOptions.value = [...new Set(rawData.value.map(r=>r.公司))];

    ElMessage.success('数据加载成功');
  } catch(e){
    console.error(e);
    loadError.value = true;
    initDefaultColumns();
    rawData.value = [];
    ElMessage.error('读取 Excel 失败');
  } finally {
    loading.value = false;
  }
}

function applyFilter(){}

onMounted(()=>{
  initDefaultColumns();
  readExcelFile();
});(()=>{
  initDefaultColumns();
  readExcelFile();
});
</script>

<style scoped>
.stat-box{text-align:center;}
</style>

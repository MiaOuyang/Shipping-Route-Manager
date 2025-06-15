<template>
  <!-- 运力计划表 -->
  <ele-page :key="$route.name">
    <!-- ① 统计卡片 -->
    <ele-card>
      <el-row>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">办事处数量</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ officeCount }} 个</ele-text>
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
            <ele-text type="placeholder">月度计划量合计</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalPlanVolume.toLocaleString() }} 万吨</ele-text>
          </div>
        </el-col>
        <el-col :sm="6" :xs="24">
          <div class="stat-box">
            <ele-text type="placeholder">已排运力合计</ele-text>
            <ele-text size="xl" style="margin-top:6px">{{ totalAssigned.toLocaleString() }} 万吨</ele-text>
          </div>
        </el-col>
      </el-row>
    </ele-card>

    <!-- ② 表格卡片 -->
    <ele-card>
      <ele-toolbar title="运力计划表" :title-props="{ size: 'md' }">
        <template #tools>
          <div style="display:flex;align-items:center">
            <!-- 办事处筛选 -->
            <el-select v-model="filterOffice" placeholder="办事处" style="width:140px" @change="applyFilter">
              <el-option value="全部" label="全部" />
              <el-option v-for="o in officeOptions" :key="o" :value="o" :label="o" />
            </el-select>
            <!-- 月份筛选 -->
            <el-select v-model="filterMonth" placeholder="装出月份" style="width:100px;margin-left:8px" @change="applyFilter">
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
        :show-overflow-tooltip="true"
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

defineOptions({ name: 'CapacityPlan' });

/* ---------------- 状态 ---------------- */
const rawData   = ref([]);
const columns   = ref([]);
const loading   = ref(false);
const loadError = ref(false);

/* 过滤 */
const filterOffice = ref('全部');
const filterMonth  = ref('全部');
const officeOptions = ref([]);
const monthOptions  = ['1','2','3','4','5','6','7','8','9','10','11','12'];

/* 过滤后的数据 */
const filteredData = computed(() => rawData.value.filter(r => {
  if (filterOffice.value !== '全部' && r.办事处 !== filterOffice.value) return false;
  if (filterMonth.value  !== '全部' && String(r.装出月份) !== String(filterMonth.value)) return false;
  return true;
}));

/* 统计 */
const officeCount      = computed(() => new Set(rawData.value.map(r=>r.办事处)).size);
const loadedMonths     = computed(() => new Set(rawData.value.map(r=>r.装出月份)).size);
const totalPlanVolume  = computed(() => filteredData.value.reduce((s,r)=>s+Number(r.月度计划量||0),0));
const totalAssigned    = computed(() => filteredData.value.reduce((s,r)=>s+Number(r.已排运力||0),0));

/* 默认列 */
function initDefaultColumns(){
  columns.value=[
    {prop:'序号',label:'序号',width:60,align:'center'},
    {prop:'办事处',label:'办事处',minWidth:100,align:'center'},
    {prop:'用户',label:'用户',minWidth:100,align:'center'},
    {prop:'装出月份',label:'装出月',width:70,align:'center'},
    {prop:'月度计划量',label:'月度计划量',minWidth:100,align:'center'},
    {prop:'已排运力',label:'已排运力',minWidth:90,align:'center'},
    {prop:'船名',label:'船名',minWidth:120,align:'center'},
    {prop:'航次',label:'航次',width:70,align:'center'},
    {prop:'装港',label:'装港',minWidth:90,align:'center'},
    {prop:'卸港',label:'卸港',minWidth:90,align:'center'},
    {prop:'预计\n货运量',label:'预计货运量',minWidth:110,align:'center'},
    {prop:'货种',label:'货种',minWidth:90,align:'center'},
    {prop:'预抵\n装港时间',label:'预抵装港时间',minWidth:130,align:'center'},
    {prop:'船舶类型\n（锁定列）',label:'船舶类型',minWidth:110,align:'center'},
    {prop:'运力组织单位',label:'运力组织单位',minWidth:120,align:'center'},
    {prop:'客户经理',label:'客户经理',minWidth:90,align:'center'},
    {prop:'操作人',label:'操作人',minWidth:90,align:'center'}
  ];
}

/* 读取 Excel */
async function readExcelFile(){
  loading.value = true;
  loadError.value = false;
  try {
    const buffer = await (await fetch('/data/运力计划表.xlsx')).arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    // 加 defval: '' 保证空单元格不是 undefined
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!json.length) {
      initDefaultColumns();
      rawData.value = [];
      return;
    }

    /* -------- 重点：处理表头，去掉空格 / 换行 -------- */
    const rawHeader = json[0].map((h) =>
      typeof h === 'string' ? h.trim() : String(h ?? '').trim()
    );

    columns.value = rawHeader.map((h, i) => ({
      prop: h || `COL_${i}`,
      label: h || `列${i + 1}`,
      align: 'center',
      minWidth: 120
    }));

    // 行数据
    rawData.value = json.slice(1).map((row, idx) => {
      const obj = { 序号: idx + 1 };
      rawHeader.forEach((h, colIdx) => {
        const key = h || `COL_${colIdx}`;
        obj[key] = row[colIdx]; // defval='' 已保证不会是 undefined
      });
      return obj;
    });

    officeOptions.value=[...new Set(rawData.value.map(r=>r.办事处))];

    ElMessage.success('数据加载成功');
  }catch(e){
    console.error(e);
    loadError.value=true;
    initDefaultColumns();
    rawData.value=[];
    ElMessage.error('读取 Excel 失败');
  }finally{
    loading.value=false;
  }
}

function applyFilter(){}

onMounted(()=>{
  initDefaultColumns();
  readExcelFile();
});
</script>

<style scoped>
.stat-box{ text-align:center; }
</style>

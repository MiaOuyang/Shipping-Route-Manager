<template>
  <div class="port-container">
    <el-tabs v-model="activeTab" class="port-tabs">
      <!-- 港口统计总信息 -->
      <el-tab-pane label="港口统计总信息" name="statistics">
        <!-- 统计卡片 -->
        <div class="stat-cards">
          <div class="stat-card blue">
            <div class="stat-title">港口泊位统计</div>
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
          <div class="stat-card green">
            <div class="stat-title">泊位总数（个）</div>
            <div class="stat-value">{{ statistics.berthTotal }}</div>
          </div>
          <div class="stat-card yellow">
            <div class="stat-title">可用泊位数</div>
            <div class="stat-value">{{ statistics.berthAvailable }}</div>
          </div>
          <div class="stat-card purple">
            <div class="stat-title">泊位使用率（%）</div>
            <div class="stat-value">{{ statistics.berthUsageRate }}</div>
          </div>
          <div class="stat-card red">
            <div class="stat-title">维护中泊位数（个）</div>
            <div class="stat-value">{{ statistics.berthMaintaining }}</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-title">今日靠泊船舶数（艘）</div>
            <div class="stat-value">{{ statistics.todayBerthShip }}</div>
          </div>
        </div>
        <!-- 图表区 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item name="charts">
            <template #title>
              <span class="collapse-title">展开/收起图表分析</span>
            </template>
            <div class="stats-container port-charts">
              <div class="chart-block">
                <div class="chart-title">本周泊位使用率趋势</div>
                <div ref="trendChartRef" class="chart-box"></div>
              </div>
              <div class="chart-block">
                <div class="chart-title">各港口泊位数量统计</div>
                <div ref="berthCountChartRef" class="chart-box"></div>
              </div>
              <div class="chart-block">
                <div class="chart-title">港口吃水限制分布</div>
                <div ref="draftLimitChartRef" class="chart-box"></div>
              </div>
              <div class="chart-block">
                <div class="chart-title">泊位使用热力图</div>
                <div ref="heatmapChartRef" class="chart-box"></div>
              </div>
              <div class="chart-block">
                <div class="chart-title">靠类型泊位数量分布</div>
                <div ref="berthTypePieChartRef" class="chart-box"></div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <!-- 港口基础信息 -->
      <el-tab-pane label="港口基础信息" name="basic">
        <!-- 搜索栏 -->
        <div class="search-container">
          <div class="search-form">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入港口名/泊位名称搜索"
              class="search-item"
              clearable
              @clear="resetSearch"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="success" @click="handleExportExcel">
              下载Excel
            </el-button>
            <el-button type="primary" @click="handleAdd">新增港口</el-button>
          </div>
        </div>
        <!-- 表格 -->
        <el-table
          :data="portList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" fixed="left" />
          <el-table-column type="index" label="序号" width="60" fixed="left" />
          <el-table-column prop="portName" label="港口名" min-width="100" />
          <el-table-column prop="berthNo" label="泊位号" min-width="100" />
          <el-table-column prop="channel" label="航道/港池" min-width="120" />
          <el-table-column prop="draft" label="吃水(米)" min-width="80" />
          <el-table-column prop="lakeType" label="湖型" min-width="80" />
          <el-table-column prop="nightNav" label="是否可夜航" min-width="100" />
          <el-table-column prop="pilotage" label="引水要求" min-width="100" />
          <el-table-column prop="berthName" label="泊位名称" min-width="120" />
          <el-table-column
            prop="frontDepth"
            label="泊位前沿水深(米)"
            min-width="120"
          />
          <el-table-column
            prop="berthLength"
            label="泊位长度(米)"
            min-width="100"
          />
          <el-table-column
            prop="berthWidth"
            label="泊位宽度(米)"
            min-width="100"
          />
          <el-table-column
            prop="shipCondition"
            label="可靠船舶条件"
            min-width="120"
          />
          <el-table-column
            prop="machineCount"
            label="装卸机械数量"
            min-width="100"
          />
          <el-table-column
            prop="capacity"
            label="装卸能力(吨/时)"
            min-width="120"
          />
          <el-table-column prop="shorePower" label="岸电情况" min-width="100" />
          <el-table-column prop="remark" label="备注" min-width="120" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button link @click="handleView(scope.row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPorts"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px"
        />
      </el-tab-pane>
      <!-- 港口具体信息 -->
      <el-tab-pane label="港口具体信息" name="detail">
        <div v-if="selectedPorts.length === 0" class="empty-detail">
          <el-empty description="请在港口基础信息页面选择需要查看的港口" />
        </div>
        <template v-else>
          <div
            v-for="port in selectedPorts"
            :key="port.id"
            class="port-detail-card"
          >
            <div class="detail-card-header">
              <h3 class="detail-card-title">
                {{ port.portName }} - {{ port.berthName }}
              </h3>
            </div>
            <el-descriptions title="基础信息" :column="3" border>
              <el-descriptions-item label="港口名">
                {{ port.portName }}
              </el-descriptions-item>
              <el-descriptions-item label="泊位号">
                {{ port.berthNo }}
              </el-descriptions-item>
              <el-descriptions-item label="泊位名称">
                {{ port.berthName }}
              </el-descriptions-item>
              <el-descriptions-item label="航道/港池">
                {{ port.channel }}
              </el-descriptions-item>
              <el-descriptions-item label="吃水(米)">
                {{ port.draft }}
              </el-descriptions-item>
              <el-descriptions-item label="湖型">
                {{ port.lakeType }}
              </el-descriptions-item>
              <el-descriptions-item label="是否可夜航">
                {{ port.nightNav }}
              </el-descriptions-item>
              <el-descriptions-item label="引水要求">
                {{ port.pilotage }}
              </el-descriptions-item>
              <el-descriptions-item label="泊位前沿水深(米)">
                {{ port.frontDepth }}
              </el-descriptions-item>
              <el-descriptions-item label="泊位长度(米)">
                {{ port.berthLength }}
              </el-descriptions-item>
              <el-descriptions-item label="泊位宽度(米)">
                {{ port.berthWidth }}
              </el-descriptions-item>
              <el-descriptions-item label="可靠船舶条件">
                {{ port.shipCondition }}
              </el-descriptions-item>
              <el-descriptions-item label="装卸机械数量">
                {{ port.machineCount }}
              </el-descriptions-item>
              <el-descriptions-item label="装卸能力(吨/时)">
                {{ port.capacity }}
              </el-descriptions-item>
              <el-descriptions-item label="岸电情况">
                {{ port.shorePower }}
              </el-descriptions-item>
              <el-descriptions-item label="备注">
                {{ port.remark }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增港口' : '编辑港口'"
      v-model="dialogVisible"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="portForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="港口名" prop="portName">
          <el-input v-model="portForm.portName" />
        </el-form-item>
        <el-form-item label="泊位号" prop="berthNo">
          <el-input v-model="portForm.berthNo" />
        </el-form-item>
        <el-form-item label="航道/港池" prop="channel">
          <el-input v-model="portForm.channel" />
        </el-form-item>
        <el-form-item label="吃水(米)" prop="draft">
          <el-input v-model="portForm.draft" />
        </el-form-item>
        <el-form-item label="湖型" prop="lakeType">
          <el-input v-model="portForm.lakeType" />
        </el-form-item>
        <el-form-item label="是否可夜航" prop="nightNav">
          <el-input v-model="portForm.nightNav" />
        </el-form-item>
        <el-form-item label="引水要求" prop="pilotage">
          <el-input v-model="portForm.pilotage" />
        </el-form-item>
        <el-form-item label="泊位名称" prop="berthName">
          <el-input v-model="portForm.berthName" />
        </el-form-item>
        <el-form-item label="泊位前沿水深(米)" prop="frontDepth">
          <el-input v-model="portForm.frontDepth" />
        </el-form-item>
        <el-form-item label="泊位长度(米)" prop="berthLength">
          <el-input v-model="portForm.berthLength" />
        </el-form-item>
        <el-form-item label="泊位宽度(米)" prop="berthWidth">
          <el-input v-model="portForm.berthWidth" />
        </el-form-item>
        <el-form-item label="可靠船舶条件" prop="shipCondition">
          <el-input v-model="portForm.shipCondition" />
        </el-form-item>
        <el-form-item label="装卸机械数量" prop="machineCount">
          <el-input v-model="portForm.machineCount" />
        </el-form-item>
        <el-form-item label="装卸能力(吨/时)" prop="capacity">
          <el-input v-model="portForm.capacity" />
        </el-form-item>
        <el-form-item label="岸电情况" prop="shorePower">
          <el-input v-model="portForm.shorePower" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="portForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 初始数据
const allPortList = ref([
  {
    id: 1,
    portName: '秦皇岛港',
    berthNo: '1',
    channel: '秦皇岛主航道',
    draft: '15.5',
    lakeType: '全潮',
    nightNav: '是',
    pilotage: '强制引航',
    berthName: '201-212',
    frontDepth: '14.5',
    berthLength: '300',
    berthWidth: '30',
    shipCondition: '30万吨级',
    machineCount: '4',
    capacity: '2000',
    shorePower: '已配备',
    remark: '煤炭专用泊位'
  },
  {
    id: 2,
    portName: '上海港',
    berthNo: '2',
    channel: '洋山深水港区航道',
    draft: '16.5',
    lakeType: '全潮',
    nightNav: '是',
    pilotage: '强制引航',
    berthName: '301-315',
    frontDepth: '15.5',
    berthLength: '350',
    berthWidth: '40',
    shipCondition: '40万吨级',
    machineCount: '6',
    capacity: '3000',
    shorePower: '已配备',
    remark: '集装箱专用泊位'
  },
  {
    id: 3,
    portName: '天津港',
    berthNo: '3',
    channel: '天津深水主航道',
    draft: '15.0',
    lakeType: '全潮',
    nightNav: '是',
    pilotage: '强制引航',
    berthName: '401-410',
    frontDepth: '14.0',
    berthLength: '280',
    berthWidth: '25',
    shipCondition: '25万吨级',
    machineCount: '5',
    capacity: '2500',
    shorePower: '已配备',
    remark: '通用泊位'
  }
])
const currentPage = ref(1)
const pageSize = ref(10)
const portList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allPortList.value.slice(start, end)
})
const totalPorts = computed(() => allPortList.value.length)

const searchForm = reactive({ keyword: '' })
function handleSearch() {
  if (!searchForm.keyword) {
    resetSearch()
    return
  }
  allPortList.value = allPortList.value.filter(item =>
    item.portName.includes(searchForm.keyword) ||
    item.berthName.includes(searchForm.keyword)
  )
  currentPage.value = 1
}
function resetSearch() {
  // 恢复初始数据
  allPortList.value = [
    {
      id: 1,
      portName: '秦皇岛港',
      berthNo: '1',
      channel: '秦皇岛主航道',
      draft: '15.5',
      lakeType: '全潮',
      nightNav: '是',
      pilotage: '强制引航',
      berthName: '201-212',
      frontDepth: '14.5',
      berthLength: '300',
      berthWidth: '30',
      shipCondition: '30万吨级',
      machineCount: '4',
      capacity: '2000',
      shorePower: '已配备',
      remark: '煤炭专用泊位'
    },
    {
      id: 2,
      portName: '上海港',
      berthNo: '2',
      channel: '洋山深水港区航道',
      draft: '16.5',
      lakeType: '全潮',
      nightNav: '是',
      pilotage: '强制引航',
      berthName: '301-315',
      frontDepth: '15.5',
      berthLength: '350',
      berthWidth: '40',
      shipCondition: '40万吨级',
      machineCount: '6',
      capacity: '3000',
      shorePower: '已配备',
      remark: '集装箱专用泊位'
    },
    {
      id: 3,
      portName: '天津港',
      berthNo: '3',
      channel: '天津深水主航道',
      draft: '15.0',
      lakeType: '全潮',
      nightNav: '是',
      pilotage: '强制引航',
      berthName: '401-410',
      frontDepth: '14.0',
      berthLength: '280',
      berthWidth: '25',
      shipCondition: '25万吨级',
      machineCount: '5',
      capacity: '2500',
      shorePower: '已配备',
      remark: '通用泊位'
    }
  ]
  currentPage.value = 1
}
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const portForm = reactive({
  id: null,
  portName: '',
  berthNo: '',
  channel: '',
  draft: '',
  lakeType: '',
  nightNav: '',
  pilotage: '',
  berthName: '',
  frontDepth: '',
  berthLength: '',
  berthWidth: '',
  shipCondition: '',
  machineCount: '',
  capacity: '',
  shorePower: '',
  remark: ''
})
const rules = {
  portName: [{ required: true, message: '请输入港口名', trigger: 'blur' }],
  berthNo: [{ required: true, message: '请输入泊位号', trigger: 'blur' }],
  channel: [{ required: true, message: '请输入航道/港池', trigger: 'blur' }],
  draft: [{ required: true, message: '请输入吃水', trigger: 'blur' }],
  lakeType: [{ required: true, message: '请输入湖型', trigger: 'blur' }],
  nightNav: [{ required: true, message: '请输入是否可夜航', trigger: 'blur' }],
  pilotage: [{ required: true, message: '请输入引水要求', trigger: 'blur' }],
  berthName: [{ required: true, message: '请输入泊位名称', trigger: 'blur' }],
  frontDepth: [{ required: true, message: '请输入泊位前沿水深', trigger: 'blur' }],
  berthLength: [{ required: true, message: '请输入泊位长度', trigger: 'blur' }],
  berthWidth: [{ required: true, message: '请输入泊位宽度', trigger: 'blur' }],
  shipCondition: [{ required: true, message: '请输入可靠船舶条件', trigger: 'blur' }],
  machineCount: [{ required: true, message: '请输入装卸机械数量', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入装卸能力', trigger: 'blur' }],
  shorePower: [{ required: true, message: '请输入岸电情况', trigger: 'blur' }],
}
function handleAdd() {
  dialogType.value = 'add'
  Object.assign(portForm, {
    id: null,
    portName: '',
    berthNo: '',
    channel: '',
    draft: '',
    lakeType: '',
    nightNav: '',
    pilotage: '',
    berthName: '',
    frontDepth: '',
    berthLength: '',
    berthWidth: '',
    shipCondition: '',
    machineCount: '',
    capacity: '',
    shorePower: '',
    remark: ''
  })
  dialogVisible.value = true
}
function handleEdit(row) {
  dialogType.value = 'edit'
  Object.assign(portForm, row)
  dialogVisible.value = true
}
function handleView(row) {
  ElMessage.info(`查看港口泊位详情：${row.portName} - ${row.berthName}`)
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该泊位吗？', '提示', { type: 'warning' }).then(() => {
    const idx = allPortList.value.findIndex(item => item.id === row.id)
    if (idx !== -1) {
      allPortList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    }
  })
}
function handleSubmit() {
  formRef.value.validate(valid => {
    if (valid) {
      if (dialogType.value === 'add') {
        allPortList.value.push({ ...portForm, id: Date.now() })
        ElMessage.success('添加成功')
      } else {
        const idx = allPortList.value.findIndex(item => item.id === portForm.id)
        if (idx !== -1) {
          allPortList.value[idx] = { ...portForm }
          ElMessage.success('编辑成功')
        }
      }
      dialogVisible.value = false
    }
  })
}
function handleExportExcel() {
  ElMessage.info('导出功能待实现，可用xlsx库实现')
}
function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
}
function handleCurrentChange(val) {
  currentPage.value = val
}

// 静态模拟图表数据
const chartData = {
  usageTrend: [75, 72, 80, 85, 82, 74, 78],
  portNames: ['黄骅港','秦皇岛港','天津港','上海港','宁波港'],
  berthCounts: [14, 10, 19, 24, 17],
  draftBins: ['<10米','10-12米','12-14米','14-16米','>16米'],
  draftCounts: [6, 8, 11, 6, 3],
  heatmap: [
    // 3班*7天
    [60, 62, 65, 70, 68, 66, 64], // 晚班
    [55, 58, 60, 62, 61, 59, 57], // 中班
    [50, 52, 54, 56, 55, 53, 51]  // 早班
  ],
  berthTypePie: [
    { value: 12, name: '集装箱泊位' },
    { value: 10, name: '散货泊位' },
    { value: 8, name: '液体泊位' },
    { value: 6, name: '杂货泊位' },
    { value: 5, name: '滚装泊位' },
    { value: 4, name: '其他泊位' }
  ]
}

// 统计卡片数字由图表数据推算
const statistics = computed(() => {
  const berthTotal = chartData.berthCounts.reduce((a, b) => a + b, 0)
  const berthAvailable = Math.max(...chartData.usageTrend.map(u => Math.round(berthTotal * u / 100)))
  const berthUsageRate = Math.round(chartData.usageTrend.reduce((a, b) => a + b, 0) / chartData.usageTrend.length)
  const berthMaintaining = chartData.heatmap[1][0] // 用中班周一模拟
  const todayBerthShip = chartData.heatmap[0][6] // 用晚班周日模拟
  return {
    total: chartData.portNames.length,
    berthTotal,
    berthAvailable,
    berthUsageRate,
    berthMaintaining,
    todayBerthShip
  }
})

const activeTab = ref('statistics')
const activeCollapse = ref(['charts'])
const trendChartRef = ref(null)
const berthCountChartRef = ref(null)
const draftLimitChartRef = ref(null)
const heatmapChartRef = ref(null)
const berthTypePieChartRef = ref(null)

let trendChart, berthCountChart, draftLimitChart, heatmapChart, berthTypePieChart

function renderCharts() {
  // 1. 本周泊位使用率趋势（折线图）
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      title: { show: false },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'] },
      yAxis: { type: 'value', name: '使用率(%)', min: 0, max: 100 },
      series: [{
        data: chartData.usageTrend,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        areaStyle: { opacity: 0.1 },
        lineStyle: { width: 3 }
      }]
    })
  }
  // 2. 各港口泊位数量统计（柱状图）
  if (berthCountChartRef.value) {
    berthCountChart = echarts.init(berthCountChartRef.value)
    berthCountChart.setOption({
      title: { show: false },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: chartData.portNames },
      yAxis: { type: 'value', name: '泊位数量' },
      series: [{
        data: chartData.berthCounts,
        type: 'bar',
        itemStyle: { color: '#409EFF' },
        barWidth: 30
      }]
    })
  }
  // 3. 港口吃水限制分布（柱状图）
  if (draftLimitChartRef.value) {
    draftLimitChart = echarts.init(draftLimitChartRef.value)
    draftLimitChart.setOption({
      title: { show: false },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: chartData.draftBins },
      yAxis: { type: 'value', name: '港口数量' },
      series: [{
        data: chartData.draftCounts,
        type: 'bar',
        itemStyle: { color: '#67C23A' },
        barWidth: 30
      }]
    })
  }
  // 4. 泊位使用热力图
  if (heatmapChartRef.value) {
    heatmapChart = echarts.init(heatmapChartRef.value)
    const hours = ['周一','周二','周三','周四','周五','周六','周日']
    const shifts = ['晚班','中班','早班']
    const data = []
    for (let i = 0; i < shifts.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        data.push([j, i, chartData.heatmap[i][j]])
      }
    }
    heatmapChart.setOption({
      tooltip: { position: 'top' },
      grid: { height: '60%', top: '10%' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true } },
      yAxis: { type: 'category', data: shifts, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', top: 0,
        inRange: { color: ['#fff7bc','#f03b20'] }
      },
      series: [{
        name: '使用率',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
      }]
    })
  }
  // 5. 靠类型泊位数量分布（饼图）
  if (berthTypePieChartRef.value) {
    berthTypePieChart = echarts.init(berthTypePieChartRef.value)
    berthTypePieChart.setOption({
      title: { show: false },
      tooltip: { trigger: 'item' },
      legend: { left: 'left', top: 'bottom' },
      series: [{
        name: '泊位类型',
        type: 'pie',
        radius: '60%',
        data: chartData.berthTypePie,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
        }
      }]
    })
  }
}

function resizeCharts() {
  trendChart?.resize()
  berthCountChart?.resize()
  draftLimitChart?.resize()
  heatmapChart?.resize()
  berthTypePieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    renderCharts()
    window.addEventListener('resize', resizeCharts)
  })
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
})
watch(activeCollapse, (val) => {
  if (val.includes('charts')) nextTick(renderCharts)
})

// 选中港口列表
const selectedPorts = ref([])
function handleSelectionChange(selection) {
  selectedPorts.value = selection
}

// 监听allPortList变化，自动刷新图表
watch(allPortList, () => { nextTick(renderCharts) }, { deep: true })
</script>

<style scoped>
.port-container {
  padding: 20px;
  background: #f5f7fa;
}
.breadcrumb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.search-input {
  width: 260px;
}
.stat-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.stat-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-card.blue { border-left: 4px solid #409EFF; }
.stat-card.green { border-left: 4px solid #67C23A; }
.stat-card.yellow { border-left: 4px solid #E6A23C; }
.stat-card.purple { border-left: 4px solid #909399; }
.stat-card.red { border-left: 4px solid #F56C6C; }
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.left-tools {
  display: flex;
  gap: 10px;
}
.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.search-item {
  width: 260px;
}
.empty-detail {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
.port-detail-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.detail-card-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.chart-row {
  flex: 1;
}
.chart-item {
  flex: 1;
}
.chart-box {
  height: 300px;
}
.port-charts {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.chart-block {
  background: #fff;
  border-radius: 8px;
  padding: 24px 24px 8px 24px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  margin-bottom: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}
.chart-box {
  width: 100%;
  height: 300px;
  min-height: 240px;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-collapse) {
  border: none;
  
  .el-collapse-item__wrap {
    border: none;
  }
  
  .el-collapse-item__header {
    border: none;
    background-color: white;
    margin-bottom: 10px;
    border-radius: 4px;
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }
  
  .el-collapse-item__content {
    padding: 0;
  }
}

.collapse-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 16px;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
}
</style> 
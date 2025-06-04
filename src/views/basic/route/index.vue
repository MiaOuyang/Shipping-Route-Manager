<template>
  <div class="route-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="route-tabs">
      <!-- 航线统计总信息 -->
      <el-tab-pane label="航线统计总信息" name="statistics">
        <!-- 顶部统计卡片 -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-title">航线总数</div>
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">当前季度启用航线数</div>
            <div class="stat-value">{{ statistics.activeInQuarter }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">定期航线</div>
            <div class="stat-value">{{ statistics.regular }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">不定期航线</div>
            <div class="stat-value">{{ statistics.irregular }}</div>
          </div>
        </div>
        <!-- 数据统计图表 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item name="charts">
            <template #title>
              <span class="collapse-title">数据统计图表</span>
            </template>
            <div class="stats-container">
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="typeChartRef" class="chart-box"></div>
                </div>
                <div class="chart-item">
                  <div ref="distanceChartRef" class="chart-box"></div>
                </div>
              </div>
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="timeChartRef" class="chart-box"></div>
                </div>
                <div class="chart-item">
                  <div ref="trendChartRef" class="chart-box"></div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <!-- 航线基础信息 -->
      <el-tab-pane label="航线基础信息" name="basic">
        <!-- 搜索条件 -->
        <div class="search-container">
          <div class="search-form">
            <el-input v-model="searchForm.keyword" placeholder="输入航线名称/编号/港口" class="search-item" />
            <el-select v-model="searchForm.status" placeholder="请选择状态" class="search-item">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
            <el-select v-model="searchForm.type" placeholder="请选择航线类型" class="search-item">
              <el-option label="定期航线" value="regular" />
              <el-option label="不定期航线" value="irregular" />
            </el-select>
            <el-select v-model="searchForm.startPort" placeholder="请选择起始港口" class="search-item">
              <el-option v-for="port in portOptions" :key="port.value" :label="port.label" :value="port.value" />
            </el-select>
            <el-select v-model="searchForm.endPort" placeholder="请选择目的港口" class="search-item">
              <el-option v-for="port in portOptions" :key="port.value" :label="port.label" :value="port.value" />
            </el-select>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="warning" @click="handleExportExcel">导出Excel</el-button>
          </div>
        </div>
        <!-- 表格工具栏 -->
        <div class="table-toolbar">
          <div class="left-tools">
            <el-button type="primary" @click="handleAdd">新增航线</el-button>
            <el-button type="success" @click="handleImportExcel">导入Excel</el-button>
            <el-button type="warning" @click="handleExportExcel">导出Excel</el-button>
          </div>
          <div class="right-tools">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalRoutes"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        <!-- 表格 -->
        <el-table 
          :data="routeList" 
          border 
          style="width: 100%" 
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" fixed="left" />
          <el-table-column type="index" label="序号" width="60" fixed="left" />
          <el-table-column prop="code" label="航线编号" min-width="120" />
          <el-table-column prop="name" label="航线名称" min-width="120" />
          <el-table-column prop="type" label="航线类型" min-width="120">
            <template #default="scope">{{ getRouteTypeName(scope.row.type) }}</template>
          </el-table-column>
          <el-table-column prop="startPort" label="起始港口" min-width="120">
            <template #default="scope">{{ getPortName(scope.row.startPort) }}</template>
          </el-table-column>
          <el-table-column prop="endPort" label="目的港口" min-width="120">
            <template #default="scope">{{ getPortName(scope.row.endPort) }}</template>
          </el-table-column>
          <el-table-column prop="distance" label="航程(海里)" min-width="120">
            <template #default="scope">{{ scope.row.distance }}</template>
          </el-table-column>
          <el-table-column prop="estimatedTime" label="预计航行时间(小时)" min-width="120">
            <template #default="scope">{{ scope.row.estimatedTime }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button link @click="handleView(scope.row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 选中航线的统计图表 -->
        <div class="selected-stats-container" v-if="selectedRoutes.length > 0">
          <div class="stats-header">
            <div class="stats-title">已选航线统计</div>
            <el-button type="text" @click="clearSelection">清除选择</el-button>
          </div>
          <div class="stats-content">
            <div class="chart-row">
              <div class="chart-item">
                <div ref="selectedTypeChartRef" class="chart-box"></div>
              </div>
              <div class="chart-item">
                <div ref="selectedDistanceChartRef" class="chart-box"></div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 航线具体信息 -->
      <el-tab-pane label="航线具体信息" name="detail">
        <div v-if="selectedRoutes.length === 0" class="empty-detail">
          <el-empty description="请在航线基础信息页面选择需要查看的航线" />
        </div>
        <template v-else>
          <div v-for="route in selectedRoutes" :key="route.id" class="route-detail-card">
            <div class="detail-card-header">
              <h3 class="detail-card-title">{{ route.name }}</h3>
              <el-tag :type="route.status === 'active' ? 'success' : 'danger'">
                {{ route.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <el-descriptions title="基础信息" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="航线编号" label-class-name="label-width">{{ route.code }}</el-descriptions-item>
              <el-descriptions-item label="航线名称" label-class-name="label-width">{{ route.name }}</el-descriptions-item>
              <el-descriptions-item label="航线类型" label-class-name="label-width">{{ getRouteTypeName(route.type) }}</el-descriptions-item>
              <el-descriptions-item label="起始港口" label-class-name="label-width">{{ getPortName(route.startPort) }}</el-descriptions-item>
              <el-descriptions-item label="目的港口" label-class-name="label-width">{{ getPortName(route.endPort) }}</el-descriptions-item>
              <el-descriptions-item label="航程(海里)" label-class-name="label-width">{{ route.distance }}</el-descriptions-item>
              <el-descriptions-item label="预计航行时间(小时)" label-class-name="label-width">{{ route.estimatedTime }}</el-descriptions-item>
              <el-descriptions-item label="状态" label-class-name="label-width">
                <el-tag :type="route.status === 'active' ? 'success' : 'danger'">
                  {{ route.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="备注" label-class-name="label-width">{{ route.remark || '暂无备注' }}</el-descriptions-item>
            </el-descriptions>
            <!-- 可扩展更多详细参数 -->
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增航线' : '编辑航线'"
      v-model="dialogVisible"
      width="50%">
      <el-form ref="formRef" :model="routeForm" :rules="rules" label-width="120px">
        <el-form-item label="航线编号" prop="code">
          <el-input v-model="routeForm.code" />
        </el-form-item>
        <el-form-item label="航线名称" prop="name">
          <el-input v-model="routeForm.name" />
        </el-form-item>
        <el-form-item label="航线类型" prop="type">
          <el-select v-model="routeForm.type" placeholder="请选择航线类型" style="width: 100%">
            <el-option label="定期航线" value="regular" />
            <el-option label="不定期航线" value="irregular" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始港口" prop="startPort">
          <el-select v-model="routeForm.startPort" placeholder="请选择起始港口" style="width: 100%">
            <el-option v-for="port in portOptions" :key="port.value" :label="port.label" :value="port.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="目的港口" prop="endPort">
          <el-select v-model="routeForm.endPort" placeholder="请选择目的港口" style="width: 100%">
            <el-option v-for="port in portOptions" :key="port.value" :label="port.label" :value="port.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="航程(海里)" prop="distance">
          <el-input-number v-model="routeForm.distance" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计航行时间(小时)" prop="estimatedTime">
          <el-input-number v-model="routeForm.estimatedTime" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="routeForm.status">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="routeForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加隐藏的文件输入框 -->
    <input
      type="file"
      ref="fileInputRef"
      style="display: none"
      accept=".xlsx,.xls"
      @change="handleFileChange"
    />

    <!-- 导入 Excel 对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入 Excel"
      width="500px"
    >
      <div class="import-dialog-content">
        <div v-if="importPreviewData.length" class="preview-table">
          <el-table :data="importPreviewData" border height="300">
            <el-table-column prop="code" label="航线编号" min-width="120" />
            <el-table-column prop="name" label="航线名称" min-width="120" />
            <el-table-column prop="type" label="航线类型" min-width="120">
              <template #default="scope">{{ getRouteTypeName(scope.row.type) }}</template>
            </el-table-column>
            <el-table-column prop="startPort" label="起始港口" min-width="120">
              <template #default="scope">{{ getPortName(scope.row.startPort) }}</template>
            </el-table-column>
            <el-table-column prop="endPort" label="目的港口" min-width="120">
              <template #default="scope">{{ getPortName(scope.row.endPort) }}</template>
            </el-table-column>
            <el-table-column prop="distance" label="航程(海里)" min-width="120" />
            <el-table-column prop="estimatedTime" label="预计航行时间(小时)" min-width="120" />
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="upload-tip">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="tip-text">点击上传或将文件拖拽到这里</div>
          <div class="sub-tip">支持 .xlsx, .xls 格式</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleImportConfirm"
            :disabled="!importPreviewData.length"
          >
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'
import { Close, Upload } from '@element-plus/icons-vue'

export default {
  name: 'RouteInfo',
  components: {
    Close,
    Upload
  },
  setup() {
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)

    // 表单数据
    const routeForm = reactive({
      id: null,
      code: '',
      name: '',
      type: '',
      startPort: '',
      endPort: '',
      distance: 0,
      estimatedTime: 0,
      status: 'active',
      remark: ''
    })

    // 表单验证规则
    const rules = {
      code: [
        { required: true, message: '请输入航线编号', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入航线名称', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择航线类型', trigger: 'change' }
      ],
      startPort: [
        { required: true, message: '请选择起始港口', trigger: 'change' }
      ],
      endPort: [
        { required: true, message: '请选择目的港口', trigger: 'change' }
      ],
      distance: [
        { required: true, message: '请输入航程(海里)', trigger: 'blur' }
      ],
      estimatedTime: [
        { required: true, message: '请输入预计航行时间(小时)', trigger: 'blur' }
      ]
    }

    // 港口选项
    const portOptions = ref([
      { value: 'SHANGHAI', label: '上海港' },
      { value: 'QINGDAO', label: '青岛港' },
      { value: 'DALIAN', label: '大连港' },
      { value: 'NINGBO', label: '宁波港' },
      { value: 'GUANGZHOU', label: '广州港' },
      { value: 'TIANJIN', label: '天津港' },
      { value: 'NANJING', label: '南京港' }
    ])

    // 航线列表 (原始数据)
    const allRouteList = ref([])
    // 当前页显示的航线列表 (计算属性)
    const routeList = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredRouteList.value.slice(start, end)
    })
    // 过滤后的航线列表
    const filteredRouteList = computed(() => {
      return allRouteList.value.filter(route => {
        return (!searchForm.keyword || route.name.includes(searchForm.keyword) || route.code.includes(searchForm.keyword) || getPortName(route.startPort).includes(searchForm.keyword) || getPortName(route.endPort).includes(searchForm.keyword)) &&
          (!searchForm.status || route.status === searchForm.status) &&
          (!searchForm.type || route.type === searchForm.type) &&
          (!searchForm.startPort || route.startPort === searchForm.startPort) &&
          (!searchForm.endPort || route.endPort === searchForm.endPort)
      })
    })
    // 总记录数
    const totalRoutes = computed(() => filteredRouteList.value.length)

    // 图表实例引用
    const typeChartRef = ref(null)
    const distanceChartRef = ref(null)
    const timeChartRef = ref(null)
    const trendChartRef = ref(null)
    let typeChart = null
    let distanceChart = null
    let timeChart = null
    let trendChart = null

    // 示例数据加载
    const loadExampleData = () => {
      allRouteList.value = [
        { id: 1, code: 'R001', name: '南北干线', type: 'regular', startPort: 'DALIAN', endPort: 'GUANGZHOU', distance: 1340, estimatedTime: 168, status: 'active', remark: '主力干线' },
        { id: 2, code: 'R002', name: '长江内河干线', type: 'regular', startPort: 'SHANGHAI', endPort: 'CHONGQING', distance: 2400, estimatedTime: 288, status: 'active', remark: '' },
        { id: 3, code: 'R003', name: '东南亚支线', type: 'irregular', startPort: 'NINGBO', endPort: 'SINGAPORE', distance: 1500, estimatedTime: 180, status: 'inactive', remark: '' },
        { id: 4, code: 'R004', name: '中日韩航线', type: 'regular', startPort: 'QINGDAO', endPort: 'BUSAN', distance: 800, estimatedTime: 96, status: 'active', remark: '' },
        { id: 5, code: 'R005', name: '中欧航线', type: 'irregular', startPort: 'NINGBO', endPort: 'ROTTERDAM', distance: 10000, estimatedTime: 1200, status: 'active', remark: '' }
      ]
    }

    onMounted(() => {
      loadExampleData()
      nextTick(() => {
        initCharts()
      })
    })

    // 获取航线类型名称
    const getRouteTypeName = (type) => {
      const typeMap = { regular: '定期航线', irregular: '不定期航线' }
      return typeMap[type] || type
    }
    // 获取港口名称
    const getPortName = (portCode) => {
      const port = portOptions.value.find(p => p.value === portCode)
      return port ? port.label : portCode
    }

    // 新增航线
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const formRef = ref(null)
    const handleAdd = () => {
      dialogType.value = 'add'
      Object.assign(routeForm, { id: null, code: '', name: '', type: '', startPort: '', endPort: '', distance: 0, estimatedTime: 0, status: 'active', remark: '' })
      nextTick(() => { formRef.value?.clearValidate() })
      dialogVisible.value = true
    }
    // 编辑航线
    const handleEdit = (row) => {
      dialogType.value = 'edit'
      Object.assign(routeForm, row)
      nextTick(() => { formRef.value?.clearValidate() })
      dialogVisible.value = true
    }
    // 查看航线
    const handleView = (row) => {
      ElMessage.info(`查看航线详情：${row.name}（${getRouteTypeName(row.type)}）`)
    }
    // 删除航线
    const handleDelete = (row) => {
      ElMessageBox.confirm(`确定要删除航线 ${row.name} 吗？`, '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => {
          const index = allRouteList.value.findIndex(item => item.id === row.id)
          if (index !== -1) {
            allRouteList.value.splice(index, 1)
            ElMessage.success('删除成功')
            if (routeList.value.length === 0 && currentPage.value > 1) currentPage.value--
            nextTick(() => { initCharts() })
          } else {
            ElMessage.error('未找到要删除的数据')
          }
        }).catch(() => {})
    }
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate((valid) => {
        if (valid) {
          if (dialogType.value === 'add') {
            const newRoute = { id: Date.now(), ...routeForm }
            allRouteList.value.push(newRoute)
            ElMessage.success('添加成功')
            currentPage.value = Math.ceil(allRouteList.value.length / pageSize.value)
          } else {
            const index = allRouteList.value.findIndex(item => item.id === routeForm.id)
            if (index !== -1) {
              allRouteList.value[index] = { ...routeForm }
              ElMessage.success('更新成功')
            } else {
              ElMessage.error('未找到要更新的数据')
            }
          }
          nextTick(() => { initCharts() })
          dialogVisible.value = false
        }
      })
    }
    // 导出Excel
    const handleExportExcel = () => {
      if (allRouteList.value.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
      }
      const exportData = allRouteList.value.map(item => ({
        '航线编号': item.code,
        '航线名称': item.name,
        '航线类型': getRouteTypeName(item.type),
        '起始港口': getPortName(item.startPort),
        '目的港口': getPortName(item.endPort),
        '航程(海里)': item.distance,
        '预计航行时间(小时)': item.estimatedTime,
        '状态': item.status === 'active' ? '启用' : '禁用',
        '备注': item.remark || ''
      }))
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '航线信息')
      worksheet['!cols'] = [ { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 } ]
      XLSX.writeFile(workbook, `航线信息_${new Date().toISOString().split('T')[0]}.xlsx`)
      ElMessage.success('导出成功')
    }
    // 分页事件处理
    const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1 }
    const handleCurrentChange = (val) => { currentPage.value = val }

    // 图表相关
    const initCharts = () => {
      initTypeChart(); initDistanceChart(); initTimeChart(); initTrendChart();
      window.addEventListener('resize', resizeCharts)
    }
    const resizeCharts = () => {
      typeChart?.resize(); distanceChart?.resize(); timeChart?.resize(); trendChart?.resize()
    }
    // 1. 航线类型分布图
    const initTypeChart = () => {
      if (!typeChartRef.value) return
      typeChart = echarts.init(typeChartRef.value)
      const data = [
        { value: allRouteList.value.filter(r => r.type === 'regular').length, name: '定期航线' },
        { value: allRouteList.value.filter(r => r.type === 'irregular').length, name: '不定期航线' }
      ]
      typeChart.setOption({
        title: { text: '航线类型分布', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{ name: '航线类型', type: 'pie', radius: '50%', data }]
      })
    }
    // 2. 航程分布图
    const initDistanceChart = () => {
      if (!distanceChartRef.value) return
      distanceChart = echarts.init(distanceChartRef.value)
      const groups = { '<1000': 0, '1000-3000': 0, '3000-7000': 0, '>7000': 0 }
      allRouteList.value.forEach(route => {
        if (route.distance < 1000) groups['<1000']++
        else if (route.distance < 3000) groups['1000-3000']++
        else if (route.distance < 7000) groups['3000-7000']++
        else groups['>7000']++
      })
      distanceChart.setOption({
        title: { text: '航程分布', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: Object.keys(groups) },
        yAxis: { type: 'value' },
        series: [{ data: Object.values(groups), type: 'bar' }]
      })
    }
    // 3. 航行时间分布图
    const initTimeChart = () => {
      if (!timeChartRef.value) return
      timeChart = echarts.init(timeChartRef.value)
      const groups = { '<100': 0, '100-500': 0, '500-1000': 0, '>1000': 0 }
      allRouteList.value.forEach(route => {
        if (route.estimatedTime < 100) groups['<100']++
        else if (route.estimatedTime < 500) groups['100-500']++
        else if (route.estimatedTime < 1000) groups['500-1000']++
        else groups['>1000']++
      })
      timeChart.setOption({
        title: { text: '航行时间分布', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: Object.keys(groups) },
        yAxis: { type: 'value' },
        series: [{ data: Object.values(groups), type: 'bar' }]
      })
    }
    // 4. 航线趋势图
    const initTrendChart = () => {
      if (!trendChartRef.value) return
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        title: { text: '航线数量趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value' },
        series: [{ name: '航线数量', type: 'line', data: [2, 3, 4, 5, 6, 7] }]
      })
    }

    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      status: '',
      type: '',
      startPort: '',
      endPort: ''
    })
    const resetSearch = () => {
      Object.assign(searchForm, { keyword: '', status: '', type: '', startPort: '', endPort: '' })
    }
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 文件输入引用
    const fileInputRef = ref(null)
    const importDialogVisible = ref(false)
    const importPreviewData = ref([])
    const handleImportExcel = () => {
      importDialogVisible.value = true
      importPreviewData.value = []
      nextTick(() => { fileInputRef.value.click() })
    }
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (!file) return
      const types = ['.xlsx', '.xls']
      const isValidType = types.some(type => file.name.toLowerCase().endsWith(type))
      if (!isValidType) {
        ElMessage.error('请上传 Excel 文件（.xlsx 或 .xls）')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          const convertedData = jsonData.map(row => ({
            code: row['航线编号'] || '',
            name: row['航线名称'] || '',
            type: row['航线类型'] === '定期航线' ? 'regular' : 'irregular',
            startPort: row['起始港口'] || '',
            endPort: row['目的港口'] || '',
            distance: Number(row['航程(海里)']) || 0,
            estimatedTime: Number(row['预计航行时间(小时)']) || 0,
            status: row['状态'] === '启用' ? 'active' : 'inactive',
            remark: row['备注'] || ''
          }))
          importPreviewData.value = convertedData
        } catch (error) {
          ElMessage.error('Excel 文件解析失败，请检查文件格式')
        }
      }
      reader.readAsArrayBuffer(file)
      event.target.value = ''
    }
    const handleImportConfirm = () => {
      if (!importPreviewData.value.length) {
        ElMessage.warning('没有可导入的数据')
        return
      }
      const invalidData = importPreviewData.value.some(item => !item.code || !item.name)
      if (invalidData) {
        ElMessage.error('存在无效数据，请检查必填字段')
        return
      }
      const newRoutes = importPreviewData.value.map(item => ({ ...item, id: Date.now() + Math.random() }))
      allRouteList.value = [...allRouteList.value, ...newRoutes]
      ElMessage.success(`成功导入 ${newRoutes.length} 条数据`)
      importDialogVisible.value = false
      importPreviewData.value = []
      nextTick(() => { initCharts() })
    }

    // 统计数据
    const statistics = computed(() => {
      const total = allRouteList.value.length
      const active = allRouteList.value.filter(route => route.status === 'active').length
      const regular = allRouteList.value.filter(route => route.type === 'regular').length
      const irregular = allRouteList.value.filter(route => route.type === 'irregular').length
      return {
        total,
        activeInQuarter: active,
        regular,
        irregular
      }
    })
    // 折叠面板激活的项
    const activeCollapse = ref(['charts'])
    // 选中的航线列表
    const selectedRoutes = ref([])
    // 表格多选
    const handleSelectionChange = (selection) => {
      selectedRoutes.value = selection
    }
    // 监听选中航线变化,重新渲染图表
    watch(selectedRoutes, () => {
      nextTick(() => {
        if (activeTab.value === 'basic') {
          initSelectedCharts()
        }
      })
    })
    // 监听标签页切换
    const activeTab = ref('statistics')
    watch(activeTab, (newVal) => {
      if (newVal === 'basic' && selectedRoutes.value.length > 0) {
        nextTick(() => { initSelectedCharts() })
      }
    })
    // 选中航线的图表引用
    const selectedTypeChartRef = ref(null)
    const selectedDistanceChartRef = ref(null)
    // 选中航线的图表实例
    let selectedTypeChart = null
    let selectedDistanceChart = null
    // 初始化选中航线的图表
    const initSelectedCharts = () => {
      if (!selectedRoutes.value.length) return
      // 类型分布图
      if (selectedTypeChartRef.value) {
        selectedTypeChart = echarts.init(selectedTypeChartRef.value)
        const typeData = selectedRoutes.value.reduce((acc, route) => {
          const typeName = getRouteTypeName(route.type)
          const existing = acc.find(item => item.name === typeName)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: typeName, value: 1 })
          }
          return acc
        }, [])
        selectedTypeChart.setOption({
          title: { text: '选中航线类型分布', left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{ name: '航线类型', type: 'pie', radius: '50%', data: typeData }]
        })
      }
      // 航程分布图
      if (selectedDistanceChartRef.value) {
        selectedDistanceChart = echarts.init(selectedDistanceChartRef.value)
        const groups = { '<1000': 0, '1000-3000': 0, '3000-7000': 0, '>7000': 0 }
        selectedRoutes.value.forEach(route => {
          if (route.distance < 1000) groups['<1000']++
          else if (route.distance < 3000) groups['1000-3000']++
          else if (route.distance < 7000) groups['3000-7000']++
          else groups['>7000']++
        })
        selectedDistanceChart.setOption({
          title: { text: '选中航线航程分布', left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: Object.keys(groups) },
          yAxis: { type: 'value' },
          series: [{ data: Object.values(groups), type: 'bar' }]
        })
      }
    }
    // 清除选择
    const clearSelection = () => { selectedRoutes.value = [] }
    // 处理窗口大小变化
    const handleResize = () => {
      nextTick(() => {
        if (activeTab.value === 'basic' && selectedRoutes.value.length > 0) {
          selectedTypeChart?.resize()
          selectedDistanceChart?.resize()
        }
      })
    }
    onMounted(() => { window.addEventListener('resize', handleResize) })
    onUnmounted(() => { window.removeEventListener('resize', handleResize) })

    return {
      dialogVisible,
      dialogType,
      formRef,
      routeForm,
      rules,
      portOptions,
      routeList,
      allRouteList,
      totalRoutes,
      currentPage,
      pageSize,
      getRouteTypeName,
      getPortName,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleSubmit,
      handleExportExcel,
      handleSizeChange,
      handleCurrentChange,
      typeChartRef,
      distanceChartRef,
      timeChartRef,
      trendChartRef,
      searchForm,
      resetSearch,
      handleSearch,
      statistics,
      activeCollapse,
      selectedRoutes,
      handleSelectionChange,
      fileInputRef,
      importDialogVisible,
      importPreviewData,
      handleImportExcel,
      handleFileChange,
      handleImportConfirm,
      activeTab,
      selectedTypeChartRef,
      selectedDistanceChartRef,
      clearSelection
    }
  }
}
</script>

<style scoped>
.route-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
}

.route-tabs {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.stat-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.stat-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.search-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.search-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.search-item {
  width: 200px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-tools {
  display: flex;
  gap: 10px;
}

.stats-container {
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.chart-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-item {
  flex: 1;
  min-height: 300px;
}

.chart-box {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.detail-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.detail-content {
  :deep(.el-descriptions) {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.collapse-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
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

.close-button {
  padding: 4px;
}

.close-button :deep(.el-icon) {
  font-size: 16px;
}

.import-dialog-content {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-tip {
  text-align: center;
  color: #606266;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.tip-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.sub-tip {
  font-size: 12px;
  color: #909399;
}

.preview-table {
  width: 100%;
  height: 300px;
}

.selected-stats-container {
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.stats-content {
  min-height: 400px;
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.route-detail-card {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-card-title {
  margin: 0;
  font-size: 18px;
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

:deep(.el-descriptions__cell) {
  padding: 12px 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  text-align: right;
  padding-right: 12px;
  font-weight: bold;
  color: #606266;
}

:deep(.el-descriptions__content) {
  word-break: break-all;
}

:deep(.label-width) {
  min-width: 120px;
}

:deep(.el-descriptions__body) {
  background-color: #ffffff;
}

:deep(.el-descriptions__row) {
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-descriptions__cell.is-bordered-content) {
  background-color: #ffffff;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
  
  .el-descriptions__header {
    margin-bottom: 16px;
  }
  
  .el-descriptions__title {
    font-size: 16px;
    font-weight: bold;
    color: #409EFF;
  }
  
  .el-descriptions__body {
    .el-descriptions__table {
      border-collapse: collapse;
      width: 100%;
    }
  }
}
</style> 

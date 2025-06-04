<template>
  <div class="ship-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="ship-tabs">
      <!-- 船舶统计总信息 -->
      <el-tab-pane label="船舶统计总信息" name="statistics">
        <!-- 顶部统计卡片 -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-title">船舶总数</div>
            <div class="stat-value">300</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">当前季度启用船舶数</div>
            <div class="stat-value">230</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">自有船（启用）</div>
            <div class="stat-value">100</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">期租船（启用）</div>
            <div class="stat-value">80</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">航次租船（启用）</div>
            <div class="stat-value">50</div>
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
                  <div ref="ageChartRef" class="chart-box"></div>
                </div>
              </div>
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="capacityChartRef" class="chart-box"></div>
                </div>
                <div class="chart-item">
                  <div ref="statusTrendChartRef" class="chart-box"></div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <!-- 船舶基础信息 -->
      <el-tab-pane label="船舶基础信息" name="basic">
        <!-- 搜索条件 -->
        <div class="search-container">
          <div class="search-form">
            <el-select v-model="searchForm.season" placeholder="请选择季度" class="search-item">
              <el-option label="第一季度" value="Q1" />
              <el-option label="第二季度" value="Q2" />
              <el-option label="第三季度" value="Q3" />
              <el-option label="第四季度" value="Q4" />
            </el-select>
            <el-select v-model="searchForm.status" placeholder="请选择状态" class="search-item">
              <el-option label="在用" value="active" />
              <el-option label="停用" value="inactive" />
            </el-select>
            <el-select v-model="searchForm.type" placeholder="请选择船舶类型" class="search-item">
              <el-option label="散货船" value="bulk" />
              <el-option label="集装箱船" value="container" />
              <el-option label="油轮" value="tanker" />
              <el-option label="多用途船" value="multi" />
            </el-select>
            <el-select v-model="searchForm.company" placeholder="请选择所属公司" class="search-item">
              <el-option 
                v-for="company in companyOptions" 
                :key="company.value" 
                :label="company.label" 
                :value="company.value" 
              />
            </el-select>
            <el-select v-model="searchForm.shipName" placeholder="请选择船舶名称" class="search-item">
              <el-option 
                v-for="ship in allShipList" 
                :key="ship.id" 
                :label="ship.name" 
                :value="ship.name"
              />
            </el-select>
            <el-input v-model="searchForm.code" placeholder="输入船舶编号" class="search-item" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="warning" @click="handleExportExcel">导出Excel</el-button>
          </div>
        </div>

        <!-- 表格工具栏 -->
        <div class="table-toolbar">
          <div class="left-tools">
            <el-button type="primary" @click="handleAdd">新增船舶</el-button>
            <el-button type="success" @click="handleImportExcel">导入Excel</el-button>
            <el-button type="warning" @click="handleExportExcel">导出Excel</el-button>
          </div>
          <div class="right-tools">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalShips"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 表格 -->
        <el-table 
          :data="shipList" 
          border 
          style="width: 100%" 
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" fixed="left" />
          <el-table-column type="index" label="序号" width="60" fixed="left" />
          <el-table-column prop="code" label="船舶编号" min-width="120" />
          <el-table-column prop="name" label="船舶名称" min-width="120" />
          <el-table-column prop="type" label="船舶类型" min-width="120">
            <template #default="scope">{{ getShipTypeName(scope.row.type) }}</template>
          </el-table-column>
          <el-table-column prop="capacity" label="载重吨位" min-width="120">
            <template #default="scope">{{ scope.row.capacity }}吨</template>
          </el-table-column>
          <el-table-column prop="buildYear" label="建造年份" min-width="120">
            <template #default="scope">{{ scope.row.buildYear }}年</template>
          </el-table-column>
          <el-table-column prop="company" label="所属公司" min-width="200">
            <template #default="scope">{{ getCompanyName(scope.row.company) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '在用' : '停用' }}
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

        <!-- 选中船舶的统计图表 -->
        <div class="selected-stats-container" v-if="selectedShips.length > 0">
          <div class="stats-header">
            <div class="stats-title">已选船舶统计</div>
            <el-button type="text" @click="clearSelection">清除选择</el-button>
          </div>
          <div class="stats-content">
            <div class="chart-row">
              <div class="chart-item">
                <div ref="selectedTypeChartRef" class="chart-box"></div>
              </div>
              <div class="chart-item">
                <div ref="selectedAgeChartRef" class="chart-box"></div>
              </div>
            </div>
            <div class="chart-row">
              <div class="chart-item">
                <div ref="selectedCapacityChartRef" class="chart-box"></div>
              </div>
              <div class="chart-item">
                <div ref="selectedCompanyChartRef" class="chart-box"></div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 船舶具体信息 -->
      <el-tab-pane label="船舶具体信息" name="detail">
        <div v-if="selectedShips.length === 0" class="empty-detail">
          <el-empty description="请在船舶基础信息页面选择需要查看的船舶" />
        </div>
        <template v-else>
          <div v-for="ship in selectedShips" :key="ship.id" class="ship-detail-card">
            <div class="detail-card-header">
              <h3 class="detail-card-title">{{ ship.name }}</h3>
              <el-tag :type="ship.status === 'active' ? 'success' : 'danger'">
                {{ ship.status === 'active' ? '在用' : '停用' }}
              </el-tag>
            </div>
            
            <!-- 基本信息 -->
            <el-descriptions title="基本信息" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="船舶编号" label-class-name="label-width">{{ ship.code }}</el-descriptions-item>
              <el-descriptions-item label="船舶名称" label-class-name="label-width">{{ ship.name }}</el-descriptions-item>
              <el-descriptions-item label="船舶类型" label-class-name="label-width">{{ getShipTypeName(ship.type) }}</el-descriptions-item>
              <el-descriptions-item label="载重吨位" label-class-name="label-width">{{ ship.capacity }}吨</el-descriptions-item>
              <el-descriptions-item label="建造年份" label-class-name="label-width">{{ ship.buildYear }}年</el-descriptions-item>
              <el-descriptions-item label="所属公司" label-class-name="label-width">{{ getCompanyName(ship.company) }}</el-descriptions-item>
            </el-descriptions>

            <!-- 船舶尺寸信息 -->
            <el-descriptions title="船舶尺寸" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="总长" label-class-name="label-width">{{ getRandomLength() }}米</el-descriptions-item>
              <el-descriptions-item label="型宽" label-class-name="label-width">{{ getRandomWidth() }}米</el-descriptions-item>
              <el-descriptions-item label="型深" label-class-name="label-width">{{ getRandomDepth() }}米</el-descriptions-item>
              <el-descriptions-item label="吃水" label-class-name="label-width">{{ getRandomDraft() }}米</el-descriptions-item>
              <el-descriptions-item label="空船重量" label-class-name="label-width">{{ getRandomWeight() }}吨</el-descriptions-item>
              <el-descriptions-item label="总吨位" label-class-name="label-width">{{ getRandomGrossTonnage() }}吨</el-descriptions-item>
            </el-descriptions>

            <!-- 动力系统 -->
            <el-descriptions title="动力系统" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="主机型号" label-class-name="label-width">{{ getRandomEngine() }}</el-descriptions-item>
              <el-descriptions-item label="主机功率" label-class-name="label-width">{{ getRandomPower() }}kW</el-descriptions-item>
              <el-descriptions-item label="设计航速" label-class-name="label-width">{{ getRandomSpeed() }}节</el-descriptions-item>
              <el-descriptions-item label="燃料类型" label-class-name="label-width">{{ getRandomFuelType() }}</el-descriptions-item>
              <el-descriptions-item label="日耗油量" label-class-name="label-width">{{ getRandomFuelConsumption() }}吨/天</el-descriptions-item>
              <el-descriptions-item label="续航能力" label-class-name="label-width">{{ getRandomRange() }}海里</el-descriptions-item>
            </el-descriptions>

            <!-- 船级信息 -->
            <el-descriptions title="船级信息" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="船级社" label-class-name="label-width">{{ getRandomClass() }}</el-descriptions-item>
              <el-descriptions-item label="船级证书编号" label-class-name="label-width">{{ getRandomCertNumber() }}</el-descriptions-item>
              <el-descriptions-item label="建造船厂" label-class-name="label-width">{{ getRandomShipyard() }}</el-descriptions-item>
              <el-descriptions-item label="检验日期" label-class-name="label-width">{{ getRandomInspectionDate() }}</el-descriptions-item>
              <el-descriptions-item label="下次检验日期" label-class-name="label-width">{{ getRandomNextInspectionDate() }}</el-descriptions-item>
              <el-descriptions-item label="航区限制" label-class-name="label-width">{{ getRandomNavigationArea() }}</el-descriptions-item>
            </el-descriptions>

            <!-- 通讯设备 -->
            <el-descriptions title="通讯设备" :column="3" border :cell-style="{ width: '33.33%', minWidth: '250px' }">
              <el-descriptions-item label="呼号" label-class-name="label-width">{{ getRandomCallSign() }}</el-descriptions-item>
              <el-descriptions-item label="MMSI编号" label-class-name="label-width">{{ getRandomMMSI() }}</el-descriptions-item>
              <el-descriptions-item label="IMO编号" label-class-name="label-width">{{ getRandomIMO() }}</el-descriptions-item>
              <el-descriptions-item label="AIS设备" label-class-name="label-width">{{ getRandomAISInfo() }}</el-descriptions-item>
              <el-descriptions-item label="GMDSS设备" label-class-name="label-width">{{ getRandomGMDSSInfo() }}</el-descriptions-item>
              <el-descriptions-item label="雷达设备" label-class-name="label-width">{{ getRandomRadarInfo() }}</el-descriptions-item>
            </el-descriptions>

            <!-- 其他信息 -->
            <el-descriptions title="其他信息" :column="1" border>
              <el-descriptions-item label="备注" label-class-name="label-width">{{ ship.remark || '暂无备注' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增船舶' : '编辑船舶'"
      v-model="dialogVisible"
      width="50%">
      <el-form ref="formRef" :model="shipForm" :rules="rules" label-width="120px">
        <el-form-item label="船舶编号" prop="code">
          <el-input v-model="shipForm.code" />
        </el-form-item>
        <el-form-item label="船舶名称" prop="name">
          <el-input v-model="shipForm.name" />
        </el-form-item>
        <el-form-item label="船舶类型" prop="type">
          <el-select v-model="shipForm.type" placeholder="请选择船舶类型" style="width: 100%">
            <el-option label="散货船" value="bulk" />
            <el-option label="集装箱船" value="container" />
            <el-option label="油轮" value="tanker" />
            <el-option label="多用途船" value="multi" />
          </el-select>
        </el-form-item>
        <el-form-item label="载重吨位" prop="capacity">
          <el-input-number v-model="shipForm.capacity" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="建造年份" prop="buildYear">
          <el-date-picker
            v-model="shipForm.buildYear"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属公司" prop="company">
          <el-select v-model="shipForm.company" placeholder="请选择所属公司" style="width: 100%">
            <el-option 
              v-for="company in companyOptions" 
              :key="company.value" 
              :label="company.label" 
              :value="company.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="shipForm.status">
            <el-option label="在用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipForm.remark" type="textarea" />
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
            <el-table-column prop="code" label="船舶编号" min-width="120" />
            <el-table-column prop="name" label="船舶名称" min-width="120" />
            <el-table-column prop="type" label="船舶类型" min-width="120">
              <template #default="scope">{{ getShipTypeName(scope.row.type) }}</template>
            </el-table-column>
            <el-table-column prop="capacity" label="载重吨位" min-width="120">
              <template #default="scope">{{ scope.row.capacity }}吨</template>
            </el-table-column>
            <el-table-column prop="buildYear" label="建造年份" min-width="120">
              <template #default="scope">{{ scope.row.buildYear }}年</template>
            </el-table-column>
            <el-table-column prop="company" label="所属公司" min-width="200">
              <template #default="scope">{{ getCompanyName(scope.row.company) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '在用' : '停用' }}
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
  name: 'ShipInfo',
  components: {
    Close,
    Upload
  },
  setup() {
    console.log('ShipInfo 组件初始化')
    
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const formRef = ref(null)
    
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 表单数据
    const shipForm = reactive({
      id: null,
      code: '',
      name: '',
      type: '',
      capacity: 0,
      buildYear: '',
      company: '',
      status: 'active',
      remark: ''
    })
    
    // 表单验证规则
    const rules = {
      code: [
        { required: true, message: '请输入船舶编号', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入船舶名称', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择船舶类型', trigger: 'change' }
      ],
      capacity: [
        { required: true, message: '请输入载重吨位', trigger: 'blur' }
      ],
      company: [
        { required: true, message: '请选择所属公司', trigger: 'change' }
      ]
    }
    
    // 公司选项
    const companyOptions = ref([
      { value: 'COMPANY001', label: '国能远洋运输有限公司' },
      { value: 'COMPANY002', label: '国能海运有限公司' },
      { value: 'COMPANY003', label: '国能长江航运有限公司' }
    ])
    
    // 船舶列表 (原始数据)
    const allShipList = ref([])
    // 当前页显示的船舶列表 (计算属性)
    const shipList = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return allShipList.value.slice(start, end)
    })
    
    // 总记录数
    const totalShips = computed(() => allShipList.value.length)
    
    // 图表实例引用
    const typeChartRef = ref(null)
    const ageChartRef = ref(null)
    const capacityChartRef = ref(null)
    const statusTrendChartRef = ref(null)
    
    let typeChart = null
    let ageChart = null
    let capacityChart = null
    let statusTrendChart = null
    
    // 加载示例数据
    const loadExampleData = async () => {
      console.log('开始加载船舶示例数据')
      try {
        // 模拟从API获取数据
        allShipList.value = [
          {
            id: 1,
            code: 'SHIP001',
            name: '远洋号',
            type: 'bulk',
            capacity: 50000,
            buildYear: '2015',
            company: 'COMPANY001',
            status: 'active',
            remark: '主要用于煤炭运输'
          },
          {
            id: 2,
            code: 'SHIP002',
            name: '海能号',
            type: 'bulk',
            capacity: 45000,
            buildYear: '2018',
            company: 'COMPANY001',
            status: 'active',
            remark: '主要用于煤炭运输'
          },
          {
            id: 3,
            code: 'SHIP003',
            name: '江海号',
            type: 'multi',
            capacity: 30000,
            buildYear: '2020',
            company: 'COMPANY002',
            status: 'active',
            remark: '多用途船舶'
          }
        ]
        console.log('船舶数据加载成功，共加载', allShipList.value.length, '条数据')
        // 数据加载后初始化图表
        nextTick(() => {
            initCharts()
        })
      } catch (error) {
        console.error('加载示例数据失败:', error)
        ElMessage.error('数据加载失败')
      }
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      console.log('ShipInfo 组件已挂载')
      loadExampleData()
       // DOM渲染完成后初始化图表，以防数据加载先完成
      nextTick(() => {
        if (allShipList.value.length > 0) {
             initCharts()
        }
      })
    })
    
    // 获取船舶类型名称
    const getShipTypeName = (type) => {
      const typeMap = {
        bulk: '散货船',
        container: '集装箱船',
        tanker: '油轮',
        multi: '多用途船'
      }
      return typeMap[type] || type
    }
    
    // 获取公司名称
    const getCompanyName = (companyCode) => {
      const company = companyOptions.value.find(c => c.value === companyCode)
      return company ? company.label : companyCode
    }
    
    // 新增船舶
    const handleAdd = () => {
      dialogType.value = 'add'
      // 重置表单，确保 id 为 null
      Object.assign(shipForm, {
        id: null,
        code: '',
        name: '',
        type: '',
        capacity: 0,
        buildYear: '',
        company: '',
        status: 'active',
        remark: ''
      })
      // 清除之前的校验状态
      nextTick(() => {
          formRef.value?.clearValidate()
      })
      dialogVisible.value = true
    }
    
    // 编辑船舶
    const handleEdit = (row) => {
      dialogType.value = 'edit'
      // 浅拷贝行数据到表单，确保 id 被复制
      Object.assign(shipForm, row)
       // 清除之前的校验状态
      nextTick(() => {
          formRef.value?.clearValidate()
      })
      dialogVisible.value = true
    }
    
    // 查看船舶
    const handleView = (row) => {
      ElMessage.info(`查看船舶详情：${row.name}（${getShipTypeName(row.type)}）`)
    }
    
    // 删除船舶
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除船舶 ${row.name} 吗？`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).then(() => {
        // 从 allShipList 中删除
        const index = allShipList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          allShipList.value.splice(index, 1)
          ElMessage.success('删除成功')
          // 如果删除的是当前页最后一条，可能需要调整页码
          if (shipList.value.length === 0 && currentPage.value > 1) {
              currentPage.value--;
          }
          // 更新图表
          nextTick(() => {
               initCharts() // 数据变化后重新初始化图表
          })
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
            // 新增
            const newShip = {
              id: Date.now(), // 使用时间戳作为临时ID
              ...shipForm
            }
            allShipList.value.push(newShip) // 添加到原始列表
            ElMessage.success('添加成功')
             // 跳转到最后一页查看新添加的数据
            currentPage.value = Math.ceil(allShipList.value.length / pageSize.value);
          } else {
            // 编辑
            const index = allShipList.value.findIndex(item => item.id === shipForm.id)
            if (index !== -1) {
              // 更新原始列表中的数据
              allShipList.value[index] = { ...shipForm }
              ElMessage.success('更新成功')
            } else {
                 ElMessage.error('未找到要更新的数据')
            }
          }
          // 更新图表
           nextTick(() => {
                initCharts() // 数据变化后重新初始化图表
           })
          dialogVisible.value = false
        }
      })
    }
    
    // 导出Excel
    const handleExportExcel = () => {
       if (allShipList.value.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
      }
      
      // 转换数据格式
      const exportData = allShipList.value.map(item => ({
        '船舶编号': item.code,
        '船舶名称': item.name,
        '船舶类型': getShipTypeName(item.type),
        '载重吨位': item.capacity,
        '建造年份': item.buildYear,
        '所属公司': getCompanyName(item.company),
        '状态': item.status === 'active' ? '在用' : '停用',
        '备注': item.remark || ''
      }))
      
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '船舶信息')
      
      const colWidths = [ { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 8 }, { wch: 25 } ]
      worksheet['!cols'] = colWidths
      
      XLSX.writeFile(workbook, `船舶信息_${new Date().toISOString().split('T')[0]}.xlsx`)
      ElMessage.success('导出成功')
    }
    
    // 分页事件处理
    const handleSizeChange = (val) => {
        pageSize.value = val
        currentPage.value = 1 // 页大小改变时，回到第一页
    }
    const handleCurrentChange = (val) => {
        currentPage.value = val
    }
    
    // --- 图表相关逻辑 ---
    const initCharts = () => {
        console.log('尝试初始化图表')
        initTypeChart()
        initAgeChart()
        initCapacityChart()
        initStatusTrendChart()
         // 监听窗口大小变化，重新渲染图表
        window.addEventListener('resize', resizeCharts)
    }
    
    const resizeCharts = () => {
        typeChart?.resize()
        ageChart?.resize()
        capacityChart?.resize()
        statusTrendChart?.resize()
    }
    
    // 1. 船舶类型分布图
    const initTypeChart = () => {
        if (!typeChartRef.value) return
        typeChart = echarts.init(typeChartRef.value)
        const option = {
            title: { text: '船舶类型分布', left: 'center' },
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left' },
            series: [{
                name: '船舶类型',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 60, name: '散货船' },
                    { value: 40, name: '多用途船' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        }
        typeChart.setOption(option)
    }
    
    // 2. 船龄分布图
    const initAgeChart = () => {
         if (!ageChartRef.value) {
             console.error("Age chart ref not found");
             return;
         }
        ageChart = echarts.init(ageChartRef.value)
        const currentYear = new Date().getFullYear();
        const ageGroups = { '0-5年': 0, '6-10年': 0, '11-15年': 0, '16-20年': 0, '20年以上': 0 };
        allShipList.value.forEach(ship => {
            const buildYear = parseInt(ship.buildYear);
            if (!isNaN(buildYear)) {
                const age = currentYear - buildYear;
                if (age >= 0 && age <= 5) ageGroups['0-5年']++;
                else if (age >= 6 && age <= 10) ageGroups['6-10年']++;
                else if (age >= 11 && age <= 15) ageGroups['11-15年']++;
                else if (age >= 16 && age <= 20) ageGroups['16-20年']++;
                else if (age > 20) ageGroups['20年以上']++;
            }
        });

        const option = {
            title: { text: '船龄分布', left: 'center' },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'category', data: Object.keys(ageGroups) },
            yAxis: { type: 'value', name: '船舶数量' },
             grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            series: [ { data: Object.values(ageGroups), type: 'bar' } ]
        };
        ageChart.setOption(option);
    }
    
     // 3. 载重吨位分布图
    const initCapacityChart = () => {
        if (!capacityChartRef.value) return
        capacityChart = echarts.init(capacityChartRef.value)
        const option = {
            title: { text: '载重吨位分布', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['<10000', '10000-30000', '30000-50000', '>50000'] },
            yAxis: { type: 'value' },
            series: [{
                data: [2, 5, 7, 3],
                type: 'bar'
            }]
        }
        capacityChart.setOption(option)
    }
    
    // 4. 月度运营状态趋势图
    const initStatusTrendChart = () => {
        if (!statusTrendChartRef.value) return
        statusTrendChart = echarts.init(statusTrendChartRef.value)
        const option = {
            title: { text: '月度运营状态趋势', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['在航', '在港', '维修'], bottom: 0 },
            xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '在航',
                    type: 'line',
                    data: [80, 85, 82, 88, 90, 86]
                },
                {
                    name: '在港',
                    type: 'line',
                    data: [15, 10, 12, 8, 7, 10]
                },
                {
                    name: '维修',
                    type: 'line',
                    data: [5, 5, 6, 4, 3, 4]
                }
            ]
        }
        statusTrendChart.setOption(option)
    }
    
    // 搜索表单
    const searchForm = reactive({
      season: '',
      status: '',
      type: '',
      company: '',
      shipName: '',
      code: ''
    })

    // 重置搜索表单
    const resetSearch = () => {
      Object.assign(searchForm, {
        season: '',
        status: '',
        type: '',
        company: '',
        shipName: '',
        code: ''
      })
    }

    // 处理搜索
    const handleSearch = () => {
      // 实现搜索逻辑
      const filteredList = allShipList.value.filter(ship => {
        return (!searchForm.season || true) && // 季度筛选待实现
          (!searchForm.status || ship.status === searchForm.status) &&
          (!searchForm.type || ship.type === searchForm.type) &&
          (!searchForm.company || ship.company === searchForm.company) &&
          (!searchForm.shipName || ship.name === searchForm.shipName) &&
          (!searchForm.code || ship.code.includes(searchForm.code))
      })
      
      // 更新显示的数据
      allShipList.value = filteredList
      // 重置分页
      currentPage.value = 1
    }

    // 文件输入引用
    const fileInputRef = ref(null)
    // 导入对话框显示状态
    const importDialogVisible = ref(false)
    // 导入预览数据
    const importPreviewData = ref([])

    // 处理导入Excel按钮点击
    const handleImportExcel = () => {
      importDialogVisible.value = true
      importPreviewData.value = []
      // 延迟触发文件选择
      nextTick(() => {
        fileInputRef.value.click()
      })
    }

    // 处理文件选择变化
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // 检查文件类型
      const types = ['.xlsx', '.xls']
      const isValidType = types.some(type => file.name.toLowerCase().endsWith(type))
      if (!isValidType) {
        ElMessage.error('请上传 Excel 文件（.xlsx 或 .xls）')
        return
      }

      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // 转换数据格式
          const convertedData = jsonData.map(row => ({
            code: row['船舶编号'] || '',
            name: row['船舶名称'] || '',
            type: getShipTypeValue(row['船舶类型'] || ''),
            capacity: Number(row['载重吨位']) || 0,
            buildYear: String(row['建造年份']) || '',
            company: getCompanyValue(row['所属公司'] || ''),
            status: row['状态'] === '在用' ? 'active' : 'inactive',
            remark: row['备注'] || ''
          }))

          importPreviewData.value = convertedData
        } catch (error) {
          console.error('Excel 解析错误:', error)
          ElMessage.error('Excel 文件解析失败，请检查文件格式')
        }
      }
      reader.readAsArrayBuffer(file)

      // 重置文件输入，以便重复选择同一文件
      event.target.value = ''
    }

    // 获取船舶类型值
    const getShipTypeValue = (typeName) => {
      const typeMap = {
        '散货船': 'bulk',
        '集装箱船': 'container',
        '油轮': 'tanker',
        '多用途船': 'multi'
      }
      return typeMap[typeName] || 'bulk'
    }

    // 获取公司值
    const getCompanyValue = (companyName) => {
      const company = companyOptions.value.find(c => c.label === companyName)
      return company ? company.value : companyOptions.value[0].value
    }

    // 处理确认导入
    const handleImportConfirm = () => {
      if (!importPreviewData.value.length) {
        ElMessage.warning('没有可导入的数据')
        return
      }

      // 验证数据
      const invalidData = importPreviewData.value.some(item => !item.code || !item.name)
      if (invalidData) {
        ElMessage.error('存在无效数据，请检查必填字段')
        return
      }

      // 添加到船舶列表
      const newShips = importPreviewData.value.map(item => ({
        ...item,
        id: Date.now() + Math.random() // 生成临时ID
      }))

      allShipList.value = [...allShipList.value, ...newShips]
      ElMessage.success(`成功导入 ${newShips.length} 条数据`)
      importDialogVisible.value = false
      importPreviewData.value = []

      // 更新图表
      nextTick(() => {
        initCharts()
      })
    }

    // 统计数据
    const statistics = computed(() => {
      const total = allShipList.value.length
      const active = allShipList.value.filter(ship => ship.status === 'active').length
      // 这里需要根据实际数据结构补充其他统计数据
      return {
        total,
        activeInQuarter: active,
        ownedActive: 100, // 示例数据
        charteredActive: 80,
        voyageChartered: 50
      }
    })
    
    // 折叠面板激活的项
    const activeCollapse = ref(['charts']) // 默认展开图表

    // 选中的船舶列表
    const selectedShips = ref([])

    // 表格多选
    const handleSelectionChange = (selection) => {
      selectedShips.value = selection
    }

    // 监听选中船舶变化,重新渲染图表
    watch(selectedShips, () => {
      nextTick(() => {
        if (activeCollapse.value.includes('charts')) {
          initCharts()
        }
      })
    })

    // 监听折叠面板状态变化
    watch(activeCollapse, (newVal) => {
      if (newVal.includes('charts')) {
        nextTick(() => {
          initCharts()
        })
      }
    })

    // 处理关闭详情
    const handleCloseDetail = () => {
      selectedShips.value = []
    }

    // 当前激活的标签页
    const activeTab = ref('statistics')

    // 选中船舶的图表引用
    const selectedTypeChartRef = ref(null)
    const selectedAgeChartRef = ref(null)
    const selectedCapacityChartRef = ref(null)
    const selectedCompanyChartRef = ref(null)

    // 选中船舶的图表实例
    let selectedTypeChart = null
    let selectedAgeChart = null
    let selectedCapacityChart = null
    let selectedCompanyChart = null

    // 初始化选中船舶的图表
    const initSelectedCharts = () => {
      if (!selectedShips.value.length) return

      // 类型分布图
      if (selectedTypeChartRef.value) {
        selectedTypeChart = echarts.init(selectedTypeChartRef.value)
        const typeData = selectedShips.value.reduce((acc, ship) => {
          const typeName = getShipTypeName(ship.type)
          const existing = acc.find(item => item.name === typeName)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: typeName, value: 1 })
          }
          return acc
        }, [])

        selectedTypeChart.setOption({
          title: { text: '选中船舶类型分布', left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{
            name: '船舶类型',
            type: 'pie',
            radius: '50%',
            data: typeData
          }]
        })
      }

      // 船龄分布图
      if (selectedAgeChartRef.value) {
        selectedAgeChart = echarts.init(selectedAgeChartRef.value)
        const currentYear = new Date().getFullYear()
        const ageGroups = { '0-5年': 0, '6-10年': 0, '11-15年': 0, '16-20年': 0, '20年以上': 0 }
        
        selectedShips.value.forEach(ship => {
          const age = currentYear - parseInt(ship.buildYear)
          if (age <= 5) ageGroups['0-5年']++
          else if (age <= 10) ageGroups['6-10年']++
          else if (age <= 15) ageGroups['11-15年']++
          else if (age <= 20) ageGroups['16-20年']++
          else ageGroups['20年以上']++
        })

        selectedAgeChart.setOption({
          title: { text: '选中船舶船龄分布', left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: Object.keys(ageGroups) },
          yAxis: { type: 'value' },
          series: [{
            data: Object.values(ageGroups),
            type: 'bar'
          }]
        })
      }

      // 载重吨位分布图
      if (selectedCapacityChartRef.value) {
        selectedCapacityChart = echarts.init(selectedCapacityChartRef.value)
        const capacityGroups = { '<10000': 0, '10000-30000': 0, '30000-50000': 0, '>50000': 0 }
        
        selectedShips.value.forEach(ship => {
          if (ship.capacity < 10000) capacityGroups['<10000']++
          else if (ship.capacity < 30000) capacityGroups['10000-30000']++
          else if (ship.capacity <= 50000) capacityGroups['30000-50000']++
          else capacityGroups['>50000']++
        })

        selectedCapacityChart.setOption({
          title: { text: '选中船舶载重分布', left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: Object.keys(capacityGroups) },
          yAxis: { type: 'value' },
          series: [{
            data: Object.values(capacityGroups),
            type: 'bar'
          }]
        })
      }

      // 所属公司分布图
      if (selectedCompanyChartRef.value) {
        selectedCompanyChart = echarts.init(selectedCompanyChartRef.value)
        const companyData = selectedShips.value.reduce((acc, ship) => {
          const companyName = getCompanyName(ship.company)
          const existing = acc.find(item => item.name === companyName)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: companyName, value: 1 })
          }
          return acc
        }, [])

        selectedCompanyChart.setOption({
          title: { text: '选中船舶公司分布', left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{
            name: '所属公司',
            type: 'pie',
            radius: '50%',
            data: companyData
          }]
        })
      }
    }

    // 清除选择
    const clearSelection = () => {
      selectedShips.value = []
    }

    // 监听选中船舶变化
    watch(selectedShips, () => {
      nextTick(() => {
        if (activeTab.value === 'basic') {
          initSelectedCharts()
        }
      })
    })

    // 监听标签页切换
    watch(activeTab, (newVal) => {
      if (newVal === 'basic' && selectedShips.value.length > 0) {
        nextTick(() => {
          initSelectedCharts()
        })
      }
    })

    // 处理窗口大小变化
    const handleResize = () => {
      nextTick(() => {
        if (activeTab.value === 'basic' && selectedShips.value.length > 0) {
          selectedTypeChart?.resize()
          selectedAgeChart?.resize()
          selectedCapacityChart?.resize()
          selectedCompanyChart?.resize()
        }
      })
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 船舶详细信息随机生成方法
    const getRandomLength = () => (150 + Math.random() * 100).toFixed(2)
    const getRandomWidth = () => (20 + Math.random() * 15).toFixed(2)
    const getRandomDepth = () => (10 + Math.random() * 5).toFixed(2)
    const getRandomDraft = () => (8 + Math.random() * 4).toFixed(2)
    const getRandomWeight = () => Math.floor(5000 + Math.random() * 15000)
    const getRandomGrossTonnage = () => Math.floor(10000 + Math.random() * 30000)
    
    const getRandomEngine = () => {
      const brands = ['MAN B&W', 'Wärtsilä', 'SULZER', 'YANMAR']
      const models = ['6S60ME-C', '8RT-flex82C', '7L32/40', '6EY26W']
      return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`
    }
    
    const getRandomPower = () => Math.floor(5000 + Math.random() * 15000)
    const getRandomSpeed = () => (12 + Math.random() * 8).toFixed(1)
    const getRandomFuelType = () => {
      const types = ['重质燃料油', '轻质燃料油', '低硫燃料油', '混合燃料油']
      return types[Math.floor(Math.random() * types.length)]
    }
    const getRandomFuelConsumption = () => (20 + Math.random() * 30).toFixed(1)
    const getRandomRange = () => Math.floor(5000 + Math.random() * 5000)
    
    const getRandomClass = () => {
      const classes = ['中国船级社(CCS)', '劳氏船级社(LR)', '美国船级社(ABS)', '日本船级社(NK)']
      return classes[Math.floor(Math.random() * classes.length)]
    }
    
    const getRandomCertNumber = () => {
      const prefix = ['CCS', 'LR', 'ABS', 'NK']
      return `${prefix[Math.floor(Math.random() * prefix.length)]}${Math.floor(Math.random() * 1000000)}`
    }
    
    const getRandomShipyard = () => {
      const shipyards = ['大连造船厂', '上海外高桥造船厂', '广州造船厂', '武昌造船厂']
      return shipyards[Math.floor(Math.random() * shipyards.length)]
    }
    
    const getRandomInspectionDate = () => {
      const date = new Date()
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 12))
      return date.toISOString().split('T')[0]
    }
    
    const getRandomNextInspectionDate = () => {
      const date = new Date()
      date.setMonth(date.getMonth() + Math.floor(Math.random() * 12))
      return date.toISOString().split('T')[0]
    }
    
    const getRandomNavigationArea = () => {
      const areas = ['无限航区', '近海航区', '沿海航区', '内河航区']
      return areas[Math.floor(Math.random() * areas.length)]
    }
    
    const getRandomCallSign = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return 'B' + Array(4).fill().map(() => letters[Math.floor(Math.random() * letters.length)]).join('')
    }
    
    const getRandomMMSI = () => {
      return '477' + Array(6).fill().map(() => Math.floor(Math.random() * 10)).join('')
    }
    
    const getRandomIMO = () => {
      return '9' + Array(6).fill().map(() => Math.floor(Math.random() * 10)).join('')
    }
    
    const getRandomAISInfo = () => {
      const brands = ['Furuno', 'JRC', 'Simrad', 'Garmin']
      const models = ['FA-170', 'JHS-183', 'A2004', 'AIS 800']
      return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`
    }
    
    const getRandomGMDSSInfo = () => {
      const types = ['A1+A2+A3', 'A1+A2', 'A1+A2+A3+A4']
      return types[Math.floor(Math.random() * types.length)]
    }
    
    const getRandomRadarInfo = () => {
      const brands = ['Furuno', 'JRC', 'Sperry Marine', 'Raytheon']
      const models = ['FAR-2228', 'JMA-5300', 'VisionMaster', 'R4K']
      return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`
    }

    return {
      dialogVisible,
      dialogType,
      formRef,
      shipForm,
      rules,
      companyOptions,
      shipList,
      allShipList,
      totalShips,
      currentPage,
      pageSize,
      getShipTypeName,
      getCompanyName,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleSubmit,
      handleExportExcel,
      handleSizeChange,
      handleCurrentChange,
      typeChartRef,
      ageChartRef,
      capacityChartRef,
      statusTrendChartRef,
      searchForm,
      resetSearch,
      handleSearch,
      statistics,
      activeCollapse,
      selectedShips,
      handleSelectionChange,
      handleCloseDetail,
      fileInputRef,
      importDialogVisible,
      importPreviewData,
      handleImportExcel,
      handleFileChange,
      handleImportConfirm,
      activeTab,
      selectedTypeChartRef,
      selectedAgeChartRef,
      selectedCapacityChartRef,
      selectedCompanyChartRef,
      clearSelection,
      getRandomLength,
      getRandomWidth,
      getRandomDepth,
      getRandomDraft,
      getRandomWeight,
      getRandomGrossTonnage,
      getRandomEngine,
      getRandomPower,
      getRandomSpeed,
      getRandomFuelType,
      getRandomFuelConsumption,
      getRandomRange,
      getRandomClass,
      getRandomCertNumber,
      getRandomShipyard,
      getRandomInspectionDate,
      getRandomNextInspectionDate,
      getRandomNavigationArea,
      getRandomCallSign,
      getRandomMMSI,
      getRandomIMO,
      getRandomAISInfo,
      getRandomGMDSSInfo,
      getRandomRadarInfo
    }
  }
}
</script>

<style scoped>
.ship-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
}

.ship-tabs {
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

.ship-detail-card {
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
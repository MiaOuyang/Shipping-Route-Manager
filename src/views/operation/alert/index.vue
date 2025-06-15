<template>
    <div class="alert-config-container">
      <EleCard class="alert-card">
        <template #header>
          <div class="alert-header">
            <h2>预警分级与规则设置</h2>
          </div>
        </template>
  
        <!-- 预警类型筛选 -->
        <div class="filter-section">
          <ProForm
            :model="filterForm"
            :items="filterItems"
            :grid="false"
            :footer="false"
          >
            <template #type>
              <div class="filter-actions">
                <el-button type="primary" @click="handleAdd">新增预警规则</el-button>
                <el-button type="warning" @click="handleExportExcel">导出Excel</el-button>
              </div>
            </template>
          </ProForm>
        </div>
  
        <!-- 显示全部时按预警类型分组展示 -->
        <div v-if="isShowingAll" class="alert-groups">
          <EleCard v-for="group in alertGroups" :key="group.type" class="alert-group" :header="group.typeName">
            <div class="group-content">
              <el-table :data="group.alerts" border style="width: 100%">
                <el-table-column prop="level" label="预警等级" width="150">
                  <template #default="scope">
                    <el-tag :type="getLevelType(scope.row.level)">
                      {{ getLevelLabel(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <!-- 只有非自有电厂预警才显示适用船型列 -->
                <el-table-column v-if="group.type !== 'power_plant_progress'" prop="shipType" label="适用船型" width="150">
                  <template #default="scope">
                    <span v-if="scope.row.shipType">{{ getShipTypeLabel(scope.row.shipType) }}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="parameterName" label="预警指标" width="180" />
                <el-table-column prop="condition" label="触发条件" width="150">
                  <template #default="scope">
                    {{ getConditionLabel(scope.row.condition) }}
                  </template>
                </el-table-column>
                <el-table-column prop="threshold" label="阈值" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button link @click="handleView(scope.row)">查看</el-button>
                    <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </EleCard>
        </div>
  
        <!-- 显示特定预警类型时的表格 -->
        <div v-else class="table-container">
          <EleCard>
            <el-table :data="filteredAlertList" border style="width: 100%" height="500">
              <el-table-column prop="level" label="预警等级" width="180">
                <template #default="scope">
                  <el-tag :type="getLevelType(scope.row.level)">
                    {{ getLevelLabel(scope.row.level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <!-- 只有非自有电厂预警才显示适用船型列 -->
              <el-table-column v-if="selectedType !== 'power_plant_progress'" prop="shipType" label="适用船型" width="200">
                <template #default="scope">
                  <span v-if="scope.row.shipType">{{ getShipTypeLabel(scope.row.shipType) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="parameterName" label="预警指标" width="200" />
              <el-table-column prop="condition" label="触发条件" width="220">
                <template #default="scope">
                  {{ getConditionLabel(scope.row.condition) }}
                </template>
              </el-table-column>
              <el-table-column prop="threshold" label="阈值" width="180" />
              <el-table-column prop="status" label="状态" width="140">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220">
                <template #default="scope">
                  <el-button link @click="handleView(scope.row)">查看</el-button>
                  <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </EleCard>
        </div>
      </EleCard>
  
      <!-- 新增/编辑对话框 -->
      <el-dialog
          :title="dialogType === 'add' ? '新增预警规则' : '编辑预警规则'"
          v-model="dialogVisible"
          width="60%"
          @close="resetForm">
        <EleCard>
          <ProForm
            ref="formRef"
            :model="alertForm"
            :rules="rules"
            :items="formItems"
            :grid="true"
            :footer="true"
            :submitText="'确定'"
            :resetText="'取消'"
            @submit="handleSubmit"
            @reset="dialogVisible = false"
          />
        </EleCard>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as XLSX from 'xlsx'
  import ProForm from '@/components/ProForm/index.vue'
  import { EleCard } from 'ele-admin-plus/es'
  import { useThemeStore } from '@/store/modules/theme'
  import { storeToRefs } from 'pinia'
  
  export default {
    name: 'AlertConfig',
    components: {
      ProForm,
      EleCard
    },
    setup() {
      console.log('AlertConfig 组件初始化')
  
      const dialogVisible = ref(false)
      const dialogType = ref('add')
      const formRef = ref(null)
      const selectedType = ref('')
  
      // 表单数据
      const alertForm = reactive({
        type: '',
        level: '',
        shipType: '',
        parameterName: '',
        condition: '',
        threshold: '',
        minValue: 0,
        maxValue: 0,
        status: 'active',
        remark: ''
      })
  
      // 表单验证规则
      const rules = computed(() => {
        const baseRules = {
          type: [
            { required: true, message: '请选择预警类型', trigger: 'change' }
          ],
          level: [
            { required: true, message: '请选择预警等级', trigger: 'change' }
          ],
          parameterName: [
            { required: true, message: '请输入预警指标', trigger: 'blur' }
          ],
          condition: [
            { required: true, message: '请选择触发条件', trigger: 'change' }
          ],
          threshold: [
            { required: true, message: '请输入阈值', trigger: 'blur' }
          ]
        }
  
        // 只有非自有电厂预警才需要验证船型
        if (alertForm.type !== 'power_plant_progress') {
          baseRules.shipType = [
            { required: true, message: '请选择适用船型', trigger: 'change' }
          ]
        }
  
        return baseRules
      })
  
      // 预警规则列表
      const alertList = ref([])
  
      // 判断是否显示全部的计算属性
      const isShowingAll = computed(() => {
        return !selectedType.value
      })
  
      // 过滤后的预警列表
      const filteredAlertList = computed(() => {
        if (!selectedType.value) {
          return alertList.value
        }
        return alertList.value.filter(item => item.type === selectedType.value)
      })
  
      // 按预警类型分组的数据
      const alertGroups = computed(() => {
        const groups = []
        const typeMap = {
          'port_congestion': '港口拥堵滞期预警',
          'abnormal_stop': '异常停航预警',
          'port_closure': '港口封航预警',
          'typhoon_impact': '台风影响预警',
          'abnormal_speed': '异常航速预警',
          'extreme_weather': '极端天气预警',
          'power_plant_progress': '自有电厂月度计划完成进度预警'
        }
  
        // 获取所有预警类型
        const types = [...new Set(alertList.value.map(item => item.type))]
  
        types.forEach(type => {
          const typeAlerts = alertList.value.filter(item => item.type === type)
          if (typeAlerts.length > 0) {
            groups.push({
              type,
              typeName: typeMap[type] || type,
              alerts: typeAlerts
            })
          }
        })
  
        return groups
      })
  
      // 获取预警类型标签
      const getTypeLabel = (type) => {
        const typeMap = {
          'port_congestion': '港口拥堵滞期预警',
          'abnormal_stop': '异常停航预警',
          'port_closure': '港口封航预警',
          'typhoon_impact': '台风影响预警',
          'abnormal_speed': '异常航速预警',
          'extreme_weather': '极端天气预警',
          'power_plant_progress': '自有电厂月度计划完成进度预警'
        }
        return typeMap[type] || type
      }
  
      // 获取预警等级标签
      const getLevelLabel = (level) => {
        const levelMap = {
          'red': '红色预警',
          'yellow': '黄色预警',
          'green': '绿色预警'
        }
        return levelMap[level] || level
      }
  
      // 获取预警等级类型（用于标签颜色）
      const getLevelType = (level) => {
        const typeMap = {
          'red': 'danger',
          'yellow': 'warning',
          'green': 'success'
        }
        return typeMap[level] || 'info'
      }
  
      // 获取船型标签
      const getShipTypeLabel = (shipType) => {
        if (!shipType) return '-'
        const shipTypeMap = {
          'all': '全部船型',
          '50k': '5万吨级',
          '70k': '7万吨级'
        }
        return shipTypeMap[shipType] || shipType
      }
  
      // 获取触发条件标签
      const getConditionLabel = (condition) => {
        const conditionMap = {
          'gte': '大于等于 (≥)',
          'lte': '小于等于 (≤)',
          'range': '区间范围'
        }
        return conditionMap[condition] || condition
      }
  
      // 加载示例数据
      const loadExampleData = async () => {
        console.log('开始加载预警规则示例数据')
        try {
          alertList.value = [
            // 1. 港口拥堵滞期预警
            {
              id: 1,
              type: 'port_congestion',
              level: 'red',
              shipType: '70k',
              parameterName: '滞期时间（天）',
              condition: 'gte',
              threshold: '6',
              status: 'active',
              remark: '港口拥堵滞期红色预警'
            },
            {
              id: 2,
              type: 'port_congestion',
              level: 'yellow',
              shipType: '70k',
              parameterName: '滞期时间（天）',
              condition: 'range',
              threshold: '4-6',
              minValue: 4,
              maxValue: 6,
              status: 'active',
              remark: '港口拥堵滞期黄色预警'
            },
            {
              id: 3,
              type: 'port_congestion',
              level: 'green',
              shipType: '70k',
              parameterName: '滞期时间（天）',
              condition: 'lte',
              threshold: '4',
              status: 'active',
              remark: '港口拥堵滞期绿色预警'
            },
  
            // 2. 异常停航预警
            {
              id: 4,
              type: 'abnormal_stop',
              level: 'red',
              shipType: 'all',
              parameterName: '停航时间（天）',
              condition: 'gte',
              threshold: '2',
              status: 'active',
              remark: '异常停航红色预警'
            },
            {
              id: 5,
              type: 'abnormal_stop',
              level: 'yellow',
              shipType: 'all',
              parameterName: '停航时间（天）',
              condition: 'range',
              threshold: '0.5-2',
              minValue: 0.5,
              maxValue: 2,
              status: 'active',
              remark: '异常停航黄色预警'
            },
            {
              id: 6,
              type: 'abnormal_stop',
              level: 'green',
              shipType: 'all',
              parameterName: '停航时间（天）',
              condition: 'lte',
              threshold: '0.5',
              status: 'active',
              remark: '异常停航绿色预警'
            },
  
            // 3. 港口封航预警
            {
              id: 7,
              type: 'port_closure',
              level: 'red',
              shipType: '50k',
              parameterName: '封航时间（天）',
              condition: 'gte',
              threshold: '5',
              status: 'active',
              remark: '港口封航红色预警'
            },
            {
              id: 8,
              type: 'port_closure',
              level: 'yellow',
              shipType: '50k',
              parameterName: '封航时间（天）',
              condition: 'range',
              threshold: '2-5',
              minValue: 2,
              maxValue: 5,
              status: 'active',
              remark: '港口封航黄色预警'
            },
            {
              id: 9,
              type: 'port_closure',
              level: 'green',
              shipType: '50k',
              parameterName: '封航时间（天）',
              condition: 'lte',
              threshold: '2',
              status: 'active',
              remark: '港口封航绿色预警'
            },
  
            // 4. 台风影响预警
            {
              id: 10,
              type: 'typhoon_impact',
              level: 'red',
              shipType: 'all',
              parameterName: '台风等级（级）',
              condition: 'gte',
              threshold: '10',
              status: 'active',
              remark: '台风影响红色预警'
            },
            {
              id: 11,
              type: 'typhoon_impact',
              level: 'yellow',
              shipType: 'all',
              parameterName: '台风等级（级）',
              condition: 'range',
              threshold: '4-10',
              minValue: 4,
              maxValue: 10,
              status: 'active',
              remark: '台风影响黄色预警'
            },
            {
              id: 12,
              type: 'typhoon_impact',
              level: 'green',
              shipType: 'all',
              parameterName: '台风等级（级）',
              condition: 'lte',
              threshold: '4',
              status: 'active',
              remark: '台风影响绿色预警'
            },
  
            // 5. 异常航速预警
            {
              id: 13,
              type: 'abnormal_speed',
              level: 'red',
              shipType: '70k',
              parameterName: '航行速度（节）',
              condition: 'gte',
              threshold: '10',
              status: 'active',
              remark: '异常航速红色预警'
            },
            {
              id: 14,
              type: 'abnormal_speed',
              level: 'yellow',
              shipType: '70k',
              parameterName: '航行速度（节）',
              condition: 'range',
              threshold: '6-10',
              minValue: 6,
              maxValue: 10,
              status: 'active',
              remark: '异常航速黄色预警'
            },
            {
              id: 15,
              type: 'abnormal_speed',
              level: 'green',
              shipType: '70k',
              parameterName: '航行速度（节）',
              condition: 'lte',
              threshold: '6',
              status: 'active',
              remark: '异常航速绿色预警'
            },
  
            // 6. 极端天气预警
            {
              id: 16,
              type: 'extreme_weather',
              level: 'red',
              shipType: 'all',
              parameterName: '影响时间（小时）',
              condition: 'gte',
              threshold: '72',
              status: 'active',
              remark: '极端天气红色预警'
            },
            {
              id: 17,
              type: 'extreme_weather',
              level: 'yellow',
              shipType: 'all',
              parameterName: '影响时间（小时）',
              condition: 'range',
              threshold: '24-72',
              minValue: 24,
              maxValue: 72,
              status: 'active',
              remark: '极端天气黄色预警'
            },
            {
              id: 18,
              type: 'extreme_weather',
              level: 'green',
              shipType: 'all',
              parameterName: '影响时间（小时）',
              condition: 'lte',
              threshold: '24',
              status: 'active',
              remark: '极端天气绿色预警'
            },
  
            // 7. 自有电厂月度计划完成进度预警
            {
              id: 19,
              type: 'power_plant_progress',
              level: 'red',
              shipType: '',
              parameterName: '月度未完成率（%）',
              condition: 'gte',
              threshold: '15',
              status: 'active',
              remark: '进度欠量'
            },
            {
              id: 20,
              type: 'power_plant_progress',
              level: 'yellow',
              shipType: '',
              parameterName: '月度未完成率（%）',
              condition: 'range',
              threshold: '5-15',
              minValue: 5,
              maxValue: 15,
              status: 'active',
              remark: '进度欠量'
            },
            {
              id: 21,
              type: 'power_plant_progress',
              level: 'green',
              shipType: '',
              parameterName: '月度未完成率（%）',
              condition: 'lte',
              threshold: '5',
              status: 'active',
              remark: '进度欠量'
            }
          ]
          console.log('预警规则数据加载成功，共加载', alertList.value.length, '条数据')
        } catch (error) {
          console.error('加载示例数据失败:', error)
          ElMessage.error('数据加载失败')
        }
      }
  
      // 组件挂载时加载数据
      onMounted(() => {
        console.log('AlertConfig 组件已挂载')
        loadExampleData()
      })
  
      // 预警类型变化处理
      const handleTypeChange = (value) => {
        console.log('预警类型筛选:', value)
      }
  
      // 新增预警规则
      const handleAdd = () => {
        dialogType.value = 'add'
        resetForm()
        dialogVisible.value = true
      }
  
      // 编辑预警规则
      const handleEdit = (row) => {
        dialogType.value = 'edit'
        Object.assign(alertForm, row)
        dialogVisible.value = true
      }
  
      // 查看预警规则
      const handleView = (row) => {
        ElMessage.info(`查看预警规则：${getTypeLabel(row.type)} - ${getLevelLabel(row.level)}`)
      }
  
      // 删除预警规则
      const handleDelete = (row) => {
        ElMessageBox.confirm(
            '确定要删除该预警规则吗？',
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        ).then(() => {
          const index = alertList.value.findIndex(item => item.id === row.id)
          if (index !== -1) {
            alertList.value.splice(index, 1)
            ElMessage.success('删除成功')
          }
        }).catch(() => {})
      }
  
      // 预警类型选择处理
      const handleTypeSelect = (value) => {
        // 根据预警类型设置默认参数（包含单位）
        const typeDefaults = {
          'port_congestion': { parameterName: '滞期时间（天）' },
          'abnormal_stop': { parameterName: '停航时间（天）' },
          'port_closure': { parameterName: '封航时间（天）' },
          'typhoon_impact': { parameterName: '台风等级（级）' },
          'abnormal_speed': { parameterName: '航行速度（节）' },
          'extreme_weather': { parameterName: '影响时间（小时）' },
          'power_plant_progress': { parameterName: '月度未完成率（%）' }
        }
  
        const defaults = typeDefaults[value]
        if (defaults) {
          alertForm.parameterName = defaults.parameterName
        }
  
        // 如果是自有电厂预警，清空船型字段
        if (value === 'power_plant_progress') {
          alertForm.shipType = ''
        }
      }
  
      // 重置表单
      const resetForm = () => {
        Object.assign(alertForm, {
          type: '',
          level: '',
          shipType: '',
          parameterName: '',
          condition: '',
          threshold: '',
          minValue: 0,
          maxValue: 0,
          status: 'active',
          remark: ''
        })
        if (formRef.value) {
          formRef.value.resetFields()
        }
      }
  
      // 提交表单
      const handleSubmit = async () => {
        if (!formRef.value) return
  
        await formRef.value.validate((valid) => {
          if (valid) {
            // 格式化阈值显示
            let displayThreshold = alertForm.threshold
            if (alertForm.condition === 'range') {
              displayThreshold = `${alertForm.minValue}-${alertForm.maxValue}`
            }
  
            if (dialogType.value === 'add') {
              const newAlert = {
                id: Date.now(),
                ...alertForm,
                threshold: displayThreshold
              }
              alertList.value.push(newAlert)
              ElMessage.success('添加成功')
            } else {
              const index = alertList.value.findIndex(item => item.id === alertForm.id)
              if (index !== -1) {
                alertList.value[index] = {
                  ...alertForm,
                  threshold: displayThreshold
                }
                ElMessage.success('更新成功')
              }
            }
            dialogVisible.value = false
          }
        })
      }
  
      // 导出Excel
      const handleExportExcel = () => {
        const currentData = filteredAlertList.value
        if (currentData.length === 0) {
          ElMessage.warning('没有数据可导出')
          return
        }
  
        // 转换数据格式
        let exportData
        if (isShowingAll.value) {
          exportData = currentData.map(item => {
            const baseData = {
              '预警类型': getTypeLabel(item.type),
              '预警等级': getLevelLabel(item.level),
              '预警指标': item.parameterName,
              '触发条件': getConditionLabel(item.condition),
              '阈值': item.threshold,
              '状态': item.status === 'active' ? '启用' : '禁用',
              '备注': item.remark || ''
            }
  
            // 只有非自有电厂预警才添加适用船型字段
            if (item.type !== 'power_plant_progress') {
              baseData['适用船型'] = getShipTypeLabel(item.shipType)
            }
  
            return baseData
          })
        } else {
          exportData = currentData.map(item => {
            const baseData = {
              '预警类型': getTypeLabel(item.type),
              '预警等级': getLevelLabel(item.level),
              '预警指标': item.parameterName,
              '触发条件': getConditionLabel(item.condition),
              '阈值': item.threshold,
              '状态': item.status === 'active' ? '启用' : '禁用',
              '备注': item.remark || ''
            }
  
            // 只有非自有电厂预警才添加适用船型字段
            if (item.type !== 'power_plant_progress') {
              baseData['适用船型'] = getShipTypeLabel(item.shipType)
            }
  
            return baseData
          })
        }
  
        // 创建工作簿和工作表
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '预警规则配置')
  
        // 设置列宽
        const colWidths = [
          { wch: 35 }, // 预警类型
          { wch: 12 }, // 预警等级
          { wch: 15 }, // 适用船型（部分有）
          { wch: 20 }, // 预警指标
          { wch: 12 }, // 触发条件
          { wch: 15 }, // 阈值
          { wch: 8 },  // 状态
          { wch: 30 }  // 备注
        ]
        worksheet['!cols'] = colWidths
  
        // 导出文件
        const fileName = selectedType.value
            ? `${getTypeLabel(selectedType.value)}_${new Date().toISOString().split('T')[0]}.xlsx`
            : `预警规则配置_全部类型_${new Date().toISOString().split('T')[0]}.xlsx`
  
        XLSX.writeFile(workbook, fileName)
        ElMessage.success('导出成功')
      }
  
      // 筛选表单数据
      const filterForm = reactive({
        type: ''
      })
  
      // 筛选表单项配置
      const filterItems = [
        {
          type: 'select',
          prop: 'type',
          label: '预警类型',
          placeholder: '选择预警类型',
          props: {
            clearable: true,
            onChange: handleTypeChange
          },
          options: [
            { label: '全部', value: '' },
            { label: '港口拥堵滞期预警', value: 'port_congestion' },
            { label: '异常停航预警', value: 'abnormal_stop' },
            { label: '港口封航预警', value: 'port_closure' },
            { label: '台风影响预警', value: 'typhoon_impact' },
            { label: '异常航速预警', value: 'abnormal_speed' },
            { label: '极端天气预警', value: 'extreme_weather' },
            { label: '自有电厂月度计划完成进度预警', value: 'power_plant_progress' }
          ]
        }
      ]
  
      // 表单配置项
      const formItems = computed(() => {
        const items = [
          {
            type: 'select',
            prop: 'type',
            label: '预警类型',
            placeholder: '请选择预警类型',
            props: {
              onChange: handleTypeSelect
            },
            options: [
              { label: '港口拥堵滞期预警', value: 'port_congestion' },
              { label: '异常停航预警', value: 'abnormal_stop' },
              { label: '港口封航预警', value: 'port_closure' },
              { label: '台风影响预警', value: 'typhoon_impact' },
              { label: '异常航速预警', value: 'abnormal_speed' },
              { label: '极端天气预警', value: 'extreme_weather' },
              { label: '自有电厂月度计划完成进度预警', value: 'power_plant_progress' }
            ]
          },
          {
            type: 'select',
            prop: 'level',
            label: '预警等级',
            placeholder: '请选择预警等级',
            options: [
              { label: '红色预警(3级)', value: 'red' },
              { label: '黄色预警(2级)', value: 'yellow' },
              { label: '绿色预警(1级)', value: 'green' }
            ]
          }
        ]
  
        // 只有非自有电厂预警才显示适用船型字段
        if (alertForm.type !== 'power_plant_progress') {
          items.push({
            type: 'select',
            prop: 'shipType',
            label: '适用船型',
            placeholder: '请选择适用船型',
            options: [
              { label: '全部船型', value: 'all' },
              { label: '5万吨级', value: '50k' },
              { label: '7万吨级', value: '70k' }
            ]
          })
        }
  
        items.push(
          {
            type: 'input',
            prop: 'parameterName',
            label: '预警指标',
            placeholder: '请输入预警指标（含单位）'
          },
          {
            type: 'select',
            prop: 'condition',
            label: '触发条件',
            placeholder: '请选择触发条件',
            options: [
              { label: '大于等于 (≥)', value: 'gte' },
              { label: '小于等于 (≤)', value: 'lte' },
              { label: '区间范围', value: 'range' }
            ]
          },
          {
            type: 'input',
            prop: 'threshold',
            label: '阈值',
            placeholder: '请输入阈值'
          }
        )
  
        if (alertForm.condition === 'range') {
          items.push(
            {
              type: 'inputNumber',
              prop: 'minValue',
              label: '最小值',
              props: {
                min: 0,
                style: { width: '100%' }
              }
            },
            {
              type: 'inputNumber',
              prop: 'maxValue',
              label: '最大值',
              props: {
                min: 0,
                style: { width: '100%' }
              }
            }
          )
        }
  
        items.push(
          {
            type: 'select',
            prop: 'status',
            label: '状态',
            options: [
              { label: '启用', value: 'active' },
              { label: '禁用', value: 'inactive' }
            ]
          },
          {
            type: 'textarea',
            prop: 'remark',
            label: '备注',
            placeholder: '请输入备注信息',
            props: {
              rows: 3
            }
          }
        )
  
        return items
      })
  
      // 主题相关
      const themeStore = useThemeStore()
      const { darkMode } = storeToRefs(themeStore)
  
      return {
        dialogVisible,
        dialogType,
        formRef,
        selectedType,
        alertForm,
        rules,
        alertList,
        filteredAlertList,
        alertGroups,
        isShowingAll,
        filterForm,
        filterItems,
        formItems,
        getTypeLabel,
        getLevelLabel,
        getLevelType,
        getShipTypeLabel,
        getConditionLabel,
        handleTypeChange,
        handleAdd,
        handleEdit,
        handleView,
        handleDelete,
        handleTypeSelect,
        resetForm,
        handleSubmit,
        handleExportExcel,
        darkMode
      }
    }
  }
  </script>
  
  <style scoped>
  .alert-config-container {
    padding: 20px;
  }
  
  .alert-card {
    background-color: var(--el-bg-color);
    border-radius: 8px;
  }
  
  .alert-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .alert-header h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 20px;
  }
  
  /* 筛选区域样式 */
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--el-bg-color-page);
    border-radius: 6px;
  }
  
  .filter-section .el-select {
    width: 250px;
  }
  
  .filter-actions {
    display: flex;
    gap: 10px;
  }
  
  /* 分组展示样式 */
  .alert-groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .alert-group {
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .group-content {
    padding: 0;
  }
  
  .group-content .el-table {
    border: none;
  }
  
  .group-content :deep(.el-table th) {
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .group-content :deep(.el-table td) {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .group-content :deep(.el-table tr:last-child td) {
    border-bottom: none;
  }
  
  /* 表格容器样式 */
  .table-container {
    margin-top: 10px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* 表格样式优化 */
  :deep(.el-table) {
    --el-table-border-color: var(--el-border-color-light);
    --el-table-header-bg-color: var(--el-bg-color-page);
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
    --el-table-current-row-bg-color: var(--el-color-primary-light-9);
    --el-table-header-height: 44px;
    --el-table-row-height: 44px;
    --el-table-text-color: var(--el-text-color-regular);
    --el-table-header-text-color: var(--el-text-color-primary);
    --el-table-border: 1px solid var(--el-border-color-light);
  }
  
  :deep(.el-table th) {
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  
  :deep(.el-table td) {
    padding: 12px 0;
  }
  
  /* 标签样式 */
  .el-tag {
    font-weight: 500;
  }
  
  /* 对话框样式 */
  :deep(.el-dialog) {
    border-radius: 8px;
    background-color: var(--el-bg-color);
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-light);
    margin: 0;
  }
  
  :deep(.el-dialog__title) {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-light);
    margin: 0;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .alert-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
  
    .filter-section {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }
  
    .filter-section .el-select {
      width: 100%;
    }
  
    .filter-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  /* 调整ProForm样式 */
  :deep(.el-form--inline) {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  :deep(.el-form--inline .el-form-item__content) {
    display: flex;
    align-items: center;
  }
  
  .filter-actions {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
  </style>
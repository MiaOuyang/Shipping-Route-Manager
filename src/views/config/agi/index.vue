<template>
  <ele-page>
    <ele-card :header="false">
      <!-- 1. 可拖拽左右面板容器 -->
      <div class="d-flex" id="dragContainer" style="height: calc(100vh - 140px); overflow: hidden;">
        
        <!-- 左侧面板：数据输入 & 知识库 & 口语化指令 -->
        <div id="leftPanel" class="bg-light" style="width: 35%; min-width: 320px; overflow-y: auto; padding: 20px;">
          <!-- 知识库嵌入 & 数据输入示例 -->
          <div class="card mb-3">
            <div class="card-block p-3">
              <h5 class="card-title">知识库</h5>
              <!-- 示例文件列表 -->
              <ul class="list-group mb-3" style="max-height: 180px; overflow-y: auto;">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  航运行业基础知识
                  <span class="badge badge-info badge-pill">Doc 1.2 MB</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  船舶运力配置指南
                  <span class="badge badge-info badge-pill">PDF 3.5 MB</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  天气预报API说明
                  <span class="badge badge-info badge-pill">Excel 2.3 MB</span>
                </li>
              </ul>
              <!-- 新增知识输入 -->
              <div class="input-group">
                <el-input class="form-control" placeholder="输入新的知识文档链接或名称" />
                <span class="input-group-btn">
                  <el-button type="success">添加知识</el-button>
                </span>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-block p-3">
              <h5 class="card-title mb-3">数据输入</h5>
        
              <!-- 第一项：基础用户数据 -->
              <div class="form-group">
                <div class="input-group">
                  <el-input v-model="shipDataUserText" class="form-control" placeholder="请选择基础用户数据文件" readonly />
                  <span class="input-group-btn">
                    <el-button type="success" @click="triggerFileInput('shipDataUser')">选择文件</el-button>
                  </span>
                </div>
                <input type="file" ref="shipDataUser" style="display:none" accept=".csv,.xlsx,.json"
                    @change="handleFileChange('shipDataUserText', $event)" />
              </div>
        
              <div class="form-group">
                <div class="input-group">
                  <el-input v-model="shipDataShipText" class="form-control" placeholder="请选择基础船舶数据文件" readonly />
                  <span class="input-group-btn">
                    <el-button type="success" @click="triggerFileInput('shipDataShip')">选择文件</el-button>
                  </span>
                </div>
                <input type="file" ref="shipDataShip" style="display:none" accept=".csv,.xlsx,.json"
                    @change="handleFileChange('shipDataShipText', $event)" />
              </div>
        
              <div class="form-group">
                <div class="input-group">
                  <el-input v-model="shipDataPortText" class="form-control" placeholder="请选择基础港口数据文件" readonly />
                  <span class="input-group-btn">
                    <el-button type="success" @click="triggerFileInput('shipDataPort')">选择文件</el-button>
                  </span>
                </div>
                <input type="file" ref="shipDataPort" style="display:none" accept=".csv,.xlsx,.json"
                    @change="handleFileChange('shipDataPortText', $event)" />
              </div>
        
              <div class="form-group">
                <div class="input-group">
                  <el-input v-model="shipDataDemandText" class="form-control" placeholder="请选择运量需求数据文件" readonly />
                  <span class="input-group-btn">
                    <el-button type="success" @click="triggerFileInput('shipDataDemand')">选择文件</el-button>
                  </span>
                </div>
                <input type="file" ref="shipDataDemand" style="display:none" accept=".csv,.xlsx,.json"
                    @change="handleFileChange('shipDataDemandText', $event)" />
              </div>
        
              <!-- 加载数据按钮 -->
              <div class="text-right">
                <el-button type="info" @click="loadData">
                  <i class="el-icon-upload"></i> 加载数据
                </el-button>
              </div>
            </div>
          </div>                        

          <!-- 口语化指令输入 -->
          <div class="card">
            <div class="card-block p-3">
              <h5 class="card-title">口语化指令</h5>
              <p class="small text-muted">示例：请生成明年1至12月的航运调度方案，重点关注台风季。</p>
              <el-input
                type="textarea"
                v-model="voiceCommand"
                rows="2"
                placeholder="请输入您的自然语言指令..."
                class="mb-2"
              />
              <el-button class="w-100" type="primary" @click="parseCommand">
                <i class="el-icon-chat-line-square"></i> DeepSeek 解析指令
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 中间分隔条，可拖拽改变左右面板宽度 -->
        <div id="divider" 
            style="width: 5px; cursor: col-resize; background-color: #ddd; flex-shrink: 0;"
            @mousedown="startDrag">
        </div>

        <!-- 右侧面板：多目标求解 & 运行图生成 -->
        <div id="rightPanel" class="bg-white" style="width: 65%; padding: 20px; overflow-y: auto;">
          
          <!-- 模型参数判定器 & 多目标求解器 -->
          <div class="card mb-3">
            <div class="card-block">
              <h5 class="card-title">模型参数判定器</h5>
              <p class="small text-muted">
                检验DeepSeek产出的模型参数、速度要求、时间窗口、是否满足权重等。
              </p>
              <ul class="list-group mb-3">
                <li class="list-group-item d-flex justify-content-between">
                  <span>是否存在可行解</span>
                  <el-tag :type="getTagType(checkStatus.feasibility)" size="small">
                    {{ checkStatus.feasibility }}
                  </el-tag>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <span>合作时间要求</span>
                  <el-tag :type="getTagType(checkStatus.timeConstraint)" size="small">
                    {{ checkStatus.timeConstraint }}
                  </el-tag>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <span>速度/载重等关键参数</span>
                  <el-tag :type="getTagType(checkStatus.speedLoad)" size="small">
                    {{ checkStatus.speedLoad }}
                  </el-tag>
                </li>
              </ul>
              <el-button type="primary" plain @click="checkParameters">检查参数</el-button>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-block">
              <h5 class="card-title">多目标求解器</h5>
              <p class="small text-muted">
                当参数检查通过后，将在此调用多目标求解器，独立求解不同目标(效率、效益、供给...)。
              </p>
              <div class="d-flex align-items-center">
                <el-button type="primary" class="mr-3" @click="runSolver">
                  <i class="el-icon-cpu"></i> 启动多目标求解
                </el-button>
                <el-tag :type="solverStatusType">{{ solverStatus }}</el-tag>
              </div>
            </div>
          </div>

          <!-- 运行图生成区 -->
          <div class="card">
            <div class="card-block">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">运行图生成</h5>
                <el-button type="success" @click="generatePlan">
                  <i class="el-icon-data-line"></i> 一键生成运行图
                </el-button>
              </div>
              <p class="small text-muted">
                调用运行图绘制函数，生成最终可视化运行图。
              </p>
              <!-- 示例：运行图/甘特图/地图预览 -->
              <div id="mapOrGanttContainer" ref="chartContainer" style="height:350px; background:#f8f9fa;">
                <!-- 在此放置Leaflet地图、ECharts甘特图等 -->
              </div>
            </div>
          </div>
        </div>
      </div> <!-- end d-flex -->
    </ele-card>
  </ele-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 数据字段
const shipDataUserText = ref('')
const shipDataShipText = ref('')
const shipDataPortText = ref('')
const shipDataDemandText = ref('')
const voiceCommand = ref('')

// 拖拽状态
const isDragging = ref(false)
const startX = ref(0)
const startLeftWidth = ref(0)

// 文件输入引用
const shipDataUser = ref(null)
const shipDataShip = ref(null)
const shipDataPort = ref(null)
const shipDataDemand = ref(null)

// 检查状态
const checkStatus = reactive({
  feasibility: '未验证',
  timeConstraint: '未验证', 
  speedLoad: '未验证'
})

// 求解器状态
const solverStatus = ref('未开始')
const solverStatusType = ref('warning')

// 计算标签类型
function getTagType(status) {
  if (status === '通过') return 'success'
  if (status === '未验证') return 'info'
  return 'warning'
}

// 触发文件选择
function triggerFileInput(refName) {
  const inputRef = ref[refName]
  if (inputRef && inputRef.value) {
    inputRef.value.click()
  }
}

// 处理文件变更
function handleFileChange(modelName, event) {
  const files = event.target.files
  if (files && files.length > 0) {
    ref[modelName].value = files[0].name
  }
}

// 加载数据
function loadData() {
  ElMessage.success('数据加载成功')
}

// 解析指令
function parseCommand() {
  if (!voiceCommand.value.trim()) {
    ElMessage.warning('请先输入口语化指令')
    return
  }
  ElMessage.info('DeepSeek正在解析指令：' + voiceCommand.value)
}

// 参数检查
function checkParameters() {
  // 模拟参数检查
  checkStatus.feasibility = '通过'
  checkStatus.timeConstraint = '通过'
  checkStatus.speedLoad = '通过'
  ElMessage.success('全部参数检查通过')
}

// 运行求解器
function runSolver() {
  solverStatus.value = '求解中...'
  solverStatusType.value = 'info'
  
  setTimeout(() => {
    solverStatus.value = '求解完毕'
    solverStatusType.value = 'success'
    ElMessage.success('多目标求解成功，已得到Pareto解集')
  }, 1500)
}

// 生成运行图
function generatePlan() {
  ElMessage.success('开始绘制运行图...')
  // 这里可以添加调用图表库绘制运行图的代码
}

// 开始拖拽
function startDrag(e) {
  isDragging.value = true
  startX.value = e.clientX
  const leftPanel = document.getElementById('leftPanel')
  if (leftPanel) {
    startLeftWidth.value = leftPanel.offsetWidth
  }
  document.body.style.userSelect = 'none' // 禁止文本选中
}

// 拖拽移动
function onDrag(e) {
  if (!isDragging.value) return
  
  const dx = e.clientX - startX.value
  const leftPanel = document.getElementById('leftPanel')
  const rightPanel = document.getElementById('rightPanel')
  const container = document.getElementById('dragContainer')
  
  if (!leftPanel || !rightPanel || !container) return
  
  // 计算新的左侧宽度
  const newLeftWidth = startLeftWidth.value + dx
  
  // 设置最小/最大值
  if (newLeftWidth < 300 || newLeftWidth > container.offsetWidth - 300) return
  
  // 更新左右面板宽度
  leftPanel.style.width = newLeftWidth + 'px'
  const dividerWidth = document.getElementById('divider')?.offsetWidth || 5
  rightPanel.style.width = (container.offsetWidth - newLeftWidth - dividerWidth) + 'px'
}

// 结束拖拽
function endDrag() {
  isDragging.value = false
  document.body.style.userSelect = 'auto'
}

// 生命周期钩子
onMounted(() => {
  // 添加拖拽事件监听
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
})

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
})
</script>

<style scoped>
/* 知识库主容器，带浅背景和圆角 */
.knowledge-section {
  background-color: #f3f2fa;
  border-radius: 12px;
  padding: 20px;
}

/* 顶部区域：日期、数量、锁图标、按钮 */
.knowledge-header {
  font-size: 14px;
  color: #777;
}
.knowledge-header .el-icon-lock {
  font-size: 14px;
  margin-left: 2px;
}
.knowledge-header .knowledge-date,
.knowledge-header .knowledge-count {
  font-weight: 500;
}

/* 知识列表区：使用网格布局，使卡片分两列或更多列 */
.knowledge-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 5px;
}

/* 每个知识卡片：白底、圆角、阴影或边框 */
.knowledge-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* 图标大小与间距 */
.knowledge-icon {
  width: 36px;
  height: 36px;
  margin-right: 10px;
}

/* 文字信息 */
.knowledge-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.knowledge-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}
.knowledge-meta {
  font-size: 13px;
  color: #999;
}

/* 去除默认内边距，充分利用空间 */
#dragContainer {
  overflow: hidden;
}
#leftPanel, #rightPanel {
  overflow-y: auto;
}
/* 卡片内容稍微美化 */
.card-block {
  border-bottom: 1px solid #eee;
  padding: 1rem 1.25rem;
}
.card-block:last-child {
  border-bottom: none;
}

/* 背景与卡片风格：柔和浅色系，减少滚动条对比度 */
.bg-light {
  background-color: #f8f9fa;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  margin-bottom: 15px;
  border: none;
  overflow: visible;
}

/* 辅助类 */
.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.mr-3 {
  margin-right: 16px;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.text-right {
  text-align: right;
}

.w-100 {
  width: 100%;
}

/* 列表组 */
.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
}

.list-group-item {
  position: relative;
  display: flex;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0,0,0,0.125);
}

.list-group-item:first-child {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.list-group-item:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

/* 输入组 */
.input-group {
  position: relative;
  display: flex;
  width: 100%;
  margin-bottom: 10px;
}

.input-group .el-input {
  flex: 1;
}

.input-group .el-input__inner {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-btn {
  display: inline-flex;
  vertical-align: middle;
  margin-left: -1px;
  white-space: nowrap;
}

.input-group-btn .el-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin: 0;
  height: 40px;
}

/* 表单组 */
.form-group {
  margin-bottom: 1rem;
}

/* 小文本 */
.small {
  font-size: 85%;
}

.text-muted {
  color: #6c757d;
}

/* 徽章 */
.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.badge-pill {
  padding-right: 0.6em;
  padding-left: 0.6em;
  border-radius: 10rem;
}

.badge-info {
  color: #fff;
  background-color: #17a2b8;
}
</style>

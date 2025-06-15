<template>
  <div class="ele-page">
    <!-- 主要内容 -->
    <div class="ele-page">
      <div class="ele-admin-wrapper">
        <div class="ele-card">
          <div class="ele-card-body">
            <!-- 绘图选项区域 -->
            <div
              class="d-flex flex-wrap align-items-end mb-3"
              style="gap: 20px; min-width: 0"
            >
              <div style="flex: 1 1 200px; min-width: 200px; max-width: 260px">
                <div class="form-group">
                  <label>类型:</label>
                  <el-select
                    v-model="drawOptions.type"
                    placeholder="请选择类型"
                  >
                    <el-option label="年度" value="annual" />
                    <el-option label="季度" value="quarter" />
                    <el-option label="月度" value="monthly" />
                  </el-select>
                </div>
              </div>
              <div style="flex: 1 1 200px; min-width: 200px; max-width: 260px">
                <div class="form-group">
                  <label>年份:</label>
                  <el-date-picker
                    v-model="drawOptions.year"
                    type="year"
                    placeholder="选择年份"
                  />
                </div>
              </div>
              <div style="flex: 1 1 200px; min-width: 200px; max-width: 260px">
                <div class="form-group">
                  <label>季度:</label>
                  <el-select
                    v-model="drawOptions.quarter"
                    placeholder="请选择季度"
                  >
                    <el-option label="第一季度" value="Q1" />
                    <el-option label="第二季度" value="Q2" />
                    <el-option label="第三季度" value="Q3" />
                    <el-option label="第四季度" value="Q4" />
                  </el-select>
                </div>
              </div>
              <div style="flex: 1 1 200px; min-width: 200px; max-width: 260px;">
                <div class="form-group">
                  <label>月份:</label>
                  <el-date-picker
                    v-model="drawOptions.month"
                    type="month"
                    placeholder="选择月份"
                  />
                </div>
              </div>
              <div style="flex: 1 1 240px; min-width: 240px; max-width: 320px;">
                <div class="form-group">
                  <label>运力组织单位:</label>
                  <el-select
                    v-model="drawOptions.unit"
                    placeholder="请选择单位"
                  >
                    <el-option
                      label="华中销售"
                      value="huazhong"
                    />
                    <el-option label="神皖能源" value="shenwan" />
                  </el-select>
                </div>
              </div>
              <div style="flex: 1 1 160px; min-width: 160px; max-width: 220px;">
                <div class="form-group">
                  <label>船舶:</label>
                  <el-select
                    v-model="drawOptions.ship"
                    placeholder="请选择船舶"
                  >
                    <el-option label="全部" value="all" />
                  </el-select>
                </div>
              </div>
              <div style="flex: 1 1 160px; min-width: 160px; max-width: 220px;">
                <div class="form-group">
                  <label>区域:</label>
                  <el-select
                    v-model="drawOptions.region"
                    placeholder="请选择区域"
                  >
                    <el-option label="全部" value="all" />
                    <el-option label="渤海湾" value="bohai" />
                    <el-option label="华中" value="huazhong" />
                  </el-select>
                </div>
              </div>
            </div>

            <!-- 工具栏 -->
            <div class="row mb-3">
              <div class="col-12">
                <div class="btn-group">
                  <el-button type="info">
                    <i class="el-icon-document"></i> 导出数据表
                  </el-button>
                  <el-button type="info">
                    <i class="el-icon-zoom-in"></i> 放大视图
                  </el-button>
                  <el-button type="info">
                    <i class="el-icon-zoom-out"></i> 缩小视图
                  </el-button>
                  <el-button type="info">
                    <i class="el-icon-refresh"></i> 背景
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 运行图显示区域 -->
            <div class="ele-card">
              <div class="col-12">
                <div class="chart-container">
                  <!-- 运行图类型切换选项卡 -->
                  <el-tabs v-model="activeTab" class="mb-3">
                    <el-tab-pane label="需求运行图" name="basic">
                      <template #label>
                        <i class="el-icon-data-line"></i> 需求运行图
                      </template>
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="text-center">
                          <h4></h4>
                        </div>
                        <div class="btn-group">
                          <el-button type="primary" @click="showUploadDialog">
                            <i class="el-icon-upload"></i> 上传数据
                          </el-button>
                          <el-button type="success" @click="saveChanges">
                            <i class="el-icon-check"></i> 保存修改
                          </el-button>
                          <el-button type="info" @click="submitPlan">
                            <i class="el-icon-s-promotion"></i> 下达计划
                          </el-button>
                        </div>
                      </div>

                      <!-- 运行图编辑区域 -->
                      <div class="chart-edit-area mb-3 text-center" style="padding-right: 20px;">
                        <div class="d-flex justify-content-center">
                          <div 
                            class="chart-main-area"
                            style="
                              flex-grow: 1;
                              position: relative;
                              min-height: 600px;
                              padding-right: 50px; /* 添加右侧间距 */
                              overflow-x: auto; /* 添加水平滚动条 */
                            "
                          >
                            <div style="position: relative">
                              <!-- 添加标题 -->
                              <div class="text-center mb-3" style="padding-top: 20px">
                                <h2>航运运行图 （2024年3月份）</h2>
                                <h4>国家能源集团航运公司–华中/神皖船舶运行图</h4>
                              </div>
                              
                              <table 
                                border="1"
                                style="
                                  border-collapse: collapse;
                                  border: 2px solid #0070c0;
                                  table-layout: fixed;
                                "
                                id="mainTable"
                                ref="mainTable"
                              ></table>
                              <svg 
                                id="routeSvg" 
                                style="
                                  position: absolute;
                                  top: 0;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  pointer-events: none;
                                  z-index: 100;
                                "
                              >
                                <path 
                                  stroke="red" 
                                  stroke-width="2" 
                                  fill="none" 
                                  id="redPath" 
                                  d="M50,50 L150,50 L200,100 L300,150"
                                />
                                <path 
                                  stroke="black" 
                                  stroke-width="2" 
                                  fill="none" 
                                  id="blackPath" 
                                  d="M50,100 L150,120 L250,180 L350,220"
                                />
                                <text 
                                  id="redText" 
                                  fill="black" 
                                  font-size="12px" 
                                  font-weight="bold" 
                                  text-anchor="middle" 
                                  dy="-10"
                                  x="150"
                                  y="50"
                                >运行路线1</text>
                                <text 
                                  id="blackText" 
                                  fill="black" 
                                  font-size="12px" 
                                  font-weight="bold" 
                                  text-anchor="middle" 
                                  dy="-10"
                                  x="150"
                                  y="120"
                                >运行路线2</text>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>    
                    </el-tab-pane>
                    
                    <!-- 确认运行图 标签页 -->
                    <el-tab-pane label="计划运行图" name="confirmed">
                      <template #label>
                        <i class="el-icon-check-circle"></i> 计划运行图
                      </template>
                      <!-- 图例说明 -->
                      <div class="legend-box mt-3 mb-3">
                        <div class="d-flex flex-wrap">
                          <div class="legend-item">
                            <span class="legend-color bg-success"></span>
                            <span>计划航线</span>
                          </div>
                          <div class="legend-item">
                            <span class="legend-color bg-info"></span>
                            <span>确认航线</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 运行图编辑区域 -->
                      <div class="chart-edit-area mb-3">
                        <div class="d-flex">
                          <!-- 运行图主区域 -->
                          <div 
                            class="chart-main-area" 
                            style="
                              flex-grow: 1; 
                              position: relative; 
                              min-height: 600px; 
                              background: #fff; 
                              border: 1px solid #e9ecef;
                              overflow-x: auto; /* 添加水平滚动条 */
                            "
                          >
                            <canvas id="confirmedChart" ref="confirmedChart" style="width: 100%; height: 100%;"></canvas>
                          </div>
                        </div>
                      </div>

                      <!-- 船舶报文与指令 -->
                      <div class="row mt-3">
                        <div class="col-12">
                          <div class="table-responsive">
                            <el-table :data="shipMessages">
                              <el-table-column type="selection" width="55" />
                              <el-table-column prop="shipName" label="船名" />
                              <el-table-column prop="shipType" label="船舶类型" />
                              <el-table-column prop="voyage" label="航次" />
                              <el-table-column prop="carrierCode" label="承运人代码" />
                              <el-table-column prop="location" label="经纬度" />
                              <el-table-column prop="draft" label="船舶吃水" />
                              <el-table-column prop="destination" label="目的地" />
                              <el-table-column prop="speed" label="船速" />
                              <el-table-column prop="course" label="航向" />
                              <el-table-column prop="eta" label="预计抵达时间" />
                              <el-table-column label="操作">
                                <template #default="scope">
                                  <el-button type="text" size="small" @click="viewDetail(scope.row)">
                                    <i class="el-icon-view"></i> 查看详情
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    
                    <!-- 动态运行图 标签页 -->
                    <el-tab-pane label="实际运行图" name="dynamic">
                      <template #label>
                        <i class="el-icon-data-analysis"></i> 实际运行图
                      </template>

                      <!-- 预警横幅 -->
                      <div class="warning-banner-container">
                        <div id="globalWarningBanner" class="warning-banner severity-none">
                          <span class="icon">ℹ️</span> <span id="warningSummaryText">正在加载预警信息...</span>
                          <a id="toggleWarningPanelBtn" style="display:none;">查看详情 &raquo;</a>
                        </div>
                      </div>

                      <!-- 预警详情面板 -->
                      <div id="warningDetailsPanelContainer" class="warning-details-panel-container">
                        <div class="warning-panel-header">
                          <h3><span id="panelIcon" class="panel-icon">⚠️</span>预警信息列表</h3>
                          <button id="closeWarningPanelBtn" title="关闭面板">&times;</button>
                        </div>
                        <ul id="warningListUL" class="warning-list-ui"></ul>
                      </div>

                      <!-- 图例说明 -->
                      <div class="legend">
                        <div class="legend-item">
                          <div class="legend-line legend-demand"></div>
                          <span>需求线</span>
                        </div>
                        <div class="legend-item">
                          <div class="legend-line legend-planned"></div>
                          <span>计划线</span>
                        </div>
                        <div class="legend-item">
                          <div class="legend-line legend-actual"></div>
                          <span>实际线</span>
                        </div>
                      </div>

                      <!-- 运行图标题 -->
                      <div class="gantt-chart-title">
                        <h2 id="chartMainTitle">航运运行图示例 (2024年3月份)</h2>
                        <h4 id="chartSubTitle">国家能源集团航运公司–华中/神皖船舶运行图</h4>
                      </div>

                      <!-- 运行图编辑区域 -->
                      <div class="chart-edit-area mb-3">
                        <div class="d-flex">
                          <!-- 运行图主区域 -->
                          <div class="chart-display-container">
                            <div id="chartTableWrapper" class="chart-table-wrapper">
                              <table id="mainGanttTable"></table>
                              <svg id="ganttSvgOverlay">
                                <defs>
                                  <marker id="arrow-demand-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFC107" />
                                  </marker>
                                  <marker id="arrow-planned-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#B0BEC5" />
                                  </marker>
                                  <marker id="arrow-actual-svg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#26C6DA" />
                                  </marker>
                                </defs>
                                <g id="areaWarningOverlaysGroupSvg"></g>
                                <g id="trainPathsGroupSvg"></g>
                                <g id="discreteWarningIconsGroupSvg"></g>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 船舶报文与指令 -->
                      <div class="row mt-3">
                        <div class="col-12">
                          <div class="table-responsive">
                            <el-table :data="shipMessages">
                              <el-table-column type="selection" width="55" />
                              <el-table-column prop="shipName" label="船名" />
                              <el-table-column prop="shipType" label="船舶类型" />
                              <el-table-column prop="voyage" label="航次" />
                              <el-table-column prop="carrierCode" label="承运人代码" />
                              <el-table-column prop="location" label="经纬度" />
                              <el-table-column prop="draft" label="船舶吃水" />
                              <el-table-column prop="destination" label="目的地" />
                              <el-table-column prop="speed" label="船速" />
                              <el-table-column prop="course" label="航向" />
                              <el-table-column prop="eta" label="预计抵达时间" />
                              <el-table-column label="操作">
                                <template #default="scope">
                                  <el-button type="text" size="small" @click="viewDetail(scope.row)">
                                    <i class="el-icon-view"></i> 查看详情
                                  </el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传数据对话框 -->
    <el-dialog
      title="上传运行计划数据"
      v-model:visible="uploadDialogVisible"
      width="60%"
    >
      <!-- 文件上传区域 -->
      <div class="upload-area mb-3">
        <div class="upload-icon mb-3">
          <i class="el-icon-upload" style="font-size: 48px; color: #5f76e8;"></i>
        </div>
        <p class="text-muted mb-3">点击或拖拽文件到此处上传</p>
        <el-upload
          class="upload-demo"
          drag
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          :auto-upload="false"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传excel文件，且不超过10MB</div>
          </template>
        </el-upload>
      </div>

      <!-- 数据预览表格 -->
      <el-table :data="previewData">
        <el-table-column prop="shipId" label="船号" />
        <el-table-column prop="startPort" label="起始地点" />
        <el-table-column prop="endPort" label="目的地" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">
              <i class="el-icon-view"></i> 查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">
            <i class="el-icon-download"></i> 确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详细信息对话框 -->
    <el-dialog
      title="航次详细信息"
      v-model:visible="detailDialogVisible"
      width="60%"
    >
      <div v-if="selectedDetail" class="detail-content">
        <!-- 在这里显示详细信息 -->
        <p>船舶名称: {{ selectedDetail.shipName }}</p>
        <p>起始港口: {{ selectedDetail.startPort }}</p>
        <p>目的港口: {{ selectedDetail.endPort }}</p>
      </div>
      <div v-else class="text-center text-muted">
        （详细信息将在此处显示）
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';

  // 绘图选项
  const drawOptions = reactive({
    type: 'annual',
    year: new Date().getFullYear(),
    quarter: 'Q1',
    month: new Date(),
    unit: '',
    ship: 'all',
    region: 'all'
  });

  // 标签页活动标签
  const activeTab = ref('basic');

  // 船舶报文数据
  const shipMessages = ref([
    // 示例数据
    {
      shipName: '神华562',
      shipType: '散货船',
      voyage: '202409',
      carrierCode: 'SH562',
      location: '38.96°N, 121.62°E',
      draft: '8.5m',
      destination: '黄骅港',
      speed: '12节',
      course: '180°',
      eta: '2024-03-15 14:30'
    }
  ]);

  // 文件上传相关
  const uploadDialogVisible = ref(false);
  const fileList = ref([]);
  const previewData = ref([
    {
      shipId: 'SHIP001',
      startPort: '天津港',
      endPort: '黄骅港',
      shipName: '长江01'
    }
  ]);

  // 详细信息对话框
  const detailDialogVisible = ref(false);
  const selectedDetail = ref(null);

  // 表格引用
  const mainTable = ref(null);
  const confirmedChart = ref(null);
  const dynamicChart = ref(null);

  // 方法
  function showUploadDialog() {
    uploadDialogVisible.value = true;
  }

  function handleRemove(file, fileList) {
    console.log(file, fileList);
  }

  function handlePreview(file) {
    console.log(file);
  }

  function viewDetail(row) {
    selectedDetail.value = row;
    detailDialogVisible.value = true;
  }

  function confirmImport() {
    // 处理导入逻辑
    uploadDialogVisible.value = false;
  }

  function saveChanges() {
    // 保存修改逻辑
  }

  function submitPlan() {
    // 下达计划逻辑
  }

  // 创建运行图表格
  function createTable() {
    const ports = ['天津', '黄骅', '社会港', '华中销售', '神皖能源'];
    const states = ['交接|待离', '装船', '抵港|待装'];
    const table = mainTable.value;
    if (!table) return;

    // Clear existing table content
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    table.style.width = '100%'; // 更改为100%宽度
    table.style.tableLayout = 'fixed'; // 强制使用固定布局

    const headerRow = table.insertRow();
    const headerCell = headerRow.insertCell();
    headerCell.colSpan = 2;
    headerCell.textContent = '渤海湾-华中/华东';
    headerCell.className = 'table-cell region-header header-right-strong';
    headerCell.style.width = '160px'; // 设置标头宽度

    // 增加日期列标题
    for (let i = 0; i < 32; i++) {
      const isDash = (i + 1) % 10 === 0;
      const cell = headerRow.insertCell();
      // cell.textContent = i + 1; // Text content removed as per original HTML table generation for these cells
      cell.style.textAlign = 'center';
      cell.style.width = '40px'; // 设置日期列宽度
      if (isDash) cell.style.borderRight = '2px dashed #0070c0';
      cell.className = 'empty-cell';
    }

    const northPortCell = headerRow.insertCell();
    northPortCell.textContent = '北方装港';
    northPortCell.className = 'table-cell last-col-left-strong';
    northPortCell.style.width = '80px'; // 设置最后一列宽度

    ports.forEach((port) => {
      const isSpecialGap = (port === '社会港');
      for (let i = 0; i < 3; i++) {
        const row = table.insertRow();
        row.style.height = '30px';
        if (i === 0) row.classList.add('top-border-strong');
        if (i === 2) row.classList.add('bottom-border-strong');

        if (i === 0) {
          const portCell = row.insertCell();
          portCell.rowSpan = 3;
          portCell.textContent = port;
          portCell.className = 'table-cell first-col-strong';

          const stateCell = row.insertCell();
          stateCell.textContent = states[i];
          stateCell.className = 'table-cell status-col';
        } else {
          const stateCell = row.insertCell();
          stateCell.textContent = states[i];
          stateCell.className = 'table-cell status-col';
        }

        for (let j = 0; j < 32; j++) {
          const cell = row.insertCell();
          if ((j + 1) % 10 === 0) {
            cell.style.borderRight = '2px dashed #0070c0';
            cell.style.borderLeft = '1px dashed #0070c0';
          }
          cell.className = 'empty-cell';

          // Add route point classes and data attributes based on yunxingtu.html logic
          // For red line (神华562)
          if((port === '黄骅' && states[i] === '抵港|待装' && (j === 1 || j === 2 || j === 12 || j === 14)) ||
             (port === '黄骅' && states[i] === '装船' && (j === 2 || j === 3 || j === 14 || j === 15)) ||
             (port === '黄骅' && states[i] === '交接|待离' && j === 15) || // This was '黄烨' in HTML, assuming '黄骅' for Vue
             (port === '黄骅' && states[i] === '交接|待离' && (j === 2 || j === 3)) || // This was '黄烨'
             (port === '黄骅' && states[i] === '抵港|待装' && j === 3) || // This was '黄烨'
             (port === '神皖能源' && states[i] === '抵港|待装' && (j === 6 || j === 7 || j === 9)) ||
             (port === '神皖能源' && states[i] === '装船' && (j === 7 || j === 8)) ||
             (port === '神皖能源' && states[i] === '交接|待离' && (j === 8 || j === 9)) ||
             (port === '华中销售' && states[i] === '抵港|待装' && (j === 20 || j === 22)) ||
             (port === '华中销售' && states[i] === '装船' && (j === 20 || j === 21)) ||
             (port === '华中销售' && states[i] === '交接|待离' && (j === 21 || j === 22))) {
              cell.classList.add('route-point');
              cell.setAttribute('data-port', port);
              cell.setAttribute('data-state', states[i]);
              cell.setAttribute('data-col', j.toString());
              cell.setAttribute('data-line', 'red');
          }

          // For black line (租船1)
          // Original HTML logic: (port === '天津' && states[i] === '抵港|待装' && (j === 8 || j === 9)) || ...
          // The port '黄烨' was used in HTML. Assuming '黄骅' or '天津' based on context.
          // Using '天津' for the first part of black line and '华中销售' for the second as per HTML logic.
          if((port === '天津' && states[i] === '抵港|待装' && (j === 8 || j === 9)) ||
             (port === '天津' && states[i] === '装船' && (j === 9 || j === 10)) ||
             (port === '黄骅' && states[i] === '交接|待离' && (j === 9 || j === 10)) || // Assuming 黄烨 maps to 黄骅
             (port === '黄骅' && states[i] === '抵港|待装' && j === 10) || // Assuming 黄烨 maps to 黄骅
             (port === '华中销售' && states[i] === '抵港|待装' && (j === 13 || j === 14)) ||
             (port === '华中销售' && states[i] === '装船' && (j === 14 || j === 15)) ||
             (port === '华中销售' && states[i] === '交接|待离' && (j === 15 || j === 16))) {
              cell.classList.add('route-point-black');
              cell.setAttribute('data-port', port);
              cell.setAttribute('data-state', states[i]);
              cell.setAttribute('data-col', j.toString());
              cell.setAttribute('data-line', 'black');
          }
        }
        if (i === 0) {
          const mergeCell = row.insertCell();
          mergeCell.rowSpan = 3;
          // In the HTML, this was: port === '黄骅' ? '黄烨' : port;
          // Sticking to the port name for now, can be adjusted if '黄烨' is a distinct entity.
          mergeCell.textContent = port;
          mergeCell.className = 'table-cell last-col-strong last-col-left-strong';
          mergeCell.style.width = '80px'; // 设置最后一列宽度
          mergeCell.style.padding = '0 10px'; // 添加内边距
        }
      }

      const emptyRow = table.insertRow();
      emptyRow.classList.add('empty-row');
      if (isSpecialGap) {
        emptyRow.style.height = '120px'; // Specific height for gap after '社会港'
      }
      // emptyRow.classList.add('empty-row'); // Already added
      for(let k = 0; k < 35; k++) { // Loop 35 times as in HTML
          const cell = emptyRow.insertCell();
          const isDash = (k >= 2 && k < 34) && ((k - 1) % 10 === 0); // Adjusted condition for dashes
          if (isDash) cell.style.borderRight = '2px dashed #0070C0';

          if(k === 1) { // Second cell of empty row
              cell.className = 'table-cell empty-row-second-col';
          } else if(k === 34) { // Last cell of empty row
              cell.className = 'table-cell last-col-left-strong';
              cell.style.width = '80px'; // 设置最后一列宽度
              cell.style.padding = '0 10px'; // 添加内边距
          } else if(k >= 2 && k < 34) { // Date cells in empty row
              cell.className = 'empty-cell';
          } else { // First cell and any other default
              cell.className = 'table-cell';
          }
      }
    });
  }

  // Adapted from yunxingtu.html's drawRoute function
  function drawRoute() {
    const svgElement = document.getElementById('routeSvg');
    if (!svgElement) return;

    let tooltip = document.querySelector('.custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        document.body.appendChild(tooltip);
    }

    const processPath = (pathId, textId, pointsSelector, shipName, voyageName, color) => {
        const svgPath = document.getElementById(pathId);
        const svgText = document.getElementById(textId);
        if (!svgPath || !svgText) return;

        const routePoints = document.querySelectorAll(pointsSelector);
        const routePointArray = [];

        routePoints.forEach(point => {
            const rect = point.getBoundingClientRect();
            const port = point.getAttribute('data-port');
            const state = point.getAttribute('data-state');
            const col = point.getAttribute('data-col');
            routePointArray.push({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                port: port,
                state: state,
                col: col,
                element: point
            });
        });
        
        // Define the specific order for points, adapted from yunxingtu.html
        // This ordering logic is crucial and needs to exactly match how points are connected.
        let orderedRoutePoints = [];
        if (color === 'red') {
             orderedRoutePoints = [
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '1'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '2'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '装船' && p.col === '2'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '装船' && p.col === '3'),
                // Assuming '黄烨' points from HTML are mapped to '黄骅' or another relevant port
                routePointArray.find(p => p.port === '黄骅' && p.state === '交接|待离' && p.col === '2'), // Originally 黄烨
                routePointArray.find(p => p.port === '黄骅' && p.state === '交接|待离' && p.col === '3'), // Originally 黄烨
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '3'), // Originally 黄烨
                routePointArray.find(p => p.port === '神皖能源' && p.state === '抵港|待装' && p.col === '6'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '抵港|待装' && p.col === '7'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '装船' && p.col === '7'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '装船' && p.col === '8'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '交接|待离' && p.col === '8'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '交接|待离' && p.col === '9'),
                routePointArray.find(p => p.port === '神皖能源' && p.state === '抵港|待装' && p.col === '9'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '12'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '14'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '装船' && p.col === '14'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '装船' && p.col === '15'),
                routePointArray.find(p => p.port === '黄骅' && p.state === '交接|待离' && p.col === '15'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '抵港|待装' && p.col === '20'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '装船' && p.col === '20'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '装船' && p.col === '21'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '交接|待离' && p.col === '21'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '交接|待离' && p.col === '22'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '抵港|待装' && p.col === '22')
            ].filter(p => p !== undefined);
        } else if (color === 'black') {
            orderedRoutePoints = [
                routePointArray.find(p => p.port === '天津' && p.state === '抵港|待装' && p.col === '8'),
                routePointArray.find(p => p.port === '天津' && p.state === '抵港|待装' && p.col === '9'),
                routePointArray.find(p => p.port === '天津' && p.state === '装船' && p.col === '9'),
                routePointArray.find(p => p.port === '天津' && p.state === '装船' && p.col === '10'),
                // Assuming '黄烨' points from HTML are mapped to '黄骅' or another relevant port
                routePointArray.find(p => p.port === '黄骅' && p.state === '交接|待离' && p.col === '9'), // Originally 黄烨
                routePointArray.find(p => p.port === '黄骅' && p.state === '交接|待离' && p.col === '10'),// Originally 黄烨
                routePointArray.find(p => p.port === '黄骅' && p.state === '抵港|待装' && p.col === '10'),// Originally 黄烨
                routePointArray.find(p => p.port === '华中销售' && p.state === '抵港|待装' && p.col === '13'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '抵港|待装' && p.col === '14'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '装船' && p.col === '14'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '装船' && p.col === '15'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '交接|待离' && p.col === '15'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '交接|待离' && p.col === '16'),
                routePointArray.find(p => p.port === '华中销售' && p.state === '抵港|待装' && p.col === '16')
            ].filter(p => p !== undefined);
        }


        const svgRect = svgElement.getBoundingClientRect();
        const adjustedPoints = orderedRoutePoints.map(point => ({
            x: point.x - svgRect.left,
            y: point.y - svgRect.top
        }));

        if (adjustedPoints.length > 0) {
            const pathData = adjustedPoints.map((point, index) => 
                (index === 0 ? 'M' : 'L') + point.x + ',' + point.y
            ).join(' ');
            svgPath.setAttribute('d', pathData);

            const textPositionIndex = Math.min(4, adjustedPoints.length - 1);
            const textPosition = adjustedPoints[textPositionIndex];
            svgText.setAttribute('x', textPosition.x);
            svgText.setAttribute('y', textPosition.y - 10);
            svgText.textContent = shipName;

            // 删除事件监听器
            svgPath.style.pointerEvents = 'none';

        } else {
             svgPath.setAttribute('d', ''); // Clear path if no points
             svgText.textContent = ''; // Clear text
        }
    };
    
    processPath('redPath', 'redText', '.route-point', '神华562', '202409', 'red');
    processPath('blackPath', 'blackText', '.route-point-black', '租船1', '202411', 'black');
}

  // 组件挂载后初始化
  onMounted(() => {
    createTable();
    // Ensure DOM is updated before drawing paths
    setTimeout(() => {
      drawRoute(); // Changed from drawPaths to drawRoute
    }, 500); // Keep a delay to ensure table rendering
  });

  // 预警系统相关
  const MOCK_WARNINGS = [
    { id: "W001", severity: "high", type: "滞期", serviceId: "VESSEL_B_actual", atPort: "黄骅", message: "租船01（实际）在黄骅滞期", details: "已超3小时", timestamp: "10:00" },
    { id: "W002", severity: "medium", type: "晚点", serviceId: "VESSEL_A_actual", atPort: "神皖能源", message: "神华562（实际）在神皖能源晚点", details: "预计晚点30分钟", timestamp: "14:00" },
    { id: "W003", severity: "medium", type: "气象", serviceId: "VESSEL_A_actual", atPort: "华中销售", message: "神华562（实际）遇到大风天气", details: "阵风8级，注意安全", timestamp: "15:00" },
    { id: "W004", severity: "high", type: "特殊海况", serviceId: "VESSEL_B_actual", atPort: "神皖能源", message: "租船01（实际）遇到特殊海况", details: "海浪较大，作业暂停", timestamp: "16:00" }
  ];

  const portConfig = [
    { name: '天津', states: ['交接|待离', '装船', '抵港|待装'] },
    { name: '黄骅', states: ['交接|待离', '装船', '抵港|待装'] },
    { name: '社会港', states: ['交接|待离', '装船', '抵港|待装'], largeGapAfter: true },
    { name: '华中销售', states: ['抵港待卸', '装船', '交接待离'] },
    { name: '神皖能源', states: ['抵港待卸', '装船', '交接待离'] }
  ];

  const TIME_COLUMNS = 32;
  const TIME_AXIS_LABEL_INTERVAL = 4;
  const CHART_START_HOUR = 7;
  const CHART_END_HOUR = 23;
  const HOURS_PER_COLUMN = (CHART_END_HOUR - CHART_START_HOUR) / TIME_COLUMNS;

  const cellInfoMap = new Map();

  const trainServices = [
    { id: "VESSEL_C_demand", type: "demand", label: "神华563", segments: [
      { port: "天津", state: "抵港|待装", time: 8.0 }, { port: "天津", state: "抵港|待装", time: 9.0 },
      { port: "天津", state: "装船", time: 9.0 }, { port: "天津", state: "装船", time: 10.0 },
      { port: "黄烨", state: "交接|待离", time: 9.0 }, { port: "黄烨", state: "交接|待离", time: 10.0 },
      { port: "黄烨", state: "抵港|待装", time: 10.0 },
      { port: "华中销售", state: "抵港|待装", time: 13.0 }, { port: "华中销售", state: "抵港|待装", time: 14.0 },
      { port: "华中销售", state: "装船", time: 14.0 }, { port: "华中销售", state: "装船", time: 15.0 },
      { port: "华中销售", state: "交接|待离", time: 15.0 }, { port: "华中销售", state: "交接|待离", time: 16.0 },
      { port: "华中销售", state: "抵港|待装", time: 16.0 }
    ]},
    // ... 其他服务数据 ...
  ];

  // 预警系统函数
  function getIconCharForWarning(type, severity) {
    return type === '封港' ? '⛔' : 
           type === '特殊海况' ? '🌊' : 
           (type === '滞期' || type === '晚点') ? '⏰' : 
           type === '气象' ? '🌦️' : 
           severity === 'high' ? '❗' : 
           severity === 'medium' ? '⚠️' : 'ℹ️';
  }

  function getSeverityClass(severity) {
    return `severity-${severity || 'info'}`;
  }

  function displayWarnings(warnings) {
    const warningBannerEl = document.getElementById('globalWarningBanner');
    const warningSummaryTextEl = document.getElementById('warningSummaryText');
    const toggleWarningPanelBtnEl = document.getElementById('toggleWarningPanelBtn');
    const warningPanelContainerEl = document.getElementById('warningDetailsPanelContainer');
    const panelIconEl = document.getElementById('panelIcon');
    const warningListUlEl = document.getElementById('warningListUL');

    if (warnings.length > 0) {
      let highSeverityCount = warnings.filter(w => w.severity === 'high').length;
      let mediumSeverityCount = warnings.filter(w => w.severity === 'medium').length;
      let overallSeverity = 'low';
      if (warnings.some(w => w.severity === 'info') && !highSeverityCount && !mediumSeverityCount && !warnings.some(w => w.severity === 'low')) overallSeverity = 'info';
      if (mediumSeverityCount > 0) overallSeverity = 'medium';
      if (highSeverityCount > 0) overallSeverity = 'high';

      warningBannerEl.className = 'warning-banner ' + getSeverityClass(overallSeverity);
      panelIconEl.textContent = getIconCharForWarning(null, overallSeverity);
      warningSummaryTextEl.innerHTML = `当前有 <b>${warnings.length}</b> 条预警信息` + (highSeverityCount > 0 ? ` (含 <b>${highSeverityCount}</b> 条高级别)` : '');
      toggleWarningPanelBtnEl.style.display = 'inline';
    } else {
      warningBannerEl.className = 'warning-banner severity-none';
      panelIconEl.textContent = '✔️';
      warningSummaryTextEl.innerHTML = '<span class="icon">✔️</span> 当前无预警信息';
      toggleWarningPanelBtnEl.style.display = 'none';
      warningPanelContainerEl.classList.remove('open');
    }

    warningListUlEl.innerHTML = '';
    warnings.sort((a,b) => {
      const order = { high: 3, medium: 2, low: 1, info: 0 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    }).forEach(w => {
      const li = document.createElement('li');
      li.className = 'warning-item ' + getSeverityClass(w.severity);
      li.dataset.warningId = w.id;
      if(w.serviceId) li.dataset.targetServiceId = w.serviceId;
      if(w.entityName) li.dataset.targetEntityName = w.entityName;
      li.innerHTML = `
        <span class="item-icon">${getIconCharForWarning(w.type, w.severity)}</span>
        <div class="message-content">
          <span class="summary">${w.message}</span>
          <span class="details">${w.details}</span>
          <span class="meta">${w.timestamp ? `时间: ${w.timestamp} | ` : ''}<a href="#" class="locate-on-chart-btn" title="定位预警">定位图上</a></span>
        </div>
      `;
      warningListUlEl.appendChild(li);
    });
  }

  // 运行图函数
  function createGanttTable() {
    const mainGanttTable = document.getElementById('mainGanttTable');
    if (!mainGanttTable) return;

    mainGanttTable.innerHTML = '';
    cellInfoMap.clear();
    let absoluteRowIndex = 0;

    const headerRow = mainGanttTable.insertRow();
    absoluteRowIndex++;
    const mainHeaderCell = headerRow.insertCell();
    mainHeaderCell.colSpan = 2;
    mainHeaderCell.textContent = '港口/状态';
    mainHeaderCell.className = 'table-header-cell right-border-strong';

    for (let i = 0; i < TIME_COLUMNS; i++) {
      const cell = headerRow.insertCell();
      cell.className = 'time-slot-cell table-header-cell';
      if ((i + 1) % 10 === 0 && i < TIME_COLUMNS -1) cell.classList.add('dashed-right');
    }

    const endHeaderCell = headerRow.insertCell();
    endHeaderCell.textContent = '港口重复';
    endHeaderCell.className = 'table-header-cell left-border-strong';

    portConfig.forEach((port) => {
      port.states.forEach((state, stateIdx) => {
        const row = mainGanttTable.insertRow();
        row.dataset.absoluteRowIndex = absoluteRowIndex;
        absoluteRowIndex++;

        if (stateIdx === 0) {
          const portCell = row.insertCell();
          portCell.rowSpan = port.states.length;
          portCell.textContent = port.name;
          portCell.className = 'port-name-cell right-border-strong';
        }

        const stateCell = row.insertCell();
        stateCell.textContent = state;
        stateCell.className = 'state-name-cell';

        if (stateIdx === 0) row.classList.add('top-border-strong');
        if (stateIdx === port.states.length - 1) row.classList.add('bottom-border-strong');

        for (let colIdx = 0; colIdx < TIME_COLUMNS; colIdx++) {
          const cell = row.insertCell();
          cell.className = 'time-slot-cell';
          cell.id = `cell_${port.name}_${state.replace(/[^a-zA-Z0-9\-]/g,'-')}_${colIdx}`;
          if ((colIdx + 1) % 10 === 0 && colIdx < TIME_COLUMNS -1) cell.classList.add('dashed-right');
        }

        if (stateIdx === 0) {
          const endPortCell = row.insertCell();
          endPortCell.rowSpan = port.states.length;
          endPortCell.textContent = port.name;
          endPortCell.className = 'port-name-cell left-border-strong';
        }
      });

      const emptyRow = mainGanttTable.insertRow();
      emptyRow.dataset.absoluteRowIndex = absoluteRowIndex;
      absoluteRowIndex++;
      emptyRow.className = 'empty-spacer-row';
      if (port.largeGapAfter) emptyRow.classList.add('large-gap');

      for (let i = 0; i < 2 + TIME_COLUMNS + 1; i++) {
        const cell = emptyRow.insertCell();
        if (i === 0) cell.className = 'port-name-cell right-border-strong';
        else if (i === 1) cell.className = 'state-name-cell';
        else if (i === 2 + TIME_COLUMNS) cell.className = 'port-name-cell left-border-strong';
        else cell.className = 'time-slot-cell';
        if (i > 1 && i < 2 + TIME_COLUMNS && (i - 2 + 1) % 10 === 0 && (i-2) < TIME_COLUMNS -1) cell.classList.add('dashed-right');
      }
    });

    requestAnimationFrame(() => {
      const ganttSvgOverlay = document.getElementById('ganttSvgOverlay');
      ganttSvgOverlay.style.width = `${mainGanttTable.offsetWidth}px`;
      ganttSvgOverlay.style.height = `${mainGanttTable.offsetHeight}px`;
      ganttSvgOverlay.setAttribute('viewBox', `0 0 ${mainGanttTable.offsetWidth} ${mainGanttTable.offsetHeight}`);

      for (const port of portConfig) {
        for (const state of port.states) {
          for (let colIdx = 0; colIdx < TIME_COLUMNS; colIdx++) {
            const cellId = `cell_${port.name}_${state.replace(/[^a-zA-Z0-9\-]/g,'-')}_${colIdx}`;
            const cellElement = document.getElementById(cellId);
            if (cellElement) {
              const cellX = cellElement.offsetLeft + cellElement.offsetWidth / 2;
              const cellY = cellElement.offsetTop + cellElement.offsetHeight / 2;
              cellInfoMap.set(cellId, { element: cellElement, centerX: cellX, centerY: cellY });
            }
          }
        }
      }

      drawTrainPathsAndVesselWarnings();
      drawAreaWarnings(MOCK_WARNINGS.filter(w => w.type === '封港' || w.type === '特殊海况'));
    });
  }

  function getCellCenter(portName, stateName, timeColIdx) {
    const cellKey = `cell_${portName}_${stateName.replace(/[^a-zA-Z0-9\-]/g,'-')}_${timeColIdx}`;
    return cellInfoMap.get(cellKey);
  }

  function serviceTimeToColIdx(timeInHours) {
    let colIdx = Math.round((timeInHours - CHART_START_HOUR) / HOURS_PER_COLUMN);
    return Math.max(0, Math.min(TIME_COLUMNS - 1, colIdx));
  }

  function drawTrainPathsAndVesselWarnings() {
    const trainPathsGroupSvg = document.getElementById('trainPathsGroupSvg');
    if (!trainPathsGroupSvg) return;

    trainPathsGroupSvg.innerHTML = '';

    let tooltip = document.querySelector('.custom-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      document.body.appendChild(tooltip);
    }

    trainServices.forEach(service => {
      const pathPoints = [];
      const warningSegments = (service.type === 'actual') ? MOCK_WARNINGS.filter(w => w.serviceId === service.id) : [];

      if (service.segments) {
        service.segments.forEach((segment, idx) => {
          const cellInfo = getCellCenter(segment.port, segment.state, serviceTimeToColIdx(segment.time));
          if (cellInfo) {
            pathPoints.push(`${cellInfo.centerX},${cellInfo.centerY}`);

            const warningHere = warningSegments.find(w => w.atPort === segment.port);
            if (warningHere) {
              const iconChar = getIconCharForWarning(warningHere.type, warningHere.severity);
              const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              icon.setAttribute('x', cellInfo.centerX + 8);
              icon.setAttribute('y', cellInfo.centerY - 8);
              icon.setAttribute('class', 'warning-icon-on-svg ' + getSeverityClass(warningHere.severity));
              icon.textContent = iconChar;
              icon.style.fontSize = '18px';
              icon.style.cursor = 'pointer';

              icon.addEventListener('mouseover', function(e) {
                tooltip.style.display = 'block';
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px';
                tooltip.innerHTML = `<b>${warningHere.message}</b><br>${warningHere.details}`;
              });

              icon.addEventListener('mousemove', function(e) {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px';
              });

              icon.addEventListener('mouseout', function() {
                tooltip.style.display = 'none';
              });

              trainPathsGroupSvg.appendChild(icon);
            }
          }
        });
      }

      if (pathPoints.length > 0) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M' + pathPoints.join(' L'));
        path.setAttribute('class', service.type + '-line-svg');
        path.dataset.serviceId = service.id;

        if (service.type === 'demand') path.setAttribute('marker-end', 'url(#arrow-demand-svg)');
        else if (service.type === 'planned') path.setAttribute('marker-end', 'url(#arrow-planned-svg)');
        else if (service.type === 'actual') path.setAttribute('marker-end', 'url(#arrow-actual-svg)');

        trainPathsGroupSvg.appendChild(path);

        if (service.label) {
          const lastPointCoords = pathPoints[pathPoints.length - 1].split(',');
          let midX = parseFloat(lastPointCoords[0]);
          let midY = parseFloat(lastPointCoords[1]);

          if (pathPoints.length > 1) {
            const secondLastPointCoords = pathPoints[Math.max(0, pathPoints.length - 2)].split(',');
            midX = (parseFloat(secondLastPointCoords[0]) + parseFloat(lastPointCoords[0])) / 2;
            midY = (parseFloat(secondLastPointCoords[1]) + parseFloat(lastPointCoords[1])) / 2;
          }

          const labelTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelTextElement.setAttribute('x', midX);
          labelTextElement.setAttribute('y', midY - 8);
          labelTextElement.setAttribute('class', 'line-label-svg');
          labelTextElement.textContent = service.label;
          trainPathsGroupSvg.appendChild(labelTextElement);
        }
      }
    });
  }

  function drawAreaWarnings(warningsToDraw) {
    const areaWarningOverlaysGroupSvg = document.getElementById('areaWarningOverlaysGroupSvg');
    if (!areaWarningOverlaysGroupSvg) return;

    if (!warningsToDraw || warningsToDraw === MOCK_WARNINGS) {
      areaWarningOverlaysGroupSvg.innerHTML = '';
    } else if (warningsToDraw.length > 0) {
      areaWarningOverlaysGroupSvg.innerHTML = '';
    }

    warningsToDraw.forEach(w => {
      const startColIdx = serviceTimeToColIdx(parseFloat(w.timestamp.split(':')[0]));
      const endColIdx = startColIdx + 2; // 假设预警持续2小时

      if (w.type === '封港' && w.entityType === 'port' && w.entityName && startColIdx !== null && endColIdx !== null) {
        const portInfo = portConfig.find(p => p.name === w.entityName);
        if (portInfo) {
          const firstStateCellInfo = getCellCenter(w.entityName, portInfo.states[0], startColIdx);
          const lastStateCellInfo = getCellCenter(w.entityName, portInfo.states[portInfo.states.length - 1], startColIdx);
          const startXCellInfo = getCellCenter(w.entityName, portInfo.states[0], startColIdx);
          const endXCellInfo = getCellCenter(w.entityName, portInfo.states[0], endColIdx);

          if (firstStateCellInfo && lastStateCellInfo && startXCellInfo && endXCellInfo) {
            const x = startXCellInfo.centerX - startXCellInfo.element.offsetWidth / 2;
            const width = (endXCellInfo.centerX + endXCellInfo.element.offsetWidth/2) - x;
            const y = firstStateCellInfo.centerY - firstStateCellInfo.element.offsetHeight / 2;
            const height = (lastStateCellInfo.centerY + lastStateCellInfo.element.offsetHeight/2) - y;

            if (width > 0 && height > 0) {
              const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              rect.setAttribute('x', x);
              rect.setAttribute('y', y);
              rect.setAttribute('width', width);
              rect.setAttribute('height', height);
              rect.setAttribute('class', 'area-warning-overlay-svg port-closure-overlay-svg');

              const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
              title.textContent = `${w.message}\n${w.details}`;
              rect.appendChild(title);

              areaWarningOverlaysGroupSvg.appendChild(rect);

              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', x + width / 2);
              text.setAttribute('y', y + height / 2);
              text.setAttribute('class', 'area-warning-text-svg');
              text.textContent = `封: ${w.entityName.slice(0,2)}`;
              areaWarningOverlaysGroupSvg.appendChild(text);
            }
          }
        }
      }
    });
  }

  // 事件监听器
  onMounted(() => {
    const toggleWarningPanelBtnEl = document.getElementById('toggleWarningPanelBtn');
    const closeWarningPanelBtnEl = document.getElementById('closeWarningPanelBtn');
    const warningPanelContainerEl = document.getElementById('warningDetailsPanelContainer');
    const warningListUlEl = document.getElementById('warningListUL');

    toggleWarningPanelBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      warningPanelContainerEl.classList.toggle('open');
    });

    closeWarningPanelBtnEl.addEventListener('click', () => {
      warningPanelContainerEl.classList.remove('open');
    });

    warningListUlEl.addEventListener('click', function(event) {
      if (event.target.classList.contains('locate-on-chart-btn')) {
        event.preventDefault();
        const listItem = event.target.closest('.warning-item');
        const warningId = listItem.dataset.warningId;
        const specificWarning = MOCK_WARNINGS.find(w => w.id === warningId);
        if (specificWarning) {
          drawAreaWarnings([specificWarning]);
        }
      }
    });

    createGanttTable();
    displayWarnings(MOCK_WARNINGS);
  });
</script>

<style scoped>
  /* 容器样式 */
  .annual-operation-container {
    padding: 20px;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
  }

  /* 面包屑与标题 */
  .page-titles {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  .page-titles h3 {
    margin-bottom: 5px;
    font-weight: 600;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0;
    background: transparent;
    list-style: none;
  }

  .breadcrumb-item {
    font-size: 14px;
  }

  .breadcrumb-item + .breadcrumb-item::before {
    content: '/';
    padding: 0 5px;
    color: #ccc;
  }

  /* 卡片样式 */
  .card {
    background-color: var(--el-bg-color);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    margin-bottom: 30px;
    border: 1px solid var(--el-border-color-light);
  }

  .card-block {
    padding: 20px;
  }

  .card-title {
    margin-bottom: 20px;
    font-weight: 600;
  }

  /* 绘图选项样式 */
  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  /* 按钮组样式 */
  .btn-group {
    margin-bottom: 15px;
  }

  .btn-group .el-button {
    margin-right: 8px;
  }

  /* 运行图容器样式 */
  .chart-container {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    padding: 15px;
  }

  /* 时间轴标尺 */
  .time-ruler {
    width: 100px;
    background: #f8f9fa;
    border-right: 1px solid #dee2e6;
    padding: 10px;
  }

  /* 图表主区域 */
  .chart-main-area {
    flex-grow: 1;
    position: relative;
    min-height: 600px;
  }

  /* SVG路径样式 */
  #routeSvg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }

  /* 运行图编辑区域 */
  .chart-edit-area {
    margin-bottom: 15px;
    max-width: 100%; /* 确保不超出父容器 */
  }

  /* 节点编辑工具栏 */
  .node-edit-toolbar {
    padding: 10px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    margin-bottom: 15px;
  }

  /* 图例 */
  .legend-box {
    padding: 10px;
    border-bottom: 1px solid var(--el-border-color-light);
    margin-bottom: 15px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 5px;
    color: var(--el-text-color-primary);
  }

  .legend-color {
    width: 30px;
    height: 3px;
    margin-right: 8px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: #343a40 !important;
  }

  /* 文件上传区域 */
  .upload-area {
    padding: 30px;
    border: 2px dashed var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    text-align: center;
    background-color: var(--el-bg-color-page);
    transition: all 0.3s ease;
    margin-bottom: 20px;
  }

  .upload-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
  }

  /* 表格样式 */
  .table-cell {
    border: 1px solid var(--el-border-color);
    width: 80px;
    min-width: 80px;
    height: 30px;
    min-height: 30px;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    text-align: center;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
  }

  .empty-cell {
    border: 1px solid var(--el-border-color-lighter);
    width: 40px;
    min-width: 40px;
    height: 30px;
    min-height: 30px;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    background-color: var(--el-bg-color);
  }

  .empty-row td {
    height: 10px !important;
    min-height: 10px !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .region-header {
    font-weight: bold;
  }

  table { /* 从yunxingtu.html添加的border-spacing */
    border-spacing: 0;
    table-layout: fixed; /* 添加固定表格布局，确保单元格尊重设置的宽度 */
    width: auto; /* 确保表格宽度适合内容 */
  }

  .top-border-strong td {
    border-top: 2px solid var(--el-border-color);
  }

  .bottom-border-strong td {
    border-bottom: 2px solid var(--el-border-color);
  }

  .status-col {
    border-left: 2px solid var(--el-border-color) !important;
    border-right: 2px solid var(--el-border-color) !important;
  }

  .empty-row-second-col {
    border-left: 2px solid var(--el-border-color) !important;
    border-right: 2px solid var(--el-border-color) !important;
  }

  .last-col-left-strong {
    border-left: 2px solid var(--el-border-color) !important;
  }

  .header-right-strong {
    border-right: 2px solid var(--el-border-color) !important;
  }

  .first-col-strong {
    border-right: 2px solid var(--el-border-color) !important;
  }

  /* 工具类 */
  .d-flex {
    display: flex;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .justify-content-between {
    justify-content: space-between;
  }

  .justify-content-center {
    justify-content: center;
  }

  .align-items-center {
    align-items: center;
  }

  .flex-column {
    flex-direction: column;
  }

  .text-center {
    text-align: center;
  }

  .mb-3 {
    margin-bottom: 1rem;
  }

  .mt-3 {
    margin-top: 1rem;
  }

  .pull-right {
    float: right;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }

  .col-12 {
    flex: 0 0 100%;
    max-width: 100%;
    padding-right: 15px;
    padding-left: 15px;
  }

  .col-md-1,
  .col-md-2,
  .col-md-5,
  .col-md-7 {
    padding-right: 15px;
    padding-left: 15px;
  }

  @media (min-width: 768px) {
    .col-md-1 {
      flex: 0 0 8.333333%;
      max-width: 8.333333%;
    }
    .col-md-2 {
      flex: 0 0 16.666667%;
      max-width: 16.666667%;
    }
    .col-md-5 {
      flex: 0 0 41.666667%;
      max-width: 41.666667%;
    }
    .col-md-7 {
      flex: 0 0 58.333333%;
      max-width: 58.333333%;
    }
  }

  /* 背景颜色工具类 */
  .bg-success {
    background-color: #67c23a !important;
  }

  .bg-info {
    background-color: #409eff !important;
  }

  .bg-warning {
    background-color: #e6a23c !important;
  }

  .bg-danger {
    background-color: #f56c6c !important;
  }

  .text-muted {
    color: #6c757d;
  }

  /* Added from yunxingtu.html for route points and tooltips */
  .route-point {
    position: relative;
  }
  .route-point-black { /* Ensure this class is defined if used for black lines */
    position: relative;
  }

  .custom-tooltip {
    position: absolute;
    padding: 8px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    pointer-events: none;
    z-index: 1000;
    font-size: 12px;
    display: none;
    text-align: center;
    white-space: pre-line;
    color: var(--el-text-color-primary);
  }

  #redPath, #blackPath {
    stroke-width: 2;
    cursor: pointer;
    pointer-events: all;
  }

  #redPath.hovered, #blackPath.hovered {
    stroke-width: 3;
    stroke-opacity: 1;
    filter: drop-shadow(0 0 2px var(--el-box-shadow));
  }
  /* Ensure other specific styles from yunxingtu.html are also present or adapted */
  .last-col-strong { /* Added from yunxingtu.html */
      border-left: 2px solid #0070C0 !important;
  }
  .empty-row { /* Ensure this style applies correctly */
    /* height: 10px !important; /* Height is set dynamically for special gap */
  }

  .form-short {
    max-width: 140px;
    min-width: 100px;
    flex: 0 0 140px;
    padding-right: 4px;
    padding-left: 4px;
  }

  /* 预警系统样式 */
  .warning-banner-container {
    width: 95%;
    max-width: 1200px;
    margin-bottom: 15px;
  }

  .warning-banner {
    padding: 10px 15px;
    border-radius: 6px;
    text-align: center;
    font-size: 0.95em;
    transition: background-color 0.3s ease;
    border: 1px solid transparent;
  }

  .warning-banner .icon {
    margin-right: 8px;
  }

  .warning-banner a {
    color: inherit;
    font-weight: bold;
    text-decoration: underline;
    margin-left: 15px;
    cursor: pointer;
  }

  .warning-banner.severity-none {
    background-color: #28a745;
    border-color: #28a745;
    color: white;
  }

  .warning-banner.severity-low {
    background-color: #17a2b8;
    border-color: #17a2b8;
    color: white;
  }

  .warning-banner.severity-medium {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #212529;
  }

  .warning-banner.severity-high {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  /* 预警详情面板样式 */
  .warning-details-panel-container {
    position: fixed;
    top: 0;
    right: -390px;
    width: 380px;
    height: 100%;
    background-color: #2d333a;
    border-left: 1px solid #444c56;
    box-shadow: -3px 0 15px rgba(0,0,0,0.25);
    z-index: 1050;
    transition: right 0.35s ease-in-out;
    display: flex;
    flex-direction: column;
  }

  .warning-details-panel-container.open {
    right: 0px;
  }

  .warning-panel-header {
    padding: 15px 20px;
    border-bottom: 1px solid #444c56;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .warning-panel-header h3 {
    margin: 0;
    font-size: 1.2em;
    color: #e5e7eb;
  }

  .warning-panel-header .panel-icon {
    margin-right: 8px;
  }

  #closeWarningPanelBtn {
    background: none;
    border: none;
    color: #9ea7b3;
    font-size: 1.8em;
    line-height: 1;
    cursor: pointer;
    padding: 0 5px;
  }

  #closeWarningPanelBtn:hover {
    color: #e5e7eb;
  }

  .warning-list-ui {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex-grow: 1;
  }

  .warning-list-ui li {
    padding: 12px 20px;
    border-bottom: 1px solid #373e47;
    font-size: 0.9em;
    display: flex;
    align-items: flex-start;
  }

  .warning-list-ui li:last-child {
    border-bottom: none;
  }

  .warning-list-ui .item-icon {
    margin-right: 12px;
    font-size: 1.3em;
    line-height: 1.3;
    padding-top: 2px;
  }

  .warning-list-ui .message-content .summary {
    font-weight: bold;
    display: block;
    margin-bottom: 4px;
    font-size: 0.95em;
  }

  .warning-list-ui .message-content .details {
    font-size: 0.85em;
    color: #adb5bd;
    margin-bottom: 5px;
    white-space: pre-wrap;
  }

  .warning-list-ui .message-content .meta {
    font-size: 0.75em;
    color: #868e96;
  }

  .warning-list-ui .message-content .meta .locate-on-chart-btn {
    color: #63a4ff;
    text-decoration: none;
    cursor: pointer;
  }

  .warning-list-ui .message-content .meta .locate-on-chart-btn:hover {
    text-decoration: underline;
  }

  .warning-item.severity-high .item-icon,
  .warning-item.severity-high .summary {
    color: #f48fb1;
  }

  .warning-item.severity-medium .item-icon,
  .warning-item.severity-medium .summary {
    color: #ffb74d;
  }

  .warning-item.severity-low .item-icon,
  .warning-item.severity-low .summary {
    color: #81d4fa;
  }

  .warning-item.severity-info .item-icon,
  .warning-item.severity-info .summary {
    color: #90caf9;
  }

  /* 图例样式 */
  .legend {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 25px;
    padding: 12px 15px;
    background-color: #2d333a;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 5px;
    font-size: 14px;
    color: #c5c8cc;
  }

  .legend-item:last-child {
    margin-right: 0;
  }

  .legend-line {
    width: 35px;
    height: 5px;
    margin-right: 10px;
    border-radius: 2px;
  }

  .legend-demand {
    background-color: #FFC107;
  }

  .legend-planned {
    background-color: #B0BEC5;
  }

  .legend-actual {
    background-color: #26C6DA;
  }

  /* 运行图容器样式 */
  .chart-display-container {
    width: 95%;
    max-width: 1200px;
    background-color: #051532;
    border: 1px solid #30363d;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    display: flex;
    justify-content: center;
  }

  .chart-table-wrapper {
    position: relative;
  }

  #mainGanttTable {
    border-collapse: collapse;
    table-layout: fixed;
    border: 2px solid #ADE1FF;
    color: #c5c8cc;
  }

  #mainGanttTable th,
  #mainGanttTable td {
    border: 1px solid rgba(173, 225, 255, 0.3);
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    text-align: center;
    vertical-align: middle;
    font-size: 11px;
  }

  .table-header-cell {
    height: 30px;
    min-height: 30px;
    font-weight: bold;
  }

  .port-name-cell {
    width: 80px;
    min-width: 80px;
    font-weight: bold;
  }

  .state-name-cell {
    width: 70px;
    min-width: 70px;
    border-left: 2px solid #ADE1FF !important;
    border-right: 2px solid #ADE1FF !important;
  }

  .time-slot-cell {
    width: 25px;
    min-width: 25px;
    height: 25px;
    min-height: 25px;
  }

  .time-slot-cell.dashed-right {
    border-right: 2px dashed #ADE1FF !important;
  }

  .time-slot-cell.dashed-left {
    border-left: 1px dashed #ADE1FF !important;
  }

  .empty-spacer-row td {
    height: 10px !important;
    min-height: 10px !important;
  }

  .empty-spacer-row.large-gap td {
    height: 60px !important;
    min-height: 60px !important;
  }

  /* SVG覆盖层样式 */
  #ganttSvgOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  #ganttSvgOverlay path,
  #ganttSvgOverlay line {
    pointer-events: auto;
    stroke-linecap: round;
  }

  .demand-line-svg {
    stroke: #FFC107;
    stroke-width: 2.5;
    fill: none;
    stroke-dasharray: 6, 4;
  }

  .planned-line-svg {
    stroke: #B0BEC5;
    stroke-width: 2.5;
    fill: none;
  }

  .actual-line-svg {
    stroke: #26C6DA;
    stroke-width: 3;
    fill: none;
  }

  .line-label-svg {
    font-size: 9px;
    fill: #e1e4e8;
    text-anchor: middle;
    pointer-events: none;
    paint-order: stroke;
    stroke: #24292e;
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  /* 预警图标样式 */
  .warning-icon-on-svg {
    font-size: 12px;
    cursor: help;
    text-anchor: start;
    pointer-events: auto;
  }

  .warning-icon-on-svg.severity-high {
    fill: #f48fb1;
  }

  .warning-icon-on-svg.severity-medium {
    fill: #ffb74d;
  }

  .warning-icon-on-svg.severity-low {
    fill: #81d4fa;
  }

  .area-warning-overlay-svg {
    opacity: 0.35;
  }

  .port-closure-overlay-svg {
    fill: #c62828;
  }

  .sea-condition-overlay-svg-high {
    fill: #d32f2f;
  }

  .sea-condition-overlay-svg-medium {
    fill: #ef6c00;
  }

  .sea-condition-overlay-svg-low {
    fill: #0277bd;
  }

  .area-warning-text-svg {
    font-size: 11px;
    fill: #ffffff;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    font-weight: bold;
    paint-order: stroke;
    stroke: rgba(0,0,0,0.7);
    stroke-width: 2px;
    stroke-linejoin: round;
  }

  /* 运行图标题样式 */
  .gantt-chart-title {
    text-align: center;
    margin-bottom: 15px;
  }

  .gantt-chart-title h2,
  .gantt-chart-title h4 {
    color: #e5e7eb;
    margin: 5px 0;
  }

  .gantt-chart-title h2 {
    font-size: 1.4em;
  }

  .gantt-chart-title h4 {
    font-size: 0.9em;
    font-weight: normal;
    color: #adb5bd;
  }
</style>

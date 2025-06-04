<template>
  <div class="annual-operation-container">
    <!-- 主要内容 -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-block">
            <!-- 绘图选项区域 -->
            <div class="row mb-3">
              <div class="col-12">
                <div class="row">
                  <div class="col-md-2">
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
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>年份:</label>
                      <el-date-picker
                        v-model="drawOptions.year"
                        type="year"
                        placeholder="选择年份"
                      />
                    </div>
                  </div>
                  <div class="col-md-2">
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
                  <div class="col-md-2">
                    <div class="form-group">
                      <label>月份:</label>
                      <el-date-picker
                        v-model="drawOptions.month"
                        type="month"
                        placeholder="选择月份"
                      />
                    </div>
                  </div>
                  <div class="col-md-2">
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
                  <div class="col-md-1">
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
                  <div class="col-md-1">
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
            <div class="row">
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
                          <div class="legend-item">
                            <span class="legend-color bg-warning"></span>
                            <span>实际航线</span>
                          </div>
                          <div class="legend-item">
                            <span class="legend-color bg-danger"></span>
                            <span>偏离航线</span>
                          </div>
                          <div class="legend-item">
                            <span class="legend-dot"></span>
                            <span>停泊点</span>
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
                            <canvas id="dynamicChart" ref="dynamicChart" style="width: 100%; height: 100%;"></canvas>
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
            svgText.setAttribute('y', textPosition.y - 10); // Offset text slightly above the line
            svgText.textContent = shipName;

            svgPath.addEventListener('mouseover', (e) => {
                svgPath.classList.add('hovered');
                tooltip.style.display = 'block';
                tooltip.innerHTML = `${shipName}<br>(${voyageName})`;
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px';
            });
            svgPath.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px';
            });
            svgPath.addEventListener('mouseout', () => {
                svgPath.classList.remove('hovered');
                tooltip.style.display = 'none';
            });
        } else {
             svgPath.setAttribute('d', ''); // Clear path if no points
             svgText.textContent = ''; // Clear text
        }
    };
    
    // Selector for red line points was '.route-point'
    // Selector for black line points was '.route-point-black'
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
</script>

<style scoped>
  /* 容器样式 */
  .annual-operation-container {
    padding: 20px;
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
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    margin-bottom: 30px;
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

  /* 运行图容器样式 */
  .chart-container {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
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
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 15px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 5px;
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
    border: 2px dashed #e9ecef;
    border-radius: 4px;
    text-align: center;
    background-color: #f8f9fa;
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
    border: 1px solid #0070c0;
    width: 80px; /* 增加宽度 */
    min-width: 80px; /* 增加最小宽度 */
    height: 30px;
    min-height: 30px;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    text-align: center; /* 确保文本居中 */
  }

  .empty-cell {
    border: 1px solid #0070c080;
    width: 40px; /* 从30px增加到40px */
    min-width: 40px; /* 从30px增加到40px */
    height: 30px; 
    min-height: 30px;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
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
    border-top: 2px solid #0070c0;
  }

  .bottom-border-strong td {
    border-bottom: 2px solid #0070c0;
  }

  .status-col {
    border-left: 2px solid #0070c0 !important;
    border-right: 2px solid #0070c0 !important;
  }

  .empty-row-second-col {
    border-left: 2px solid #0070c0 !important;
    border-right: 2px solid #0070c0 !important;
  }

  .last-col-left-strong {
    border-left: 2px solid #0070c0 !important;
  }

  .header-right-strong {
    border-right: 2px solid #0070c0 !important;
  }

  .left-border-strong {
    border-left: 2px solid #0070c0 !important;
  }

  .right-border-strong {
    border-right: 2px solid #0070c0 !important;
  }

  .first-col-strong {
    border-right: 2px solid #0070c0 !important;
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
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #333;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
    font-size: 12px;
    display: none;
    text-align: center;
    white-space: pre-line;
  }

  #redPath, #blackPath {
    stroke-width: 2;
    cursor: pointer;
    pointer-events: all; /* Important for mouse events to register on SVG paths */
  }

  #redPath.hovered, #blackPath.hovered {
    stroke-width: 3;
    stroke-opacity: 1;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  }
  /* Ensure other specific styles from yunxingtu.html are also present or adapted */
  .last-col-strong { /* Added from yunxingtu.html */
      border-left: 2px solid #0070C0 !important;
  }
  .empty-row { /* Ensure this style applies correctly */
    /* height: 10px !important; /* Height is set dynamically for special gap */
  }
</style>

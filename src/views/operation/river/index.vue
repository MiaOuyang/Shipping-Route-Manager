<template>
  <ele-page plain :multi-card="false">
    <ele-page>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent=""
      >
        <ele-card :body-style="{ padding: '24px 20px 8px 2px' }">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
              <span>参数配置</span>
              <span
                style="cursor:pointer;display:flex;align-items:center;font-size:14px;color:var(--el-color-primary);"
                @click="cardExpanded = !cardExpanded"
              >
                <el-icon v-if="cardExpanded"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                <span style="margin-left:4px;">{{ cardExpanded ? '收起' : '展开' }}</span>
              </span>
            </div>
          </template>
          <el-collapse-transition>
            <div>
              <el-row :gutter="12">
                <!-- 类型选择 -->
                <el-col :lg="8" :md="12" :sm="12" :xs="24">
                  <el-form-item label="类型" prop="type">
                    <el-select
                      v-model="form.type"
                      placeholder="请选择类型"
                      class="ele-fluid"
                      :popper-options="{ strategy: 'fixed' }"
                      @change="handleTypeChange"
                    >
                      <el-option label="年度" value="annual" />
                      <el-option label="季度" value="quarter" />
                      <el-option label="月度" value="monthly" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <!-- 年份/季度/月度选择，只显示一个 -->
                <el-col v-if="form.type === 'annual'" :lg="8" :md="12" :sm="12" :xs="24">
                  <el-form-item label="年份" prop="year">
                    <el-date-picker
                      v-model="form.year"
                      type="year"
                      placeholder="选择年份"
                      class="ele-fluid"
                      :popper-options="{ strategy: 'fixed' }"
                    />
                  </el-form-item>
                </el-col>
                <el-col v-if="form.type === 'quarter'" :lg="8" :md="12" :sm="12" :xs="24">
                  <el-form-item label="季度" prop="quarter">
                    <el-select
                      v-model="form.quarter"
                      placeholder="请选择季度"
                      class="ele-fluid"
                      :popper-options="{ strategy: 'fixed' }"
                    >
                      <el-option label="第一季度" value="Q1" />
                      <el-option label="第二季度" value="Q2" />
                      <el-option label="第三季度" value="Q3" />
                      <el-option label="第四季度" value="Q4" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col v-if="form.type === 'monthly'" :lg="8" :md="12" :sm="12" :xs="24">
                  <el-form-item label="月份" prop="month">
                    <el-date-picker
                      v-model="form.month"
                      type="month"
                      placeholder="选择月份"
                      class="ele-fluid"
                      :popper-options="{ strategy: 'fixed' }"
                    />
                  </el-form-item>
                </el-col>
                <!-- 展开时显示其余表单项 -->
                <template v-if="cardExpanded">
                  <el-col :lg="8" :md="12" :sm="12" :xs="24">
                    <el-form-item label="运力组织单位" prop="unit" label-width="120px">
                      <el-select
                        v-model="form.unit"
                        placeholder="请选择单位"
                        class="ele-fluid"
                        :popper-options="{ strategy: 'fixed' }"
                      >
                        <el-option label="华中销售" value="huazhong" />
                        <el-option label="神皖能源" value="shenwan" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="8" :md="12" :sm="12" :xs="24">
                    <el-form-item label="船舶" prop="ship">
                      <el-select
                        v-model="form.ship"
                        placeholder="请选择船舶"
                        class="ele-fluid"
                        :popper-options="{ strategy: 'fixed' }"
                      >
                        <el-option label="全部" value="all" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :lg="8" :md="12" :sm="12" :xs="24">
                    <el-form-item label="区域" prop="region">
                      <el-select
                        v-model="form.region"
                        placeholder="请选择区域"
                        class="ele-fluid"
                        :popper-options="{ strategy: 'fixed' }"
                      >
                        <el-option label="全部" value="all" />
                        <el-option label="渤海湾" value="bohai" />
                        <el-option label="华中" value="huazhong" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
              <!-- 工具栏 -->
              <div v-if="cardExpanded" class="form-footer-btns">
                <div class="btn-group">
                  <el-button type="primary" @click="handleSearch">
                    <el-icon><Search /></el-icon>查询
                  </el-button>
                  <el-button type="success" @click="handleExport">
                    <el-icon><Download /></el-icon>导出数据
                  </el-button>
                  <el-button type="warning" @click="handleRefresh">
                    <el-icon><Refresh /></el-icon>刷新
                  </el-button>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </ele-card>

        <!-- 运行图显示区域 -->
        <ele-card>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
              <span>运行图</span>
              <span
                style="cursor:pointer;display:flex;align-items:center;font-size:14px;color:var(--el-color-primary);"
                @click="chartCardExpanded = !chartCardExpanded"
              >
                <el-icon v-if="chartCardExpanded"><ArrowUp /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
                <span style="margin-left:4px;">{{ chartCardExpanded ? '收起' : '展开' }}</span>
              </span>
            </div>
          </template>
          <!-- 自定义预警横幅 -->
          <div v-if="bannerWarning" :style="bannerStyle(bannerWarning.severity)">
            <el-icon style="font-size: 22px; margin-right: 12px;">
              <component :is="bannerIcon(bannerWarning.severity)" />
            </el-icon>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: bold; font-size: 16px;">【{{ bannerWarning.type }}】{{ bannerWarning.summary }}</div>
              <div style="font-size: 14px; margin-top: 2px; white-space: pre-line;">{{ bannerWarning.details }}</div>
              <div style="font-size: 12px; color: #888; margin-top: 2px;">{{ bannerWarning.time }}</div>
            </div>
            <el-button type="text" @click="drawerVisible = true" :style="bannerBtnStyle(bannerWarning.severity)">查看详情</el-button>
          </div>
          <el-drawer
            v-model="drawerVisible"
            title="预警详情"
            size="380px"
            direction="rtl"
          >
            <el-timeline>
              <el-timeline-item
                v-for="item in warnings"
                :key="item.id"
                :type="severityTypeMap[item.severity]"
                :timestamp="item.time"
              >
                <div>
                  <b>{{ item.summary }}</b>
                  <div style="font-size: 13px; color: #888;">{{ item.details }}</div>
                  <div style="font-size: 12px; color: #aaa;">类型：{{ item.type }}</div>
                  <el-button v-if="item.target" size="small" type="primary" style="margin-top: 6px;" @click="locateOnChart(item.target.routeIdx)">定位图上</el-button>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-drawer>
          <el-collapse-transition>
            <div v-show="chartCardExpanded">
              <div class="text-center mb-3" style="padding-top: 20px">
                <div class="chart-title-center">
                  <h2>航运运行图 （2024年3月份）</h2>
                  <h4>国家能源集团航运公司–华中/神皖船舶运行图</h4>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #888888"></span>
                    <span class="legend-text">需求线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #0070C0"></span>
                    <span class="legend-text">散货船计划线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #00B050"></span>
                    <span class="legend-text">租船计划线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #FF0000"></span>
                    <span class="legend-text">散货船实际线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #FFA500"></span>
                    <span class="legend-text">租船实际线</span>
                  </div>
                </div>
              </div>
              <div class="chart-edit-area mb-3 text-center" style="padding-right: 20px;">
                <div class="d-flex justify-content-center">
                  <div class="chart-main-area" style="flex-grow: 1; position: relative; min-height: 600px; padding-right: 50px; overflow-x: auto;">
                    <div style="position: relative; overflow: visible;">
                      <table 
                        border="1"
                        style="border-collapse: collapse; border: 2px solid #0070c0; table-layout: fixed;"
                        id="mainTable"
                        ref="mainTable"
                      ></table>
                      <div ref="svgContainer" class="svg-container"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </ele-card>
      </el-form>
    </ele-page>
  </ele-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { Search, Download, Refresh, ArrowUp, ArrowDown, WarningFilled, InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue';
import { useFormData } from '@/utils/use-form-data';

defineOptions({ name: 'SeaOperation' });

/** 表单实例 */
const formRef = ref(null);

/** 表单数据 */
const [form, resetFields] = useFormData({
  type: 'annual',
  year: new Date().getFullYear(),
  quarter: 'Q1',
  month: new Date(),
  unit: '',
  ship: 'all',
  region: 'all'
});

/** 表单验证规则 */
const rules = reactive({
  type: [
    {
      required: true,
      message: '请选择类型',
      type: 'string',
      trigger: 'change'
    }
  ],
  year: [
    {
      required: true,
      message: '请选择年份',
      type: 'string',
      trigger: 'change'
    }
  ],
  quarter: [
    {
      required: true,
      message: '请选择季度',
      type: 'string',
      trigger: 'change'
    }
  ],
  month: [
    {
      required: true,
      message: '请选择月份',
      type: 'string',
      trigger: 'change'
    }
  ],
  unit: [
    {
      required: true,
      message: '请选择运力组织单位',
      type: 'string',
      trigger: 'change'
    }
  ],
  ship: [
    {
      required: true,
      message: '请选择船舶',
      type: 'string',
      trigger: 'change'
    }
  ],
  region: [
    {
      required: true,
      message: '请选择区域',
      type: 'string',
      trigger: 'change'
    }
  ]
});

/** 查询方法 */
const handleSearch = () => {
  formRef.value?.validate?.((valid) => {
    if (!valid) {
      return;
    }
    console.log('查询参数:', form);
  });
};

/** 导出数据 */
const handleExport = () => {
  formRef.value?.validate?.((valid) => {
    if (!valid) {
      return;
    }
    console.log('导出数据');
  });
};

/** 刷新 */
const handleRefresh = () => {
  resetFields();
  formRef.value?.clearValidate?.();
};

// 切换类型时清空不需要的字段
const handleTypeChange = (val) => {
  if (val === 'annual') {
    form.quarter = '';
    form.month = '';
  } else if (val === 'quarter') {
    form.year = '';
    form.month = '';
  } else if (val === 'monthly') {
    form.year = '';
    form.quarter = '';
  }
};

// 卡片展开/收起状态
const cardExpanded = ref(true);
const chartCardExpanded = ref(true);

const mainTable = ref(null);
const svgContainer = ref(null);

const drawerVisible = ref(false);
const warnings = ref([
  {
    id: 1,
    severity: 'high',
    type: '气象',
    summary: '台风预警',
    details: '预计24小时内有台风影响天津港。',
    time: '2024-06-01 10:00',
    target: null
  },
  {
    id: 2,
    severity: 'medium',
    type: '设备',
    summary: '设备故障',
    details: '黄骅港装船设备临时检修。',
    time: '2024-06-01 09:00',
    target: null
  },
  {
    id: 3,
    severity: 'medium',
    type: '延误',
    summary: '船舶延误',
    details: '国电15延误，预计晚到港2天。',
    time: '2024-06-01 08:00',
    target: { ship: '国电15', routeIdx: 0 }
  },
  {
    id: 4,
    severity: 'low',
    type: '拥堵',
    summary: '天津港拥堵',
    details: '天津港排队时间增加，预计影响国电15。',
    time: '2024-06-01 07:00',
    target: { ship: '国电15', routeIdx: 0 }
  },
  {
    id: 5,
    severity: 'info',
    type: '计划变更',
    summary: '租船1计划调整',
    details: '租船1计划临时调整，预计提前1天到港。',
    time: '2024-06-01 06:00',
    target: { ship: '租船1', routeIdx: 4 }
  }
]);
const severityTypeMap = {
  high: 'error',
  medium: 'warning',
  low: 'info',
  info: 'info',
};

// 高亮相关状态
const hoverRouteIdx = ref(null);

// 计算横幅显示的预警（最严重且最新）
const bannerWarning = computed(() => {
  // 按severity优先级和时间排序，取第一条
  const severityOrder = { high: 1, medium: 2, low: 3, info: 4 };
  return warnings.value
    .slice()
    .sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.time) - new Date(a.time);
    })[0];
});

function createTable() {
  // 港口和泊位
  const ports = ['重庆煤炭泊位', '宜宾煤炭泊位', '泸州集装箱泊位', '万州散货泊位',
    '武汉煤炭泊位', '岳阳集装箱泊位', '九江散货泊位',
    '南京煤炭泊位', '镇江集装箱泊位', '上海煤炭泊位'];
  const states = ['装船', '运输', '卸船'];
  const table = mainTable.value;
  if (!table) return;

  // 清空表格内容
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  table.style.width = '100%';
  table.style.tableLayout = 'fixed';

  // 表头
  const headerRow = table.insertRow();
  const headerCell = headerRow.insertCell();
  headerCell.colSpan = 2;
  headerCell.textContent = '江运主要港口运行图';
  headerCell.className = 'table-cell region-header header-right-strong';
  headerCell.style.width = '160px';

  // 日期列
  for (let i = 0; i < 31; i++) {
    const isDash = (i + 1) % 10 === 0;
    const cell = headerRow.insertCell();
    cell.style.textAlign = 'center';
    cell.style.width = '40px';
    if (isDash) cell.style.borderRight = '2px dashed #0070c0';
    cell.className = 'empty-cell';
  }

  // 每个港口3行（装船、运输、卸船）
  ports.forEach((port) => {
    for (let i = 0; i < 3; i++) {
      const row = table.insertRow();
      row.style.height = '30px';
      if (i === 0) row.classList.add('top-border-strong');
      if (i === 2) row.classList.add('bottom-border-strong');

      // 港口名只在第一行显示
      if (i === 0) {
        const portCell = row.insertCell();
        portCell.rowSpan = 3;
        portCell.textContent = port;
        portCell.className = 'table-cell first-col-strong';
      }
      // 状态列
      const stateCell = row.insertCell();
      stateCell.textContent = states[i];
      stateCell.className = 'table-cell status-col';
      // 日期列
      for (let j = 0; j < 31; j++) {
        const cell = row.insertCell();
        if ((j + 1) % 10 === 0) {
          cell.style.borderRight = '2px dashed #0070c0';
          cell.style.borderLeft = '1px dashed #0070c0';
        }
        cell.className = 'empty-cell';
      }
    }
  });

  drawShipRoute();
}

function drawShipRoute() {
  const table = mainTable.value;
  const svgContainer = document.querySelector('.svg-container');
  if (!table || !svgContainer) {
    console.warn('表格或svgContainer未找到');
    return;
  }

  svgContainer.innerHTML = '';
  svgContainer.style.width = table.offsetWidth + 'px';
  svgContainer.style.height = table.offsetHeight + 'px';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', table.offsetWidth);
  svg.setAttribute('height', table.offsetHeight);
  svg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;');
  svgContainer.appendChild(svg);

  const ports = ['重庆煤炭泊位', '宜宾煤炭泊位', '泸州集装箱泊位', '万州散货泊位',
    '武汉煤炭泊位', '岳阳集装箱泊位', '九江散货泊位',
    '南京煤炭泊位', '镇江集装箱泊位', '上海煤炭泊位'];
  const states = ['装船', '运输', '卸船'];

  function getCellPosition(port, state, day) {
    const portIndex = ports.indexOf(port);
    const stateIndex = states.indexOf(state);
    const rowIndex = 1 + portIndex * 3 + stateIndex;
    const colIndex = day + 1;
    const row = table.rows[rowIndex];
    if (!row) {
      console.warn('找不到行', port, state, day, rowIndex);
      return null;
    }
    const cell = row.cells[colIndex];
    if (!cell) {
      console.warn('找不到单元格', port, state, day, rowIndex, colIndex);
      return null;
    }
    const rect = cell.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    return {
      x: rect.left - tableRect.left + rect.width / 2,
      y: rect.top - tableRect.top + rect.height / 2
    };
  }

  function drawRoute(routePoints, color, shipName, idx) {
    let pathData = '';
    let lastPos = null;
    routePoints.forEach((point, i) => {
      const pos = getCellPosition(point.port, point.state, point.day);
      if (!pos) {
        console.warn('跳过无效点', point);
        return;
      }
      if (i === 0) {
        pathData += `M ${pos.x} ${pos.y}`;
      } else if (lastPos) {
        if (point.day === routePoints[i - 1].day) {
          pathData += ` L ${lastPos.x} ${pos.y} L ${pos.x} ${pos.y}`;
        } else {
          pathData += ` L ${pos.x} ${pos.y}`;
        }
      }
      lastPos = pos;
    });
    if (pathData) {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', color);
      path.setAttribute('fill', 'none');
      path.setAttribute('data-route-idx', idx);
      if (hoverRouteIdx.value === idx) {
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-opacity', '0.8');
        path.setAttribute('filter', 'drop-shadow(0 0 4px #888)');
      } else {
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-opacity', '1');
        path.removeAttribute('filter');
      }
      group.appendChild(path);
      if (shipName) {
        const first = routePoints[0];
        const pos = getCellPosition(first.port, first.state, first.day);
        if (pos) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', pos.x);
          text.setAttribute('y', pos.y - 10);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', '#000');
          text.setAttribute('font-size', '12px');
          text.textContent = shipName;
          group.appendChild(text);
        }
      }
      group.setAttribute('style', 'pointer-events: auto; cursor: pointer;');
      group.addEventListener('mouseenter', () => {
        hoverRouteIdx.value = idx;
        updateRouteHighlight();
      });
      group.addEventListener('mouseleave', () => {
        hoverRouteIdx.value = null;
        updateRouteHighlight();
      });
      svg.appendChild(group);
    }
  }

  function updateRouteHighlight() {
    const svg = svgContainer.querySelector('svg');
    if (!svg) return;
    const paths = svg.querySelectorAll('path');
    paths.forEach((path, i) => {
      if (hoverRouteIdx.value === i) {
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-opacity', '0.8');
        path.setAttribute('filter', 'drop-shadow(0 0 4px #888)');
      } else {
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-opacity', '1');
        path.removeAttribute('filter');
      }
    });
  }

  // 合理的江运运行线
  // 需求线1：重庆煤炭泊位->上海煤炭泊位
  const routePoints1 = [
    { port: '重庆煤炭泊位', state: '装船', day: 2 },
    { port: '重庆煤炭泊位', state: '运输', day: 5 },
    { port: '上海煤炭泊位', state: '运输', day: 20 },
    { port: '上海煤炭泊位', state: '卸船', day: 22 }
  ];
  // 需求线2：武汉煤炭泊位->南京煤炭泊位
  const routePoints2 = [
    { port: '武汉煤炭泊位', state: '装船', day: 3 },
    { port: '武汉煤炭泊位', state: '运输', day: 6 },
    { port: '南京煤炭泊位', state: '运输', day: 15 },
    { port: '南京煤炭泊位', state: '卸船', day: 17 }
  ];
  // 实际线（自有船，红）
  const routePoints3 = [
    { port: '重庆煤炭泊位', state: '装船', day: 2 },
    { port: '重庆煤炭泊位', state: '运输', day: 6 },
    { port: '南京煤炭泊位', state: '运输', day: 15 },
    { port: '南京煤炭泊位', state: '卸船', day: 18 }
  ];
  // 实际线（租船，橙1）
  const routePoints4 = [
    { port: '宜宾煤炭泊位', state: '装船', day: 4 },
    { port: '宜宾煤炭泊位', state: '运输', day: 7 },
    { port: '上海煤炭泊位', state: '运输', day: 21 },
    { port: '上海煤炭泊位', state: '卸船', day: 24 }
  ];
  // 实际线（租船，橙2）
  const routePoints5 = [
    { port: '万州散货泊位', state: '装船', day: 5 },
    { port: '万州散货泊位', state: '运输', day: 8 },
    { port: '镇江集装箱泊位', state: '运输', day: 18 },
    { port: '镇江集装箱泊位', state: '卸船', day: 21 }
  ];
  // 实际线（租船，橙3）
  const routePoints6 = [
    { port: '武汉煤炭泊位', state: '装船', day: 7 },
    { port: '武汉煤炭泊位', state: '运输', day: 10 },
    { port: '九江散货泊位', state: '运输', day: 14 },
    { port: '九江散货泊位', state: '卸船', day: 16 }
  ];

  // 绘制
  drawRoute(routePoints1, '#888888', null, 0); // 需求线1
  drawRoute(routePoints2, '#888888', null, 1); // 需求线2
  drawRoute(routePoints3, '#FF0000', '自有船A', 2); // 实际线（红）
  drawRoute(routePoints4, '#FFA500', '租船1', 3); // 实际线（橙）
  drawRoute(routePoints5, '#FFA500', '租船2', 4); // 实际线（橙）
  drawRoute(routePoints6, '#FFA500', '租船3', 5); // 实际线（橙）

  // 调试输出
  console.log('表格行数', table.rows.length, 'SVG宽高', svg.getAttribute('width'), svg.getAttribute('height'));
}

function locateOnChart(routeIdx) {
  // 高亮对应线条
  hoverRouteIdx.value = routeIdx;
  // 更新高亮
  const svg = svgContainer.value?.querySelector('svg');
  if (svg) {
    const paths = svg.querySelectorAll('path');
    paths.forEach((path, i) => {
      if (routeIdx === i) {
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-opacity', '0.8');
        path.setAttribute('filter', 'drop-shadow(0 0 4px #888)');
      } else {
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-opacity', '1');
        path.removeAttribute('filter');
      }
    });
  }
  // 滚动到图表区域
  const chartArea = document.querySelector('.chart-main-area');
  if (chartArea) {
    chartArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function bannerStyle(severity) {
  if (severity === 'high') {
    return 'display: flex; align-items: center; background: #fdecea; border: 1px solid #f5c2c7; border-radius: 4px; padding: 12px 20px; margin-bottom: 16px; color: #b71c1c;';
  } else if (severity === 'medium') {
    return 'display: flex; align-items: center; background: #fff4e5; border: 1px solid #ffd59e; border-radius: 4px; padding: 12px 20px; margin-bottom: 16px; color: #ad6800;';
  } else if (severity === 'low') {
    return 'display: flex; align-items: center; background: #e8f7ff; border: 1px solid #b3e5fc; border-radius: 4px; padding: 12px 20px; margin-bottom: 16px; color: #096dd9;';
  } else {
    return 'display: flex; align-items: center; background: #f4f8fb; border: 1px solid #d3e2ef; border-radius: 4px; padding: 12px 20px; margin-bottom: 16px; color: #333;';
  }
}

function bannerBtnStyle(severity) {
  if (severity === 'high') {
    return 'margin-left: 24px; color: #b71c1c; font-weight: bold;';
  } else if (severity === 'medium') {
    return 'margin-left: 24px; color: #ad6800; font-weight: bold;';
  } else if (severity === 'low') {
    return 'margin-left: 24px; color: #096dd9; font-weight: bold;';
  } else {
    return 'margin-left: 24px; color: #333; font-weight: bold;';
  }
}

function bannerIcon(severity) {
  if (severity === 'high') return WarningFilled;
  if (severity === 'medium') return InfoFilled;
  if (severity === 'low') return CircleCheckFilled;
  return InfoFilled;
}

onMounted(() => {
  createTable();
  // 确保在表格渲染完成后绘制线条
  setTimeout(() => {
    drawShipRoute();
    // 调试输出
    console.log('表格', mainTable.value, 'SVG容器', svgContainer.value);
  }, 100);
});
</script>

<style lang="scss" scoped>
.btn-group {
  display: flex;
  gap: 10px;
}

:deep(.el-select),
:deep(.el-date-editor) {
  width: 100%;
}

:deep(.ele-card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  font-weight: 500;
}

:deep(.ele-card-body) {
  padding: 20px;
}

.form-footer-btns {
  padding: 18px 24px 8px 24px;
  display: flex;
  justify-content: flex-start;
}

.gantt-chart-title {
  text-align: center;
  margin-bottom: 15px;
}
.gantt-chart-title h2,
.gantt-chart-title h4 {
  color: #222;
  margin: 5px 0;
}
.gantt-chart-title h2 {
  font-size: 1.4em;
}
.gantt-chart-title h4 {
  font-size: 0.9em;
  font-weight: normal;
  color: #555;
}
.chart-edit-area {
  margin-bottom: 15px;
  max-width: 100%;
}
.chart-main-area {
  flex-grow: 1;
  position: relative;
  min-height: 600px;
  overflow-x: auto;
  white-space: nowrap;
}
#mainTable {
  border-collapse: collapse;
  table-layout: fixed;
  border: 2px solid #0070c0;
  color: #222;
  min-width: 1200px;
  width: auto;
}
#mainTable th,
#mainTable td {
  border: 1px solid #0070c0;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  text-align: center;
  vertical-align: middle;
  font-size: 13px;
}
.table-cell {
  border: 1px solid #0070c0;
  width: 80px;
  min-width: 80px;
  height: 30px;
  min-height: 30px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  text-align: center;
  background-color: #fff;
  color: #222;
}
.empty-cell {
  border: 1px solid #b3d8f6;
  width: 40px;
  min-width: 40px;
  height: 30px;
  min-height: 30px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  background-color: #fff;
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
.first-col-strong {
  border-right: 2px solid #0070c0 !important;
}
.last-col-strong {
  border-left: 2px solid #0070c0 !important;
}
.chart-title-center {
  text-align: center;
}
.chart-title-center h2, .chart-title-center h4 {
  display: block;
  margin: 0 auto;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-line {
  display: inline-block;
  width: 24px;
  height: 3px;
  border-radius: 2px;
}

.legend-text {
  font-size: 14px;
  color: #333;
}

.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>

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
                  <h2>航运运行图（2024年第一季度）</h2>
                  <h4>国家能源集团航运公司 – 福建公司</h4>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #888888"></span>
                    <span class="legend-text">需求线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #0070C0"></span>
                    <span class="legend-text">自有船计划线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #00B050"></span>
                    <span class="legend-text">租船计划线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #FF0000"></span>
                    <span class="legend-text">自有船实际线</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line" style="background-color: #FFA500"></span>
                    <span class="legend-text">租船实际线</span>
                  </div>
                </div>
              </div>
              <div class="chart-edit-area mb-3 text-center" style="padding-right: 20px;">
                <div class="d-flex justify-content-center">
                  <div style="width:100%;max-width:fit-content;position:relative;">
                    <div id="table-number-labels" style="position:relative;height:24px;margin-bottom:2px;"></div>
                    <div class="chart-main-area" style="flex-grow: 1; position: relative; min-height: 600px; padding-right: 50px; overflow-x: auto;">
                      <div style="position: relative; overflow: visible;">
                        <table 
                          border="1"
                          style="border-collapse: collapse; border: 2px solid #0070c0; table-layout: fixed;"
                          id="mainTable"
                          ref="mainTable"
                        ></table>
                        <div ref="svgContainer" class="svg-container"></div>
                        <div ref="timelineLayer" class="timeline-layer"></div>
                      </div>
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
import { drawRouteLine } from '@/utils/ship-route-draw';
import { SHIP_ROUTE_COLORS } from '@/utils/ship-route-colors';
import { createShipRouteTable } from '@/utils/ship-route-table';

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
const timelineLayer = ref(null);

const drawerVisible = ref(false);
const warnings = ref([
  {
    id: 1,
    severity: 'high',
    type: '气象',
    summary: '渤海湾大风预警',
    details: '预计48小时内渤海湾将有8-9级大风，影响天津港和黄骅港船舶进出港。建议国电15、国电16、租船1等船舶调整靠泊计划。',
    time: '2024-02-18 08:30',
    target: null
  },
  {
    id: 2,
    severity: 'medium',
    type: '设备',
    summary: '黄骅港装船设备故障',
    details: '黄骅港3号装船机突发故障，预计维修时间6小时。可能影响国电16、国电17的装船进度。',
    time: '2024-02-18 07:15',
    target: { ship: '国电16', routeIdx: 1 }
  },
  {
    id: 3,
    severity: 'medium',
    type: '延误',
    summary: '国电18卸船延误',
    details: '国电18在鸿山电厂卸船进度较慢，预计比计划晚1天完成。可能影响后续航次安排。',
    time: '2024-02-18 06:45',
    target: { ship: '国电18', routeIdx: 5 }
  },
  {
    id: 4,
    severity: 'low',
    type: '拥堵',
    summary: '天津港排队时间增加',
    details: '天津港船舶排队时间增加至12小时，建议国电15、租船1提前安排靠泊申请。',
    time: '2024-02-18 06:00',
    target: { ship: '国电15', routeIdx: 0 }
  },
  {
    id: 5,
    severity: 'info',
    type: '计划变更',
    summary: '国电19计划调整',
    details: '国电19计划提前1天到福州电厂，预计第50天抵港。请相关方做好接卸准备。',
    time: '2024-02-18 05:30',
    target: { ship: '国电19', routeIdx: 6 }
  },
  {
    id: 6,
    severity: 'low',
    type: '天气',
    summary: '福州地区雾霾天气',
    details: '福州地区出现雾霾天气，能见度降低，可能影响国电19、国电20的靠泊作业。',
    time: '2024-02-18 05:00',
    target: { ship: '国电19', routeIdx: 6 }
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
  const table = mainTable.value;
  if (!table) return;

  // 使用新的表格创建函数
  const result = createShipRouteTable(table, {
    title: '福建公司',
    rightTitle: '北方装港',
    loadingPorts: ['天津', '黄骅', '社会港'],
    unloadingPorts: ['连江电厂', '福州电厂', '泉州电厂', '鸿山电厂'],
    days: 90,
    specialGaps: { '社会港': 120 },
    monthDividers: [31, 59, 89],
    tenDayDividers: 10
  });

  // 在创建完表格后绘制运行线
  // drawShipRoute();
  nextTick(() => {
    renderNumberLabels();
  });
}

// 绘制船舶运行线
function drawShipRoute() {
  const table = mainTable.value;
  const svgContainer = document.querySelector('.svg-container');
  if (!table || !svgContainer) return;

  svgContainer.innerHTML = '';
  svgContainer.style.width = table.offsetWidth + 'px';
  svgContainer.style.height = table.offsetHeight + 'px';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', table.offsetWidth);
  svg.setAttribute('height', table.offsetHeight);
  svg.setAttribute('style', 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;');
  svgContainer.appendChild(svg);

  // 港口和状态映射
  const ports = ['天津', '黄骅', '社会港', '连江电厂', '福州电厂', '泉州电厂', '鸿山电厂'];
  const statesMap = {
    '天津': ['交接|待离', '装船', '抵港|待装'],
    '黄骅': ['交接|待离', '装船', '抵港|待装'],
    '社会港': ['交接|待离', '装船', '抵港|待装'],
    '连江电厂': ['抵港|待泊', '卸船', '交接|离港'],
    '福州电厂': ['抵港|待泊', '卸船', '交接|离港'],
    '泉州电厂': ['抵港|待泊', '卸船', '交接|离港'],
    '鸿山电厂': ['抵港|待泊', '卸船', '交接|离港']
  };

  // z自有船计划线1
  const routePoints1 = [
    { port: '天津', state: '抵港|待装', day: 0, hour: 2, anchor: 'center' },
    { port: '天津', state: '装船', day: 0, hour: 2, anchor: 'center' },
    { port: '天津', state: '装船', day: 2, hour: 2, anchor: 'center' },
    { port: '天津', state: '交接|待离', day: 2, hour: 2, anchor: 'center' },
    { port: '天津', state: '交接|待离', day: 2, hour: 12, anchor: 'center' },
    { port: '天津', state: '抵港|待装', day: 2, hour: 12, anchor: 'bottom' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 7, hour: 2, anchor: 'top' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 7, hour: 2, anchor: 'center' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 8, hour: 2, anchor: 'center' },
    { port: '鸿山电厂', state: '卸船', day: 8, hour: 2, anchor: 'center' },
    { port: '鸿山电厂', state: '卸船', day: 12, hour: 2, anchor: 'center' },
    { port: '鸿山电厂', state: '交接|离港', day: 12, hour: 2, anchor: 'center' },
    { port: '鸿山电厂', state: '交接|离港', day: 12, hour: 12, anchor: 'center' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 12, hour: 12, anchor: 'top' }
  ];

  const routePoints2_ = [
    { port: '黄骅', state: '抵港|待装', day: 2, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 2, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 3, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 3, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 3, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 9, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 9, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 11, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 11, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 15, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 15, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 15, anchor: 'top' }
  ];

  const routePoints2 = [
    { port: '黄骅', state: '抵港|待装', day: 2, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 2, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 4, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 4, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 4, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 10, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 10, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 12, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 12, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 16, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 16, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 16, anchor: 'top' }
  ];

  const routePoints3 = [
    { port: '黄骅', state: '抵港|待装', day: 10, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 10, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 12, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 12, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 12, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 18, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 18, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 21, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 21, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 24, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 24, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 24, anchor: 'top' },
    { port: '黄骅', state: '抵港|待装', day: 28, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 28, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 30, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 30, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 30, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 36, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 36, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 39, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 39, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 41, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 41, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 41, anchor: 'top' }
  ];

  const routePoints3_ = [
    { port: '黄骅', state: '抵港|待装', day: 10, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 10, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 12, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 12, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 12, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 19, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 19, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 22, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 22, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 26, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 26, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 26, anchor: 'top' },
    { port: '黄骅', state: '抵港|待装', day: 30, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 30, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 31, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 31, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 31, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 37, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 37, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 40, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 40, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 42, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 42, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 42, anchor: 'top' }
  ];

  const routePoints4 = [
    { port: '社会港', state: '抵港|待装', day: 12, anchor: 'center' },
    { port: '社会港', state: '装船', day: 12, anchor: 'center' },
    { port: '社会港', state: '装船', day: 14, anchor: 'center' },
    { port: '社会港', state: '交接|待离', day: 14, anchor: 'center' },
    { port: '社会港', state: '抵港|待装', day: 14, anchor: 'bottom' },
    { port: '泉州电厂', state: '抵港|待泊', day: 20, anchor: 'top' },
    { port: '泉州电厂', state: '抵港|待泊', day: 20, anchor: 'center' },
    { port: '泉州电厂', state: '抵港|待泊', day: 23, anchor: 'center' },
    { port: '泉州电厂', state: '卸船', day: 23, anchor: 'center' },
    { port: '泉州电厂', state: '卸船', day: 26, anchor: 'center' },
    { port: '泉州电厂', state: '交接|离港', day: 26, anchor: 'center' },
    { port: '泉州电厂', state: '抵港|待泊', day: 26, anchor: 'top' },
    { port: '天津', state: '抵港|待装', day: 30, anchor: 'center' },
    { port: '天津', state: '装船', day: 30, anchor: 'center' },
    { port: '天津', state: '装船', day: 32, anchor: 'center' },
    { port: '天津', state: '交接|待离', day: 32, anchor: 'center' },
    { port: '天津', state: '抵港|待装', day: 32, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 39, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 39, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 41, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 41, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 44, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 44, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 44, anchor: 'top' }
  ];

  // 复制routePoints1~routePoints4，每个天数+40
  const routePoints1b = [
    { port: '天津', state: '抵港|待装', day: 40, anchor: 'center' },
    { port: '天津', state: '装船', day: 40, anchor: 'center' },
    { port: '天津', state: '装船', day: 42, anchor: 'center' },
    { port: '天津', state: '交接|待离', day: 42, anchor: 'center' },
    { port: '天津', state: '抵港|待装', day: 42, anchor: 'bottom' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 47, anchor: 'top' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 47, anchor: 'center' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 48, anchor: 'center' },
    { port: '鸿山电厂', state: '卸船', day: 48, anchor: 'center' },
    { port: '鸿山电厂', state: '卸船', day: 52, anchor: 'center' },
    { port: '鸿山电厂', state: '交接|离港', day: 52, anchor: 'center' },
    { port: '鸿山电厂', state: '抵港|待泊', day: 52, anchor: 'top' }
  ];
  const routePoints2b = [
    { port: '黄骅', state: '抵港|待装', day: 42, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 42, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 44, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 44, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 44, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 50, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 50, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 52, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 52, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 56, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 56, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 56, anchor: 'top' }
  ];
  const routePoints3b = [
    { port: '黄骅', state: '抵港|待装', day: 50, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 50, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 52, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 52, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 52, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 58, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 58, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 61, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 61, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 64, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 64, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 64, anchor: 'top' },
    { port: '黄骅', state: '抵港|待装', day: 68, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 68, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 70, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 70, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 70, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 76, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 76, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 79, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 79, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 81, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 81, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 81, anchor: 'top' }
  ];
  const routePoints4b = [
    { port: '黄骅', state: '抵港|待装', day: 55, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 55, anchor: 'center' },
    { port: '黄骅', state: '装船', day: 57, anchor: 'center' },
    { port: '黄骅', state: '交接|待离', day: 57, anchor: 'center' },
    { port: '黄骅', state: '抵港|待装', day: 57, anchor: 'bottom' },
    { port: '泉州电厂', state: '抵港|待泊', day: 63, anchor: 'top' },
    { port: '泉州电厂', state: '抵港|待泊', day: 63, anchor: 'center' },
    { port: '泉州电厂', state: '抵港|待泊', day: 66, anchor: 'center' },
    { port: '泉州电厂', state: '卸船', day: 66, anchor: 'center' },
    { port: '泉州电厂', state: '卸船', day: 69, anchor: 'center' },
    { port: '泉州电厂', state: '交接|离港', day: 69, anchor: 'center' },
    { port: '泉州电厂', state: '抵港|待泊', day: 69, anchor: 'top' },
    { port: '天津', state: '抵港|待装', day: 73, anchor: 'center' },
    { port: '天津', state: '装船', day: 73, anchor: 'center' },
    { port: '天津', state: '装船', day: 75, anchor: 'center' },
    { port: '天津', state: '交接|待离', day: 75, anchor: 'center' },
    { port: '天津', state: '抵港|待装', day: 75, anchor: 'bottom' },
    { port: '福州电厂', state: '抵港|待泊', day: 82, anchor: 'top' },
    { port: '福州电厂', state: '抵港|待泊', day: 82, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 84, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 84, anchor: 'center' },
    { port: '福州电厂', state: '卸船', day: 87, anchor: 'center' },
    { port: '福州电厂', state: '交接|离港', day: 87, anchor: 'center' },
    { port: '福州电厂', state: '抵港|待泊', day: 87, anchor: 'top' }
  ];

  drawRouteLine(svg, table, routePoints2_, { color: SHIP_ROUTE_COLORS.plan1, width: 2, ports, statesMap, shipName: '国电16', isPlan: true, currentDay: 49 });
  drawRouteLine(svg, table, routePoints1, { color: SHIP_ROUTE_COLORS.actual1, width: 2, ports, statesMap, shipName: '国电15' });
  drawRouteLine(svg, table, routePoints2, { color: SHIP_ROUTE_COLORS.actual1, width: 2, ports, statesMap, shipName: '国电16' });
  drawRouteLine(svg, table, routePoints3, { color: SHIP_ROUTE_COLORS.actual2, width: 2, ports, statesMap, shipName: '国电17' });
  drawRouteLine(svg, table, routePoints3_, { color: SHIP_ROUTE_COLORS.plan2, width: 2, ports, statesMap, shipName: '国电17', isPlan: true, currentDay: 49 });
  drawRouteLine(svg, table, routePoints4, { color: SHIP_ROUTE_COLORS.actual1, width: 2, ports, statesMap, shipName: '租船1' });
  drawRouteLine(svg, table, routePoints1b, { color: SHIP_ROUTE_COLORS.actual2, width: 2, ports, statesMap, shipName: '国电18' });
  drawRouteLine(svg, table, routePoints2b, { color: SHIP_ROUTE_COLORS.plan1, width: 2, ports, statesMap, shipName: '国电19', isPlan: true, currentDay: 49 });
  drawRouteLine(svg, table, routePoints3b, { color: SHIP_ROUTE_COLORS.plan1, width: 2, ports, statesMap, shipName: '国电20', isPlan: true, currentDay: 49 });
  drawRouteLine(svg, table, routePoints4b, { color: SHIP_ROUTE_COLORS.demand, width: 2, ports, statesMap, shipName: '租船2' });
}

function drawTimelineLayer() {
  const table = mainTable.value;
  const layer = timelineLayer.value;
  if (!table || !layer) return;
  // 当前时刻线在第50列
  const day = 49; // 索引从0开始，第50列
  // 用表头第50列的left
  const headerCell = table.rows[0]?.cells[day + 1];
  const tableRect = table.getBoundingClientRect();
  if (!headerCell) return;
  const x = headerCell.getBoundingClientRect().left - tableRect.left;
  // 取表格最上面和最下面的cell
  const topCell = table.rows[1]?.cells[day + 1];
  const bottomCell = table.rows[table.rows.length - 2]?.cells[day + 1];
  if (!topCell || !bottomCell) return;
  const topRect = topCell.getBoundingClientRect();
  const bottomRect = bottomCell.getBoundingClientRect();
  const y1 = topRect.top - tableRect.top;
  const y2 = bottomRect.top - tableRect.top + bottomRect.height;
  // 设置layer样式
  layer.innerHTML = `<div style="position:absolute;left:${x - 1}px;top:${y1}px;height:${y2 - y1}px;width:2px;background: repeating-linear-gradient(to bottom, #FF0000, #FF0000 6px, transparent 6px, transparent 10px);z-index:10;pointer-events:none;"></div>
    <div style="position:absolute;left:${x - 30}px;top:${y1 - 24}px;color:#FF0000;font-size:13px;font-weight:bold;z-index:11;pointer-events:none;">当前时刻</div>`;
}

function syncNumberLabelsScroll() {
  const chartArea = document.querySelector('.chart-main-area');
  const numberLabels = document.getElementById('table-number-labels');
  if (chartArea && numberLabels) {
    numberLabels.style.left = -chartArea.scrollLeft + 'px';
  }
}

onMounted(() => {
  createTable();
  setTimeout(() => {
    drawShipRoute();
    renderNumberLabels();
    syncNumberLabelsScroll();
    // 监听横向滚动
    const chartArea = document.querySelector('.chart-main-area');
    if (chartArea) {
      chartArea.addEventListener('scroll', syncNumberLabelsScroll);
    }
  }, 100);
});

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

function renderNumberLabels() {
  const table = mainTable.value;
  if (!table) return;
  const labels = [
    { col: 0, text: '1' },
    { col: 31, text: '2' },
    { col: 59, text: '3' },
    { col: 90, text: '4' }
  ];
  const container = document.getElementById('table-number-labels');
  if (!container) return;
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.width = table.offsetWidth + 'px';
  container.style.height = '24px';
  container.style.pointerEvents = 'none';

  labels.forEach(label => {
    const cell = table.rows[0].cells[label.col];
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    const x = rect.left - tableRect.left + rect.width;
    const div = document.createElement('div');
    div.textContent = label.text;
    div.style.position = 'absolute';
    div.style.left = `${x - 10}px`;
    div.style.top = '0';
    div.style.width = '20px';
    div.style.textAlign = 'center';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '16px';
    div.style.color = '#0070c0';
    container.appendChild(div);
  });
  // 初始对齐
  syncNumberLabelsScroll();
}

window.addEventListener('resize', () => {
  drawShipRoute();
  drawTimelineLayer();
  renderNumberLabels();
  syncNumberLabelsScroll();
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

.timeline-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
</style>

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
            <div class="statistics-grid">
              <!-- 左上：本周泊位使用率趋势 -->
              <div class="statistics-item">
                <div class="chart-title">本周泊位使用率趋势</div>
                <div ref="lineChartRef" class="chart-box"></div>
              </div>
              <!-- 右上：港口泊位数量分布 -->
              <div class="statistics-item">
                <div class="chart-title">港口泊位数量分布</div>
                <div ref="pieChartRef" class="chart-box"></div>
              </div>
              <!-- 左下：各港口泊位数量统计 -->
              <div class="statistics-item">
                <div class="chart-title">各港口泊位数量统计</div>
                <div ref="barChartRef" class="chart-box"></div>
              </div>
              <!-- 右下：泊位热力图 -->
              <div class="statistics-item">
                <div class="chart-title">泊位热力图</div>
                <div ref="heatmapChartRef" class="chart-box"></div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <!-- 港口基础信息 -->
      <el-tab-pane label="港口基础信息" name="basic">
        <!-- 搜索栏 -->
        <div class="search-container">
          <el-input v-model="searchForm.keyword" placeholder="请输入港口名/泊位名称搜索" class="search-input" clearable @clear="resetSearch" @keyup.enter="handleSearch" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="success" @click="handleExportExcel">下载Excel</el-button>
          <el-button type="primary" @click="handleAdd">新增港口</el-button>
        </div>
        <!-- 表格 -->
        <el-table :data="portList" border style="width: 100%" @selection-change="handleSelectionChange">
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
          <el-table-column prop="frontDepth" label="泊位前沿水深(米)" min-width="120" />
          <el-table-column prop="berthLength" label="泊位长度(米)" min-width="100" />
          <el-table-column prop="berthWidth" label="泊位宽度(米)" min-width="100" />
          <el-table-column prop="shipCondition" label="可靠船舶条件" min-width="120" />
          <el-table-column prop="machineCount" label="装卸机械数量" min-width="100" />
          <el-table-column prop="capacity" label="装卸能力(吨/时)" min-width="120" />
          <el-table-column prop="shorePower" label="岸电情况" min-width="100" />
          <el-table-column prop="remark" label="备注" min-width="120" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button link @click="handleView(scope.row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
          style="margin-top: 20px;"
        />
      </el-tab-pane>
      <!-- 港口具体信息 -->
      <el-tab-pane label="港口具体信息" name="detail">
        <div v-if="selectedPorts.length === 0" class="empty-detail">
          <el-empty description="请在港口基础信息页面选择需要查看的港口" />
        </div>
        <template v-else>
          <div v-for="port in selectedPorts" :key="port.id" class="port-detail-card">
            <div class="detail-card-header">
              <h3 class="detail-card-title">{{ port.portName }} - {{ port.berthName }}</h3>
            </div>
            <el-descriptions title="基础信息" :column="3" border>
              <el-descriptions-item label="港口名">{{ port.portName }}</el-descriptions-item>
              <el-descriptions-item label="港口代码">{{ port.portCode }}</el-descriptions-item>
              <el-descriptions-item label="泊位号">{{ port.berthNo }}</el-descriptions-item>
              <el-descriptions-item label="泊位名称">{{ port.berthName }}</el-descriptions-item>
              <el-descriptions-item label="港口类型">{{ port.portType }}</el-descriptions-item>
              <el-descriptions-item label="所属公司">{{ port.company }}</el-descriptions-item>
              <el-descriptions-item label="航道/港池">{{ port.channel }}</el-descriptions-item>
              <el-descriptions-item label="吃水(米)">{{ port.draft }}</el-descriptions-item>
              <el-descriptions-item label="泊位前沿水深(米)">{{ port.frontDepth }}</el-descriptions-item>
              <el-descriptions-item label="泊位长度(米)">{{ port.berthLength }}</el-descriptions-item>
              <el-descriptions-item label="泊位宽度(米)">{{ port.berthWidth }}</el-descriptions-item>
              <el-descriptions-item label="最大靠泊吨位">{{ port.maxShip }}</el-descriptions-item>
              <el-descriptions-item label="可靠船舶条件">{{ port.shipCondition }}</el-descriptions-item>
              <el-descriptions-item label="装卸机械数量">{{ port.machineCount }}</el-descriptions-item>
              <el-descriptions-item label="装卸能力(吨/时)">{{ port.capacity }}</el-descriptions-item>
              <el-descriptions-item label="岸电情况">{{ port.shorePower }}</el-descriptions-item>
              <el-descriptions-item label="建成时间">{{ port.buildYear }}</el-descriptions-item>
              <el-descriptions-item label="管理单位">{{ port.manager }}</el-descriptions-item>
              <el-descriptions-item label="港口地址">{{ port.address }}</el-descriptions-item>
              <el-descriptions-item label="泊位设施描述">{{ port.facility }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ port.remark }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '新增港口' : '编辑港口'" v-model="dialogVisible" width="50%">
      <el-form ref="formRef" :model="portForm" :rules="rules" label-width="120px">
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

// 添加标签页和折叠面板状态
const activeTab = ref('statistics')
const activeCollapse = ref(['charts'])

// 添加统计数据
const statistics = reactive({
  total: 7,  // 总港口数（黄骅、曹妃甸、秦皇岛、天津、青岛、连云港、日照）
  berthTotal: 85, // 所有港口泊位总数
  berthAvailable: 78, // 可用泊位数
  berthUsageRate: '91.8%', // 泊位使用率
  berthMaintaining: 7, // 维护中泊位数
  todayBerthShip: 25 // 今日靠泊船舶数
})

// 添加图表数据
const chartData = reactive({
  weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  usageRate: [92, 89, 94, 91, 93, 88, 90],
  berthTypePie: [
    { value: 52, name: '煤炭泊位' },
    { value: 12, name: '集装箱泊位' },
    { value: 8, name: '散货泊位' },
    { value: 6, name: '液体泊位' },
    { value: 4, name: '杂货泊位' },
    { value: 3, name: '滚装泊位' }
  ],
  portNames: ['黄骅港', '曹妃甸', '秦皇岛', '天津港', '青岛港', '连云港', '日照港'],
  berthCounts: [15, 3, 21, 20, 15, 9, 2]
})

const allPortList = ref([
  {
    id: 1,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '100',
    berthName: '100号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '257.5',
    berthWidth: '30',
    shipCondition: '5万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 2,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '101',
    berthName: '101号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '257.5',
    berthWidth: '30',
    shipCondition: '5万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 3,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '102',
    berthName: '102号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '315',
    berthWidth: '30',
    shipCondition: '10万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 4,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '103',
    berthName: '103号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '290',
    berthWidth: '30',
    shipCondition: '3.5万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 5,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '200',
    berthName: '200号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '257.5',
    berthWidth: '30',
    shipCondition: '5万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 6,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '201',
    berthName: '201号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '257.5',
    berthWidth: '30',
    shipCondition: '5万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 7,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '202',
    berthName: '202号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '315',
    berthWidth: '30',
    shipCondition: '10万吨',
    machineCount: '1',
    capacity: '3000',
    shorePower: '高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 8,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '203',
    berthName: '203号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '290',
    berthWidth: '30',
    shipCondition: '3.5万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 9,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '301',
    berthName: '301号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '290',
    berthWidth: '30',
    shipCondition: '3.5万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压/低压 与401不能同时接高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 10,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '401',
    berthName: '401号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '290',
    berthWidth: '30',
    shipCondition: '3.5万吨',
    machineCount: '0',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 11,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '302',
    berthName: '302号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '248',
    berthWidth: '30',
    shipCondition: '7万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 12,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '402',
    berthName: '402号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '248',
    berthWidth: '30',
    shipCondition: '7万吨',
    machineCount: '0',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 13,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '303',
    berthName: '303号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '248',
    berthWidth: '30',
    shipCondition: '10万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 14,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '403',
    berthName: '403号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '248',
    berthWidth: '30',
    shipCondition: '7万吨',
    machineCount: '0',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
  },
  {
    id: 15,
    portName: '黄骅国能港区',
    portCode: 'HHGN',
    berthNo: '304',
    berthName: '304号煤炭泊位',
    channel: '黄骅港主航道',
    draft: '14.5',
    lakeType: '海港',
    nightNav: '可夜航',
    pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
    frontDepth: '14.5',
    berthLength: '286',
    berthWidth: '30',
    shipCondition: '10万吨',
    machineCount: '1',
    capacity: '5000',
    shorePower: '高压/低压',
    remark: '煤炭专用泊位',
    portType: '煤炭港',
    company: '国能集团航运公司'
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
      portName: '黄骅国能港区',
      portCode: 'HHGN',
      berthNo: '100',
      berthName: '100号煤炭泊位',
      channel: '黄骅港主航道',
      draft: '14.5',
      lakeType: '海港',
      nightNav: '可夜航',
      pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
      frontDepth: '14.5',
      berthLength: '257.5',
      berthWidth: '30',
      shipCondition: '5万吨',
      machineCount: '1',
      capacity: '3000',
      shorePower: '低压',
      remark: '煤炭专用泊位',
      portType: '煤炭港',
      company: '国能集团航运公司'
    },
    {
      id: 2,
      portName: '黄骅国能港区',
      portCode: 'HHGN',
      berthNo: '101',
      berthName: '101号煤炭泊位',
      channel: '黄骅港主航道',
      draft: '14.5',
      lakeType: '海港',
      nightNav: '可夜航',
      pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
      frontDepth: '14.5',
      berthLength: '257.5',
      berthWidth: '30',
      shipCondition: '5万吨',
      machineCount: '1',
      capacity: '3000',
      shorePower: '高压',
      remark: '煤炭专用泊位',
      portType: '煤炭港',
      company: '国能集团航运公司'
    },
    {
      id: 3,
      portName: '黄骅国能港区',
      portCode: 'HHGN',
      berthNo: '102',
      berthName: '102号煤炭泊位',
      channel: '黄骅港主航道',
      draft: '14.5',
      lakeType: '海港',
      nightNav: '可夜航',
      pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
      frontDepth: '14.5',
      berthLength: '315',
      berthWidth: '30',
      shipCondition: '10万吨',
      machineCount: '1',
      capacity: '3000',
      shorePower: '高压',
      remark: '煤炭专用泊位',
      portType: '煤炭港',
      company: '国能集团航运公司'
    },
    {
      id: 4,
      portName: '黄骅国能港区',
      portCode: 'HHGN',
      berthNo: '103',
      berthName: '103号煤炭泊位',
      channel: '黄骅港主航道',
      draft: '14.5',
      lakeType: '海港',
      nightNav: '可夜航',
      pilotage: '船舶证书载重吨85000T以内不强制；船舶证书载重吨85000T以上强制引水，但可申请自引（待批）',
      frontDepth: '14.5',
      berthLength: '290',
      berthWidth: '30',
      shipCondition: '3.5万吨',
      machineCount: '1',
      capacity: '5000',
      shorePower: '高压/低压',
      remark: '煤炭专用泊位',
      portType: '煤炭港',
      company: '国能集团航运公司'
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

// 图表ref
const lineChartRef = ref(null)
const pieChartRef = ref(null)
const barChartRef = ref(null)
const heatmapChartRef = ref(null)

let lineChart, pieChart, barChart, heatmapChart

function renderCharts() {
  // 1. 折线图
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: chartData.weekDays },
      yAxis: { type: 'value', name: '使用率(%)', min: 0, max: 100 },
      series: [{
        data: chartData.usageRate,
        type: 'line',
        areaStyle: { color: '#e0f3ff' },
        smooth: true,
        lineStyle: { color: '#409EFF' }
      }]
    })
  }
  // 2. 饼图
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { left: 'center', bottom: 0 },
      series: [{
        name: '泊位数量',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: { show: true, position: 'outside' },
        data: chartData.berthTypePie
      }]
    })
  }
  // 3. 柱状图
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
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
  // 4. 热力图
  if (heatmapChartRef.value) {
    heatmapChart = echarts.init(heatmapChartRef.value)
    const hours = chartData.weekDays
    const days = ['泊位1', '泊位2', '泊位3', '泊位4', '泊位5']
    const data = []
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        data.push([j, i, Math.floor(Math.random() * 100)])
      }
    }
    heatmapChart.setOption({
      tooltip: { position: 'top' },
      grid: { height: '70%', top: '10%' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true } },
      yAxis: { type: 'category', data: days, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', top: 0,
        inRange: { color: ['#e0f3ff','#409EFF'] }
      },
      series: [{
        name: '泊位热力',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
      }]
    })
  }
}

function resizeCharts() {
  lineChart?.resize()
  pieChart?.resize()
  barChart?.resize()
  heatmapChart?.resize()
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
}
.empty-detail {
  padding: 20px;
}
.port-detail-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}
.detail-card-header {
  margin-bottom: 20px;
}
.detail-card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.stats-container {
  display: flex;
  gap: 20px;
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
.statistics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
.statistics-item {
  background: #fff;
  border-radius: 8px;
  padding: 24px 24px 8px 24px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
}
</style>

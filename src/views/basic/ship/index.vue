<template>
  <div class="ship-container">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="ship-tabs">
      <!-- 船舶动态信息 -->
      <el-tab-pane label="船舶动态信息" name="statistics">
        <!-- 公司筛选下拉框 -->
        <el-select
          v-model="selectedCompany"
          placeholder="选择公司"
          style="width: 220px; margin-bottom: 16px"
        >
          <el-option
            v-for="item in companyShipStats"
            :key="item.company"
            :label="item.company"
            :value="item.company"
          />
        </el-select>
        <!-- 顶部统计卡片 -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-title">
              <el-icon><Ship /></el-icon> 船舶总数
            </div>
            <div class="stat-value">{{ currentStats.total }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">
              <el-icon><HomeFilled /></el-icon> 自有船
            </div>
            <div class="stat-value">{{ currentStats.owned }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">
              <el-icon><Tickets /></el-icon> 期租船
            </div>
            <div class="stat-value">{{ currentStats.timeCharter }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">
              <el-icon><Calendar /></el-icon> 航次租船
            </div>
            <div class="stat-value">{{ currentStats.voyageCharter }}</div>
          </div>
        </div>
        <!-- 船舶动态搜索框 -->
        <div class="ship-timeline-search" style="margin-bottom: 20px;">
          <el-form :inline="true" :model="timelineSearch" @submit.prevent>
            <el-form-item label="船名">
              <el-select
                v-model="timelineSearch.shipName"
                placeholder="全部"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="item in shipNameOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="航次号">
              <el-select
                v-model="timelineSearch.voyageNo"
                placeholder="全部"
                clearable
                style="width: 180px"
              >
                <el-option
                  v-for="item in voyageNoOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="抵达时间">
              <el-date-picker
                v-model="timelineSearch.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 300px"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTimelineSearch">
                查询
              </el-button>
              <el-button @click="resetTimelineSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 船舶动态横向航次卡片展示 -->
        <div class="ship-timeline-grouped">
          <div
            v-for="ship in paginatedGroupedVoyageData"
            :key="ship.shipName"
            class="ship-timeline-ship-row"
          >
            <div class="ship-timeline-ship-title">{{ ship.shipName }}</div>
            <div class="ship-timeline-voyage-list">
              <div
                v-for="voyage in ship.voyages"
                :key="voyage.voyageNo"
                class="ship-timeline-voyage-card"
              >
                <!-- 新版航次卡片内容 -->
                <div class="voyage-detail-card">
                  <div class="voyage-header">
                    <el-icon class="flag"><Ship /></el-icon>
                    <span class="port-name">{{ voyage.mainPort }}</span>
                    <span class="berth">{{ voyage.berth }}</span>
                    <el-tag size="small">{{ voyage.tag1 }}</el-tag>
                    <el-tag size="small" type="primary">
                      {{ voyage.tag2 }}
                    </el-tag>
                    <el-tag size="small" type="warning">
                      {{ voyage.tag3 }}
                    </el-tag>
                    <el-tag size="small" type="success">
                      {{ voyage.tag4 }}
                    </el-tag>
                  </div>
                  <div class="voyage-times">
                    <div>
                      <el-icon><UploadFilled /></el-icon>
                      离港：{{ voyage.departTime }}
                    </div>
                    <div>
                      <el-icon><Download /></el-icon>
                      靠泊：{{ voyage.berthTime }}
                    </div>
                    <div>
                      <el-icon><LocationFilled /></el-icon>
                      到港：{{ voyage.arriveTime }}
                    </div>
                  </div>
                  <div class="voyage-params">
                    <span>
                      <el-tooltip content="总停时（小时）" placement="top">
                        <el-icon><Clock /></el-icon>
                      </el-tooltip>
                      {{ voyage.duration }}
                    </span>
                    <span>
                      <el-tooltip content="装运量（吨）" placement="top">
                        <el-icon><Tickets /></el-icon>
                      </el-tooltip>
                      {{ voyage.distance }}
                    </span>
                    <span>
                      <el-tooltip content="港口效率（吨/小时）" placement="top">
                        <el-icon><HomeFilled /></el-icon>
                      </el-tooltip>
                      {{ voyage.speed }}
                    </span>
                    <span>
                      <el-tooltip content="实载率" placement="top">
                        <el-icon><Calendar /></el-icon>
                      </el-tooltip>
                      {{ voyage.draft }}
                    </span>
                    <span>
                      <el-tooltip content="卸运量（吨）" placement="top">
                        <el-icon><Ship /></el-icon>
                      </el-tooltip>
                      {{ voyage.tonnage }}
                    </span>
                  </div>
                  <div class="voyage-icons">
                    <el-tooltip content="定位" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M10 18c.28 0 .53-.11.71-.29l5.5-5.5A7 7 0 1 0 3.79 12.21l5.5 5.5c.18.18.43.29.71.29ZM10 10.5A2.5 2.5 0 1 1 10 5.5a2.5 2.5 0 0 1 0 5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="碳排放" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <text x="0" y="15" font-size="10" fill="currentColor">CO₂</text>
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="波浪/信号" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M2 15c2-2 4 2 6 0s4 2 6 0 4 2 4 0"
                            stroke="currentColor"
                            stroke-width="1.5"
                            fill="none"
                          />
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="统计" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="10"
                            width="2"
                            height="7"
                            fill="currentColor"
                          />
                          <rect
                            x="8"
                            y="6"
                            width="2"
                            height="11"
                            fill="currentColor"
                          />
                          <rect
                            x="13"
                            y="13"
                            width="2"
                            height="4"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="趋势" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M3 17l5-6 4 5 5-8"
                            stroke="currentColor"
                            stroke-width="1.5"
                            fill="none"
                          />
                          <circle cx="3" cy="17" r="1" fill="currentColor" />
                          <circle cx="8" cy="11" r="1" fill="currentColor" />
                          <circle cx="12" cy="16" r="1" fill="currentColor" />
                          <circle cx="17" cy="8" r="1" fill="currentColor" />
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="静音" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M3 8v4h4l5 5V3l-5 5H3zm13.5 2a4.5 4.5 0 0 1-4.5 4.5"
                            stroke="currentColor"
                            stroke-width="1.5"
                            fill="none"
                          />
                        </svg>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="天气" placement="top">
                      <span class="voyage-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <ellipse
                            cx="10"
                            cy="15"
                            rx="6"
                            ry="3"
                            fill="currentColor"
                            opacity=".3"
                          />
                          <circle cx="13" cy="10" r="4" fill="currentColor" />
                        </svg>
                      </span>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 添加分页组件 -->
          <div class="timeline-pagination">
            <span class="page-info">第 {{ timelineCurrentPage }} 页 / 共 {{ timelinePageCount }} 页</span>
            <el-pagination
              v-model:current-page="timelineCurrentPage"
              :page-size="timelinePageSize"
              :total="groupedVoyageData.length"
              layout="prev, pager, next, jumper"
              background
              @current-change="handleTimelinePageChange"
            />
          </div>
        </div>
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
            <el-select
              v-model="searchForm.status"
              placeholder="请选择船舶状态"
              class="search-item"
            >
              <el-option label="全部状态" value="" />
              <el-option label="运营中" value="operating" />
              <el-option label="维修中" value="maintenance" />
              <el-option label="租赁中" value="chartered" />
              <el-option label="建造中" value="construction" />
            </el-select>
            <el-select
              v-model="searchForm.type"
              placeholder="请选择船舶类型"
              class="search-item"
            >
              <el-option label="散货船" value="bulk" />
              <el-option label="集装箱船" value="container" />
              <el-option label="油轮" value="tanker" />
              <el-option label="多用途船" value="multi" />
            </el-select>
            <el-select
              v-model="searchForm.company"
              placeholder="所属公司"
              class="search-item"
            >
              <el-option label="全部公司" value="" />
              <el-option
                v-for="company in companyOptions"
                :key="company.value"
                :label="company.label"
                :value="company.value"
              />
            </el-select>
            <el-select
              v-model="searchForm.shipName"
              placeholder="请选择船舶名称"
              class="search-item"
            >
              <el-option
                v-for="ship in allShipList"
                :key="ship.id"
                :label="ship.name"
                :value="ship.name"
              />
            </el-select>
            <el-input
              v-model="searchForm.code"
              placeholder="输入船舶编号"
              class="search-item"
            />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="warning" @click="handleExportExcel">
              导出Excel
            </el-button>
          </div>
        </div>
        <!-- 工具栏 -->
        <div class="table-toolbar">
          <div class="left-tools">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click="handleImportExcel">导入Excel</el-button>
          </div>
        </div>
        <!-- 表格 -->
        <el-table
          :data="paginatedShipList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="code" label="船舶编号" width="120" />
          <el-table-column prop="name" label="船舶名称" width="150" />
          <el-table-column prop="type" label="船舶类型" width="120">
            <template #default="scope">
              {{ getShipTypeName(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="capacity" label="载重吨位" width="120" />
          <el-table-column prop="buildYear" label="建造年份" width="120" />
          <el-table-column prop="company" label="所属公司" width="200">
            <template #default="scope">
              {{ getCompanyName(scope.row.company) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredShipList.length"
          background
          class="pagination"
        />
      </el-tab-pane>

      <!-- 船舶规范 -->
      <el-tab-pane label="船舶规范" name="detail">
        <div v-if="selectedShips.length === 0" class="empty-detail">
          <el-empty description="请在船舶基础信息页面选择需要查看的船舶" />
        </div>
        <template v-else>
          <div
            v-for="ship in selectedShips"
            :key="ship.id"
            class="ship-detail-card"
          >
            <el-descriptions title="基本信息" :column="3" border>
              <el-descriptions-item label="船舶编号">{{ ship.code }}</el-descriptions-item>
              <el-descriptions-item label="船舶名称">{{ ship.name }}</el-descriptions-item>
              <el-descriptions-item label="载重吨位">{{ ship.capacity }}吨</el-descriptions-item>
              <el-descriptions-item label="建造年份">{{ ship.buildYear }}</el-descriptions-item>
              <el-descriptions-item label="所属公司">{{ getCompanyName(ship.company) }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(ship.status)">
                  {{ getStatusName(ship.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="3">{{ ship.basicRemark || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="能耗与载荷" :column="3" border>
              <el-descriptions-item label="总长(m)">{{ ship.length }}</el-descriptions-item>
              <el-descriptions-item label="型宽(m)">{{ ship.width }}</el-descriptions-item>
              <el-descriptions-item label="型深(m)">{{ ship.depth }}</el-descriptions-item>
              <el-descriptions-item label="空船重量">{{ ship.lightWeight }}</el-descriptions-item>
              <el-descriptions-item label="参考载重吨">{{ ship.deadWeight }}</el-descriptions-item>
              <el-descriptions-item label="吃水(m)">{{ ship.draft }}</el-descriptions-item>
              <el-descriptions-item label="燃油消耗">{{ ship.fuelConsumption || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="动力系统" :column="3" border>
              <el-descriptions-item label="主机型号">{{ ship.mainEngineModel || '/' }}</el-descriptions-item>
              <el-descriptions-item label="主机功率">{{ ship.mainEnginePower || '/' }}</el-descriptions-item>
              <el-descriptions-item label="辅机型号">{{ ship.auxEngineModel || '/' }}</el-descriptions-item>
              <el-descriptions-item label="辅机功率">{{ ship.auxEnginePower || '/' }}</el-descriptions-item>
              <el-descriptions-item label="锅炉功率">{{ ship.boilerPower || '/' }}</el-descriptions-item>
              <el-descriptions-item label="螺旋桨类型">{{ ship.propellerType || '/' }}</el-descriptions-item>
              <el-descriptions-item label="螺旋桨直径">{{ ship.propellerDiameter || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="船舶证书" :column="3" border>
              <el-descriptions-item label="船籍社">{{ ship.classSociety || '/' }}</el-descriptions-item>
              <el-descriptions-item label="船舶证书号">{{ ship.certNo || '/' }}</el-descriptions-item>
              <el-descriptions-item label="船检日期">{{ ship.surveyDate || '/' }}</el-descriptions-item>
              <el-descriptions-item label="下次船检日期">{{ ship.nextSurveyDate || '/' }}</el-descriptions-item>
              <el-descriptions-item label="建造地">{{ ship.buildLocation || '/' }}</el-descriptions-item>
              <el-descriptions-item label="交付日期">{{ ship.deliveryDate || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="船级信息" :column="3" border>
              <el-descriptions-item label="IMO号">{{ ship.imoNo || '/' }}</el-descriptions-item>
              <el-descriptions-item label="船旗国">{{ ship.flagState || '/' }}</el-descriptions-item>
              <el-descriptions-item label="MMSI号">{{ ship.mmsiNo || '/' }}</el-descriptions-item>
              <el-descriptions-item label="呼号">{{ ship.callSign || '/' }}</el-descriptions-item>
              <el-descriptions-item label="LR/BV号">{{ ship.lrBvNo || '/' }}</el-descriptions-item>
              <el-descriptions-item label="船东">{{ ship.owner || '/' }}</el-descriptions-item>
              <el-descriptions-item label="AIS编号">{{ ship.aisNo || '/' }}</el-descriptions-item>
              <el-descriptions-item label="管理公司">{{ ship.managementCompany || '/' }}</el-descriptions-item>
              <el-descriptions-item label="建造厂">{{ ship.builder || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="系泊设备" :column="3" border>
              <el-descriptions-item label="系泊设备" :span="3">{{ ship.mooringEquipment || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="消防设备" :column="3" border>
              <el-descriptions-item label="消防设备" :span="3">{{ ship.fireFightingEquipment || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="救生设备" :column="3" border>
              <el-descriptions-item label="救生设备" :span="3">{{ ship.lifeSavingEquipment || '/' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="其他信息" :column="3" border>
              <el-descriptions-item label="备注" :span="3">{{ ship.generalRemark || '/' }}</el-descriptions-item>
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
      <el-form
        ref="formRef"
        :model="shipForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="船舶编号" prop="code">
          <el-input v-model="shipForm.code" />
        </el-form-item>
        <el-form-item label="船舶名称" prop="name">
          <el-input v-model="shipForm.name" />
        </el-form-item>
        <el-form-item label="船舶类型" prop="type">
          <el-select
            v-model="shipForm.type"
            placeholder="请选择船舶类型"
            style="width: 100%"
          >
            <el-option label="散货船" value="bulk" />
            <el-option label="集装箱船" value="container" />
            <el-option label="油轮" value="tanker" />
            <el-option label="多用途船" value="multi" />
          </el-select>
        </el-form-item>
        <el-form-item label="载重吨位" prop="capacity">
          <el-input-number
            v-model="shipForm.capacity"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
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
          <el-select
            v-model="shipForm.company"
            placeholder="请选择所属公司"
            style="width: 100%"
          >
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
            <el-option label="运营中" value="operating" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="租赁中" value="chartered" />
            <el-option label="建造中" value="construction" />
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
          </el-table>
        </div>
        <div class="import-actions">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".xlsx,.xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 xlsx/xls 文件
              </div>
            </template>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportSubmit">确定导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Upload, Download, Close, Ship, CircleCheck, HomeFilled, Tickets, Calendar, Loading, Clock, LocationFilled, Briefcase } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { read, utils } from 'xlsx';
import shipdata from './shipdata.json';

// 标签页相关
const activeTab = ref('statistics');
const activeCollapse = ref([]);

// 统计数据
const statistics = reactive({
  totalShips: 300,
  activeShips: 230,
  ownedShips: 100,
  timeCharterShips: 80,
  voyageCharterShips: 50
});

// 船舶动态原始事件数据 (从图片中采样)
const rawVoyageEvents = [
  // Example for 挪威迪斯 202561
  { "船名": "挪威迪斯", "航次": "202561", "港": "大连港 (起始港)", "抵达时间": "2025-05-12 18:14:45", "停泊时间": "12h", "动态": "运输中", "备注": "装货" },
  { "船名": "挪威迪斯", "航次": "202561", "港": "天津港", "抵达时间": "2025-05-13 06:00:00", "停泊时间": "10h", "动态": "运输中", "备注": "部分卸货、补给" },
  { "船名": "挪威迪斯", "航次": "202561", "港": "宁波舟山港", "抵达时间": "2025-05-14 06:00:00", "停泊时间": "10h", "动态": "运输中", "备注": "装卸货、加油补给" },
  { "船名": "挪威迪斯", "航次": "202561", "港": "大连港 (起始港)", "抵达时间": "2025-05-15 12:00:00", "停泊时间": "12h", "动态": "运输中", "备注": "货物调配、人员换班" },
  { "船名": "挪威迪斯", "航次": "202561", "港": "广州港 (终点港口)", "抵达时间": "2025-05-16 08:00:00", "停泊时间": "", "动态": "运输中", "备注": "" },

  // Example for 神华525 202511
  { "船名": "神华525", "航次": "202511", "港": "华东-北仑", "抵达时间": "2025-05-12 19:14:45", "停泊时间": "10h", "动态": "已完成", "备注": "卸货" },
  { "船名": "神华525", "航次": "202511", "港": "华东-靖江", "抵达时间": "2025-05-13 08:00:00", "停泊时间": "8h", "动态": "已完成", "备注": "装货" },

  // Example for 神华528 202515
  { "船名": "神华528", "航次": "202515", "港": "天津港", "抵达时间": "2025-06-02 07:05:00", "停泊时间": "10h", "动态": "在港", "备注": "部分卸货、补给" },
  { "船名": "神华528", "航次": "202515", "港": "宁波舟山港", "抵达时间": "2025-06-03 08:00:00", "停泊时间": "10h", "动态": "在港", "备注": "装卸货、加油补给" },
  { "船名": "神华528", "航次": "202515", "港": "大连港", "抵达时间": "2025-06-04 12:00:00", "停泊时间": "12h", "动态": "在港", "备注": "货物调配、人员换班" },
  { "船名": "神华528", "航次": "202515", "港": "广州港", "抵达时间": "2025-06-05 18:00:00", "停泊时间": "", "动态": "在港", "备注": "终点港口" },
];

// 按船名分组，整理每个航次的卡片信息
const groupedVoyageData = computed(() => {
  // 移除船名筛选限制
  const filtered = shipdata;
  // 按船名分组
  const shipMap = new Map();
  filtered.forEach(e => {
    if (!shipMap.has(e['船名'])) shipMap.set(e['船名'], []);
    shipMap.get(e['船名']).push(e);
  });
  // 每个航次卡片内容结构
  return Array.from(shipMap.entries()).map(([shipName, voyages]) => ({
    shipName,
    voyages: voyages.map(v => ({
      voyageNo: v['航次'],
      mainPort: v['装港'],
      berth: v['泊位'],
      tag1: v['装卸标志'] || '',
      tag2: v['标志'] || '',
      tag3: v['货种'] || '',
      tag4: v['经营公司'] || '',
      departTime: v['离港时间'] ? v['离港时间'] + ' (UTC+8)' : '',
      berthTime: v['靠泊时间'] ? v['靠泊时间'] + ' (UTC+8)' : '',
      arriveTime: v['抵港时间'] ? v['抵港时间'] + ' (UTC+8)' : '',
      startWorkTime: v['开工时间'] ? v['开工时间'] + ' (UTC+8)' : '',
      finishWorkTime: v['完工时间'] ? v['完工时间'] + ' (UTC+8)' : '',
      handoverTime: v['交接时间'] ? v['交接时间'] + ' (UTC+8)' : '',
      duration: v['总停时'] ? v['总停时'] + 'h' : '',
      distance: v['装运量（吨）'] ? v['装运量（吨）'] + ' 吨' : '',
      speed: v['港口效率'] ? v['港口效率'] + '' : '',
      draft: v['实载率'] ? v['实载率'] : '',
      tonnage: v['卸运量（吨）'] ? v['卸运量（吨）'] + ' 吨' : '',
      dischargePort: v['卸港'],
      contract: v['合约方'],
      userType: v['用户性质'],
      company: v['经营公司'],
      cargo: v['货种'],
    }))
  }));
});

// 搜索表单
const searchForm = reactive({
  season: '',
  status: '',
  type: '',
  company: '',
  shipName: '',
  code: ''
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 表格数据 - 包含所有详细信息
const allShipList = ref([
  { id: 1, code: 'NE821', name: '国家能源821', type: 'bulk', capacity: 85583.7, buildYear: '2024', company: 'COMPANY002', status: 'operating', remark: '' },
  { id: 2, code: 'NE822', name: '国家能源822', type: 'bulk', capacity: 85541, buildYear: '2024', company: 'COMPANY002', status: 'chartered', remark: '' },
  { id: 3, code: 'NE581', name: '国家能源581', type: 'bulk', capacity: 56970, buildYear: '2010', company: 'COMPANY001', status: 'operating', remark: '' },
  { id: 4, code: 'NE601', name: '国家能源601', type: 'bulk', capacity: 64870.5, buildYear: '2023', company: 'COMPANY001', status: 'chartered', remark: '' },
  { id: 5, code: 'NE602', name: '国家能源602', type: 'bulk', capacity: 64885, buildYear: '2024', company: 'COMPANY001', status: 'operating', remark: '' },
  { id: 6, code: 'NE603', name: '国家能源603', type: 'bulk', capacity: 64878, buildYear: '2024', company: 'COMPANY001', status: 'chartered', remark: '' },
  { id: 7, code: 'NE605', name: '国家能源605', type: 'bulk', capacity: 64854.7, buildYear: '2024', company: 'COMPANY001', status: 'operating', remark: '' },
  { id: 8, code: 'NE606', name: '国家能源606', type: 'bulk', capacity: 64849, buildYear: '2024', company: 'COMPANY001', status: 'chartered', remark: '' },
  { id: 9, code: 'NE607', name: '国家能源607', type: 'bulk', capacity: 65000, buildYear: '2025', company: 'COMPANY001', status: 'maintenance', remark: '' },
  { id: 10, code: 'NE608', name: '国家能源608', type: 'bulk', capacity: 65000, buildYear: '2025', company: 'COMPANY001', status: 'construction', remark: '' },
]);

// 计算属性，用于过滤船舶列表
const filteredShipList = computed(() => {
  return allShipList.value.filter(ship => {
    const matchesStatus = searchForm.status ? ship.status === searchForm.status : true;
    const matchesType = searchForm.type ? ship.type === searchForm.type : true;
    const matchesCompany = searchForm.company ? ship.company === searchForm.company : true;
    const matchesShipName = searchForm.shipName ? ship.name === searchForm.shipName : true;
    const matchesCode = searchForm.code ? ship.code.includes(searchForm.code) : true;
    // season 筛选逻辑待实现，目前暂时返回 true
    const matchesSeason = true; 
    return matchesStatus && matchesType && matchesCompany && matchesShipName && matchesCode && matchesSeason;
  });
});

// 计算属性，用于分页和过滤
const paginatedShipList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredShipList.value.slice(start, end);
});

// 总记录数
const totalShips = computed(() => filteredShipList.value.length);

// 公司选项
const companyOptions = ref([
  { value: 'COMPANY001', label: '国能远洋运输有限公司' },
  { value: 'COMPANY002', label: '国能海运有限公司' },
  { value: 'COMPANY003', label: '国能长江航运有限公司' }
]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const formRef = ref(null);
const shipForm = reactive({
  id: null,
  code: '',
  name: '',
  type: '',
  capacity: 0,
  buildYear: '',
  company: '',
  status: 'active',
  remark: '',

  // 新增的详细信息字段，全部初始化为空或默认值
  basicRemark: '',
  length: 0,
  width: 0,
  depth: 0,
  lightWeight: 0,
  deadWeight: 0,
  draft: 0,
  fuelConsumption: 0,
  mainEngineModel: '',
  mainEnginePower: '',
  auxEngineModel: '',
  auxEnginePower: '',
  boilerPower: '',
  propellerType: '',
  propellerDiameter: '',
  classSociety: '',
  certNo: '',
  surveyDate: '',
  nextSurveyDate: '',
  buildLocation: '',
  deliveryDate: '',
  imoNo: '',
  flagState: '',
  mmsiNo: '',
  callSign: '',
  lrBvNo: '',
  owner: '',
  aisNo: '',
  managementCompany: '',
  builder: '',
  mooringEquipment: '',
  fireFightingEquipment: '',
  lifeSavingEquipment: '',
  generalRemark: '',
});

// 表单验证规则
const rules = {
  code: [{ required: true, message: '请输入船舶编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入船舶名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择船舶类型', trigger: 'change' }],
  capacity: [{ required: true, message: '请输入载重吨位', trigger: 'blur' }],
  buildYear: [{ required: true, message: '请选择建造年份', trigger: 'change' }],
  company: [{ required: true, message: '请选择所属公司', trigger: 'change' }]
};

// 导入相关
const fileInputRef = ref(null);
const importDialogVisible = ref(false);
const importPreviewData = ref([]);

// 图表实例 (已移除，故变量声明不再需要)
// let typeChart = null;
// let ageChart = null;
// let capacityChart = null;
// let statusTrendChart = null;

// initCharts函数现在为空，因为不再有图表
const initCharts = () => {
  // 图表已移除，此函数不再需要内容
};

// 获取船舶类型名称
const getShipTypeName = (type) => {
  const typeMap = {
    bulk: '散货船',
    container: '集装箱船',
    tanker: '油轮',
    multi: '多用途船'
  };
  return typeMap[type] || type;
};

// 获取公司名称
const getCompanyName = (companyValue) => {
  const company = companyOptions.value.find(item => item.value === companyValue);
  return company ? company.label : companyValue;
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  // 由于过滤逻辑已移至 filteredShipList 计算属性，此处只需重置页码
};

// 获取船舶列表 (目前使用模拟数据，如果需要从后端获取，请取消注释并实现API调用)
const fetchShipList = async () => {
  // 暂时不从后端获取数据，使用模拟数据
  // totalShips.value = allShipList.value.length;
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 页大小改变时，回到第一页
};

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 表格选择改变
const selectedShips = ref([]); // 用于存储选中的船舶对象
const handleSelectionChange = (selection) => {
  selectedShips.value = selection;
  if (selection.length > 0) {
    activeTab.value = 'detail'; // 选中船舶后自动切换到规范页签
  }
};

// 清除选择 (如果需要)
const clearSelection = () => {
  selectedShips.value = [];
};

// 新增船舶
const handleAdd = () => {
  dialogType.value = 'add';
  // 清空表单数据
  Object.assign(shipForm, {
    id: null,
    code: '',
    name: '',
    type: '',
    capacity: 0,
    buildYear: '',
    company: '',
    status: 'operating',
    remark: '',

    basicRemark: '',
    length: 0,
    width: 0,
    depth: 0,
    lightWeight: 0,
    deadWeight: 0,
    draft: 0,
    fuelConsumption: 0,
    mainEngineModel: '',
    mainEnginePower: '',
    auxEngineModel: '',
    auxEnginePower: '',
    boilerPower: '',
    propellerType: '',
    propellerDiameter: '',
    classSociety: '',
    certNo: '',
    surveyDate: '',
    nextSurveyDate: '',
    buildLocation: '',
    deliveryDate: '',
    imoNo: '',
    flagState: '',
    mmsiNo: '',
    callSign: '',
    lrBvNo: '',
    owner: '',
    aisNo: '',
    managementCompany: '',
    builder: '',
    mooringEquipment: '',
    fireFightingEquipment: '',
    lifeSavingEquipment: '',
    generalRemark: '',
  });
  nextTick(() => {
    formRef.value?.clearValidate();
  });
  dialogVisible.value = true;
};

// 编辑船舶
const handleEdit = (row) => {
  dialogType.value = 'edit';
  Object.assign(shipForm, row); // 将当前行数据赋值给表单
  nextTick(() => {
    formRef.value?.clearValidate();
  });
  dialogVisible.value = true;
};

// 删除船舶
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该船舶吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    const index = allShipList.value.findIndex(ship => ship.id === row.id);
    if (index !== -1) {
      allShipList.value.splice(index, 1);
      ElMessage.success('删除成功');
      // 如果删除的是selectedShips中的一个，需要从selectedShips中移除
      selectedShips.value = selectedShips.value.filter(ship => ship.id !== row.id);
      // 如果删除的是当前页最后一条，可能需要调整页码
      if (paginatedShipList.value.length === 0 && currentPage.value > 1) {
          currentPage.value--;
      }
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 提交表单 (新增/编辑)
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newShip = { ...shipForm, id: Date.now() }; // 为新船舶生成一个唯一ID
        allShipList.value.push(newShip); // 添加到原始列表
        ElMessage.success('新增成功');
        // 跳转到最后一页查看新添加的数据
        currentPage.value = Math.ceil(allShipList.value.length / pageSize.value);
      } else {
        const index = allShipList.value.findIndex(ship => ship.id === shipForm.id);
        if (index !== -1) {
          allShipList.value[index] = { ...shipForm }; // 更新现有船舶
          ElMessage.success('修改成功');
        }
      }
      dialogVisible.value = false;
    }
  });
};

// 导出Excel
const handleExportExcel = async () => {
  if (filteredShipList.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }
  
  // 转换数据格式
  const exportData = filteredShipList.value.map(item => ({
    '船舶编号': item.code,
    '船舶名称': item.name,
    '船舶类型': getShipTypeName(item.type),
    '载重吨位': item.capacity,
    '建造年份': item.buildYear,
    '所属公司': getCompanyName(item.company),
    '状态': getStatusName(item.status),
    '备注': item.remark || ''
  }));
  
  const worksheet = utils.json_to_sheet(exportData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, '船舶信息');
  
  const colWidths = [ { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 8 }, { wch: 25 } ];
  worksheet['!cols'] = colWidths;
  
  utils.writeFile(workbook, `船舶信息_${new Date().toISOString().split('T')[0]}.xlsx`);
  ElMessage.success('导出成功');
};

// 导入Excel
const handleImportExcel = () => {
  importDialogVisible.value = true;
  importPreviewData.value = []; // 清空预览数据
  // 延迟触发文件选择
  nextTick(() => {
    fileInputRef.value.click();
  });
};

// 处理文件选择
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);
    
    // 转换数据格式，确保与shipForm的字段匹配
    importPreviewData.value = jsonData.map(item => ({
      code: item['船舶编号'] || '',
      name: item['船舶名称'] || '',
      type: getShipTypeValue(item['船舶类型'] || ''),
      capacity: Number(item['载重吨位']) || 0,
      buildYear: String(item['建造年份']) || '',
      company: getCompanyValue(item['所属公司'] || ''),
      status: getStatusValue(item['状态'] || ''),
      remark: item['备注'] || '',
      
      // 导入时同样需要处理详细信息字段
      basicRemark: item['基本信息备注'] || '',
      length: Number(item['总长']) || 0,
      width: Number(item['型宽']) || 0,
      depth: Number(item['型深']) || 0,
      lightWeight: Number(item['空船重量']) || 0,
      deadWeight: Number(item['参考载重吨']) || 0,
      draft: Number(item['吃水']) || 0,
      fuelConsumption: Number(item['燃油消耗']) || 0,
      mainEngineModel: item['主机型号'] || '',
      mainEnginePower: item['主机功率'] || '',
      auxEngineModel: item['辅机型号'] || '',
      auxEnginePower: item['辅机功率'] || '',
      boilerPower: item['锅炉功率'] || '',
      propellerType: item['螺旋桨类型'] || '',
      propellerDiameter: item['螺旋桨直径'] || '',
      classSociety: item['船籍社'] || '',
      certNo: item['船舶证书号'] || '',
      surveyDate: item['船检日期'] || '',
      nextSurveyDate: item['下次船检日期'] || '',
      buildLocation: item['建造地'] || '',
      deliveryDate: item['交付日期'] || '',
      imoNo: item['IMO号'] || '',
      flagState: item['船旗国'] || '',
      mmsiNo: item['MMSI号'] || '',
      callSign: item['呼号'] || '',
      lrBvNo: item['LR/BV号'] || '',
      owner: item['船东'] || '',
      aisNo: item['AIS编号'] || '',
      managementCompany: item['管理公司'] || '',
      builder: item['建造厂'] || '',
      mooringEquipment: item['系泊设备'] || '',
      fireFightingEquipment: item['消防设备'] || '',
      lifeSavingEquipment: item['救生设备'] || '',
      generalRemark: item['其他信息备注'] || '',
    }));
  } catch (error) {
    ElMessage.error('文件解析失败');
  }
  // 重置文件输入，以便重复选择同一文件
  event.target.value = '';
};

// 获取船舶类型值 (用于导入时转换)
const getShipTypeValue = (typeName) => {
  const typeMap = {
    '散货船': 'bulk',
    '集装箱船': 'container',
    '油轮': 'tanker',
    '多用途船': 'multi'
  };
  return typeMap[typeName] || 'bulk';
};

// 获取公司值 (用于导入时转换)
const getCompanyValue = (companyName) => {
  const company = companyOptions.value.find(c => c.label === companyName);
  return company ? company.value : companyOptions.value[0].value; // 默认选择第一个公司
};

// 提交导入
const handleImportSubmit = async () => {
  if (importPreviewData.value.length === 0) {
    ElMessage.warning('没有要导入的数据');
    return;
  }
  allShipList.value.push(...importPreviewData.value.map(item => ({...item, id: Date.now() + Math.random()})));
  ElMessage.success('导入成功');
  importDialogVisible.value = false;
  importPreviewData.value = []; // 清空预览数据
};

// 选中船舶的图表引用
const selectedTypeChartRef = ref(null);
const selectedAgeChartRef = ref(null);
const selectedCapacityChartRef = ref(null);
const selectedCompanyChartRef = ref(null);

// 选中船舶的图表实例
let selectedTypeChart = null;
let selectedAgeChart = null;
let selectedCapacityChart = null;
let selectedCompanyChart = null;

// 初始化选中船舶的图表
const initSelectedCharts = () => {
  if (!selectedShips.value.length) return;

  // 类型分布图
  if (selectedTypeChartRef.value) {
    selectedTypeChart = echarts.init(selectedTypeChartRef.value);
    const typeData = selectedShips.value.reduce((acc, ship) => {
      const typeName = getShipTypeName(ship.type);
      const existing = acc.find(item => item.name === typeName);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: typeName, value: 1 });
      }
      return acc;
    }, []);

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
    });
  }

  // 船龄分布图
  if (selectedAgeChartRef.value) {
    selectedAgeChart = echarts.init(selectedAgeChartRef.value);
    const currentYear = new Date().getFullYear();
    const ageGroups = { '0-5年': 0, '6-10年': 0, '11-15年': 0, '16-20年': 0, '20年以上': 0 };
    
    selectedShips.value.forEach(ship => {
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

    selectedAgeChart.setOption({
      title: { text: '选中船舶船龄分布', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: Object.keys(ageGroups) },
      yAxis: { type: 'value' },
      series: [{
        data: Object.values(ageGroups),
        type: 'bar'
      }]
    });
  }

  // 载重吨位分布图
  if (selectedCapacityChartRef.value) {
    selectedCapacityChart = echarts.init(selectedCapacityChartRef.value);
    const capacityGroups = { '<10000': 0, '10000-30000': 0, '30000-50000': 0, '>50000': 0 };
    
    selectedShips.value.forEach(ship => {
      if (ship.capacity < 10000) capacityGroups['<10000']++;
      else if (ship.capacity < 30000) capacityGroups['10000-30000']++;
      else if (ship.capacity <= 50000) capacityGroups['30000-50000']++;
      else capacityGroups['>50000']++;
    });

    selectedCapacityChart.setOption({
      title: { text: '选中船舶载重分布', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: Object.keys(capacityGroups) },
      yAxis: { type: 'value' },
      series: [{
        data: Object.values(capacityGroups),
        type: 'bar'
      }]
    });
  }

  // 所属公司分布图
  if (selectedCompanyChartRef.value) {
    selectedCompanyChart = echarts.init(selectedCompanyChartRef.value);
    const companyData = selectedShips.value.reduce((acc, ship) => {
      const companyName = getCompanyName(ship.company);
      const existing = acc.find(item => item.name === companyName);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: companyName, value: 1 });
      }
      return acc;
    }, []);

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
    });
  }
};

// 生命周期钩子
onMounted(() => {
  fetchShipList(); // 首次加载时调用，用于初始化列表
  nextTick(() => {
    // initCharts(); // 暂时不调用船舶动态信息中的图表初始化
  });
  // 监听窗口大小变化，重新渲染图表
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 监听选中船舶变化，重新渲染图表
watch(selectedShips, () => {
  nextTick(() => {
    if (activeTab.value === 'basic') { // 仅在"基础信息"标签页才更新选中船舶的图表
      initSelectedCharts();
    }
  });
});

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'basic' && selectedShips.value.length > 0) {
    nextTick(() => {
      initSelectedCharts();
    });
  }
});

// 处理窗口大小变化 (针对选中船舶的图表)
const handleResize = () => {
  nextTick(() => {
    selectedTypeChart?.resize();
    selectedAgeChart?.resize();
    selectedCapacityChart?.resize();
    selectedCompanyChart?.resize();
  });
};

// 船舶详细信息随机生成方法 (保留原有逻辑)
const getRandomLength = () => (150 + Math.random() * 100).toFixed(2);
const getRandomWidth = () => (20 + Math.random() * 15).toFixed(2);
const getRandomDepth = () => (10 + Math.random() * 5).toFixed(2);
const getRandomDraft = () => (8 + Math.random() * 4).toFixed(2);
const getRandomWeight = () => Math.floor(5000 + Math.random() * 15000);
const getRandomGrossTonnage = () => Math.floor(10000 + Math.random() * 30000);

const getRandomEngine = () => {
  const brands = ['MAN B&W', 'Wärtsilä', 'SULZER', 'YANMAR'];
  const models = ['6S60ME-C', '8RT-flex82C', '7L32/40', '6EY26W'];
  return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`;
};

const getRandomPower = () => Math.floor(5000 + Math.random() * 15000);
const getRandomSpeed = () => (12 + Math.random() * 8).toFixed(1);
const getRandomFuelType = () => {
  const types = ['重质燃料油', '轻质燃料油', '低硫燃料油', '混合燃料油'];
  return types[Math.floor(Math.random() * types.length)];
};
const getRandomFuelConsumption = () => (20 + Math.random() * 30).toFixed(1);
const getRandomRange = () => Math.floor(5000 + Math.random() * 5000);

const getRandomClass = () => {
  const classes = ['中国船级社(CCS)', '劳氏船级社(LR)', '美国船级社(ABS)', '日本船级社(NK)'];
  return classes[Math.floor(Math.random() * classes.length)];
};

const getRandomCertNumber = () => {
  const prefix = ['CCS', 'LR', 'ABS', 'NK'];
  return `${prefix[Math.floor(Math.random() * prefix.length)]}${Math.floor(Math.random() * 1000000)}`;
};

const getRandomShipyard = () => {
  const shipyards = ['大连造船厂', '上海外高桥造船厂', '广州造船厂', '武昌造船厂'];
  return shipyards[Math.floor(Math.random() * shipyards.length)];
};

const getRandomInspectionDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
  return date.toISOString().split('T')[0];
};

const getRandomNextInspectionDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.floor(Math.random() * 12));
  return date.toISOString().split('T')[0];
};

const getRandomNavigationArea = () => {
  const areas = ['无限航区', '近海航区', '沿海航区', '内河航区'];
  return areas[Math.floor(Math.random() * areas.length)];
};

const getRandomCallSign = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return 'B' + Array(4).fill().map(() => letters[Math.floor(Math.random() * letters.length)]).join('');
};

const getRandomMMSI = () => {
  return '477' + Array(6).fill().map(() => Math.floor(Math.random() * 10)).join('');
};

const getRandomIMO = () => {
  return '9' + Array(6).fill().map(() => Math.floor(Math.random() * 10)).join('');
};

const getRandomAISInfo = () => {
  const brands = ['Furuno', 'JRC', 'Simrad', 'Garmin'];
  const models = ['FA-170', 'JHS-183', 'A2004', 'AIS 800'];
  return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`;
};

const getRandomGMDSSInfo = () => {
  const types = ['A1+A2+A3', 'A1+A2', 'A1+A2+A3+A4'];
  return types[Math.floor(Math.random() * types.length)];
};

const getRandomRadarInfo = () => {
  const brands = ['Furuno', 'JRC', 'Sperry Marine', 'Raytheon'];
  const models = ['FAR-2228', 'JMA-5300', 'VisionMaster', 'R4K'];
  return `${brands[Math.floor(Math.random() * brands.length)]} ${models[Math.floor(Math.random() * models.length)]}`;
};

// 船舶动态统计数据（按公司）
const companyShipStats = [
  {
    company: '全部公司',
    total: 87,
    owned: 68,
    timeCharter: 19,
    voyageCharter: '动态',
  },
  {
    company: '国能远海航运有限公司',
    total: 30,
    owned: 30,
    timeCharter: 0,
    voyageCharter: '-',
  },
  {
    company: '天津国能海运有限公司',
    total: 15,
    owned: 15,
    timeCharter: 0,
    voyageCharter: '-',
  },
  {
    company: '国能（天津）航运有限公司',
    total: 12,
    owned: 12,
    timeCharter: 0,
    voyageCharter: '-',
  },
  {
    company: '国能（武汉）航运有限公司',
    total: 1,
    owned: 1,
    timeCharter: 0,
    voyageCharter: '-',
  },
  {
    company: '海南公司',
    total: 10,
    owned: 10,
    timeCharter: 0,
    voyageCharter: '-',
  },
];

const selectedCompany = ref('全部公司');
const currentStats = computed(() => {
  return companyShipStats.find(item => item.company === selectedCompany.value) || companyShipStats[0];
});

// 船舶动态时间轴搜索相关
const timelineSearch = reactive({
  shipName: '',
  voyageNo: '',
  dateRange: []
});

// 船名下拉选项
const shipNameOptions = computed(() => {
  const set = new Set(shipdata.map(e => e['船名']));
  return [{ label: '全部', value: '' }, ...Array.from(set).map(name => ({ label: name, value: name }))];
});
// 航次号下拉选项
const voyageNoOptions = computed(() => {
  const set = new Set(shipdata.map(e => e['航次']));
  return [{ label: '全部', value: '' }, ...Array.from(set).map(no => ({ label: no, value: no }))];
});

const filteredVoyageDataForTimeline = computed(() => {
  return voyageDataForTimeline.value.filter(voyage => {
    if (timelineSearch.shipName && voyage.shipName !== timelineSearch.shipName) return false;
    if (timelineSearch.voyageNo && voyage.voyageNo !== timelineSearch.voyageNo) return false;
    if (timelineSearch.dateRange && timelineSearch.dateRange.length === 2) {
      const [start, end] = timelineSearch.dateRange;
      const inRange = voyage.route.some(r => {
        const date = r.time.split(' ')[0];
        return date >= start && date <= end;
      });
      if (!inRange) return false;
    }
    return true;
  });
});

function handleTimelineSearch() {
  // 计算属性已自动响应，无需额外处理
}
function resetTimelineSearch() {
  timelineSearch.shipName = '';
  timelineSearch.voyageNo = '';
  timelineSearch.dateRange = [];
}

// 在 script setup 中添加分页相关的响应式数据（添加在其他 ref 变量附近）
const timelineCurrentPage = ref(1);
const timelinePageSize = ref(3);
const timelinePageCount = computed(() => Math.ceil(groupedVoyageData.value.length / timelinePageSize.value));

// 计算当前页显示的船舶数据
const paginatedGroupedVoyageData = computed(() => {
  const start = (timelineCurrentPage.value - 1) * timelinePageSize.value;
  const end = start + timelinePageSize.value;
  return groupedVoyageData.value.slice(start, end);
});

// 处理页码改变
const handleTimelinePageChange = (val) => {
  timelineCurrentPage.value = val;
};

const getStatusType = (status) => {
  const statusMap = {
    operating: 'success',    // 绿色 - 运营中
    maintenance: 'warning',  // 橙色 - 维修中
    chartered: 'primary',    // 蓝色 - 租赁中
    construction: 'danger'   // 红色 - 建造中
  };
  return statusMap[status] || 'default';
};
const getStatusName = (status) => {
  const statusMap = {
    operating: '运营中',
    maintenance: '维修中',
    chartered: '租赁中',
    construction: '建造中'
  };
  return statusMap[status] || status;
};
const getStatusValue = (statusName) => {
  const statusMap = {
    '运营中': 'operating',
    '维修中': 'maintenance',
    '租赁中': 'chartered',
    '建造中': 'construction'
  };
  return statusMap[statusName] || 'operating';
};

</script>

<style lang="scss" scoped>
.ship-container {
  padding: 20px;

  .ship-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 4px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

      .stat-title {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .stat-value {
        color: #333;
        font-size: 24px;
        font-weight: bold;
      }
    }
  }

  .ship-timeline-grouped {
    margin-top: 20px;
    .ship-timeline-ship-row {
      margin-bottom: 32px;
      .ship-timeline-ship-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 12px;
        color: #222;
      }
      .ship-timeline-voyage-list {
        display: flex;
        overflow-x: auto;
        gap: 24px;
        padding-bottom: 8px;
        &::-webkit-scrollbar {
          height: 8px;
        }
        &::-webkit-scrollbar-thumb {
          background: #dcdfe6;
          border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
        }
        .ship-timeline-voyage-card {
          min-width: 400px;
          max-width: 650px;
          width: fit-content;
          background: #fff;
          border: 1.5px solid #409EFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.06);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          word-break: keep-all;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .voyage-card-header {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
            .voyage-card-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .voyage-card-status {
              font-size: 13px;
              padding: 2px 10px;
              border-radius: 12px;
              color: #fff;
              &.in-progress { background: #409EFF; }
              &.completed { background: #67C23A; }
            }
          }
          .voyage-card-body {
            font-size: 14px;
            color: #444;
            .voyage-card-row {
              margin-bottom: 6px;
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              align-items: center;
              > span {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 180px;
              }
            }
          }
        }
      }
    }
  }

  .search-container {
    margin-bottom: 20px;

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;

      .search-item {
        width: 200px;
      }
    }
  }

  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left-tools {
      display: flex;
      gap: 10px;
    }
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .selected-stats-container {
    margin-top: 20px;
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .stats-title {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }

  .ship-detail-card {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    margin-bottom: 20px;

    .detail-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .detail-card-title {
        margin: 0;
        font-size: 18px;
      }
    }
  }

  .import-dialog-content {
    .preview-table {
      margin-bottom: 20px;
    }

    .import-actions {
      text-align: center;
    }
  }
}

:deep(.el-descriptions) {
  margin-bottom: 20px;

  .el-descriptions__title {
    margin-bottom: 16px;
  }
}

:deep(.el-descriptions__label) {
  width: 120px;
}

.ship-timeline-search {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;

  .el-form-item {
    width: 200px;
  }
}

.voyage-detail-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-width: 340px;
  max-width: 600px;
  width: fit-content;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .voyage-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
    .flag {
      width: 22px;
      height: 16px;
      border-radius: 2px;
      margin-right: 4px;
    }
    .port-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-right: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .berth {
      font-size: 13px;
      color: #666;
      margin-right: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-tag {
      margin-right: 2px;
    }
  }
  .voyage-times {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
    div {
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .voyage-params {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 13px;
    color: #444;
    margin-bottom: 8px;
    span {
      display: flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .voyage-icons {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    .el-icon {
      font-size: 18px;
      color: #bbb;
    }
  }
}

.timeline-pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  .page-info {
    color: #606266;
    font-size: 14px;
  }
}
</style>
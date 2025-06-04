<template>
  <div class="ship-route-container">
    <!-- 表格和SVG容器 -->
    <div class="chart-wrapper">
      <table ref="mainTable" class="main-table" border="1"></table>
      <svg ref="routeSvg" class="route-svg" />
    </div>

    <!-- 底部控制面板 - 简化后的版本 -->
    <div class="control-panel">
      <div class="control-item">
        <span class="control-label">控制面板:</span>
        <el-button type="primary" size="small" @click="playAnimation">
          播放
        </el-button>
        <el-button type="info" size="small" @click="pauseAnimation">
          暂停
        </el-button>
        <el-button type="warning" size="small" @click="resetAnimation">
          重置
        </el-button>
      </div>

      <div class="control-item">
        <span class="control-label">播放速度:</span>
        <el-slider
          v-model="animationSpeed"
          :min="100"
          :max="1000"
          :step="100"
          style="width: 200px; margin: 0 10px 0 0"
          :show-tooltip="false"
        />
        <span>{{ animationSpeed }} ms/点</span>
      </div>

      <div class="control-item">
        <span class="control-label">状态:</span>
        <span>{{ statusDisplay }}</span>
      </div>

      <div class="control-item">
        <span class="control-label">当前位置:</span>
        <span>{{ positionDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  export default {
    name: 'ShipRouteMap',
    setup() {
      // 港口和状态定义
      const ports = ['天津', '黄骅', '社会港', '华中销售', '神皖能源'];
      const states = ['交接|待高', '装船', '抵港|待装'];

      // 船舶运行数据
      const shipData = ref({
        ship_name: '国能1号',
        ship_id: 202404,
        type: '1',
        timelist: [
          ['天津', '抵港|待装', 2],
          ['天津', '装船', 3],
          ['天津', '交接|待高', 5],
          ['华中销售', '抵港|待装', 8],
          ['华中销售', '装船', 10],
          ['华中销售', '交接|待高', 12],
          ['社会港', '抵港|待装', 14]
        ],
        origin_port: '天津',
        drop_out_port: '',
        color: '#0070c0' // 使用图片中的蓝色
      });

      // 全局变量
      const mainTable = ref(null);
      const routeSvg = ref(null);
      const animationId = ref(null);
      const currentIndex = ref(0);
      const isPlaying = ref(false);
      const pathPoints = ref([]);
      const pathElement = ref(null);
      const currentPositionMarker = ref(null);
      const animationSpeed = ref(500);
      const intermediatePoints = ref([]);
      const statusDisplay = ref('准备就绪');
      const positionDisplay = ref('-');

      // 创建表格
      const createTable = () => {
        const table = mainTable.value;
        if (!table) return;

        table.innerHTML = ''; // 清空表格
        table.style.width = '100%';
        table.style.minWidth = '1200px';

        // 创建表头 - 修改表头跨列
        const headerRow = table.insertRow();
        const headerCell = headerRow.insertCell();
        headerCell.colSpan = 2;
        headerCell.textContent = '渤海湾-华中/华东';
        headerCell.className = 'table-cell region-header header-right-strong';

        // 确保表头单元格足够宽
        headerCell.style.width = '160px';
        headerCell.style.minWidth = '160px';

        // 时间轴列
        for (let i = 0; i < 32; i++) {
          const isDash = (i + 1) % 10 === 0;
          const cell = headerRow.insertCell();
          if (isDash) cell.style.borderRight = '2px dashed #0070C0';
          cell.className = 'empty-cell';
        }

        // 右侧表头
        const northPortCell = headerRow.insertCell();
        northPortCell.textContent = '北方装港';
        northPortCell.className = 'table-cell last-col-left-strong';

        // 创建港口行
        // eslint-disable-next-line no-unused-vars
        ports.forEach((port, index) => {
          const isSpecialGap = port === '社会港';

          // 每个港口状态行
          for (let i = 0; i < states.length; i++) {
            const row = table.insertRow();
            row.style.height = '30px';
            if (i === 0) row.classList.add('top-border-strong');
            if (i === states.length - 1)
              row.classList.add('bottom-border-strong');

            // 第一列:港口名称
            if (i === 0) {
              const portCell = row.insertCell();
              portCell.rowSpan = states.length;
              portCell.textContent = port;
              portCell.className = 'table-cell first-col-strong';
              // 确保港口名称宽度
              portCell.style.width = '80px';
              portCell.style.minWidth = '80px';
            }

            // 第二列:状态名称
            const stateCell = row.insertCell();
            stateCell.textContent = states[i];
            stateCell.className = 'table-cell status-col';
            // 确保状态列宽度
            stateCell.style.width = '80px';
            stateCell.style.minWidth = '80px';

            // 时间轴单元格
            for (let j = 0; j < 32; j++) {
              const cell = row.insertCell();
              if ((j + 1) % 10 === 0) {
                cell.style.borderRight = '2px dashed #0070C0';
                cell.style.borderLeft = '1px dashed #0070C0';
              }
              cell.className = 'empty-cell';

              // 标记船舶停靠点
              const point = shipData.value.timelist.find(
                (item) =>
                  item[0] === port && item[1] === states[i] && item[2] === j
              );
              if (point) {
                cell.classList.add('route-point');
                cell.setAttribute('data-port', port);
                cell.setAttribute('data-state', states[i]);
                cell.setAttribute('data-col', j);
                cell.setAttribute(
                  'data-index',
                  shipData.value.timelist.indexOf(point)
                );
              }
            }

            // 最后一列:港口名称
            if (i === 0) {
              const mergeCell = row.insertCell();
              mergeCell.rowSpan = states.length;
              mergeCell.textContent = port;
              mergeCell.className =
                'table-cell last-col-strong last-col-left-strong';
              // 确保右侧港口名称宽度
              mergeCell.style.width = '80px';
              mergeCell.style.minWidth = '80px';
            }
          }

          // 港口间的空行
          const emptyRow = table.insertRow();
          emptyRow.classList.add('empty-row');
          if (isSpecialGap) {
            emptyRow.style.height = '30px';
          }
          for (let i = 0; i < 35; i++) {
            const cell = emptyRow.insertCell();
            const isDash = i >= 2 && i < 34 && (i - 1) % 10 === 0;
            if (isDash) cell.style.borderRight = '2px dashed #0070C0';
            if (i === 1) {
              cell.className = 'table-cell empty-row-second-col';
            } else if (i === 34) {
              cell.className = 'table-cell last-col-left-strong';
            } else if (i >= 2 && i < 34) {
              cell.className = 'empty-cell';
            } else {
              cell.className = 'table-cell';
            }
          }
        });
      };

      // 准备路径数据
      const preparePathData = () => {
        const svg = routeSvg.value;
        const table = mainTable.value;

        if (!svg || !table) return;

        // 清空SVG内容
        while (svg.firstChild) {
          svg.removeChild(svg.firstChild);
        }

        const svgRect = svg.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();

        // 收集所有路径点
        pathPoints.value = [];

        // 添加起始点(时间点0)
        const firstPort = shipData.value.timelist[0][0];
        const firstState = shipData.value.timelist[0][1];
        const firstCol = shipData.value.timelist[0][2];

        // 找到第一个状态点的位置
        const firstStateCell = document.querySelector(
          `.route-point[data-port="${firstPort}"][data-state="${firstState}"][data-col="${firstCol}"]`
        );
        if (!firstStateCell) {
          console.error('找不到初始状态点');
          return;
        }

        const firstStateRect = firstStateCell.getBoundingClientRect();

        // 计算时间点0的位置（表格最左侧）
        const startX = tableRect.left + 160 - svgRect.left; // 左侧两列宽度约160px
        const startY =
          firstStateRect.top + firstStateRect.height / 2 - svgRect.top;

        // 添加起始点(时间点0)
        pathPoints.value.push({
          x: startX,
          y: startY,
          port: firstPort,
          state: '出发',
          col: 0
        });

        // 添加所有标记点
        document.querySelectorAll('.route-point').forEach((point) => {
          const rect = point.getBoundingClientRect();
          const index = parseInt(point.getAttribute('data-index'));

          pathPoints.value.push({
            x: rect.left + rect.width / 2 - svgRect.left,
            y: rect.top + rect.height / 2 - svgRect.top,
            index: index,
            port: point.getAttribute('data-port'),
            state: point.getAttribute('data-state'),
            col: parseInt(point.getAttribute('data-col'))
          });
        });

        // 按时间顺序排序
        pathPoints.value.sort((a, b) => a.col - b.col);

        // 创建路径元素
        pathElement.value = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        pathElement.value.setAttribute('stroke', shipData.value.color);
        pathElement.value.setAttribute('stroke-width', '2');
        pathElement.value.setAttribute('fill', 'none'); // 关键修改：确保不填充路径
        pathElement.value.setAttribute('class', 'route-path');
        pathElement.value.setAttribute('id', 'shipPath');
        svg.appendChild(pathElement.value);

        // 创建当前位置标记
        currentPositionMarker.value = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        currentPositionMarker.value.setAttribute('class', 'current-position');
        currentPositionMarker.value.setAttribute('r', '5'); // 明确设置半径
        currentPositionMarker.value.setAttribute('fill', 'red'); // 明确设置填充颜色
        svg.appendChild(currentPositionMarker.value);

        // 设置初始位置（如果有路径点）
        if (pathPoints.value.length > 0) {
          currentPositionMarker.value.setAttribute('cx', pathPoints.value[0].x);
          currentPositionMarker.value.setAttribute('cy', pathPoints.value[0].y);
        }

        // 计算所有中间点
        calculateIntermediatePoints();
      };

      // 计算所有中间点（实现平滑动画）
      const calculateIntermediatePoints = () => {
        intermediatePoints.value = [];

        if (pathPoints.value.length < 2) return;

        for (let i = 1; i < pathPoints.value.length; i++) {
          const prev = pathPoints.value[i - 1];
          const curr = pathPoints.value[i];

          // 同一港口内不同状态间的连接
          if (prev.port === curr.port) {
            // 计算垂直移动的点
            const verticalSteps = 10;
            const yStep = (curr.y - prev.y) / verticalSteps;
            for (let j = 1; j <= verticalSteps; j++) {
              intermediatePoints.value.push({
                x: prev.x,
                y: prev.y + yStep * j,
                port: curr.port,
                state: prev.state, // 过渡中状态未变
                col: prev.col + ((curr.col - prev.col) * j) / verticalSteps
              });
            }

            // 计算水平移动的点
            const horizontalSteps = Math.max(
              5,
              Math.abs(curr.col - prev.col) * 2
            );
            const xStep = (curr.x - prev.x) / horizontalSteps;
            for (let j = 1; j <= horizontalSteps; j++) {
              intermediatePoints.value.push({
                x: prev.x + xStep * j,
                y: curr.y,
                port: curr.port,
                state: curr.state, // 状态已变化
                col: prev.col + ((curr.col - prev.col) * j) / horizontalSteps
              });
            }
          }
          // 不同港口间的连接
          else {
            const steps = 20;
            const xStep = (curr.x - prev.x) / steps;
            const yStep = (curr.y - prev.y) / steps;
            for (let j = 1; j <= steps; j++) {
              intermediatePoints.value.push({
                x: prev.x + xStep * j,
                y: prev.y + yStep * j,
                port: '航行中',
                state: '航行中',
                col: prev.col + ((curr.col - prev.col) * j) / steps
              });
            }
          }
        }
      };

      // 动画绘制路径
      const animatePath = () => {
        if (
          currentIndex.value >=
          pathPoints.value.length + intermediatePoints.value.length
        ) {
          pauseAnimation();
          statusDisplay.value = '播放完成';
          return;
        }

        // 确定当前点
        let currentPoint;
        if (currentIndex.value < pathPoints.value.length) {
          // 使用主要路径点
          currentPoint = pathPoints.value[currentIndex.value];
        } else {
          // 使用中间过渡点
          currentPoint =
            intermediatePoints.value[
              currentIndex.value - pathPoints.value.length
            ];
        }

        // 更新路径
        let pathData;
        if (currentIndex.value < pathPoints.value.length) {
          // 主要路径点
          pathData = generatePartialPath(
            Math.min(currentIndex.value + 1, pathPoints.value.length)
          );
        } else {
          // 中间过渡点
          const pointIndex = currentIndex.value - pathPoints.value.length;
          const prevMainPointIndex = Math.min(
            pathPoints.value.length - 1,
            Math.floor(
              pointIndex /
                (intermediatePoints.value.length /
                  (pathPoints.value.length - 1))
            )
          );
          pathData = generatePartialPath(prevMainPointIndex + 1);

          // 添加过渡点到路径
          const transitionPoints = intermediatePoints.value.slice(
            0,
            pointIndex + 1
          );
          transitionPoints.forEach((point) => {
            pathData += ` L${point.x},${point.y}`;
          });
        }

        if (pathElement.value) {
          pathElement.value.setAttribute('d', pathData);
        }

        // 更新当前位置标记
        if (currentPositionMarker.value) {
          currentPositionMarker.value.setAttribute('cx', currentPoint.x);
          currentPositionMarker.value.setAttribute('cy', currentPoint.y);
        }

        // 更新状态显示
        statusDisplay.value = isPlaying.value ? '播放中...' : '已暂停';
        positionDisplay.value = `${currentPoint.port} (${currentPoint.state}) 时间点: ${currentPoint.col.toFixed(1)}`;

        currentIndex.value++;
        animationId.value = setTimeout(animatePath, animationSpeed.value / 2); // 加快动画速度
      };

      // 生成部分路径数据
      const generatePartialPath = (endIndex) => {
        if (pathPoints.value.length === 0 || endIndex <= 0) return '';

        let pathData = [`M${pathPoints.value[0].x},${pathPoints.value[0].y}`];

        for (let i = 1; i < endIndex; i++) {
          const prev = pathPoints.value[i - 1];
          const curr = pathPoints.value[i];

          // 同一港口内不同状态间的连接
          if (prev.port === curr.port) {
            // 先垂直移动
            pathData.push(`V${curr.y}`);
            // 再水平移动
            pathData.push(`H${curr.x}`);
          }
          // 不同港口间的连接
          else {
            pathData.push(`L${curr.x},${curr.y}`);
          }
        }

        return pathData.join(' ');
      };

      // 播放动画
      const playAnimation = () => {
        if (isPlaying.value) return;
        if (
          currentIndex.value >=
          pathPoints.value.length + intermediatePoints.value.length
        ) {
          currentIndex.value = 0;
        }
        isPlaying.value = true;
        statusDisplay.value = '播放中...';
        animatePath();
      };

      // 暂停动画
      const pauseAnimation = () => {
        if (!isPlaying.value) return;
        clearTimeout(animationId.value);
        isPlaying.value = false;
        statusDisplay.value = '已暂停';
      };

      // 重置动画
      const resetAnimation = () => {
        pauseAnimation();
        currentIndex.value = 0;
        if (pathElement.value) {
          pathElement.value.setAttribute('d', '');
        }

        // 确保重置时不隐藏红点，而是将其放回起始位置
        if (currentPositionMarker.value && pathPoints.value.length > 0) {
          const startPoint = pathPoints.value[0];
          currentPositionMarker.value.setAttribute('cx', startPoint.x);
          currentPositionMarker.value.setAttribute('cy', startPoint.y);
        }

        statusDisplay.value = '已重置';
        positionDisplay.value = '-';
      };

      // 初始化
      const init = () => {
        console.log('开始初始化表格...');
        setTimeout(() => {
          createTable();

          setTimeout(() => {
            console.log('准备路径数据...');
            preparePathData();
            statusDisplay.value = '准备就绪';
            console.log('初始化完成');
          }, 500);
        }, 500);
      };

      // 组件挂载时执行
      onMounted(() => {
        init();

        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', () => {
          resetAnimation();
          setTimeout(init, 300);
        });
      });

      // 组件卸载前执行
      onBeforeUnmount(() => {
        pauseAnimation();
        window.removeEventListener('resize');
      });

      return {
        // 返回响应式数据和方法
        mainTable,
        routeSvg,
        animationSpeed,
        statusDisplay,
        positionDisplay,
        playAnimation,
        pauseAnimation,
        resetAnimation
      };
    }
  };
</script>

<style scoped>
  .ship-route-container {
    padding: 20px;
    background-color: #fff;
  }

  /* 图表容器 */
  .chart-wrapper {
    position: relative;
    margin-bottom: 20px;
    overflow-x: auto;
    width: 100%;
  }

  /* 表格样式 */
  .main-table {
    border-collapse: collapse;
    border: 1px solid #0070c0;
    table-layout: fixed;
    min-width: 1200px; /* 确保表格有足够的宽度 */
    width: 100%;
  }

  .route-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }

  .table-cell {
    border: 1px solid #0070c0;
    width: 80px;
    min-width: 80px;
    height: 30px;
    min-height: 30px;
    box-sizing: border-box;
    padding: 5px;
    margin: 0;
    text-align: center;
    white-space: nowrap; /* 防止文本换行 */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-cell {
    border: 1px solid #0070c080;
    width: 30px;
    min-width: 30px;
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

  /* 航线样式 */
  .route-path {
    stroke-width: 2;
    fill: none; /* 确保SVG路径没有填充 */
    stroke: #0070c0; /* 蓝色线条 */
    pointer-events: all;
  }

  .current-position {
    fill: red;
    r: 5;
    stroke: white; /* 添加白色边框使红点更明显 */
    stroke-width: 1;
  }

  /* 控制面板样式 - 简化版 */
  .control-panel {
    margin-top: 20px;
  }

  .control-item {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  .control-label {
    display: inline-block;
    width: 100px;
    font-weight: bold;
  }

  /* 适配Element UI样式 */
  :deep(.el-slider__runway) {
    margin: 0;
  }
</style>

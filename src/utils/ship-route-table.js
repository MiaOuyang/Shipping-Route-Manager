/**
 * 生成运行图底图表格
 * @param {HTMLElement} tableElement - 表格DOM元素
 * @param {Object} options - 配置选项
 * @param {string} options.title - 表格标题，如"渤海湾-华中/华东"
 * @param {string} options.rightTitle - 右侧标题，如"装货港"或"卸货港"
 * @param {Array} options.loadingPorts - 装货港口列表，如['天津', '黄骅', '社会港']
 * @param {Array} options.unloadingPorts - 卸货港口列表，如['连江电厂', '福州电厂', '泉州电厂', '鸿山电厂']
 * @param {number} options.days - 时间轴长度（天数）
 * @param {Object} options.specialGaps - 特殊间距配置，如{'社会港': 120}
 * @param {Array} options.monthDividers - 月份分隔线位置，如[31, 59, 89]
 * @param {number} options.tenDayDividers - 每十天分隔线间隔，默认10
 */
export function createShipRouteTable(tableElement, options = {}) {
  const {
    title = '运行图',
    rightTitle = '',
    loadingPorts = [],
    unloadingPorts = [],
    days = 90,
    specialGaps = {},
    monthDividers = [],
    tenDayDividers = 10
  } = options;

  if (!tableElement) {
    console.error('表格元素不能为空');
    return;
  }

  // 合并所有港口
  const allPorts = [...loadingPorts, ...unloadingPorts];
  
  // 生成状态映射
  const statesMap = {};
  loadingPorts.forEach(port => {
    statesMap[port] = ['交接|待离', '装船', '抵港|待装'];
  });
  unloadingPorts.forEach(port => {
    statesMap[port] = ['抵港|待泊', '卸船', '交接|离港'];
  });

  // 清空表格内容
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }
  tableElement.style.width = '100%';
  tableElement.style.tableLayout = 'fixed';

  // 创建表头
  const headerRow = tableElement.insertRow();
  const headerCell = headerRow.insertCell();
  headerCell.colSpan = 2;
  headerCell.textContent = title || ' ';
  headerCell.className = 'table-cell region-header header-right-strong';
  headerCell.style.width = '160px';
  headerCell.style.borderRight = '2px solid #0070c0';
  headerCell.style.textAlign = 'center';
  headerCell.style.verticalAlign = 'middle';

  // 创建日期列
  for (let i = 0; i < days; i++) {
    const isMonthSolid = monthDividers.includes(i);
    const isTenDash = (i + 1) % tenDayDividers === 0 && !monthDividers.includes(i);
    
    const cell = headerRow.insertCell();
    cell.style.textAlign = 'center';
    cell.style.width = '15px';
    if (isMonthSolid) {
      cell.style.borderLeft = '2px solid #0070c0';
    } else if (isTenDash) {
      cell.style.borderRight = '2px dashed #0070c0';
    }
    cell.className = 'empty-cell';
  }

  // 创建右侧标题列
  const rightTitleCell = headerRow.insertCell();
  rightTitleCell.textContent = rightTitle || ' ';
  rightTitleCell.className = 'table-cell last-col-left-strong';
  rightTitleCell.style.width = '80px';
  rightTitleCell.style.textAlign = 'center';

  // 创建港口行
  allPorts.forEach((port) => {
    const isSpecialGap = specialGaps[port];
    const states = statesMap[port];
    
    // 为每个港口创建3行（对应3个状态）
    for (let i = 0; i < 3; i++) {
      const row = tableElement.insertRow();
      row.style.height = '30px';
      if (i === 0) row.classList.add('top-border-strong');
      if (i === 2) row.classList.add('bottom-border-strong');

      if (i === 0) {
        // 第一行：港口名和第一个状态
        const portCell = row.insertCell();
        portCell.rowSpan = 3;
        portCell.textContent = port;
        portCell.className = 'table-cell first-col-strong';
        portCell.style.textAlign = 'center';

        const stateCell = row.insertCell();
        stateCell.textContent = states[i];
        stateCell.className = 'table-cell status-col';
        stateCell.style.borderRight = '2px solid #0070c0';
        stateCell.style.textAlign = 'center';
      } else {
        // 其他行：只有状态
        const stateCell = row.insertCell();
        stateCell.textContent = states[i];
        stateCell.className = 'table-cell status-col';
        stateCell.style.borderRight = '2px solid #0070c0';
        stateCell.style.textAlign = 'center';
      }

      // 创建日期单元格
      for (let j = 0; j < days; j++) {
        const isMonthSolid = monthDividers.includes(j);
        const isTenDash = (j + 1) % tenDayDividers === 0 && !monthDividers.includes(j);
        
        const cell = row.insertCell();
        if (isMonthSolid) {
          cell.style.borderLeft = '2px solid #0070c0';
        } else if (isTenDash) {
          cell.style.borderRight = '2px dashed #0070c0';
          cell.style.borderLeft = '1px solid #0070c0';
        }
        cell.className = 'empty-cell';
      }
      
      // 第一行添加右侧港口名
      if (i === 0) {
        const mergeCell = row.insertCell();
        mergeCell.rowSpan = 3;
        mergeCell.textContent = port;
        mergeCell.className = 'table-cell last-col-strong last-col-left-strong';
        mergeCell.style.width = '80px';
        mergeCell.style.padding = '0 10px';
        mergeCell.style.textAlign = 'center';
      }
    }

    // 创建港口间的空行
    const emptyRow = tableElement.insertRow();
    emptyRow.classList.add('empty-row');
    if (isSpecialGap) {
      emptyRow.style.height = isSpecialGap + 'px';
    }
    
    // 空行的单元格
    const totalCols = days + 3; // 日期列 + 左侧2列 + 右侧1列
    for (let k = 0; k < totalCols; k++) {
      const cell = emptyRow.insertCell();
      if (k === 1) {
        cell.className = 'table-cell empty-row-second-col';
        cell.style.borderRight = '2px solid #0070c0';
      } else if (k === totalCols - 1) {
        cell.className = 'table-cell last-col-left-strong';
        cell.style.width = '80px';
        cell.style.padding = '0 10px';
      } else if (k >= 2 && k < totalCols - 1) {
        // 日期部分
        const dateIdx = k - 2;
        const isMonthSolid = monthDividers.includes(dateIdx);
        const isTenDash = (dateIdx + 1) % tenDayDividers === 0 && !monthDividers.includes(dateIdx);
        
        if (isMonthSolid) {
          cell.style.borderLeft = '2px solid #0070C0';
        } else if (isTenDash) {
          cell.style.borderRight = '2px dashed #0070C0';
        }
        cell.className = 'empty-cell';
      } else {
        cell.className = 'table-cell';
      }
    }
  });

  return {
    table: tableElement,
    ports: allPorts,
    statesMap,
    days
  };
}

/**
 * 获取单元格位置信息（用于路线绘制）
 * @param {HTMLElement} table - 表格元素
 * @param {string} port - 港口名
 * @param {string} state - 状态名
 * @param {number} day - 天数
 * @param {string} anchor - 锚点位置 ('center', 'top', 'bottom')
 * @param {Array} ports - 港口列表
 * @param {Object} statesMap - 状态映射
 * @param {number} [hour] - 小时（0-23，可选）
 * @returns {Object|null} 位置信息 {x, y}
 */
export function getCellPosition(table, port, state, day, anchor, ports, statesMap, hour) {
  const colIndex = day + 1; // 0列是港口名，1列是状态名
  const portIndex = ports.indexOf(port);
  if (portIndex === -1) return null;
  
  let rowIndex = 1; // 跳过表头
  for (let i = 0; i < portIndex; i++) {
    rowIndex += 4; // 每个港口3行+1空行
  }
  
  // 找到状态所在的行
  const states = statesMap[port];
  let stateRow = -1;
  for (let i = 0; i < 3; i++) {
    if (states[i] === state) {
      stateRow = i;
      break;
    }
  }
  if (stateRow === -1) return null;
  
  rowIndex += stateRow;
  const row = table.rows[rowIndex];
  if (!row) return null;
  
  const cell = row.cells[colIndex];
  if (!cell) return null;
  
  // 用表头同一列的left，保证所有点严格对齐
  const headerCell = table.rows[0].cells[colIndex];
  const tableRect = table.getBoundingClientRect();
  let x = headerCell.getBoundingClientRect().left - tableRect.left;
  let rect = cell.getBoundingClientRect();
  let y = rect.top - tableRect.top;

  // 支持小时级别定位
  if (typeof hour === 'number' && hour >= 0 && hour <= 23) {
    const cellWidth = rect.width;
    x += (cellWidth / 24) * hour + cellWidth / 48; // cellWidth/48是半小时偏移，居中
  }
  
  if (anchor === 'center') {
    y += rect.height / 2;
  } else if (anchor === 'top') {
    y += 2;
  } else if (anchor === 'bottom') {
    y += rect.height - 2;
  }
  
  return { x, y };
} 
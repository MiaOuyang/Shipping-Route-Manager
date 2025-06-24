// 获取单元格锚点坐标
export function getCellPosition(table, port, state, day, anchor, ports, statesMap) {
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
  if (anchor === 'center') {
    y += rect.height / 2;
  } else if (anchor === 'top') {
    y += 2;
  } else if (anchor === 'bottom') {
    y += rect.height - 2;
  }
  return { x, y };
}

// 画一条运行线
export function drawRouteLine(svg, table, points, options = {}) {
  // options: { color, width, ports, statesMap, onClick, routeIdx }
  const { color = '#0070C0', width = 3, ports, statesMap, onClick, routeIdx } = options;
  let pathData = '';
  points.forEach((point, idx) => {
    const pos = getCellPosition(table, point.port, point.state, point.day, point.anchor, ports, statesMap);
    if (!pos) return;
    if (idx === 0) {
      pathData += `M ${pos.x} ${pos.y}`;
    } else {
      pathData += ` L ${pos.x} ${pos.y}`;
    }
  });
  if (pathData) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', width);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (typeof onClick === 'function') {
      path.style.cursor = 'pointer';
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick(routeIdx);
      });
    }
    svg.appendChild(path);
  }
}

import { getCellPosition } from './ship-route-table.js';

// 画一条运行线
export function drawRouteLine(svg, table, points, options = {}) {
  // options: { color, width, ports, statesMap, onClick, routeIdx, shipName, isPlan, currentDay }
  const { color = '#0070C0', width = 3, ports, statesMap, onClick, routeIdx, shipName, isPlan = false, currentDay = 49 } = options;
  let pathData = '';
  let firstPos = null;
  points.forEach((point, idx) => {
    const pos = getCellPosition(table, point.port, point.state, point.day, point.anchor, ports, statesMap);
    if (!pos) return;
    if (idx === 0) {
      pathData += `M ${pos.x} ${pos.y}`;
      firstPos = pos;
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
    
    // 如果是计划线且当前时刻前的部分，设置60%透明度
    if (isPlan) {
      // 检查是否有当前时刻前的点
      const hasPastPoints = points.some(point => point.day < currentDay);
      if (hasPastPoints) {
        path.setAttribute('stroke-opacity', '0.4');
      }
    }
    
    if (typeof onClick === 'function') {
      path.style.cursor = 'pointer';
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('click', routeIdx);
        onClick(routeIdx);
      });
    }
    svg.appendChild(path);
    // 绘制船名文本
    if (shipName && firstPos) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', firstPos.x);
      text.setAttribute('y', firstPos.y - 40);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14px');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#000000');
      text.setAttribute('stroke', '#fff');
      text.setAttribute('stroke-width', '0.5');
      text.textContent = shipName;
      svg.appendChild(text);
    }
  }
}

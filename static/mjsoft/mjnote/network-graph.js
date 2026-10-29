(() => {
  'use strict';
  const root = document.querySelector('[data-knowledge-graph]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = root.querySelector('[data-graph-motion]');
  const buttons = [...root.querySelectorAll('[data-graph-note]')];
  const hubs = [
    { name: '오늘의 메모', description: '흘려보내기 아쉬운 생각 한 줄에서 시작하세요.' },
    { name: '읽은 책', description: '책에서 만난 문장을 나의 생각과 연결하세요.' },
    { name: '프로젝트', description: '기록 속 작은 실마리를 다음 실행으로 이어 보세요.' },
    { name: '새로운 아이디어', description: '서로 다른 기록 사이에서 새로운 관점을 발견하세요.' },
    { name: '글쓰기', description: '모아 둔 생각을 나만의 언어로 풀어내세요.' },
    { name: '배운 것', description: '오늘 배운 것을 오래 꺼내 볼 수 있는 기록으로.' }
  ];
  const titles = [
    '기록하는 습관', '이번 주 돌아보기', '좋은 질문', '인상 깊은 문장',
    '첫 번째 시도', '생각의 단서', '일상의 발견', '독서 노트',
    '다음 할 일', '관점 바꾸기', '쓰고 싶은 이야기', '작은 배움'
  ];
  let seed = 76291;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const nodes = [];
  for (let id = 0; id < 72; id++) {
    const hub = id < hubs.length ? id : (id - hubs.length) % hubs.length;
    const angle = hub * Math.PI / 3 - Math.PI / 2;
    const jitter = id < hubs.length ? 0 : 75;
    nodes.push({
      id, hub, name: id < hubs.length ? hubs[id].name : titles[(id - 6) % titles.length] + (id > 17 ? ` ${Math.floor((id - 6) / 12) + 1}` : ''),
      x: Math.cos(angle) * 116 + (random() - .5) * jitter,
      y: Math.sin(angle) * 116 + (random() - .5) * jitter,
      vx: 0, vy: 0, radius: id < 6 ? 6.2 + random() * 1.6 : 2.5 + random() * 1.4,
      accent: id >= 6 && id % 9 === 0 ? '#7cbe9b' : id >= 6 && id % 13 === 0 ? '#a08bc9' : null
    });
  }
  const edges = [], edgeIds = new Set();
  const adjacency = nodes.map(() => new Set());
  function connect(a, b) {
    const key = [a, b].sort((x, y) => x - y).join(':');
    if (a === b || edgeIds.has(key)) return;
    edgeIds.add(key);
    edges.push({ a, b, length: a < 6 && b < 6 ? 107 : 49 + random() * 22 });
    adjacency[a].add(b); adjacency[b].add(a);
  }
  [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [1, 5], [2, 3], [2, 5], [3, 4], [4, 5]].forEach(pair => connect(...pair));
  nodes.slice(6).forEach(node => {
    connect(node.id, node.hub);
    if (node.id >= 12) connect(node.id, node.id - 6);
    if (node.id % 6 === 0 && node.id < 70) connect(node.id, node.id + 1);
    if (node.id % 11 === 0) connect(node.id, (node.hub + 2) % 6);
  });

  // Small force simulation: repulsion separates notes; springs preserve links.
  // It is original demo data and does not read or transmit user notes.
  let drag = null, elapsed = 0;
  function simulate(ambient = false) {
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const first = nodes[a], second = nodes[b];
        const dx = first.x - second.x, dy = first.y - second.y;
        const squared = Math.max(dx * dx + dy * dy, 36);
        const force = 470 / squared;
        const distance = Math.sqrt(squared);
        const fx = dx / distance * force, fy = dy / distance * force;
        first.vx += fx; first.vy += fy;
        second.vx -= fx; second.vy -= fy;
      }
    }
    for (const edge of edges) {
      const a = nodes[edge.a], b = nodes[edge.b];
      const dx = b.x - a.x, dy = b.y - a.y, distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance - edge.length) * .012;
      const fx = dx / distance * force, fy = dy / distance * force;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
    for (const node of nodes) {
      node.vx -= node.x * .0013;
      node.vy -= node.y * .0013;
      if (ambient && node.id < 6) {
        node.vx += Math.sin(elapsed * .00065 + node.id * 1.7) * .095;
        node.vy += Math.cos(elapsed * .00052 + node.id * 1.1) * .095;
      }
      if (drag?.id === node.id) { node.vx = 0; node.vy = 0; continue; }
      node.vx = Math.max(-6, Math.min(6, node.vx * .73));
      node.vy = Math.max(-6, Math.min(6, node.vy * .73));
      node.x = Math.max(-500, Math.min(500, node.x + node.vx));
      node.y = Math.max(-500, Math.min(500, node.y + node.vy));
    }
  }
  for (let tick = 0; tick < 240; tick++) simulate();
  const initial = nodes.map(node => ({ x: node.x, y: node.y }));
  const maxX = Math.max(...nodes.map(node => Math.abs(node.x))) + 34;
  const maxY = Math.max(...nodes.map(node => Math.abs(node.y))) + 32;
  let width = 600, height = 400, scale = 1, dpr = 1, zoom = 1;
  let pan = { x: 0, y: 0 }, selected = null, hovered = null;
  let visible = false, paused = false, raf = 0, lastFrame = 0;
  let screenPoints = [], labelBoxes = [];
  const canAnimate = () => !paused && !reduced.matches;
  const isRunning = () => canAnimate() && visible && !document.hidden;
  const focus = () => hovered ?? selected;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const toScreen = node => ({
    x: width / 2 + (node.x * scale + pan.x) * zoom,
    y: height / 2 + (node.y * scale + pan.y) * zoom
  });
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    screenPoints = nodes.map(toScreen);
    const active = focus(), all = active === null;
    for (const edge of edges) {
      const a = screenPoints[edge.a], b = screenPoints[edge.b];
      const linked = edge.a === active || edge.b === active;
      ctx.strokeStyle = all ? '#626269a8' : linked ? '#a6a3bcd4' : '#45454c69';
      ctx.lineWidth = linked ? 1.25 : .85;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    nodes.forEach((node, id) => {
      const point = screenPoints[id], connected = all || id === active || adjacency[active]?.has(id);
      const radius = node.radius * clamp(Math.sqrt(zoom), .85, 1.35);
      ctx.globalAlpha = connected ? 1 : .38;
      ctx.fillStyle = id === active ? '#b4a1f1' : node.accent || (id < 6 ? '#ededf0' : '#929298');
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
      if (id === active) {
        ctx.strokeStyle = '#ae99ea85'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
    // Plain labels stay close to their nodes; avoid label-on-label overlaps.
    labelBoxes = [];
    const labeled = [...new Set([active, 0, 1, 2, 3, 4, 5].filter(id => id !== null))];
    for (const id of labeled) {
      const node = nodes[id], point = screenPoints[id];
      if (point.x < 0 || point.y < 0 || point.x > width || point.y > height) continue;
      const chosen = id === active;
      ctx.font = `${chosen ? 600 : 400} ${width < 400 ? 10 : 12}px "Segoe UI","Malgun Gothic",sans-serif`;
      const labelWidth = ctx.measureText(node.name).width;
      const positions = [
        { x: point.x - labelWidth / 2, y: point.y + node.radius + 10 },
        { x: point.x - labelWidth / 2, y: point.y - node.radius - 16 },
        { x: point.x + node.radius + 9, y: point.y - 3 },
        { x: point.x - labelWidth - node.radius - 9, y: point.y - 3 }
      ];
      let label = null;
      for (const candidate of positions) {
        const box = { id, x: clamp(candidate.x, 5, Math.max(5, width - labelWidth - 5)), y: clamp(candidate.y, 6, height - 18), w: labelWidth, h: 14 };
        const overlaps = labelBoxes.some(other => box.x < other.x + other.w + 5 && box.x + box.w + 5 > other.x && box.y < other.y + other.h + 3 && box.y + box.h + 3 > other.y);
        if (!overlaps) { label = box; break; }
      }
      if (!label) continue;
      labelBoxes.push(label);
      const connected = all || chosen || adjacency[active]?.has(id);
      ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#151517'; ctx.lineWidth = 4;
      ctx.strokeText(node.name, label.x, label.y);
      ctx.fillStyle = chosen ? '#dacbff' : connected ? '#c8c8d1' : '#696974';
      ctx.fillText(node.name, label.x, label.y);
    }
    root.dataset.zoom = zoom.toFixed(2);
  }
  function frame(time) {
    raf = 0;
    if (!isRunning()) return;
    if (!lastFrame || time - lastFrame >= 1000 / 30) {
      if (lastFrame) elapsed += Math.min(time - lastFrame, 80);
      lastFrame = time;
      simulate(true); draw();
    }
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    root.dataset.motion = reduced.matches ? 'reduced' : paused ? 'paused' : isRunning() ? 'playing' : 'idle';
    motion.disabled = reduced.matches;
    motion.setAttribute('aria-pressed', String(!canAnimate()));
    motion.querySelector('[data-motion-label]').textContent = reduced.matches ? '정적 보기' : paused ? '재생' : '멈춤';
    motion.firstElementChild.textContent = canAnimate() ? 'Ⅱ' : '▷';
    draw();
    if (isRunning()) raf = requestAnimationFrame(frame);
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    scale = Math.min(width / (maxX * 2), height / (maxY * 2)) * .94;
    pan = { x: 0, y: 0 };
    draw();
  }
  function choose(id) {
    selected = id === null || id === 'all' ? null : Number(id);
    hovered = null;
    buttons.forEach(button => {
      const value = button.dataset.graphNote === 'all' ? null : Number(button.dataset.graphNote);
      button.setAttribute('aria-pressed', String(value === selected));
    });
    root.querySelector('[data-graph-name]').textContent = selected === null ? '모든 생각의 연결' : nodes[selected].name;
    root.querySelector('[data-graph-description]').textContent = selected === null
      ? '기록이 쌓일수록, 나만의 지도가 자라납니다.'
      : hubs[selected]?.description || `${adjacency[selected].size}개의 노트와 연결된 기록입니다.`;
    root.dataset.selected = selected === null ? 'all' : String(selected);
    draw();
  }
  function setZoom(next) {
    zoom = clamp(next, .65, 1.8);
    root.querySelector('[data-graph-scale]').textContent = `${Math.round(zoom * 100)}%`;
    root.querySelector('[data-graph-zoom="out"]').disabled = zoom <= .65;
    root.querySelector('[data-graph-zoom="in"]').disabled = zoom >= 1.8;
    draw();
  }
  function pointAt(event) {
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }
  function hit(point) {
    for (const label of labelBoxes) {
      if (point.x >= label.x - 4 && point.x <= label.x + label.w + 4 && point.y >= label.y - 4 && point.y <= label.y + label.h + 4) return label.id;
    }
    let result = null, nearest = 16;
    screenPoints.forEach((candidate, id) => {
      const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
      if (distance < nearest) { nearest = distance; result = id; }
    });
    return result;
  }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    const point = pointAt(event), id = hit(point);
    drag = { id, x: point.x, y: point.y, startX: point.x, startY: point.y, moved: false, touch: event.pointerType === 'touch', pointerId: event.pointerId };
    // Touch leaves vertical page scrolling intact; taps still select nodes.
    if (!drag.touch) {
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
  });
  canvas.addEventListener('pointermove', event => {
    const point = pointAt(event);
    if (drag && drag.pointerId === event.pointerId) {
      const dx = point.x - drag.x, dy = point.y - drag.y;
      if (Math.hypot(point.x - drag.startX, point.y - drag.startY) > 3) drag.moved = true;
      if (drag.touch) return;
      if (drag.id === null) {
        pan.x = clamp(pan.x + dx / zoom, -width, width);
        pan.y = clamp(pan.y + dy / zoom, -height, height);
      } else {
        const node = nodes[drag.id];
        node.x = clamp(((point.x - width / 2) / zoom - pan.x) / scale, -500, 500);
        node.y = clamp(((point.y - height / 2) / zoom - pan.y) / scale, -500, 500);
        node.vx = 0; node.vy = 0; hovered = drag.id;
      }
      drag.x = point.x; drag.y = point.y;
      draw();
    } else if (event.pointerType !== 'touch') {
      hovered = hit(point);
      canvas.style.cursor = hovered === null ? 'grab' : 'pointer';
      if (!isRunning()) draw();
    }
  });
  function finishDrag(event, cancelled = false) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const ended = drag;
    drag = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = 'grab';
    if (!cancelled && !ended.moved) choose(ended.id);
    hovered = null; draw();
  }
  canvas.addEventListener('pointerup', event => finishDrag(event));
  canvas.addEventListener('pointercancel', event => finishDrag(event, true));
  canvas.addEventListener('lostpointercapture', event => finishDrag(event, true));
  canvas.addEventListener('pointerleave', () => { if (!drag) { hovered = null; draw(); } });
  buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.graphNote)));
  root.querySelectorAll('[data-graph-zoom]').forEach(button => button.addEventListener('click', () => setZoom(zoom + (button.dataset.graphZoom === 'in' ? .15 : -.15))));
  root.querySelector('[data-graph-reset]').addEventListener('click', () => {
    drag = null; pan = { x: 0, y: 0 }; elapsed = 0;
    nodes.forEach((node, id) => { Object.assign(node, initial[id]); node.vx = 0; node.vy = 0; });
    setZoom(1); choose(null);
  });
  motion.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => { drag = null; sync(); });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .05 });
  observer.observe(canvas);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; drag = null; });
  window.addEventListener('pageshow', sync);
  root.querySelector('[data-graph-count]').textContent = `${nodes.length}개 노트 · ${edges.length}개 연결`;
  root.dataset.nodes = String(nodes.length);
  root.dataset.edges = String(edges.length);
  resize(); choose(null); sync();
})();

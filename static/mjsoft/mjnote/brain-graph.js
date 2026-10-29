(() => {
  'use strict';
  const root = document.querySelector('[data-brain-demo]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = root.querySelector('[data-brain-motion]');
  const noteButtons = [...root.querySelectorAll('[data-brain-note]')];
  const notes = [
    { name: '오늘의 메모', x: -0.015, y: -0.04, kicker: '01 / 작은 기록의 시작', description: '흘려보내기 아쉬운 생각 한 줄.\n다음 아이디어가 여기서 시작됩니다.', related: '읽은 책 · 프로젝트 · 새로운 아이디어', color: [144, 191, 255] },
    { name: '읽은 책', x: -0.31, y: -0.28, kicker: '02 / 남겨 두고 싶은 문장', description: '책에서 만난 문장을 내 생각과 연결하세요.\n좋은 영감은 다시 꺼낼 때 더 깊어집니다.', related: '오늘의 메모 · 배운 것 · 새로운 아이디어', color: [156, 166, 255] },
    { name: '프로젝트', x: 0.30, y: -0.24, kicker: '03 / 생각을 실행으로', description: '메모에서 건져 올린 작은 실마리.\n다음 프로젝트의 출발점이 됩니다.', related: '오늘의 메모 · 나의 목표 · 작은 실험', color: [111, 203, 225] },
    { name: '새로운 아이디어', x: 0.22, y: 0.22, kicker: '04 / 뜻밖의 발견', description: '서로 멀어 보이던 두 기록 사이에서\n새로운 관점을 발견해 보세요.', related: '오늘의 메모 · 읽은 책 · 작은 실험', color: [173, 156, 242] },
    { name: '배운 것', x: -0.15, y: -0.46, color: [139, 175, 234] },
    { name: '작은 실험', x: -0.27, y: 0.19, color: [119, 192, 222] },
    { name: '나의 목표', x: 0.09, y: 0.43, color: [134, 175, 237] }
  ];
  let seed = 6139;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const nodes = notes.map((note, id) => ({ ...note, id, hub: id, phase: random() * Math.PI * 2, radius: id === 0 ? 7 : 4.8 }));
  // Two connected hemispheres form a visual metaphor, not an anatomical model.
  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 43; index++) {
      const angle = random() * Math.PI * 2;
      const radius = index < 15 ? 0.88 + random() * 0.1 : Math.sqrt(random()) * 0.88;
      const y = Math.sin(angle) * 0.53 * radius - 0.055;
      const taper = y > 0.16 ? 1 - (y - 0.16) * 0.65 : 1;
      const x = side * (0.045 + Math.abs(Math.cos(angle)) * 0.48 * radius * taper);
      let hub = 0, distance = Infinity;
      notes.forEach((note, i) => { const d = Math.hypot(note.x - x, note.y - y); if (d < distance) { distance = d; hub = i; } });
      nodes.push({ id: nodes.length, x, y, hub, phase: random() * Math.PI * 2, radius: 1.4 + random() * 1.6, color: notes[hub].color });
    }
  }
  const edges = [], edgeIds = new Set();
  const addEdge = (a, b, featured = false) => {
    const key = [a, b].sort((x, y) => x - y).join(':');
    if (a === b || edgeIds.has(key)) return;
    edgeIds.add(key); edges.push({ a, b, featured, phase: random() });
  };
  [[0, 1], [0, 2], [0, 3], [1, 4], [1, 3], [2, 6], [2, 5], [3, 5], [4, 5]].forEach(([a, b]) => addEdge(a, b, true));
  nodes.forEach(node => {
    const neighbors = nodes.filter(other => other.id !== node.id)
      .map(other => ({ id: other.id, distance: Math.hypot(node.x - other.x, node.y - other.y) }))
      .sort((a, b) => a.distance - b.distance).slice(0, node.id < notes.length ? 4 : 3);
    neighbors.forEach(other => { if (other.distance < 0.22) addEdge(node.id, other.id); });
  });
  let width = 800, height = 580, scale = 420, pixelRatio = 1;
  let selected = 0, hovered = null, paused = false, visible = false;
  let raf = 0, lastFrame = 0, elapsed = 0;
  const pointer = { x: 0, y: 0, inside: false };
  let points = [];
  const rgba = (color, alpha) => `rgba(${color.join(',')},${alpha})`;
  const animated = () => !paused && !reducedMotion.matches;
  const active = () => hovered === null ? selected : hovered;
  const relatedTo = (id, focus) => id === focus || nodes[id].hub === focus ||
    edges.some(edge => edge.featured && ((edge.a === focus && edge.b === id) || (edge.b === focus && edge.a === id)));
  const roundedRect = (x, y, w, h, radius) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
  };
  function draw() {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const compact = width < 600, focus = active();
    const centerX = width * (compact ? 0.5 : 0.55), centerY = height * (compact ? 0.53 : 0.46);
    const color = notes[focus].color;
    const drift = animated() ? elapsed : 0;
    const parallaxX = animated() ? pointer.x * (compact ? 4 : 10) : 0;
    const parallaxY = animated() ? pointer.y * 7 : 0;
    points = nodes.map(node => ({
      x: centerX + node.x * scale + Math.sin(drift * 0.00042 + node.phase) * (animated() ? 2.1 : 0) + parallaxX,
      y: centerY + node.y * scale + Math.cos(drift * 0.00034 + node.phase) * (animated() ? 2.3 : 0) + parallaxY
    }));
    const halo = ctx.createRadialGradient(centerX, centerY, scale * .08, centerX, centerY, scale * .75);
    halo.addColorStop(0, rgba(color, .055)); halo.addColorStop(.65, rgba(color, .018)); halo.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = halo; ctx.fillRect(0, 0, width, height);
    // Fine orbit lines establish space without obscuring the graph.
    ctx.save(); ctx.translate(centerX, centerY);
    [0.68, 0.83].forEach((radius, i) => {
      ctx.strokeStyle = `rgba(108,147,208,${i ? .06 : .09})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, scale * radius, scale * radius * .64, -.24, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
    for (const edge of edges) {
      const a = points[edge.a], b = points[edge.b];
      const connected = (nodes[edge.a].hub === focus || nodes[edge.b].hub === focus);
      const direct = edge.featured && (edge.a === focus || edge.b === focus);
      ctx.strokeStyle = rgba(direct ? color : [105, 145, 207], direct ? .58 : connected ? .29 : .115);
      ctx.lineWidth = direct ? 1.35 : .7;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (animated() && (direct || connected && edge.phase > .83)) {
        const t = ((elapsed * .00012 + edge.phase) % 1);
        const alpha = Math.sin(t * Math.PI) * .72;
        const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, direct ? 7 : 4);
        gradient.addColorStop(0, rgba(color, alpha)); gradient.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, direct ? 7 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba([215, 233, 255], alpha); ctx.beginPath(); ctx.arc(x, y, direct ? 1.6 : 1, 0, Math.PI * 2); ctx.fill();
      }
    }
    nodes.forEach((node, i) => {
      const point = points[i], isHub = i < notes.length, connected = relatedTo(i, focus), chosen = i === focus;
      if (isHub) {
        const radius = chosen ? 31 : 17;
        const glow = ctx.createRadialGradient(point.x, point.y, 1, point.x, point.y, radius);
        glow.addColorStop(0, rgba(node.color, chosen ? .31 : .13)); glow.addColorStop(1, rgba(node.color, 0));
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
      }
      if (chosen) {
        const pulse = animated() ? (Math.sin(elapsed * .0015) + 1) / 2 : .5;
        ctx.strokeStyle = rgba(color, .18 + pulse * .09); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(point.x, point.y, 16 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = rgba(node.color, chosen ? 1 : connected ? .9 : isHub ? .55 : .34);
      ctx.beginPath(); ctx.arc(point.x, point.y, node.radius * (compact ? .84 : 1), 0, Math.PI * 2); ctx.fill();
      if (isHub && (i < 4 || !compact)) {
        ctx.font = `${chosen ? 600 : 400} ${compact ? 10 : 12}px "Segoe UI","Malgun Gothic",sans-serif`;
        const label = node.name, labelWidth = ctx.measureText(label).width;
        const labelHeight = compact ? 25 : 29, x = point.x - labelWidth / 2 - 12, y = point.y + (chosen ? 21 : 14);
        roundedRect(x, y, labelWidth + 24, labelHeight, 6);
        ctx.fillStyle = chosen ? '#223b60ed' : '#0e1a2ee0'; ctx.fill();
        ctx.strokeStyle = chosen ? rgba(color, .4) : '#405b7c4a'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = chosen ? '#e4efff' : connected ? '#a9c4e9' : '#6682a8';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, point.x, y + labelHeight / 2);
      }
    });
  }
  function frame(time) {
    raf = 0;
    if (!visible || document.hidden || !animated()) return;
    if (!lastFrame || time - lastFrame >= 1000 / 30) {
      if (lastFrame) elapsed += Math.min(time - lastFrame, 100);
      lastFrame = time; draw();
    }
    raf = requestAnimationFrame(frame);
  }
  function syncAnimation() {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    const stopped = !animated();
    motionButton.setAttribute('aria-pressed', String(stopped));
    motionButton.disabled = reducedMotion.matches;
    motionButton.querySelector('[data-motion-label]').textContent = reducedMotion.matches ? '움직임 줄이기 적용' : paused ? '움직임 재생' : '움직임 멈추기';
    motionButton.firstElementChild.textContent = stopped ? '▷' : 'Ⅱ';
    root.dataset.motion = reducedMotion.matches ? 'reduced' : paused ? 'paused' : visible && !document.hidden ? 'playing' : 'idle';
    draw();
    if (visible && !document.hidden && animated()) raf = requestAnimationFrame(frame);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    scale = Math.min(width * (width < 600 ? .86 : .62), height * .78);
    draw();
  }
  function choose(id) {
    if (!notes[id]?.description) return;
    selected = id; hovered = null;
    noteButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.brainNote) === selected)));
    root.querySelector('[data-brain-kicker]').textContent = notes[id].kicker;
    root.querySelector('[data-brain-name]').textContent = notes[id].name;
    const paragraph = root.querySelector('[data-brain-description]');
    paragraph.replaceChildren(...notes[id].description.split('\n').flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    root.querySelector('[data-brain-related]').textContent = notes[id].related;
    draw();
  }
  const pointAt = event => {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  const nearestHub = (x, y) => {
    let found = null, nearest = 46;
    for (let i = 0; i < 4; i++) {
      const point = points[i]; if (!point) continue;
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < nearest) { nearest = distance; found = i; }
    }
    return found;
  };
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const point = pointAt(event);
    pointer.x = (point.x / width - .5) * 2; pointer.y = (point.y / height - .5) * 2; pointer.inside = true;
    hovered = nearestHub(point.x, point.y);
    canvas.style.cursor = hovered === null ? 'default' : 'pointer';
    if (!animated()) draw();
  });
  canvas.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; pointer.inside = false; hovered = null; if (!animated()) draw(); });
  canvas.addEventListener('click', event => {
    const point = pointAt(event), id = nearestHub(point.x, point.y);
    if (id !== null) choose(id);
  });
  noteButtons.forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.brainNote))));
  motionButton.addEventListener('click', () => { paused = !paused; syncAnimation(); });
  reducedMotion.addEventListener('change', syncAnimation);
  document.addEventListener('visibilitychange', syncAnimation);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; syncAnimation();
  }, { threshold: 0.05 });
  observer.observe(canvas);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf); raf = 0;
  });
  window.addEventListener('pageshow', syncAnimation);
  resize(); syncAnimation();
})();

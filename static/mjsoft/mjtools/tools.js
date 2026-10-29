'use strict';
const $ = id => document.getElementById(id);
const canvas = $('preview'), ctx = canvas.getContext('2d', {willReadFrequently: true});
const MAX_PIXELS = 12000000, MAX_SIDE = 12000, UPSCALE_PIXELS = 2000000;
let current = null, original = null, history = null, tool = 'background', selection = null;
let worker = null, busy = false, fileName = 'image', faceReady = null, operationId = 0, revision = 0, activeKind = null, start = null;
const config = {
  background: ['배경 제거', '피사체를 남기고 배경을 투명하게 만듭니다. PNG로 저장하면 투명 배경이 유지됩니다.', '배경 제거하기'],
  upscale: ['AI 2배 확대', '사진의 디테일을 보완하며 가로·세로를 2배로 키웁니다. 입력은 200만 픽셀까지 지원합니다.', '2배로 확대하기'],
  mosaic: ['얼굴 모자이크', '자동으로 얼굴을 찾아 가립니다. 놓친 얼굴은 사진 위에 영역을 그려 직접 가릴 수 있습니다.', '얼굴 자동 감지 · 가리기'],
  erase: ['물체 지우기', '지울 물체와 그 가장자리를 드래그해 선택하세요. 주변 배경을 참고해 선택 영역을 채웁니다.', '선택 영역 지우기'],
  edit: ['이미지 편집', '밝기·대비·채도와 크기는 적용 버튼으로 확정됩니다. 자르기·회전·반전은 바로 적용됩니다.', '편집 적용하기'],
  convert: ['형식 변환', '오른쪽에서 PNG, JPG 또는 WebP를 선택하고 다운로드하세요. 애니메이션은 첫 장면으로 저장됩니다.', '선택한 형식으로 다운로드']
};
const formats = {'image/png': 'PNG', 'image/jpeg': 'JPG', 'image/webp': 'WebP'};
function status(message) { $('status').textContent = message; }
function syncControls() {
  document.querySelectorAll('.tool-tabs button,#tool-select,#guide-start,#replace,#upload,#sample,#file').forEach(b => b.disabled = busy);
  document.querySelectorAll('#controls button,#controls input,#controls select').forEach(b => b.disabled = busy || !current);
  $('apply').disabled = busy || !current;
  $('download').disabled = busy || !current;
  $('undo').disabled = busy || !history;
  $('reset').disabled = busy || !current || current === original;
  $('format').disabled = busy || !current;
  $('quality').disabled = busy || !current || $('format').value === 'image/png';
  $('quality-value').textContent = $('format').value === 'image/png' ? '무손실' : $('quality').value + '%';
  $('download').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/></svg>' + formats[$('format').value] + ' 다운로드';
  for (const id of ['manual-mosaic', 'crop']) if ($(id)) $(id).disabled = busy || !current || !selection;
  canvas.style.cursor = current && ['erase', 'mosaic', 'edit'].includes(tool) ? 'crosshair' : 'default';
}
function setBusy(value, label = '처리 중', kind = null) {
  const wasBusy = busy;
  busy = value;
  activeKind = value ? kind : null;
  $('busy').hidden = !value;
  $('busy-label').textContent = label;
  $('progress').removeAttribute('value');
  $('cancel').textContent = kind === 'faces' ? '결과 취소' : '취소';
  document.querySelector('.workspace').setAttribute('aria-busy', String(value));
  syncControls();
  if (value && !wasBusy) $('cancel').focus({preventScroll: true});
  if (!value && document.activeElement === $('cancel')) (current ? $('apply') : $('upload')).focus({preventScroll: true});
}
function clearSelection() {
  start = null;
  selection = null;
  $('selection').style.display = 'none';
  syncControls();
}
function renderSelection() {
  const overlay = $('selection');
  if (!selection || !current) { overlay.style.display = 'none'; return; }
  const r = canvas.getBoundingClientRect(), wrap = $('canvas-wrap').getBoundingClientRect();
  Object.assign(overlay.style, {
    display: 'block',
    left: (r.left - wrap.left + selection.x * r.width / canvas.width) + 'px',
    top: (r.top - wrap.top + selection.y * r.height / canvas.height) + 'px',
    width: (selection.width * r.width / canvas.width) + 'px',
    height: (selection.height * r.height / canvas.height) + 'px'
  });
}
function resetAdjustments() {
  for (const id of ['brightness', 'contrast', 'saturation']) if ($(id)) $(id).value = 100;
}
function draw() {
  canvas.width = current.width;
  canvas.height = current.height;
  ctx.putImageData(current, 0, 0);
  if ($('resize')) $('resize').value = current.width;
  $('empty').hidden = true;
  $('canvas-wrap').hidden = false;
  $('dimensions').textContent = current.width.toLocaleString() + ' × ' + current.height.toLocaleString() + ' px';
  $('filename').textContent = fileName;
  canvas.setAttribute('aria-label', '사진 미리보기. ' + current.width + ' × ' + current.height + ' 픽셀. 영역 선택은 드래그하거나 방향키를 사용하세요. Shift와 방향키는 크기 조절, Escape는 선택 해제입니다.');
  clearSelection();
}
function commit(image, message) {
  // ImageData values are immutable in this UI; keep one previous result without another full-size copy.
  history = current;
  current = image;
  revision++;
  draw();
  resetAdjustments();
  status(message || '완료되었습니다. 다음 작업을 이어가거나 다운로드하세요.');
}
function switchTool(next) {
  if (busy || !config[next]) return;
  tool = next;
  if ($('tool-select')) $('tool-select').value = next;
  if (window.location.hash !== '#' + next) window.history.replaceState(null, '', '#' + next);
  clearSelection();
  document.querySelectorAll('[data-tool]').forEach(b => {
    b.setAttribute('aria-selected', String(b.dataset.tool === next));
    b.tabIndex = b.dataset.tool === next ? 0 : -1;
  });
  document.querySelector('.workspace').setAttribute('aria-labelledby', 'tab-' + next);
  const c = config[next];
  $('tool-title').textContent = c[0];
  $('tool-description').textContent = c[1];
  $('apply').textContent = c[2];
  let html = '';
  const help = '<p class="selection-help">사진을 드래그해 선택하세요. 키보드에서는 미리보기에 초점을 두고 방향키로 선택·이동, Shift+방향키로 크기 조절, Esc로 해제할 수 있습니다.</p>';
  if (next === 'mosaic') html = '<label for="block">모자이크 크기</label><input id="block" type="range" min="8" max="60" value="22"><div class="option-row"><button id="manual-mosaic">선택 영역 가리기</button></div>' + help;
  if (next === 'erase') html = '<p>첫 사용 시 약 208 MB의 AI 모델을 받습니다. 기기에 따라 시간이 걸릴 수 있습니다.</p>' + help;
  if (next === 'edit') html = '<div class="option-row"><button data-edit="rotate">90° 회전</button><button data-edit="flip">좌우 반전</button><button data-edit="flip-v">상하 반전</button></div><div class="option-row"><button id="crop">선택 영역 자르기</button></div>' + help + '<label for="brightness">밝기</label><input id="brightness" type="range" min="50" max="150" value="100"><label for="contrast">대비</label><input id="contrast" type="range" min="50" max="150" value="100"><label for="saturation">채도</label><input id="saturation" type="range" min="0" max="200" value="100"><label for="resize">가로 크기 (px, 비율 유지)</label><input id="resize" type="number" min="1" max="12000" step="1" value="' + (current ? current.width : 1000) + '">';
  if (next === 'background') html = '<p>머리카락이나 복잡한 배경은 결과를 확인해 주세요. 첫 사용 시 약 5 MB 모델을 받습니다.</p>';
  if (next === 'upscale') html = '<p>작은 사진에 적합합니다. 원본의 상태에 따라 선명도 개선 정도가 다릅니다.</p>';
  $('controls').innerHTML = html;
  document.querySelector('.options').scrollTop = 0;
  status(current ? '현재 결과에 적용합니다.' : '사진을 선택해 주세요.');
  if ($('manual-mosaic')) $('manual-mosaic').onclick = () => { if (current && !busy && selection) mosaic([selection]); };
  if ($('crop')) $('crop').onclick = () => {
    if (!current || busy || !selection) return;
    const r = selection, cv = document.createElement('canvas'), c = cv.getContext('2d');
    cv.width = r.width; cv.height = r.height;
    c.putImageData(current, -r.x, -r.y);
    commit(c.getImageData(0, 0, r.width, r.height), '선택한 영역으로 잘랐습니다.');
    cv.width = cv.height = 0;
  };
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => transform(b.dataset.edit));
  syncControls();
  document.dispatchEvent(new CustomEvent('mjtools:toolchange', {detail: {tool: next}}));
}
function validateSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) {
    throw Error('가로·세로 각각 12,000 px, 전체 1,200만 픽셀 이하의 사진을 사용해 주세요.');
  }
}
async function loadFile(file) {
  if (!file || busy) return;
  const operation = ++operationId;
  let image;
  setBusy(true, '사진을 여는 중입니다', 'load');
  try {
    if (file.size > 20 * 1024 * 1024) throw Error('20 MB 이하의 사진을 선택해 주세요.');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('PNG, JPG, WebP 사진을 선택해 주세요.');
    image = await createImageBitmap(file);
    if (operation !== operationId) return;
    validateSize(image.width, image.height);
    const cv = document.createElement('canvas');
    cv.width = image.width; cv.height = image.height;
    const c = cv.getContext('2d');
    c.drawImage(image, 0, 0);
    const next = c.getImageData(0, 0, cv.width, cv.height);
    cv.width = cv.height = 0;
    current = original = next;
    history = null;
    fileName = file.name;
    revision++;
    setBusy(false);
    draw();
    switchTool(tool);
  } catch (e) {
    if (operation === operationId) status(e.message || '사진을 열지 못했습니다. 다른 파일로 다시 시도해 주세요.');
  } finally {
    if (image) image.close();
    if (operation === operationId) setBusy(false);
  }
}
$('file').onchange = e => { loadFile(e.target.files[0]); e.target.value = ''; };
$('upload').onclick = $('replace').onclick = () => { if (!busy) $('file').click(); };
const zone = $('dropzone');
zone.ondragover = e => { e.preventDefault(); if (!busy) zone.classList.add('dragover'); };
zone.ondragleave = () => zone.classList.remove('dragover');
zone.ondrop = e => { e.preventDefault(); zone.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); };
$('sample').onclick = () => {
  if (busy) return;
  ++operationId;
  const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600;
  const c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 800, 600);
  g.addColorStop(0, '#b2dfd2'); g.addColorStop(1, '#eff3dd'); c.fillStyle = g; c.fillRect(0, 0, 800, 600);
  c.fillStyle = '#89b6a0'; c.beginPath(); c.ellipse(400, 510, 170, 25, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#efb887'; c.beginPath(); c.roundRect(280, 210, 240, 290, 65); c.fill();
  c.fillStyle = '#fff3de'; c.beginPath(); c.ellipse(400, 220, 120, 48, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#df9f6b'; c.lineWidth = 27; c.beginPath(); c.arc(525, 340, 70, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.fillStyle = '#9e6141'; c.beginPath(); c.ellipse(400, 220, 94, 31, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#fff7e4'; c.lineWidth = 12;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(360 + i * 40, 145); c.bezierCurveTo(330 + i * 40, 110, 400 + i * 40, 95, 370 + i * 40, 55); c.stroke(); }
  current = original = c.getImageData(0, 0, 800, 600);
  cv.width = cv.height = 0;
  history = null; fileName = 'mjtools-sample.png'; revision++;
  draw(); switchTool(tool);
};
function point(e) {
  const r = canvas.getBoundingClientRect();
  return {x: Math.max(0, Math.min(canvas.width, (e.clientX - r.left) * canvas.width / r.width)), y: Math.max(0, Math.min(canvas.height, (e.clientY - r.top) * canvas.height / r.height))};
}
function updatePointerSelection(e) {
  if (!start || e.pointerId !== start.pointerId) return;
  const p = point(e), x = Math.floor(Math.min(start.x, p.x)), y = Math.floor(Math.min(start.y, p.y));
  selection = {x, y, width: Math.min(canvas.width, Math.ceil(Math.max(start.x, p.x))) - x, height: Math.min(canvas.height, Math.ceil(Math.max(start.y, p.y))) - y};
  renderSelection();
}
canvas.tabIndex = 0;
canvas.onpointerdown = e => {
  if (!current || busy || !e.isPrimary || e.button !== 0 || !['erase', 'mosaic', 'edit'].includes(tool)) return;
  e.preventDefault();
  clearSelection();
  start = {...point(e), pointerId: e.pointerId};
  canvas.focus({preventScroll: true});
  canvas.setPointerCapture(e.pointerId);
};
canvas.onpointermove = updatePointerSelection;
canvas.onpointerup = e => {
  if (!start || e.pointerId !== start.pointerId) return;
  updatePointerSelection(e); start = null;
  if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  if (!selection || selection.width < 2 || selection.height < 2) clearSelection();
  else { syncControls(); status('선택: ' + selection.width + ' × ' + selection.height + ' px'); }
};
canvas.onpointercancel = () => clearSelection();
canvas.onlostpointercapture = () => { if (start) clearSelection(); };
canvas.onkeydown = e => {
  if (busy || !current || !['erase', 'mosaic', 'edit'].includes(tool)) return;
  if (e.key === 'Escape') { e.preventDefault(); clearSelection(); status('선택을 해제했습니다.'); return; }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  if (!selection) {
    const width = Math.min(current.width, Math.max(2, Math.round(current.width / 4)));
    const height = Math.min(current.height, Math.max(2, Math.round(current.height / 4)));
    selection = {x: Math.floor((current.width - width) / 2), y: Math.floor((current.height - height) / 2), width, height};
  } else {
    const step = e.ctrlKey || e.metaKey ? 10 : 1, dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
    if (e.shiftKey) {
      selection.width = Math.max(Math.min(2, current.width), Math.min(current.width - selection.x, selection.width + dx));
      selection.height = Math.max(Math.min(2, current.height), Math.min(current.height - selection.y, selection.height + dy));
    } else {
      selection.x = Math.max(0, Math.min(current.width - selection.width, selection.x + dx));
      selection.y = Math.max(0, Math.min(current.height - selection.height, selection.y + dy));
    }
  }
  renderSelection(); syncControls();
  status('선택: ' + selection.width + ' × ' + selection.height + ' px, 위치 ' + selection.x + ', ' + selection.y);
};
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(renderSelection).observe(canvas);
else window.addEventListener('resize', renderSelection);
function transform(type) {
  if (!current || busy) return;
  const cv = document.createElement('canvas'), rotate = type === 'rotate';
  cv.width = rotate ? current.height : current.width; cv.height = rotate ? current.width : current.height;
  const c = cv.getContext('2d');
  if (rotate) { c.translate(cv.width, 0); c.rotate(Math.PI / 2); }
  else if (type === 'flip-v') { c.translate(0, cv.height); c.scale(1, -1); }
  else { c.translate(cv.width, 0); c.scale(-1, 1); }
  c.drawImage(canvas, 0, 0);
  commit(c.getImageData(0, 0, cv.width, cv.height));
  cv.width = cv.height = 0;
}
function edit() {
  const width = Math.round(Number($('resize').value)), height = Math.round(current.height * width / current.width);
  validateSize(width, height);
  const brightness = Number($('brightness').value), contrast = Number($('contrast').value), saturation = Number($('saturation').value);
  const cv = document.createElement('canvas'); cv.width = width; cv.height = height;
  const c = cv.getContext('2d');
  c.imageSmoothingQuality = 'high';
  c.filter = 'brightness(' + brightness + '%) contrast(' + contrast + '%) saturate(' + saturation + '%)';
  c.drawImage(canvas, 0, 0, width, height);
  commit(c.getImageData(0, 0, width, height));
  cv.width = cv.height = 0;
}
function mosaic(rects) {
  if (!current || busy && activeKind !== 'faces') return;
  const cv = document.createElement('canvas'); cv.width = current.width; cv.height = current.height;
  const c = cv.getContext('2d'); c.putImageData(current, 0, 0);
  const block = Number($('block').value);
  let count = 0;
  for (const raw of rects) {
    const x = Math.max(0, Math.floor(raw.x)), y = Math.max(0, Math.floor(raw.y));
    const w = Math.min(cv.width, Math.ceil(raw.x + raw.width)) - x, h = Math.min(cv.height, Math.ceil(raw.y + raw.height)) - y;
    if (w < 1 || h < 1) continue;
    const tiny = document.createElement('canvas');
    tiny.width = Math.max(1, Math.ceil(w / block)); tiny.height = Math.max(1, Math.ceil(h / block));
    tiny.getContext('2d').drawImage(canvas, x, y, w, h, 0, 0, tiny.width, tiny.height);
    c.imageSmoothingEnabled = false;
    c.clearRect(x, y, w, h);
    c.drawImage(tiny, 0, 0, tiny.width, tiny.height, x, y, w, h);
    tiny.width = tiny.height = 0;
    count++;
  }
  if (count) commit(c.getImageData(0, 0, cv.width, cv.height), count + '개 영역을 가렸습니다. 놓친 얼굴이 있는지 확인해 주세요.');
  cv.width = cv.height = 0;
}
function loadFaces() {
  if (!faceReady) faceReady = new Promise((resolve, reject) => {
    const ready = async () => {
      try {
        // This bundled TensorFlow.js predates current Chromium WebGL implementations.
        // CPU inference avoids silent all-empty detections on unsupported GPU paths.
        if (!await faceapi.tf.setBackend('cpu')) throw Error('얼굴 감지 실행 환경을 준비하지 못했습니다.');
        if (faceapi.tf.ready) await faceapi.tf.ready();
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
        resolve();
      } catch (e) { reject(e); }
    };
    if (window.faceapi) { ready(); return; }
    const script = document.createElement('script'); script.src = './vendor/face-api.min.js';
    script.onload = ready;
    script.onerror = () => { script.remove(); reject(Error('얼굴 감지 기능을 불러오지 못했습니다.')); };
    document.head.append(script);
  }).catch(e => { faceReady = null; throw e; });
  return faceReady;
}
async function faces() {
  const operation = ++operationId, before = current;
  setBusy(true, '얼굴을 찾고 있습니다 · 취소 시 결과를 적용하지 않습니다', 'faces');
  try {
    await loadFaces();
    await new Promise(resolve => setTimeout(resolve, 20));
    if (operation !== operationId || before !== current) return;
    const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: .3}));
    if (operation !== operationId || before !== current) return;
    if (!detections.length) { status('얼굴을 찾지 못했습니다. 사진 위에 영역을 그려 직접 가려 주세요.'); return; }
    const rects = detections.map(d => { const b = d.box, pad = Math.max(b.width, b.height) * .15; return {x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2}; });
    mosaic(rects);
  } catch (e) {
    if (operation === operationId) status('얼굴 감지 실패: ' + (e.message || '다시 시도해 주세요.'));
  } finally { if (operation === operationId) setBusy(false); }
}
function stopWorker(job) {
  job.terminate();
  if (worker === job) { worker = null; setBusy(false); }
}
function ai() {
  if (tool === 'upscale' && current.width * current.height > UPSCALE_PIXELS) throw Error('AI 확대는 200만 픽셀까지 지원합니다. 편집에서 크기를 줄여 주세요.');
  if (tool === 'upscale' && (current.width * 2 > MAX_SIDE || current.height * 2 > MAX_SIDE)) throw Error('확대 결과의 가로·세로는 각각 12,000 px까지 지원합니다. 편집에서 크기를 줄여 주세요.');
  if (tool === 'erase' && (!selection || selection.width < 2 || selection.height < 2)) throw Error('사진 위에서 지울 영역을 드래그해 선택해 주세요.');
  if (tool === 'erase' && selection.width * selection.height > current.width * current.height * .75) throw Error('사진의 75%보다 작은 영역을 선택해 주세요.');
  const operation = ++operationId, before = current, requestedTool = tool;
  setBusy(true, 'AI를 준비하고 있습니다', 'ai');
  let job;
  try {
    job = new Worker('./ai-worker.js'); worker = job;
    job.onmessage = ({data: m}) => {
      if (operation !== operationId || worker !== job || before !== current) return;
      if (m.type === 'progress') {
        if (Number.isFinite(m.value)) $('progress').value = Math.max(0, Math.min(100, m.value));
        $('busy-label').textContent = m.label;
      } else if (m.type === 'error') {
        stopWorker(job); status('처리 실패: ' + m.message);
      } else if (m.type === 'result') {
        try {
          validateSize(m.width, m.height);
          const pixels = new Uint8ClampedArray(m.pixels);
          if (pixels.length !== m.width * m.height * 4) throw Error('처리 결과의 픽셀 크기가 올바르지 않습니다.');
          const image = new ImageData(pixels, m.width, m.height);
          stopWorker(job);
          if (requestedTool === 'background') $('format').value = 'image/png';
          commit(image, requestedTool === 'background' ? '배경을 제거했습니다. 투명 배경을 보존하도록 PNG 저장을 선택했습니다.' : undefined);
        } catch (e) { stopWorker(job); status('처리 실패: ' + e.message); }
      }
    };
    job.onerror = e => {
      if (operation !== operationId || worker !== job) return;
      stopWorker(job);
      status('AI 실행에 실패했습니다. 최신 브라우저에서 다시 시도해 주세요. ' + (e.message || ''));
    };
    const copy = new Uint8ClampedArray(current.data);
    job.postMessage({tool, width: current.width, height: current.height, pixels: copy.buffer, selection: selection ? {...selection} : null}, [copy.buffer]);
  } catch (e) { if (job) stopWorker(job); else setBusy(false); throw e; }
}
$('cancel').onclick = () => {
  if (!busy) return;
  const kind = activeKind;
  ++operationId;
  if (worker) { worker.terminate(); worker = null; }
  setBusy(false);
  status(kind === 'faces' ? '취소했습니다. 진행 중인 얼굴 감지 결과는 적용하지 않습니다.' : '취소했습니다. 사진은 변경되지 않았습니다.');
};
$('apply').onclick = async () => {
  if (!current || busy) return;
  try {
    if (tool === 'convert') download();
    else if (tool === 'edit') edit();
    else if (tool === 'mosaic') await faces();
    else ai();
  } catch (e) { status(e.message || '작업을 완료하지 못했습니다.'); }
};
$('undo').onclick = () => {
  if (!history || busy) return;
  current = history; history = null; revision++;
  draw(); resetAdjustments();
  status('직전 작업을 되돌렸습니다.');
};
$('undo').title = '직전 작업 한 번 되돌리기';
$('reset').onclick = () => {
  if (!original || busy || current === original) return;
  history = current; current = original; revision++;
  draw(); resetAdjustments();
  status('원본 사진으로 돌아왔습니다.');
};
const tabs = [...document.querySelectorAll('[data-tool]')], workspace = document.querySelector('.workspace');
workspace.id = 'tool-panel'; workspace.setAttribute('role', 'tabpanel');
tabs.forEach((b, index) => {
  b.id = 'tab-' + b.dataset.tool; b.setAttribute('aria-controls', 'tool-panel');
  const icon = b.querySelector('b'); if (icon) icon.setAttribute('aria-hidden', 'true');
  b.onclick = () => switchTool(b.dataset.tool);
  b.onkeydown = e => {
    if (busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length;
    switchTool(tabs[next].dataset.tool); tabs[next].focus();
  };
});
$('quality').oninput = syncControls;
$('format').onchange = syncControls;
if ($('tool-select')) $('tool-select').onchange = e => switchTool(e.target.value);
window.addEventListener('hashchange', () => {
  const next = window.location.hash.slice(1);
  if (!config[next] || next === tool) return;
  if (busy) window.history.replaceState(null, '', '#' + tool);
  else switchTool(next);
});
function download() {
  if (!current || busy) return;
  const cv = document.createElement('canvas'); cv.width = current.width; cv.height = current.height;
  const c = cv.getContext('2d'), format = $('format').value, exportName = fileName, exportRevision = revision;
  if (format === 'image/jpeg') { c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); }
  c.drawImage(canvas, 0, 0);
  try {
    cv.toBlob(blob => {
      cv.width = cv.height = 0;
      if (!blob) { if (revision === exportRevision) status('파일 저장에 실패했습니다. 다른 형식으로 시도해 주세요.'); return; }
      if (blob.type !== format) { if (revision === exportRevision) status('이 브라우저는 선택한 저장 형식을 지원하지 않습니다. PNG 또는 JPG를 선택해 주세요.'); return; }
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url;
      a.download = exportName.replace(/\.[^.]+$/, '') + '-mjtools.' + ({'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'}[format]);
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (revision === exportRevision && !busy) status(formats[format] + ' 저장 준비 완료 · ' + (blob.size / 1024).toFixed(0) + ' KB');
    }, format, Number($('quality').value) / 100);
  } catch (e) { cv.width = cv.height = 0; status('파일 저장에 실패했습니다. ' + e.message); }
}
$('download').onclick = download;
$('busy-label').setAttribute('role', 'status');
$('busy-label').setAttribute('aria-live', 'polite');
$('progress').setAttribute('aria-label', '처리 진행률');
document.querySelector('.spinner').setAttribute('aria-hidden', 'true');
window.addEventListener('pagehide', () => { ++operationId; if (worker) worker.terminate(); });
const initialTool = window.location.hash.slice(1);
switchTool(config[initialTool] ? initialTool : tool);

// Match the product navigation used by the other Mj소프트 pages.
(() => {
  const menu = document.getElementById('section-menu');
  const toggle = document.querySelector('.product-nav .menu-toggle');
  const close = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '제품 메뉴 열기');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '제품 메뉴 닫기' : '제품 메뉴 열기');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
})();

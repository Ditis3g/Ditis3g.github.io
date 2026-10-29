(() => {
  'use strict';
  const script = document.currentScript;
  const product = script.dataset.feedbackProduct;
  const endpoint = new URL('./feedback.cgi', script.src);
  const dialog = document.querySelector('#feedback-dialog');
  const form = document.querySelector('#feedback-form');
  const field = document.querySelector('#feedback-content');
  const status = document.querySelector('#feedback-status');
  const submit = form.querySelector('[type="submit"]');
  const actions = form.querySelector('.feedback-actions');
  let pendingId = null;
  let pendingContent = null;
  let busy = false;
  let sent = false;
  const count = () => {
    document.querySelector('#feedback-count').textContent = field.value.length.toLocaleString() + ' / 5,000';
  };
  const uuid = () => {
    if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
    // randomUUID is unavailable on the NAS's plain HTTP origin.
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
  };
  document.querySelectorAll('[data-feedback-open]').forEach(button => {
    button.addEventListener('click', () => {
      if (sent) {
        sent = false;
        status.textContent = '';
        status.className = 'feedback-status';
        field.disabled = false;
        submit.hidden = false;
        actions.querySelector('[data-feedback-close]').textContent = '취소';
      }
      dialog.showModal();
      document.body.classList.add('dialog-open');
      field.focus();
    });
  });
  const close = () => { if (!busy) dialog.close(); };
  dialog.querySelectorAll('[data-feedback-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
  });
  // Keep draft text when closed; discard it only after the server confirms storage.
  field.addEventListener('input', () => {
    count();
    if (!busy && !sent) status.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || sent) return;
    const content = field.value.trim();
    if (!content) {
      status.textContent = '문의 내용이나 의견을 입력해 주세요.';
      field.focus();
      return;
    }
    if (content.length > 5000) return;
    if (!pendingId || content !== pendingContent) {
      pendingId = uuid();
      pendingContent = content;
    }
    busy = true;
    submit.disabled = true;
    submit.textContent = '저장 중…';
    field.readOnly = true;
    status.textContent = '';
    status.className = 'feedback-status';
    dialog.querySelectorAll('[data-feedback-close]').forEach(button => { button.disabled = true; });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ content, product, submission_id: pendingId }),
        signal: controller.signal
      });
      // Web Station replaces some error responses with an HTML error page.
      const fallback = {
        400: '문의 내용이나 의견을 1~5,000자로 작성해 주세요.',
        403: '제품 페이지를 새로고침한 뒤 다시 보내 주세요.',
        413: '내용은 5,000자 이내로 작성해 주세요.',
        429: '잠시 후 다시 보내 주세요. 작성한 내용은 그대로 남아 있습니다.'
      };
      const isJson = (response.headers.get('Content-Type') || '').includes('application/json');
      const result = isJson ? await response.json() : {};
      if (!response.ok || result.ok !== true) throw new Error(result.message || fallback[response.status] || '지금은 저장하지 못했습니다. 내용은 남아 있으니 잠시 후 다시 보내 주세요.');
      sent = true;
      pendingId = null;
      pendingContent = null;
      field.value = '';
      count();
      field.disabled = true;
      submit.hidden = true;
      actions.querySelector('[data-feedback-close]').textContent = '닫기';
      status.textContent = result.message;
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? '연결이 지연되고 있습니다. 내용은 남아 있으니 다시 보내 주세요.' : ((error instanceof TypeError || error instanceof SyntaxError) ? '연결하지 못했습니다. 내용은 남아 있으니 잠시 후 다시 보내 주세요.' : error.message);
      status.classList.add('is-error');
    } finally {
      clearTimeout(timer);
      busy = false;
      field.readOnly = false;
      submit.disabled = false;
      submit.textContent = '의견 보내기';
      dialog.querySelectorAll('[data-feedback-close]').forEach(button => { button.disabled = false; });
    }
  });
})();

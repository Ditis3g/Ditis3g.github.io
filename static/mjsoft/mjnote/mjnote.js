(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('section-menu');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav?.classList.toggle('open', !expanded);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
  }));
  const dialog = document.getElementById('note-image-dialog');
  document.querySelectorAll('[data-shot]').forEach(button => button.addEventListener('click', () => {
    if (!dialog) return;
    const name = button.dataset.shot === 'graph' ? 'graph' : 'workspace';
    dialog.querySelector('img').src = `./assets/${name}.png`;
    dialog.querySelector('img').alt = name === 'graph' ? 'MjNote 실제 연결 그래프' : 'MjNote 실제 편집 화면';
    dialog.showModal();
  }));
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();

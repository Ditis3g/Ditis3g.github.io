(() => {
  'use strict';
  const menu = document.querySelector('#section-menu');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '제품 메뉴 열기');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '제품 메뉴 닫기' : '제품 메뉴 열기');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const dialog = document.querySelector('#office-image-dialog');
  const screens = { workspace: { src: './assets/workspace.png', alt: 'MjOffice 메인 작업 공간' } };
  document.querySelectorAll('.office-shot-open').forEach(button => button.addEventListener('click', () => {
    const screen = screens[button.dataset.image];
    dialog.querySelector('img').src = screen.src;
    dialog.querySelector('img').alt = screen.alt;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open'); });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });

  // The HTML links work immediately; metadata keeps the displayed file facts current.
  const setText = (selector, value) => {
    if (typeof value === 'string' && value.length <= 100) document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
  };
  fetch('./release.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Release metadata unavailable');
    return response.json();
  }).then(release => {
    const download = release.download;
    if (release.status !== 'available' || !download || download.version !== '0.3.2' || !/^\.\/downloads\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:exe|zip)$/.test(download.url || '') || !/^[a-f0-9]{64}$/.test(download.sha256 || '') || !Number.isSafeInteger(download.bytes) || download.bytes <= 0) return;
    document.querySelectorAll('[data-package-download]').forEach(link => { link.href = download.url; });
    setText('[data-package-sha]', download.sha256);
    setText('[data-package-size]', (download.bytes / 1048576).toFixed(1) + ' MiB');
  }).catch(() => { /* The current, accurate HTML remains usable without metadata. */ });
})();

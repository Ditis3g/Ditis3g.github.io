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
  const screens = {
    viewer: { src: './assets/mjsee-viewer.png', alt: 'MjSee 0.33 실제 사진 보기 화면' },
    editor: { src: './assets/mjsee-editor.png', alt: 'MjSee 0.33 실제 사진 편집 화면' }
  };
  const dialog = document.querySelector('#see-image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      const screen = screens[button.dataset.image];
      const image = document.querySelector('#see-zoom-image');
      image.src = screen.src;
      image.alt = screen.alt;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
})();

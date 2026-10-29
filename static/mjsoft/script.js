(() => {
  'use strict';
  const downloadDialog = document.querySelector('#download-dialog');
  const imageDialog = document.querySelector('#image-dialog');
  const openDialog = dialog => {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
  };
  document.querySelectorAll('[data-download]').forEach(button => {
    button.addEventListener('click', () => openDialog(downloadDialog));
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#section-menu');
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '제품 메뉴 열기');
  };
  menuButton.addEventListener('click', () => {
    const opened = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? '제품 메뉴 닫기' : '제품 메뉴 열기');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const screens = {
    main: { src: './assets/main-window.png', alt: 'MjZip 문서에 수록된 파일 목록과 이미지 미리보기 개발 화면' },
    create: { src: './assets/new-archive.png', alt: 'MjZip 문서에 수록된 새 압축파일 생성 설정 개발 화면' }
  };
  const screenshot = document.querySelector('#product-screenshot');
  const panel = document.querySelector('#screenshot-panel');
  const tabs = [...document.querySelectorAll('[data-screen]')];
  function selectScreen(tab, focus = false) {
    const screen = screens[tab.dataset.screen];
    tabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    screenshot.src = screen.src;
    screenshot.alt = screen.alt;
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScreen(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        selectScreen(next, true);
      }
    });
  });
  document.querySelector('.screenshot-open').addEventListener('click', () => {
    const zoomed = document.querySelector('#zoomed-screenshot');
    zoomed.src = screenshot.src;
    zoomed.alt = screenshot.alt;
    openDialog(imageDialog);
  });

  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('.format-tile').forEach(tile => {
      tile.hidden = button.dataset.filter !== 'all' && tile.dataset.type !== button.dataset.filter;
    });
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        menu.querySelectorAll('a').forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('#features, #screenshots, #formats, #faq').forEach(section => observer.observe(section));
  }
})();

// Keep the product switcher identical on every product page.

(() => {

  'use strict';

  const script = document.currentScript;

  const menu = document.querySelector('.company-nav');

  if (!script || !menu) return;

  const base = new URL('.', script.src);

  const products = [['index.html', 'MjZip'], ['mjsee/index.html', 'MjSee'], ['mjoffice/index.html', 'MjOffice'], ['mjtools/index.html', 'MjTools'], ['mjcam/index.html', 'MjCam'], ['mjpixellab/index.html', 'MjPixelLab'], ['mjnote/index.html', 'MjNote']];

  const fragment = document.createDocumentFragment();

  products.forEach(([path, name]) => {

    const url = new URL(path, base);

    const link = document.createElement('a');

    link.href = url.href;

    link.append(document.createTextNode(name));

    const dot = document.createElement('span');

    dot.className = 'nav-dot';

    dot.setAttribute('aria-hidden', 'true');

    link.append(dot);

    if (location.pathname === url.pathname || location.pathname === url.pathname.replace(/index\.html$/, '')) {

      link.className = 'selected';

      link.setAttribute('aria-current', 'page');

    }

    fragment.append(link);

  });

  menu.replaceChildren(fragment);
  const selected = menu.querySelector('[aria-current="page"]');
  if (selected && menu.scrollWidth > menu.clientWidth) {
    const offset = selected.getBoundingClientRect().left - menu.getBoundingClientRect().left;
    menu.scrollLeft = Math.max(0, offset + selected.offsetWidth - menu.clientWidth);
  }
  const revealSelected = () => {
    const selected = menu.querySelector('[aria-current="page"]');
    if (!selected || menu.scrollWidth <= menu.clientWidth) return;
    const item = selected.getBoundingClientRect();
    const viewport = menu.getBoundingClientRect();
    menu.scrollLeft += item.left - viewport.left - (menu.clientWidth - item.width) / 2;
  };
  requestAnimationFrame(revealSelected);
  window.addEventListener('resize', revealSelected);
})();

// Shared product navigation behavior; image processing lives in app.js.
(() => {
  for (const id of ['product-open-image', 'hero-open-image']) {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('file').click();
    });
  }
})();

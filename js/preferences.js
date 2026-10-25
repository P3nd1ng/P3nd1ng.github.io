// Apply saved appearance before first paint. Storage may be disabled by a browser.
(() => {
  try {
    const p = JSON.parse(localStorage.getItem('p3-journal-preferences') || '{}');
    if (['light', 'forest', 'dark'].includes(p.theme)) document.documentElement.dataset.theme = p.theme;
    if (['alpine', 'summit', 'forest'].includes(p.wallpaper)) document.documentElement.style.setProperty('--wallpaper', `url('/img/wallpapers/${p.wallpaper}.jpg')`);
    if (p.motion === false) document.documentElement.dataset.motion = 'off';
  } catch { /* Use defaults if stored data is unavailable or invalid. */ }
})();

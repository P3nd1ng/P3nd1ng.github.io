// Apply saved appearance before first paint. Storage may be disabled by a browser.
(() => {
  try {
    const p = JSON.parse(localStorage.getItem('p3-journal-preferences') || '{}');
    const wallpapers = { adventure: 'adventure.png', alpine: 'alpine.jpg', summit: 'summit.jpg', forest: 'forest.jpg' };
    const wallpaper = p.wallpaperRevision === 2 && Object.hasOwn(wallpapers, p.wallpaper) ? p.wallpaper : 'adventure';
    if (['light', 'forest', 'dark'].includes(p.theme)) document.documentElement.dataset.theme = p.theme;
    document.documentElement.dataset.wallpaper = wallpaper;
    document.documentElement.style.setProperty('--wallpaper', `url('/img/wallpapers/${wallpapers[wallpaper]}')`);
    if (p.motion === false) document.documentElement.dataset.motion = 'off';
  } catch { /* Use defaults if stored data is unavailable or invalid. */ }
})();

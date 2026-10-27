'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const paths = {
    sun:'<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"></path>',
    music:'<path d="M9 18V5l12-2v13M9 9l12-2"></path><ellipse cx="6" cy="18" rx="3" ry="2.5"></ellipse><ellipse cx="18" cy="16" rx="3" ry="2.5"></ellipse>',
    settings:'<path d="M4 6h16M4 18h16M4 12h16"></path><circle cx="8" cy="6" r="2" fill="var(--card)"></circle><circle cx="16" cy="12" r="2" fill="var(--card)"></circle><circle cx="10" cy="18" r="2" fill="var(--card)"></circle>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"></path>',close:'<path d="m6 6 12 12M6 18 18 6"></path>',search:'<circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m16 16 5 5"></path>',
    'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"></path>',up:'<path d="m6 12 6-6 6 6M12 6v14"></path>',
    play:'<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke-width="0"></path>',pause:'<path d="M8 5v14M16 5v14" stroke-width="3"></path>',
    prev:'<path d="M5 5v14m14-14L8 12l11 7Z"></path>',next:'<path d="M19 5v14M5 5l11 7-11 7Z"></path>',volume:'<path d="M11 4 6 8H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"></path>',
    github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.5c3-.3 6-1.5 6-6a4.7 4.7 0 0 0-1-3 4 4 0 0 0-.1-3s-1-.3-3.3 1.2a12 12 0 0 0-6.2 0C7.1 2.2 6 2.5 6 2.5a4 4 0 0 0-.1 3 4.7 4.7 0 0 0-1 3c0 4.5 3 5.7 6 6A3.5 3.5 0 0 0 10 17v5"></path>'
  };
  const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.sun}</svg>`;
  let prefs = {theme:'light',wallpaper:'alpine',pet:true,motion:true};
  let storageAvailable = true;
  const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {storageAvailable=false;return fallback;}};
  const write = (key, value) => {try {localStorage.setItem(key,JSON.stringify(value));} catch {storageAvailable=false;}};
  const saved = read('p3-journal-preferences', {});
  if (saved && typeof saved === 'object') {
    if (['light','forest','dark'].includes(saved.theme)) prefs.theme=saved.theme;
    if (['alpine','summit','forest'].includes(saved.wallpaper)) prefs.wallpaper=saved.wallpaper;
    if (typeof saved.pet==='boolean') prefs.pet=saved.pet;
    if (typeof saved.motion==='boolean') prefs.motion=saved.motion;
  }
  const wallpapers = [
    {id:'alpine',name:'山野来信',alt:'山峦、木屋与湖泊倒影'},
    {id:'summit',name:'群山之间',alt:'云雾中的高山与金色光线'},
    {id:'forest',name:'绿野微光',alt:'阳光透过绿意盎然的森林'}
  ];
  const isHome=document.body.classList.contains('home-page');
  $('#site-header').innerHTML = `<a class="brand" href="/" aria-label="P3nd1ng 博客首页"><span class="brand-mark" aria-hidden="true">p.</span><span class="brand-name">P3nd1ng</span></a><div class="header-right"><nav class="desktop-nav" id="main-nav" aria-label="主导航"><a href="/blog/" ${document.body.classList.contains('blog-page')?'aria-current="page"':''}>文章</a><a href="/archives/" ${location.pathname.startsWith('/archives')?'aria-current="page"':''}>归档</a><a href="/about/" ${location.pathname==='/about/'?'aria-current="page"':''}>关于</a></nav><div class="header-tools"><button class="icon-button theme-shortcut" id="theme-shortcut" aria-label="切换主题">${icon('sun')}</button><button class="icon-button" data-open="music-dialog" aria-label="打开音乐播放器">${icon('music')}</button><button class="icon-button" data-open="settings-dialog" aria-label="打开个性化设置">${icon('settings')}</button><button class="icon-button menu-toggle" id="menu-toggle" aria-label="展开导航" aria-expanded="false" aria-controls="main-nav">${icon('menu')}</button></div></div>`;
  if(isHome){
    $('#site-header .brand').setAttribute('href','#welcome');
    $('#main-nav a').setAttribute('href','#journal');
    $('#main-nav a').setAttribute('aria-current','page');
  }
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="settings-dialog" aria-labelledby="settings-title"><div class="dialog-heading"><h2 id="settings-title">让这里，更像你。</h2><button class="icon-button" data-close aria-label="关闭个性化设置">${icon('close')}</button></div><p class="dialog-subtitle">选一种心情，换一张壁纸。</p>
      <p class="control-title">阅读主题</p><div class="theme-options" role="group" aria-label="阅读主题"><button class="theme-choice" data-theme-choice="light" style="--swatch:#f6f7f2">晴日留白</button><button class="theme-choice" data-theme-choice="forest" style="--swatch:#b4c3a2">苔绿手记</button><button class="theme-choice" data-theme-choice="dark" style="--swatch:#23362e">深夜漫游</button></div>
      <p class="control-title">背景壁纸</p><div class="wallpaper-options" role="group" aria-label="首屏壁纸">${wallpapers.map(w=>`<button class="wallpaper-choice" data-wallpaper="${w.id}" aria-label="选择${w.name}壁纸"><img src="/img/wallpapers/${w.id}.jpg" alt="" loading="lazy"><span>${w.name}</span></button>`).join('')}</div><p class="wallpaper-note">壁纸应用于入口大图与文章列表背景。</p>
      <label class="setting-row" for="pet-toggle">让团子陪我阅读<input type="checkbox" id="pet-toggle" checked></label><label class="setting-row" for="motion-toggle">轻柔的界面动效<input type="checkbox" id="motion-toggle" checked></label><button class="reset-button" id="reset-preferences">恢复默认偏好</button><p class="wallpaper-note" id="storage-note">偏好只保存在当前浏览器。</p>
    </dialog>
    <dialog id="music-dialog" aria-labelledby="music-title"><div class="dialog-heading"><h2 id="music-title">此刻，听一点。</h2><button class="icon-button" data-close aria-label="关闭音乐播放器">${icon('close')}</button></div><div class="music-art"><div class="vinyl" aria-hidden="true"></div></div><h3 class="track-title" id="track-title">山间来信</h3><div class="track-credit">原创合成氛围小曲 · JOURNAL SESSIONS</div><label for="music-seek" class="control-title">播放进度</label><input class="music-seek" id="music-seek" type="range" min="0" max="32" step="0.1" value="0"><div class="time-labels"><span id="current-time">0:00</span><span id="duration">0:32</span></div><div class="player-controls"><button class="icon-button" id="prev-track" aria-label="上一首">${icon('prev')}</button><button class="icon-button play-main" data-play aria-label="播放音乐">${icon('play')}</button><button class="icon-button" id="next-track" aria-label="下一首">${icon('next')}</button></div><label class="volume-row" for="music-volume">${icon('volume')}<input type="range" id="music-volume" min="0" max="1" step="0.01" value="0.35" aria-label="音量"><span id="volume-value">35%</span></label><label class="track-select" for="track-select"><span class="muted">曲目</span><select id="track-select" aria-label="选择曲目"><option value="0">01 山间来信</option><option value="1">02 林中小憩</option></select></label><div class="audio-status" id="audio-status" role="status">点击播放，让音乐慢慢开始。</div></dialog>
    <div class="mini-player" id="mini-player" hidden><div class="vinyl" aria-hidden="true"></div><button class="mini-player-name" data-open="music-dialog"><span id="mini-track-name">山间来信</span><small>JOURNAL SESSIONS</small></button><button class="icon-button" data-play aria-label="播放音乐">${icon('play')}</button><button class="mini-player-close" id="hide-mini-player" aria-label="隐藏并暂停迷你播放器">×</button></div>
    <div class="pet-wrap" id="pet"><div class="pet-message" id="pet-message" role="status" hidden></div><button class="pet-button" id="pet-button" aria-label="和团子打招呼"><span class="pet-body"><span class="pet-leaf"></span><span class="pet-face"><span class="pet-eyes"></span><span class="pet-blush"></span><span class="pet-mouth"></span></span></span></button></div>
    <button class="icon-button back-top" id="back-top" aria-label="回到顶部" hidden>${icon('up')}</button><div class="toast" id="toast" role="status" hidden></div>
  `);
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  let toastTimer, petTimer;
  function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,2600);}
  function applyPreferences(){
    document.documentElement.dataset.theme=prefs.theme;
    document.documentElement.dataset.motion=prefs.motion?'on':'off';
    document.documentElement.style.setProperty('--wallpaper',`url('/img/wallpapers/${prefs.wallpaper}.jpg')`);
    const w=wallpapers.find(w=>w.id===prefs.wallpaper);
    if($('#hero-image')) $('#hero-image').setAttribute('aria-label',w.alt);
    $$('[data-theme-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.themeChoice===prefs.theme)));
    $$('[data-wallpaper]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.wallpaper===prefs.wallpaper)));
    $('#pet-toggle').checked=prefs.pet;$('#pet').hidden=!prefs.pet;$('#motion-toggle').checked=prefs.motion;
    $('meta[name="theme-color"]').content={light:'#f6f7f2',forest:'#e9eee5',dark:'#161f1e'}[prefs.theme];
    write('p3-journal-preferences',prefs);
    $('#storage-note').textContent=storageAvailable?'偏好只保存在当前浏览器。':'浏览器存储不可用，偏好仅在本页生效。';
  }
  applyPreferences();
  $$('[data-theme-choice]').forEach(el=>el.addEventListener('click',()=>{prefs.theme=el.dataset.themeChoice;applyPreferences();}));
  $$('[data-wallpaper]').forEach(el=>el.addEventListener('click',()=>{prefs.wallpaper=el.dataset.wallpaper;applyPreferences();}));
  $('#theme-shortcut').addEventListener('click',()=>{const themes=['light','forest','dark'];prefs.theme=themes[(themes.indexOf(prefs.theme)+1)%3];applyPreferences();toast({light:'晴日留白',forest:'苔绿手记',dark:'深夜漫游'}[prefs.theme]);});
  function stepWallpaper(direction){
    const index=wallpapers.findIndex(w=>w.id===prefs.wallpaper);
    prefs.wallpaper=wallpapers[(index+direction+wallpapers.length)%wallpapers.length].id;
    applyPreferences();
  }
  $('#prev-wallpaper')?.addEventListener('click',()=>stepWallpaper(-1));
  $('#next-wallpaper')?.addEventListener('click',()=>stepWallpaper(1));
  $('#pet-toggle').addEventListener('change',e=>{prefs.pet=e.target.checked;applyPreferences();});
  $('#motion-toggle').addEventListener('change',e=>{prefs.motion=e.target.checked;applyPreferences();});
  $('#reset-preferences').addEventListener('click',()=>{prefs={theme:'light',wallpaper:'alpine',pet:true,motion:true};applyPreferences();toast('已恢复默认偏好');});
  let lastOpener;
  document.addEventListener('click',e=>{
    const opener=e.target.closest('[data-open]');
    if(opener){lastOpener=opener;const dialog=document.getElementById(opener.dataset.open);if(!dialog.open)dialog.showModal();}
    if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
  });
  $$('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>lastOpener?.focus());
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  });
  const menu=$('#main-nav'),menuToggle=$('#menu-toggle');
  function closeMenu(){menu.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','展开导航');}
  menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'收起导航':'展开导航');});
  menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  document.addEventListener('click',e=>{if(!e.target.closest('#site-header'))closeMenu();});
  const search=$('#article-search');
  function filterArticles(){const query=search.value.trim().toLocaleLowerCase();let count=0;$$('[data-search]').forEach(el=>{el.hidden=!el.dataset.search.includes(query);if(!el.hidden)count++;});$('#empty-state').hidden=count>0;$('#feed-end').hidden=count===0;$('#search-status').textContent=query?`找到 ${count} 篇文章`:'';}
  search?.addEventListener('input',filterArticles);
  $('#clear-search')?.addEventListener('click',()=>{search.value='';filterArticles();search.focus();});
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior=()=>prefs.motion&&!reducedMotion.matches?'smooth':'instant';
  const hero=isHome?$('.hero'):null;
  let scrollFrame=0;
  function updateScroll(){
    scrollFrame=0;
    $('#back-top').hidden=scrollY<500;
    if(hero){
      const height=hero.offsetHeight;
      document.body.classList.toggle('article-view',hero.getBoundingClientRect().bottom<=140);
      const progress=prefs.motion&&!reducedMotion.matches?Math.min(1,Math.max(0,scrollY/height)):0;
      hero.style.setProperty('--hero-progress',String(progress));
    }
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
  addEventListener('resize',updateScroll,{passive:true});
  reducedMotion.addEventListener('change',updateScroll);
  $('#motion-toggle').addEventListener('change',updateScroll);
  $('#reset-preferences').addEventListener('click',updateScroll);
  updateScroll();
  // Keep the transition in this document so music and reading state continue.
  if(isHome){
    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href="#journal"],a[href="#welcome"]');
      if(!link||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      const target=$(link.getAttribute('href'));
      if(!target)return;
      e.preventDefault();
      const hash=link.getAttribute('href');
      if(location.hash!==hash)history.pushState(null,'',hash);
      target.scrollIntoView({behavior:scrollBehavior(),block:'start'});
      target.focus({preventScroll:true});
    });
    if('IntersectionObserver' in window){
      const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});
      },{threshold:.08});
      $$('.home-journal .blog-sidebar,.home-journal .feed-toolbar,.home-journal .article-card,.home-journal .next-story').forEach(el=>{
        el.dataset.reveal='';revealObserver.observe(el);
      });
    }
  }
  $('#back-top').addEventListener('click',()=>{
    if(isHome&&location.hash)history.replaceState(null,'',location.pathname+location.search);
    scrollTo({top:0,behavior:scrollBehavior()});
  });
  const messages=['你好呀，我是团子。今天也要开心。','写一行代码，也算向前一步。','读累了的话，休息一下吧。','不着急，我们慢慢来。','能在这里遇见你，真好。'];let greeting=0;
  $('#pet-button').addEventListener('click',()=>{const m=$('#pet-message');m.textContent=messages[greeting++%messages.length];m.hidden=false;clearTimeout(petTimer);petTimer=setTimeout(()=>m.hidden=true,4200);});
  let pointerFrame;
  addEventListener('pointermove',e=>{if(!prefs.pet||!prefs.motion||matchMedia('(prefers-reduced-motion: reduce)').matches||e.pointerType==='touch')return;if(pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{const r=$('#pet-button').getBoundingClientRect();$('#pet').style.setProperty('--eye-x',`${Math.max(-3,Math.min(3,(e.clientX-r.x)/100))}px`);$('#pet').style.setProperty('--eye-y',`${Math.max(-2,Math.min(2,(e.clientY-r.y)/150))}px`);pointerFrame=null;});},{passive:true});
  // Real local audio, no third-party player or API. Never autoplay across pages.
  const tracks=[{name:'山间来信',src:'/audio/mountain-letter.wav'},{name:'林中小憩',src:'/audio/forest-rest.wav'}];
  let audioPrefs=read('p3-journal-audio',{});if(!audioPrefs||typeof audioPrefs!=='object')audioPrefs={};
  let trackIndex=Number.isInteger(audioPrefs.index)&&audioPrefs.index>=0&&audioPrefs.index<tracks.length?audioPrefs.index:0;
  const audio=new Audio();audio.preload='none';audio.loop=false;
  audio.volume=Number.isFinite(audioPrefs.volume)?Math.min(1,Math.max(0,audioPrefs.volume)):.35;
  let resumeAt=Number.isFinite(audioPrefs.time)?Math.min(31.9,Math.max(0,audioPrefs.time)):0;
  const formatTime=t=>`${Math.floor((t||0)/60)}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
  function saveAudio(){write('p3-journal-audio',{index:trackIndex,volume:audio.volume,time:Number.isFinite(audio.currentTime)?audio.currentTime:0});}
  function syncPlayback(){
    const playing=!audio.paused&&!audio.ended;document.body.classList.toggle('is-playing',playing);
    $$('[data-play]').forEach(el=>{el.innerHTML=icon(playing?'pause':'play');el.setAttribute('aria-label',playing?'暂停音乐':'播放音乐');});
  }
  function setTrack(index){
    audio.pause();trackIndex=(index+tracks.length)%tracks.length;audio.src=tracks[trackIndex].src;
    $('#track-title').textContent=tracks[trackIndex].name;$('#mini-track-name').textContent=tracks[trackIndex].name;$('#track-select').value=String(trackIndex);
    $('#music-seek').value=String(resumeAt);$('#current-time').textContent=formatTime(resumeAt);syncPlayback();
  }
  setTrack(trackIndex);$('#music-volume').value=String(audio.volume);$('#volume-value').textContent=`${Math.round(audio.volume*100)}%`;
  let playPending=false;
  async function play(){
    if(playPending)return;playPending=true;
    try {if(resumeAt>0){audio.load();}await audio.play();$('#mini-player').hidden=false;$('#audio-status').textContent='正在播放 · 本地音源';}
    catch {$('#audio-status').textContent='暂时无法播放，请再次点击播放重试。';}
    finally{playPending=false;syncPlayback();}
  }
  $$('[data-play]').forEach(el=>el.addEventListener('click',()=>{if(audio.paused)play();else audio.pause();}));
  audio.addEventListener('loadedmetadata',()=>{const duration=audio.duration;if(Number.isFinite(duration)){$('#music-seek').max=String(duration);$('#duration').textContent=formatTime(duration);if(resumeAt){audio.currentTime=Math.min(resumeAt,duration);resumeAt=0;}}});
  audio.addEventListener('play',syncPlayback);audio.addEventListener('pause',()=>{syncPlayback();saveAudio();if(!audio.ended)$('#audio-status').textContent='已暂停，随时继续。';});
  audio.addEventListener('error',()=>{$('#audio-status').textContent='音源加载失败，请稍后重试。';syncPlayback();});
  let lastSave=0;
  audio.addEventListener('timeupdate',()=>{$('#music-seek').value=String(audio.currentTime);$('#current-time').textContent=formatTime(audio.currentTime);if(Date.now()-lastSave>1500){saveAudio();lastSave=Date.now();}});
  function changeTrack(next){resumeAt=0;setTrack(next);saveAudio();play();}
  audio.addEventListener('ended',()=>changeTrack(trackIndex+1));
  $('#prev-track').addEventListener('click',()=>changeTrack(trackIndex-1));$('#next-track').addEventListener('click',()=>changeTrack(trackIndex+1));$('#track-select').addEventListener('change',e=>changeTrack(Number(e.target.value)));
  $('#music-seek').addEventListener('input',e=>{const t=Number(e.target.value);if(audio.readyState>0){audio.currentTime=t;resumeAt=0;}else resumeAt=t;$('#current-time').textContent=formatTime(t);if(audio.readyState>0)saveAudio();else write('p3-journal-audio',{index:trackIndex,volume:audio.volume,time:t});});
  $('#music-volume').addEventListener('input',e=>{audio.volume=Number(e.target.value);$('#volume-value').textContent=`${Math.round(audio.volume*100)}%`;saveAudio();});
  $('#hide-mini-player').addEventListener('click',()=>{audio.pause();$('#mini-player').hidden=true;});
  addEventListener('pagehide',()=>{if(audio.readyState>0)saveAudio();});
})();

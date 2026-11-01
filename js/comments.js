// 将 giscus 配置页面生成的 Discussions 分类名称和 ID 填在这里。
export const commentsConfig = {
  repo: 'P3nd1ng/P3nd1ng.github.io',
  repoId: 'R_kgDOQKZguA',
  category: '',
  categoryId: '',
};

const container = document.getElementById('comments');
if (container && commentsConfig.category && commentsConfig.categoryId) {
  container.textContent = '';
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  Object.entries({
    repo: commentsConfig.repo, 'repo-id': commentsConfig.repoId,
    category: commentsConfig.category, 'category-id': commentsConfig.categoryId,
    mapping: 'pathname', strict: '1', 'reactions-enabled': '1',
    'emit-metadata': '0', 'input-position': 'bottom', theme: theme(), lang: 'zh-CN',
  }).forEach(([key, value]) => script.setAttribute('data-' + key, value));
  script.setAttribute('loading', 'lazy');
  script.addEventListener('error', () => {
    container.textContent = '留言区暂时无法加载，请稍后刷新重试。';
  });
  container.append(script);
  new MutationObserver(() => {
    container.querySelector('iframe.giscus-frame')?.contentWindow?.postMessage({giscus: {setConfig: {theme: theme()}}}, 'https://giscus.app');
  }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
}

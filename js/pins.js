// 在这里填写要置顶的文章路径；多篇文章按填写顺序排列。
export const PINNED_POSTS = [
  // '/2025/10/27/hello-world/',
];

function pathKey(value) {
  try {
    return new URL(value, 'https://journal.invalid').pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  } catch { return ''; }
}

export function orderPinned(items, pins, getPath = item => item) {
  const priority = new Map();
  pins.forEach((path, index) => {
    const key = pathKey(path);
    if (key && !priority.has(key)) priority.set(key, index);
  });
  return items.map((item, index) => ({item, index, rank: priority.get(pathKey(getPath(item))) ?? Infinity}))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({item}) => item);
}

if (typeof document !== 'undefined') {
  const feed = document.querySelector('.blog-feed');
  const cards = feed ? [...feed.querySelectorAll(':scope > .article-card')] : [];
  const afterCards = cards.at(-1)?.nextSibling;
  const pinned = new Set(PINNED_POSTS.map(pathKey).filter(Boolean));
  for (const card of orderPinned(cards, PINNED_POSTS, item => item.getAttribute('href'))) {
    if (pinned.has(pathKey(card.getAttribute('href')))) {
      const badge = document.createElement('span');
      badge.className = 'pin-badge';
      badge.textContent = '置顶';
      (card.querySelector('.article-cover') || card).append(badge);
    }
    feed.insertBefore(card, afterCards);
  }
}

# P3nd1ng's Journal

适配 **GitHub Pages** 的个人博客：全屏摄影首屏 → 独立文章列表 → 沉浸阅读。

文章列表按用户提供的参考图改造为「顶部横幅 + 左侧个人资料与纵向导航 + 右侧横向图文卡片」，背景透出并配合毛玻璃。手机上自动变成单栏。多篇文章会交替排列封面左右位置；当前只展示仓库中唯一的真实文章。

## 现有项目与这次改造

原仓库是 **Hexo 7.3.0 / Butterfly 5.5.1 已生成的静态文件**，没有 Hexo 的 `source/`、主题源文件或 `_config.yml`。此次直接维护现有静态站，没有引入服务端或外部音乐 API。旧 CSS/JS 保留供追溯，新页面仅加载 `journal.css`、`preferences.js`、`journal.js`。

- 保留唯一真实文章 Hello World 的完整正文、日期、原头像、图标及 CC BY-NC-SA 4.0 文章授权。
- 保留 `/2025/10/27/hello-world/`、`/archives/`、`/archives/2025/`、`/archives/2025/10/`。
- 新增 `/blog/`、`/about/`、`/credits/`、自定义 `404.html`，修正原来的 example.com 和无效菜单链接。
- 三种主题、三张本地壁纸、可关闭的团子互动与动效、文章搜索及空结果状态。
- 两首本地合成器乐小曲，支持播放/暂停、上一首/下一首、曲目选择、进度和音量调节。曲目/位置/音量会保存；跨页面返回后需点击继续播放，遵循浏览器播放限制。
- 原生 dialog 提供键盘焦点约束、Escape 关闭及焦点归还；支持系统减少动效设置、触屏与窄屏。

## 本地运行

安装 Node.js 22 或更新版本。**没有运行依赖，不需要 npm install。**

```powershell
cd <本仓库目录>
npm start
```

打开 http://localhost:4311 。端口占用时：

```powershell
$env:PORT = 4312
npm start
```

```powershell
npm run check  # 检查本地链接、元数据和媒体文件
npm test       # 路由、原文完整性、音频分段读取、404、预览目录保护等测试
npm run build  # 校验并生成 dist/，仅包含网站公开文件
```

测试使用独立的 4317 端口。`dist/` 是可重新生成的目录。

## 发布到 GitHub Pages

目标仓库：`P3nd1ng/P3nd1ng.github.io`，站点地址：**https://p3nd1ng.github.io/**。

1. 将本次改动提交并推送到仓库 `main` 分支。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions** 中运行 **Deploy journal to GitHub Pages**，或之后每次向 `main` 推送自动触发。
4. 等待部署成功，再访问站点。首次改为 Actions 发布时，需要先完成第 2 步。

`.github/workflows/pages.yml` 会运行校验、生成 `dist/`，再上传并发布。无需安装 Hexo，也无需 Sites、Vercel 等其他托管。工作流依照 [GitHub 官方 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 配置。

如果继续使用 **Deploy from a branch → main → /(root)**，根目录的静态文件与 `.nojekyll` 也可以直接发布。两种发布源选其一；使用 Actions 只会发布 `dist/` 中的网站资源。

本地验证完成不代表线上已部署，线上状态需要以 GitHub Actions 成功记录及实际站点为准。

## 日常修改

| 内容 | 文件 |
| --- | --- |
| 全屏入口文字 | `index.html` |
| 文章卡片、左侧个人资料与导航 | `blog/index.html` |
| 全站布局、主题颜色与动效 | `css/journal.css` |
| 个性化设置、壁纸列表、音乐曲目、团子互动 | `js/journal.js` |
| 防止刷新时主题闪烁 | `js/preferences.js` |
| 正文 | `2025/10/27/hello-world/index.html` |
| 归档 | `archives/` 中的三个页面 |
| 壁纸 | `img/wallpapers/` |
| 音乐 | `audio/` |

新增文章时建立新的日期/slug 目录，复制现有文章页面的外壳，更新正文、title、description、canonical、OG 地址与日期；同步在 `blog/index.html` 增加 `.article-card`（含可搜索的 `data-search`）、归档、计数与 `sitemap.xml` 中添加记录。文章列表在宽屏使用左侧栏与横向卡片、窄屏变成单栏。当前仅有一篇文章，因此未添加空的标签/分类页或示例文章。

替换音乐时使用你有权公开托管的音频，并更新 `journal.js` 中的曲目路径与名称。壁纸下载来源与授权见 `/credits/`。默认不调用第三方统计或字体服务。

如之后恢复 Hexo 源工程，应先将这些布局迁移到主题模板再生成，避免 `hexo generate` 覆盖本次改造。

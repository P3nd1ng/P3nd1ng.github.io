# P3nd1ng's Journal

个人博客，发布地址：https://p3nd1ng.github.io/ 。日常操作是：创建 Markdown 文章 → 保存 → 推送 → 等待网站自动更新。

## 写文章

打开项目里的 `articles/` 文件夹，新建 `YYYY-MM-DD-文章名称.md`，例如 `2026-11-01-我的第一篇记录.md`。文件扩展名是 `.md`。

可以直接放在 `articles/`，也可以按生活、技术等主题，或按年份、月份建立子文件夹；所有子文件夹都会自动读取。文件夹用于本地整理，网站分类由文章开头的“分类：”决定。

文章内容示例：

~~~markdown
标题：我的第一篇记录
分类：生活,随笔

今天开始用自己的博客记录生活。

## 今天发生的事

这里写正文。
~~~

- 标题是网站显示的名称。
- 分类支持多个，用逗号或顿号分隔；留空时显示“未分类”。
- 文件名的日期决定文章日期和归档，后面的名称决定网址；发布后尽量不要改文件名。
- 可在分类下一行添加 `封面：/img/articles/图片名.webp`，图片放在 `img/articles/`；不填写就使用默认封面。正文图片也使用这个目录。
- `articles/` 中的文章都会参与公开发布，私人草稿请放在项目之外。

详细格式见 [写文章说明](博客管理/写文章说明.md)。

## 预览与发布

1. 保存文章。
2. 需要查看效果时，双击 `博客管理/本地预览.cmd`，保持打开的预览窗口运行。
3. 双击 `博客管理/一键发布.cmd`，检查修改清单，输入 `y` 确认。它会自动检查、提交并推送整个项目的修改。
4. 在 [GitHub Actions](https://github.com/P3nd1ng/P3nd1ng.github.io/actions) 等待部署成功，再访问网站。

也可以通过 Git 图形界面提交并推送到 `main`，不需要手动生成网页。自动发布会生成文章页、首页列表、分类筛选和日期归档。

首次使用电脑需要安装 Node.js 22 或更新版本及 Git，并完成 GitHub 登录。一键发布入口会在缺少组件时自动安装；首次直接使用本地预览前，需要先安装项目组件。

仓库的 **Settings → Pages → Build and deployment → Source** 应选择 **GitHub Actions**。仅从仓库根目录直接发布不会自动生成 Markdown 文章。

## 目录说明

| 目录或文件 | 用途 |
| --- | --- |
| `articles/` | Markdown 文章，日常主要操作这里 |
| `img/articles/` | 文章配图 |
| `博客管理/` | 本地预览、一键发布、写文章说明 |
| `index.html`、`blog/` | 首页与文章列表模板 |
| `2025/` | 保留的 Hello World 文章，也作为新文章的页面模板 |
| `archives/` | 日期归档模板，发布时会自动生成包含新文章的归档 |
| `about/`、`credits/`、`404.html` | 关于、素材来源、找不到页面时的提示 |
| `css/`、`js/` | 当前网站样式、搜索、分类、主题、音乐控制等 |
| `img/wallpapers/`、`audio/` | 网站壁纸和音乐 |
| `scripts/`、`tests/`、`.github/` | 生成、检查及自动发布所需程序 |
| `CNAME` | 自定义域名配置，保留为 `p3nd1ng.top`，发布时自动带入 |
| `package.json`、`package-lock.json` | 项目组件和运行配置 |
| `dist/`、`node_modules/` | 自动生成的网站与本地运行组件，不提交到仓库，无需手动编辑 |

当前页面所需的文件已保留，旧主题脚本、旧写作入口及重复原图已清理。素材来源与授权见网站的 [素材鸣谢](https://p3nd1ng.github.io/credits/) 页面。

## 网站维护

- 首页入口文字：`index.html`。
- 个人资料与列表模板：`blog/index.html`；文章卡片由发布程序生成。
- 首页样式：`css/home.css`；通用样式：`css/journal.css`。
- 主题、壁纸、音乐和交互：`js/journal.js`、`js/preferences.js`。
- 置顶文章：在 `js/pins.js` 的 `PINNED_POSTS` 中填写文章路径；删除路径即可取消置顶。
- 留言：文章模板已包含 giscus 区域。需要为仓库启用 Discussions、安装 giscus GitHub App，并在 `js/comments.js` 填写实际讨论分类配置。新 Markdown 文章会自动继承留言区。

项目维护命令：

~~~text
npm ci          安装组件
npm test        运行检查
npm run build   生成用于发布的 dist 目录
npm start       预览根目录页面；查看新 Markdown 文章请使用双击预览入口
~~~

本项目直接维护静态页面模板，未使用 Hexo 源工程；请勿直接运行 Hexo 生成程序覆盖现有文件。

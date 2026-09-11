# @mintfolio/theme-default

Mintfolio 的完整视觉主题，包含个人主页、侧栏、文章卡片、八套配色、明暗模式和阅读工具。此包独立于 Core 安装；只有选择本主题时，Core 才加载它声明的 React/Tailwind 构建工具。

当前包已支持 tarball 安装，尚未发布到公共 registry。发布后在已初始化的 Core 站点安装：

```sh
npm install @mintfolio/theme-default
```

```js
// theme.config.mjs
export default {
  theme: '@mintfolio/theme-default',
  settings: {
    initialMode: 'auto',
    archivePageSize: 9,
    sidebar: { sections: { tools: false } },
  },
};
```

有效配色和所有设置以 `theme.mjs` 为准，嵌套对象自动补齐默认值，未知键和错误类型会阻止构建。访客已有的配色/明暗偏好优先于初始设置。

站点标题、个人资料、文章与项目属于站点的 `site.config.ts`/`content/blog`。侧栏、推荐文章显示方式、文章尾图和可选 `analyticsId` 属于此主题的 `settings`，主题包不导入宿主配置。

本主题的目录、图片预览、文章解锁、代码复制、筛选与分页调用 `@mintfolio/core/client`；本包保留 HTML、CSS、图标和界面交互适配。`home`、`post`、`archive`、`page` 由本主题渲染，未声明的 404 页面使用 Core 的 Minimal。

`default` / `happyhues` 是旧配置的兼容别名，仍要求安装本包。Core 的默认兜底是 Minimal。

## 独立仓库开发

完整视觉主题。pages、layouts、components、styles、assets 和 scripts 只属于本主题。scripts 使用 Core 控制器适配自己的 DOM。不得加入内容读取、路由或加密实现。

```sh
npm ci
npm run check
npm pack
```

这个仓库可单独安装，不需要 PersonalSite 或其他源码目录。拆分前历史保留在原 PersonalSite，起点见 MIGRATION.md。 尚未发布的依赖固定在 vendor 和锁文件中；更新方式见 vendor/README.md。

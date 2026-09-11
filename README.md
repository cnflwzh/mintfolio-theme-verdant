# @mintfolio/theme-default

Mintfolio 的完整视觉主题，包含个人主页、侧栏、文章卡片、八套配色、明暗模式和阅读工具。此包独立于 Core 安装；只有选择本主题时，Core 才加载它声明的 React/Tailwind 构建工具。

当前包可通过本地 registry 或 tarball 安装，尚未发布到公共 registry。Core >= 0.1.1 的站点推荐使用以下命令，一次完成安装与配置生成：

```sh
npx mintfolio theme:add default
```

```js
// theme.config.mjs
export default {
  theme: '@mintfolio/theme-default',
};
```

站点根目录会生成 `theme-default.config.mjs`，包含全部现有设置、中文注释、8 套配色说明和数组条目示例。直接修改该文件即可；开发服务会监听并重新加载。类型来自公开的 `@mintfolio/theme-default/settings` 入口，模板本身随主题包发布。

继续使用 `npm install @mintfolio/theme-default` 也可以：随后 `npm run dev` 或 `npm run build` 会自动补齐配置。需要立即生成时运行 `npx mintfolio theme:init default`。这套流程由 Core 执行，不依赖 npm 是否允许依赖包的 postinstall 脚本。

配置文件只在第一次创建，重复安装、同步、启动或升级都不会覆盖已有内容。以后新增的配置项仍会使用清单默认值，可对照包内 `config/theme-default.config.mjs` 手动补充。

设置优先级为：主题清单默认值 → `theme-default.config.mjs` → `theme.config.mjs` 中旧的内联 `settings`。嵌套对象递归合并，数组整组替换。建议把显示设置集中在专属文件中；未知键和错误类型会阻止构建。访客已有的配色/明暗偏好优先于初始设置。

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

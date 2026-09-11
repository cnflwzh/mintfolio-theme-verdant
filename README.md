# Verdant

一个给 [Mintfolio](https://github.com/cnflwzh/mintfolio) 使用的个人主页与博客主题。

Verdant 保留了宽松的留白、文章卡片和绿色主色，也提供其他七套配色。主页可以放资料、项目与推荐文章；阅读页提供目录、代码复制、图片预览和阅读进度。

![Verdant 首页](docs/assets/home-desktop.webp)

## 安装

先按 [入门教程](https://github.com/cnflwzh/mintfolio/wiki/Getting-Started) 建好站点，再在站点目录运行：

~~~sh
mintfolio theme install verdant --use
mintfolio dev
~~~

项目仍在持续开发中。verdant 别名需要 Core >= 0.1.5。

Verdant 沿用 @mintfolio/theme-default 包名，清单 id 仍为 default，配置文件仍叫 theme-default.config.mjs。原有的 default、happyhues 与完整包名继续可用。

## 调整主题

站点根目录的 theme-default.config.mjs 是显示设置入口。它会自动生成，重复初始化或升级会保留你的修改。

~~~js
export default {
  initialMode: 'auto',
  initialPalette: '1',
  homePageSize: 6,
  archivePageSize: 8,
  sidebar: {
    quote: { enabled: true, text: '慢慢写，也认真读。', author: '' },
  },
};
~~~

initialPalette 使用字符串 '1' 到 '8'。访客在浏览器中保存的配色偏好优先于初始值。网站标题、头像和项目内容放在 site.config.ts；侧栏、推荐文章和文末插图放在主题设置中。

全部选项见 [配置模板](config/theme-default.config.mjs) 与 [主题配置教程](https://github.com/cnflwzh/mintfolio/wiki/Themes)。设置合并顺序为清单默认值、独立主题文件、旧内联 settings；数组整体替换。

## 页面与资源

主题提供首页、文章、归档和普通页面。404 页面由 Core 补齐。首页和普通页面会显示 site.config.ts 顶层的 icp 字段；其他页面目前未统一显示备案信息。

字体与图标随包分发。React 和 Tailwind 在启用本主题时由 Core 加载。文章读取、URL、搜索和解锁逻辑使用 Core 公共 API。

![阅读页面](docs/assets/article-reading.webp)

## 修改源码

~~~sh
git clone https://github.com/cnflwzh/mintfolio-theme-verdant.git
cd mintfolio-theme-verdant
npm ci
npm run check
npm pack
~~~

将打出的 tgz 安装到测试站点，检查桌面、手机和密码文章页面。定制请保存在自己的主题仓库中，直接修改 node_modules 会在重新安装后丢失。

[主题开发教程](https://github.com/cnflwzh/mintfolio/wiki/Theme-Development) · [贡献说明](CONTRIBUTING.md) · [安全问题](SECURITY.md)

## 许可证

代码为 [GPL-3.0-only](LICENSE)。Inter、JetBrains Mono、Playfair Display 按 SIL OFL 1.1 分发，原始声明保存在 [licenses](licenses) 中。

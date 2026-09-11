/**
 * Mintfolio Default 主题设置。
 * 在 theme.config.mjs 中选择 @mintfolio/theme-default 后，本文件自动生效。
 * 修改后保存即可；开发服务会重新加载配置。重复安装或生成不会覆盖本文件。
 * 网站名称、域名、个人资料、社交链接与项目仍在 site.config.ts 中设置。
 * 如果 theme.config.mjs 还包含旧的 settings，同名设置以旧的内联值为准。
 */

/** @satisfies {import('@mintfolio/theme-default/settings').DefaultSettings} */
export default {
  // 初始明暗模式：'auto' 跟随系统、'light' 浅色、'dark' 深色。
  // 访客通过主题面板保存过的个人偏好，会优先于这里的初始设置。
  initialMode: 'auto',

  // 初始配色，使用字符串编号：
  // '1' 青柠薄荷  '2' 橘子汽水  '3' 晴空海盐  '4' 葡萄跳跳糖
  // '5' 莓果奶昔  '6' 向日葵    '7' 海岛假日  '8' 午夜游乐场
  initialPalette: '1',

  // 首页首次显示的文章数量，范围 1–100；其余文章通过“加载更多”显示。
  homePageSize: 6,

  // 博客归档页首次显示的文章数量，范围 1–100。
  archivePageSize: 8,

  // 可选的 Google Analytics 测量 ID，例如 'G-XXXXXXXXXX'；留空不加载统计。
  analyticsId: '',

  sidebar: {
    // 各侧栏区域的显示开关。联系方式和最近动态的数据由站点内容提供。
    sections: {
      contact: true,  // 联系方式：使用 site.config.ts 中的 social 等资料。
      activity: true, // 最近动态。
      tools: true,    // 下方配置的推荐工具列表。
    },

    // 推荐工具列表；可按示例增加多项，空列表不显示工具条目。
    tools: [
      // {
      //   name: '工具名称',
      //   description: '用一句话介绍这个工具',
      //   url: 'https://example.com',
      // },
    ],

    // 侧栏引言；启用后填写内容和作者。
    quote: {
      enabled: false,
      text: '',
      author: '',
    },
  },

  home: {
    // 首页推荐文章。填写已有文章 ID，最多展示前三篇找到的文章。
    hotContent: {
      enabled: false,
      items: [
        // {
        //   postId: 'hello', // 对应 content/blog/hello.md 的文章 ID。
        //   image: '',       // 留空显示占位图；也可填写 '/images/hello.webp'。
        // },
      ],
    },
  },

  article: {
    // 普通文章末尾的插图；开启后 src 留空会使用站点头像。
    footerImage: {
      enabled: false,
      src: '', // 例如 '/images/article-footer.webp'，文件放在 public/images/ 中。
    },
  },
};

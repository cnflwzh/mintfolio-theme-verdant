// @ts-check
import { defineTheme } from '@mintfolio/theme-api';

/** @param {string} label @param {string} [value] @returns {import('@mintfolio/theme-api').StringSetting} */
const text = (label, value = '') => ({ type: 'string', label, default: value });
/** @param {string} label @param {boolean} value @returns {import('@mintfolio/theme-api').BooleanSetting} */
const flag = (label, value) => ({ type: 'boolean', label, default: value });

/** All layout, typography, cards, reading tools, and palette controls belong to this theme. */
export default defineTheme({
  manifest: {
    id: 'default',
    name: 'Verdant',
    version: '0.1.2',
    author: 'Mintfolio contributors',
    description: 'Portfolio hero, article cards, reading tools, and eight visitor-selectable palettes.',
    engine: '^1.0.0',
  },
  capabilities: { encryptedPosts: true, search: true, tags: true, categories: true, toc: true, darkMode: true },
  build: { react: true, tailwind: true },
  pages: {
    home: './pages/home.astro',
    post: './pages/post.astro',
    archive: './pages/archive.astro',
    page: './pages/page.astro',
  },
  settings: {
    initialMode: { type: 'select', label: '初始明暗模式', default: 'auto', options: ['auto', 'light', 'dark'] },
    initialPalette: { type: 'select', label: '初始配色', default: '1', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    homePageSize: { type: 'number', label: '首页初始文章数', default: 6, min: 1, max: 100 },
    archivePageSize: { type: 'number', label: '归档初始文章数', default: 8, min: 1, max: 100 },
    analyticsId: text('Google Analytics ID'),
    sidebar: {
      type: 'object', label: '侧边栏', default: {}, properties: {
        sections: { type: 'object', label: '显示区域', default: {}, properties: {
          contact: flag('联系方式', true), activity: flag('最近动态', true), tools: flag('推荐工具', true),
        } },
        tools: { type: 'array', label: '推荐工具', default: [], items: {
          type: 'object', label: '工具', default: {}, properties: { name: text('名称'), description: text('简介'), url: text('地址') },
        } },
        quote: { type: 'object', label: '引言', default: {}, properties: {
          enabled: flag('显示引言', false), text: text('内容'), author: text('作者'),
        } },
      },
    },
    home: { type: 'object', label: '首页', default: {}, properties: {
      hotContent: { type: 'object', label: '推荐文章', default: {}, properties: {
        enabled: flag('显示推荐文章', false),
        items: { type: 'array', label: '文章列表', default: [], items: {
          type: 'object', label: '文章', default: {}, properties: { postId: text('文章 ID'), image: text('图片地址') },
        } },
      } },
    } },
    article: { type: 'object', label: '文章', default: {}, properties: {
      footerImage: { type: 'object', label: '文末插图', default: {}, properties: {
        enabled: flag('显示文末插图', false), src: text('图片地址（为空时使用站点头像）'),
      } },
    } },
  },
});

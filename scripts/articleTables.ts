import type { PageScope } from './lifecycle';

export function initArticleTables(root: HTMLElement, scope: PageScope): void {
  for (const table of root.querySelectorAll('table')) {
    if (table.parentElement?.classList.contains('table-scroll-wrap')) continue;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll-wrap';
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    scope.add(() => {
      wrapper.parentNode?.insertBefore(table, wrapper);
      wrapper.remove();
    });
  }
}

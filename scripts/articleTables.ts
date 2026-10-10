import type { PageScope } from './lifecycle';

/**
 * Style Core's static scroll regions; create one only for older Core output.
 * @param root The rendered article, including a freshly unlocked article.
 * @param scope Page lifecycle that removes only nodes and attributes added here.
 * @returns Nothing. Existing static regions survive cleanup and repeated setup.
 */
export function initArticleTables(root: HTMLElement, scope: PageScope): void {
  for (const table of root.querySelectorAll('table')) {
    const parent = table.parentElement;
    const existing = parent?.matches('[data-mintfolio-table-scroll], .table-scroll-wrap') ? parent : undefined;
    const wrapper = existing ?? document.createElement('div');
    const hadClass = wrapper.classList.contains('table-scroll-wrap');
    const addedAttributes: string[] = [];
    const addMissingAttribute = (name: string, value: string): void => {
      if (wrapper.hasAttribute(name)) return;
      wrapper.setAttribute(name, value);
      addedAttributes.push(name);
    };
    wrapper.classList.add('table-scroll-wrap');
    addMissingAttribute('tabindex', '0');
    addMissingAttribute('role', 'region');
    if (!wrapper.hasAttribute('aria-label') && !wrapper.hasAttribute('aria-labelledby')) {
      addMissingAttribute('aria-label', '表格，可横向滚动');
    }
    if (!existing) {
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
    scope.add(() => {
      if (!existing) {
        wrapper.parentNode?.insertBefore(table, wrapper);
        wrapper.remove();
      } else {
        if (!hadClass) wrapper.classList.remove('table-scroll-wrap');
        for (const attribute of addedAttributes) wrapper.removeAttribute(attribute);
      }
    });
  }
}

import type { PageScope } from './lifecycle';

/** Measure first, then write, and coalesce resize/filter updates into one frame. */
export function createTagFold(container: HTMLElement | null, toggle: HTMLElement | null, scope: PageScope) {
  let expanded = false;
  let pending = false;
  const maxRows = Number(container?.closest<HTMLElement>('.tags-filter-block')?.dataset.maxRows) || 0;

  const measure = (): void => {
    pending = false;
    if (!container || !toggle || !maxRows || !container.clientWidth) return;
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.tag-btn')).filter(
      (button) => !button.hidden && !button.disabled,
    );
    const rows = Map.groupBy(buttons, (button) => Math.round(button.offsetTop));
    const rowTops = [...rows.keys()];
    const lastRow = rows.get(rowTops[maxRows - 1] ?? -1);
    const lastButton = lastRow?.at(-1);
    const height = lastButton ? lastButton.offsetTop + lastButton.offsetHeight - (rowTops[0] ?? 0) : 0;
    const canFold = rows.size > maxRows;
    const collapsed = canFold && !expanded;
    const expandedHeight = container.scrollHeight;

    container.classList.toggle('is-collapsed', collapsed);
    if (height) container.style.setProperty('--collapsed-height', `${height}px`);
    container.style.setProperty('--expanded-height', `${expandedHeight}px`);
    toggle.hidden = !canFold;
    toggle.textContent = collapsed ? '展开更多' : '收起标签';
    toggle.setAttribute('aria-expanded', String(canFold && expanded));
  };
  const refresh = (): void => {
    if (pending) return;
    pending = true;
    scope.frame(measure);
  };
  toggle?.addEventListener(
    'click',
    () => {
      expanded = !expanded;
      refresh();
    },
    { signal: scope.signal },
  );

  if (container) {
    let previousWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width !== previousWidth) {
        previousWidth = entry.contentRect.width;
        refresh();
      }
    });
    observer.observe(container);
    scope.add(() => observer.disconnect());
    void document.fonts.ready.then(() => {
      if (!scope.signal.aborted) refresh();
    });
  }
  refresh();
  return { refresh };
}

import type { PageScope } from './lifecycle';

/** Scroll snapping is native; update the indicator only when scrolling settles. */
export function initHotContent(scope: PageScope): void {
  const list = document.querySelector<HTMLElement>('.hot-content-carousel');
  const dots = Array.from(document.querySelectorAll<HTMLElement>('.hot-scroll-dot'));
  const items = Array.from(list?.querySelectorAll<HTMLElement>('.hot-content-item') ?? []);
  if (!list || dots.length < 2) return;
  const update = (): void => {
    const start = list.getBoundingClientRect().left;
    const distances = items.map((item) => Math.abs(item.getBoundingClientRect().left - start));
    const index = distances.indexOf(Math.min(...distances));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  list.addEventListener('scrollend', update, { signal: scope.signal });
}

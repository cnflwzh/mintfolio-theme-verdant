import { createPageScope } from './lifecycle';

let scope = createPageScope();
const progress = (value: number): void => {
  const bar = document.getElementById('page-loading-progress');
  if (!bar) return;
  bar.classList.toggle('loading', value < 100);
  bar.classList.toggle('complete', value === 100);
  bar.style.width = `${value}%`;
};

document.addEventListener('astro:before-preparation', () => {
  scope.dispose();
  scope = createPageScope();
  progress(0);
  scope.frame(() => progress(30));
  scope.timeout(() => progress(50), 100);
});
document.addEventListener('astro:after-swap', () => progress(90));
document.addEventListener('astro:page-load', () => {
  scope.dispose();
  scope = createPageScope();
  progress(100);
  scope.timeout(() => {
    const bar = document.getElementById('page-loading-progress');
    bar?.classList.remove('complete');
    if (bar) bar.style.width = '0%';
  }, 300);
});

import type { PageScope } from './lifecycle';

export function initHero(hero: HTMLElement, scope: PageScope): void {
  const content = document.querySelector('.content-wrapper');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const options = { signal: scope.signal };
  let collapsed = false;
  let hintRequested = false;
  const setCollapsed = (value: boolean): void => {
    collapsed = value;
    hero.classList.toggle('collapsed', value);
    content?.classList.toggle('hero-collapsed', value);
    hero.inert = value;
    if (value && !hintRequested) {
      hintRequested = true;
      window.dispatchEvent(new CustomEvent('home:show-return-hint'));
    }
  };
  const enterContent = (): void => {
    history.replaceState(history.state, '', `${location.pathname}${location.search}#content`);
    setCollapsed(true);
    scope.frame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  };
  hero.querySelector('a[href="#content"]')?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      enterContent();
    },
    options,
  );
  const indicator = hero.querySelector('.scroll-indicator');
  indicator?.addEventListener('click', enterContent, options);
  indicator?.addEventListener(
    'keydown',
    (event) => {
      if (event instanceof KeyboardEvent && ['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        enterContent();
      }
    },
    options,
  );
  hero.addEventListener(
    'wheel',
    (event) => {
      if (!collapsed && event.deltaY > 0) {
        event.preventDefault();
        enterContent();
      }
    },
    { ...options, passive: false },
  );
  let touchY: number | null = null;
  hero.addEventListener(
    'touchstart',
    (event) => {
      touchY = event.touches[0]?.clientY ?? null;
    },
    { ...options, passive: true },
  );
  hero.addEventListener(
    'touchmove',
    (event) => {
      if (!collapsed && touchY !== null && touchY - (event.touches[0]?.clientY ?? touchY) > 28) {
        touchY = null;
        enterContent();
      }
    },
    { ...options, passive: true },
  );
  const restore = (): void => {
    // Hydrating a history entry must not overwrite the router's restored scroll position.
    if (window.location.hash === '#content') setCollapsed(true);
    else if (!collapsed && window.scrollY > 8) setCollapsed(true);
  };
  window.addEventListener('hashchange', restore, options);
  window.addEventListener(
    'scroll',
    () => {
      if (!collapsed && window.scrollY > 8) {
        history.replaceState(history.state, '', `${location.pathname}${location.search}#content`);
        setCollapsed(true);
      }
    },
    { ...options, passive: true },
  );
  window.addEventListener(
    'home:return-to-hero',
    () => {
      setCollapsed(false);
      history.replaceState(history.state, '', `${location.pathname}${location.search}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    options,
  );
  document.addEventListener('astro:page-load', restore, options);
  restore();
  const pause = (): void => {
    hero.classList.toggle('is-paused', document.hidden);
  };
  document.addEventListener('visibilitychange', pause, options);
  pause();
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      for (const node of hero.querySelectorAll<HTMLElement>('[data-countup]')) {
        const target = Number(node.dataset.countup);
        if (!Number.isFinite(target) || reducedMotion.matches) continue;
        const start = performance.now();
        const tick = (now: number): void => {
          const progress = Math.min((now - start) / 900, 1);
          node.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
          if (progress < 1 && !collapsed) scope.frame(tick);
          else node.textContent = String(target);
        };
        scope.frame(tick);
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(hero);
  scope.add(() => observer.disconnect());
  const gradient = hero.querySelector<HTMLElement>('.hero-gradient');
  const pattern = hero.querySelector<HTMLElement>('.hero-pattern');
  if (
    !gradient ||
    !pattern ||
    reducedMotion.matches ||
    navigator.maxTouchPoints > 0 ||
    matchMedia('(pointer: coarse)').matches
  )
    return;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let pending = false;
  const animate = (): void => {
    pending = false;
    if (collapsed || document.hidden) return;
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    gradient.style.transform = `translate3d(${x * 36}px, ${y * 36}px, 0)`;
    pattern.style.transform = `translate3d(${x * -24}px, ${y * -24}px, 0)`;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001) requestFrame();
  };
  const requestFrame = (): void => {
    if (!pending) {
      pending = true;
      scope.frame(animate);
    }
  };
  hero.addEventListener(
    'mousemove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
      requestFrame();
    },
    options,
  );
  hero.addEventListener(
    'mouseleave',
    () => {
      targetX = targetY = 0;
      requestFrame();
    },
    options,
  );
}

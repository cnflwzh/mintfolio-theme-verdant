import type { PageScope } from './lifecycle';

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;
const DECODE_WAIT_MS = 600;

/**
 * Home "值得一读" banner. Slides are stacked and crossfaded by toggling
 * `.is-active`; CSS animates only opacity and transform. Autoplay pauses
 * (and later resumes where it stopped) while the reader hovers, focuses
 * inside, or the tab is hidden. Reduced motion disables autoplay.
 */
export function initFeatureBanner(scope: PageScope): void {
  const root = document.querySelector<HTMLElement>('[data-feature-banner]');
  const track = root?.querySelector<HTMLElement>('.banner-track');
  if (!root || !track) return;
  const slides = Array.from(track.querySelectorAll<HTMLElement>('.banner-slide'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('.banner-dot'));
  if (slides.length < 2) return;

  const { signal } = scope;
  const autoplay = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let switching = 0;
  let timer = 0;
  let remaining = AUTOPLAY_MS;
  let startedAt = 0;
  let progress: Animation | null = null;
  let hovered = false;
  let focused = false;

  const show = (next: number): void => {
    index = next;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
  };

  const pause = (): void => {
    if (!timer) return;
    window.clearTimeout(timer);
    timer = 0;
    remaining -= performance.now() - startedAt;
    progress?.pause();
  };

  const resume = (): void => {
    if (!autoplay || timer || hovered || focused || document.hidden) return;
    if (!progress) {
      // Composited countdown on the active dot; no layout or style recalculation per frame.
      progress = dots[index]?.querySelector('.banner-dot-fill')?.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: AUTOPLAY_MS, easing: 'linear', fill: 'forwards' },
      ) ?? null;
    }
    progress?.play();
    startedAt = performance.now();
    timer = window.setTimeout(() => {
      timer = 0;
      void go(index + 1);
    }, Math.max(remaining, 0));
  };

  const go = async (next: number): Promise<void> => {
    const target = (next + slides.length) % slides.length;
    if (target === index) return;
    const ticket = ++switching;
    pause();
    progress?.cancel();
    progress = null;
    remaining = AUTOPLAY_MS;
    // Decode before the crossfade so the first frame of the fade never waits on the image;
    // cap the wait so a slow or never-loading image cannot stall the carousel.
    const image = slides[target]?.querySelector('img');
    if (image) {
      await Promise.race([
        image.decode().catch(() => undefined),
        new Promise((resolve) => window.setTimeout(resolve, DECODE_WAIT_MS)),
      ]);
    }
    if (ticket !== switching || signal.aborted) return;
    show(target);
    resume();
  };

  root.querySelector('[data-banner-prev]')?.addEventListener('click', () => void go(index - 1), { signal });
  root.querySelector('[data-banner-next]')?.addEventListener('click', () => void go(index + 1), { signal });
  dots.forEach((dot, i) => dot.addEventListener('click', () => void go(i), { signal }));

  // Horizontal swipes on touch screens; `touch-action: pan-y` leaves vertical scrolling to the page.
  let startX = 0;
  let startY = 0;
  let swiped = false;
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    startX = event.clientX;
    startY = event.clientY;
    swiped = false;
  }, { signal });
  track.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse') return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(event.clientY - startY)) return;
    swiped = true;
    void go(index + (dx < 0 ? 1 : -1));
  }, { signal });
  // A swipe that ends on the link must not also open the article.
  track.addEventListener('click', (event) => {
    if (!swiped) return;
    swiped = false;
    event.preventDefault();
  }, { capture: true, signal });

  root.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    pause();
  }, { signal });
  root.addEventListener('pointerleave', () => {
    if (!hovered) return;
    hovered = false;
    resume();
  }, { signal });
  root.addEventListener('focusin', () => {
    focused = true;
    pause();
  }, { signal });
  root.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
    focused = false;
    resume();
  }, { signal });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()), { signal });
  scope.add(() => {
    window.clearTimeout(timer);
    progress?.cancel();
  });

  show(0);
  resume();
}

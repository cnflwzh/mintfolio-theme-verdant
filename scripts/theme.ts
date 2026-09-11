import { PALETTES } from '../lib/palettes';
import { readStorage, writeStorage } from '../utils/storage';
import type { PageScope } from './lifecycle';

function syncBrowserThemeColor(): void {
  const meta = document.querySelector<HTMLMetaElement>('#browser-theme-color');
  const background = getComputedStyle(document.documentElement).backgroundColor;
  if (meta && meta.content !== background) meta.content = background;
}

// Preserve the chosen theme before Astro swaps the root and head, avoiding a
// brief return to the default background and browser-bar color between pages.
document.addEventListener('astro:before-swap', (event) => {
  const theme = document.documentElement.dataset.theme;
  if (theme) event.newDocument.documentElement.dataset.theme = theme;
});

export function initTheme(scope: PageScope): void {
  const panel = document.getElementById('theme-panel');
  const toggle = document.getElementById('theme-toggle');
  if (!panel || !toggle) return;
  const options = { signal: scope.signal };
  const modeButtons = panel.querySelectorAll<HTMLButtonElement>('.mode-btn');
  const paletteButtons = panel.querySelectorAll<HTMLButtonElement>('.palette-btn');
  const storedMode = readStorage('local', 'theme-mode');
  let mode = ['auto', 'light', 'dark'].includes(storedMode ?? '') ? storedMode! : (document.body.dataset.initialMode ?? 'auto');
  let palette = readStorage('local', 'theme-palette') ?? document.body.dataset.initialPalette ?? '1';
  if (!PALETTES.some((entry) => entry.id === palette)) palette = '1';
  const media = matchMedia('(prefers-color-scheme: dark)');
  const apply = (announce = false): void => {
    const resolvedMode = mode === 'auto' ? (media.matches ? 'dark' : 'light') : mode;
    const theme = `${resolvedMode}-${palette}`;
    document.documentElement.dataset.theme = theme;
    syncBrowserThemeColor();
    writeStorage('local', 'theme', theme);
    writeStorage('local', 'theme-mode', mode);
    writeStorage('local', 'theme-palette', palette);
    for (const button of [...modeButtons, ...paletteButtons]) {
      const selected = button.dataset.mode === mode || button.dataset.palette === palette;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    const announcer = document.getElementById('a11y-announcer');
    if (announce && announcer) {
      const label = mode === 'auto' ? '自动' : mode === 'dark' ? '深色' : '浅色';
      announcer.textContent = `主题已切换为${label}模式，${PALETTES.find((entry) => entry.id === palette)?.name}配色`;
    }
  };
  for (const buttons of [modeButtons, paletteButtons]) {
    buttons.forEach((button, index) => {
      button.addEventListener(
        'click',
        () => {
          mode = button.dataset.mode ?? mode;
          palette = button.dataset.palette ?? palette;
          apply(true);
        },
        options,
      );
      button.addEventListener(
        'keydown',
        (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const step = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
          const next =
            buttons[
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index + step + buttons.length) % buttons.length
            ];
          next?.click();
          next?.focus();
        },
        options,
      );
    });
  }
  panel.addEventListener(
    'toggle',
    () => {
      const open = panel.matches(':popover-open');
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
    },
    options,
  );
  media.addEventListener(
    'change',
    () => {
      if (mode === 'auto') apply();
    },
    options,
  );
  apply();
  scope.add(() => {
    if (panel.matches(':popover-open')) panel.hidePopover();
  });
}

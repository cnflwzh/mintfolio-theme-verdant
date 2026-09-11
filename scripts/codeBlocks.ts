import { copyText, resolveCodeLanguage, extractCodeText } from '@mintfolio/core/client';
import { onPage } from './lifecycle';

function createIcon(kind: 'clipboard' | 'check' | 'error'): SVGSVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  const attributes = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
  for (const [name, value] of Object.entries(attributes)) svg.setAttribute(name, value);
  const append = (name: 'path' | 'rect' | 'circle', attributes: Record<string, string>): void => {
    const element = document.createElementNS(namespace, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    svg.appendChild(element);
  };
  if (kind === 'clipboard') {
    append('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' });
    append('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' });
  } else if (kind === 'check') {
    append('path', { d: 'M20 6 9 17l-5-5' });
  } else {
    append('circle', { cx: '12', cy: '12', r: '9' });
    append('path', { d: 'M12 8v5 M12 16h.01' });
  }
  return svg;
}

function getRenderedLines(code: HTMLElement, rawText: string): HTMLElement[] {
  const renderedLines = Array.from(code.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('line'),
  );
  if (renderedLines.length > 0) {
    return renderedLines;
  }

  const fragment = document.createDocumentFragment();
  const nextLines = rawText.split('\n').map((lineText) => {
    const line = document.createElement('span');
    line.className = 'line';

    if (lineText.length > 0) {
      line.textContent = lineText;
    }

    fragment.appendChild(line);
    return line;
  });

  code.textContent = '';
  code.appendChild(fragment);
  return nextLines;
}

function createCodeGutter(code: HTMLElement, rawText: string): HTMLDivElement {
  const lines = getRenderedLines(code, rawText);
  const gutter = document.createElement('div');
  gutter.className = 'code-block-gutter';
  gutter.setAttribute('aria-hidden', 'true');
  // Reuse every Shiki token node, removing only the inter-row formatting newlines.
  code.replaceChildren(...lines);
  lines.forEach((line, index) => {
    line.classList.add('code-block-row');
    const lineNumber = document.createElement('span');
    lineNumber.className = 'code-block-line-number';
    lineNumber.textContent = String(index + 1);
    gutter.appendChild(lineNumber);
  });
  return gutter;
}

function createToolbar(languageLabel: string): HTMLDivElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'code-block-toolbar';
  const controls = document.createElement('div');
  controls.className = 'code-block-window-controls';
  controls.setAttribute('aria-hidden', 'true');
  for (const color of ['red', 'yellow', 'green']) {
    const dot = document.createElement('span');
    dot.className = `code-block-window-dot is-${color}`;
    controls.appendChild(dot);
  }
  const language = document.createElement('span');
  language.className = 'code-block-language';
  language.textContent = languageLabel;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-btn';
  button.setAttribute('aria-label', '复制代码');
  button.title = '复制代码';
  button.appendChild(createIcon('clipboard'));
  toolbar.append(controls, language, button);

  return toolbar;
}

function enhancePreBlock(pre: HTMLPreElement, code: HTMLElement, rawText: string): (() => void) | null {
  let toolbar = pre.closest('.code-block-shell')?.querySelector<HTMLDivElement>('.code-block-toolbar');
  if (!toolbar) {
    const languageLabel = resolveCodeLanguage(pre, code);
    const gutter = createCodeGutter(code, rawText);

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-shell';
    wrapper.style.setProperty('--code-block-line-digits', String(Math.max(2, String(gutter.childElementCount).length)));

    toolbar = createToolbar(languageLabel);
    const scroll = document.createElement('div');
    scroll.className = 'code-block-scroll';

    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.append(toolbar, scroll);
    scroll.append(gutter, pre);
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', `${languageLabel} 代码`);

    pre.dataset.codeBlockEnhanced = '1';
  }

  const copyButton = toolbar.querySelector('.code-copy-btn');
  if (!copyButton) {
    return null;
  }

  let resetTimer: number | null = null;
  let disposed = false;

  const resetCopyState = () => {
    copyButton.replaceChildren(createIcon('clipboard'));
    copyButton.classList.remove('is-copied');
    copyButton.classList.remove('is-copy-failed');
    copyButton.setAttribute('aria-label', '复制代码');
    copyButton.setAttribute('title', '复制代码');
    resetTimer = null;
  };

  const onCopy = async () => {
    const copied = await copyText(rawText);
    if (disposed) return;
    copyButton.replaceChildren(createIcon(copied ? 'check' : 'error'));
    copyButton.classList.toggle('is-copied', copied);
    copyButton.classList.toggle('is-copy-failed', !copied);
    copyButton.setAttribute('aria-label', copied ? '复制成功' : '复制失败');
    copyButton.setAttribute('title', copied ? '复制成功' : '复制失败');

    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }

    resetTimer = window.setTimeout(resetCopyState, copied ? 1800 : 1500);
  };

  copyButton.addEventListener('click', onCopy);

  return () => {
    disposed = true;
    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }

    copyButton.removeEventListener('click', onCopy);
    resetCopyState();
  };
}

onPage('.article-prose', (postContent, scope) => {
  for (const pre of postContent.querySelectorAll('pre')) {
    const code = pre.querySelector('code');
    if (!code) continue;
    const rawText = extractCodeText(code, pre);
    if (!rawText.trim()) continue;
    const dispose = enhancePreBlock(pre, code, rawText);
    if (dispose) scope.add(dispose);
  }
});

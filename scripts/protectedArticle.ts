import { createProtectedArticleController, parseEncryptedArticle, onPage } from '@mintfolio/core/client';
import { createArticleToc } from './protectedToc';

onPage('[data-protected-post]', (root, scope) => {
  const gate = root.querySelector<HTMLElement>('.password-gate');
  const form = root.querySelector<HTMLFormElement>('.password-form');
  const input = root.querySelector<HTMLInputElement>('#article-password');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = root.querySelector<HTMLElement>('#password-status');
  const content = root.querySelector<HTMLElement>('.protected-article-content');
  const unlockedBar = root.querySelector<HTMLElement>('.unlocked-bar');
  const data = root.querySelector('.encrypted-article-data');
  if (!gate || !form || !input || !submit || !status || !content || !unlockedBar || !data) return;
  if (!window.isSecureContext || !crypto.subtle) {
    status.textContent = '当前环境不支持安全解密，请通过 HTTPS 或本机 localhost 打开。';
    return;
  }
  let payload;
  try { payload = parseEncryptedArticle(JSON.parse(data.textContent ?? '')); }
  catch { status.textContent = '加密文章数据无法读取，请刷新页面或联系作者。'; return; }
  const notify = (): void => { document.dispatchEvent(new Event('article:content-changed')); };
  const controller = createProtectedArticleController({
    payload, postId: root.dataset.postId ?? '', signal: scope.signal,
    onUnlock: (unlocked) => {
      // Only presentation stays here: retain Astro's empty scoped-style wrapper.
      const template = root.querySelector<HTMLTemplateElement>('[data-prose-template]');
      const prose = template?.content.firstElementChild?.cloneNode(true);
      if (!(prose instanceof HTMLElement)) throw new Error('Missing article presentation template');
      prose.replaceChildren(unlocked.fragment);
      content.replaceChildren(createArticleToc(root, unlocked.headings), prose);
      input.value = '';
    },
    onClear: () => { input.value = ''; content.replaceChildren(); status.textContent = ''; input.removeAttribute('aria-invalid'); notify(); },
    onState: (state) => {
      input.disabled = submit.disabled = state === 'unlocking';
      submit.textContent = state === 'unlocking' ? '正在解锁…' : '解锁文章';
      if (state === 'unlocking') { status.textContent = ''; input.removeAttribute('aria-invalid'); form.setAttribute('aria-busy', 'true'); }
      else form.removeAttribute('aria-busy');
      root.dataset.state = state === 'unlocked' ? 'unlocked' : 'locked';
      gate.hidden = state === 'unlocked';
      content.hidden = unlockedBar.hidden = state !== 'unlocked';
      if (state === 'unlocked') { notify(); content.focus({ preventScroll: true }); }
    },
    onError: () => { status.textContent = '密码不正确，或文章数据已损坏，请重试。'; input.setAttribute('aria-invalid', 'true'); input.focus(); },
  });
  input.disabled = submit.disabled = false;
  form.addEventListener('submit', (event) => { event.preventDefault(); void controller.unlock(input.value); }, { signal: scope.signal });
  root.querySelector('.lock-article')?.addEventListener('click', () => { controller.lock(); input.focus(); }, { signal: scope.signal });
});

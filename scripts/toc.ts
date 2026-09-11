import { createTocController, type PageScope } from '@mintfolio/core/client';

export function initTocDrawer(scope: PageScope): void {
  const toggle = document.getElementById('toc-toggle');
  const overlay = document.getElementById('toc-overlay');
  const tocCard = document.getElementById('toc-card');
  const progressBar = tocCard?.querySelector<HTMLElement>('.toc-progress');
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc-link'));
  const floatRight = document.getElementById('ui-float-right');

  if (!toggle || !overlay || !tocCard || tocLinks.length === 0 || !floatRight) {
    return;
  }

  // 将 TOC 按钮移动到 ui-float-right 容器中
  if (!floatRight.contains(toggle)) {
    toggle.style.display = '';
    floatRight.insertBefore(toggle, floatRight.firstChild);
  }

  const addDisposer = scope.add;

  // Check if desktop mode
  const isDesktop = () => window.innerWidth >= 1320;

  // State: desktop default open, mobile/tablet default closed
  let isOpen = isDesktop();

  // Desktop: toggle sidebar visibility
  const toggleDesktop = () => {
    isOpen = !isOpen;
    tocCard.classList.toggle('hidden', !isOpen);
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  };

  // Mobile/Tablet: open drawer
  const openDrawer = () => {
    isOpen = true;
    tocCard.classList.add('open');
    overlay.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  // Mobile/Tablet: close drawer
  const closeDrawer = () => {
    isOpen = false;
    tocCard.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  // Toggle handler
  const handleToggle = () => {
    if (isDesktop()) {
      toggleDesktop();
    } else {
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  };

  // Initialize state based on screen size
  const initializeState = () => {
    if (isDesktop()) {
      // Desktop: default open
      isOpen = true;
      tocCard.classList.remove('hidden');
      tocCard.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = '';
    } else {
      // Mobile/Tablet: default closed (使用 CSS 默认的隐藏状态)
      isOpen = false;
      tocCard.classList.remove('open');
      tocCard.classList.remove('hidden');
      overlay.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  // Set initial state
  initializeState();

  // Event listeners
  toggle.addEventListener('click', handleToggle);
  addDisposer(() => toggle.removeEventListener('click', handleToggle));

  overlay.addEventListener('click', closeDrawer);
  addDisposer(() => overlay.removeEventListener('click', closeDrawer));

  const headings = tocLinks.map((link) => {
    try { return document.getElementById(decodeURIComponent(new URL(link.href).hash.slice(1))); }
    catch { return null; }
  }).filter((heading): heading is HTMLElement => heading !== null);
  const toc = createTocController({
    headings, links: tocLinks, activeClass: 'active', scrollActiveLink: true,
    offset: () => window.innerWidth <= 768 ? 100 : 120,
    onNavigate: () => { if (!isDesktop()) closeDrawer(); },
    onProgress: (value) => {
      tocCard.style.setProperty('--reading-progress', value + '%');
      progressBar?.setAttribute('aria-valuenow', String(Math.round(value)));
    },
    signal: scope.signal,
  });

  // Escape key handler
  const onEscClose = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen && !isDesktop()) {
      closeDrawer();
      toggle.focus();
    }
  };
  document.addEventListener('keydown', onEscClose);
  addDisposer(() => document.removeEventListener('keydown', onEscClose));

  // Resize handler - reinitialize on breakpoint change
  let wasDesktop = isDesktop();
  const onResize = () => {
    const nowDesktop = isDesktop();
    if (wasDesktop !== nowDesktop) {
      initializeState();
      wasDesktop = nowDesktop;
    }
    toc.refresh();
  };
  window.addEventListener('resize', onResize);
  addDisposer(() => window.removeEventListener('resize', onResize));

  // Initial updates
  scope.frame(() => toc.refresh());

  addDisposer(() => {
    document.body.style.overflow = '';
    // Relocking can remove the article without a page swap, including this relocated control.
    toggle.remove();
  });
}

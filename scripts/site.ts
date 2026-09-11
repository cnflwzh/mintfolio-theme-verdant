import { ARTICLE_BACK_NAV_STORAGE_KEY, shouldPersistArticleBackHref } from '../utils/blogNavigation';
import { HOME_RETURN_HINT_STORAGE_KEY, shouldShowHomeReturnHint } from '../utils/homeReturnHint';
import { readStorage, writeStorage } from '../utils/storage';
import { onPage } from './lifecycle';
import { initTheme } from './theme';
import { rememberArticleOrigin } from './articleOrigin';
import './postList';
import './progress';

function getCurrentArticleBackHref(): string {
  const pathname = window.location.pathname;
  const search = window.location.search;
  const isHome = document.body.dataset.pageKind === 'home';
  const hero = document.querySelector('.hero');
  const isHomeContentVisible = isHome && hero instanceof HTMLElement && hero.classList.contains('collapsed');

  if (isHomeContentVisible) {
    return `${document.body.dataset.homeHref}#content`;
  }

  return `${pathname}${search}`;
}

onPage('body', (_body, scope) => {
  initTheme(scope);
  const addDisposer = scope.add;
  const floatRight = document.getElementById('ui-float-right');
  if (!floatRight) return;
  const backToTop = document.getElementById('back-to-top');
  const homeReturnHintLayer = document.getElementById('home-return-hint-layer');
  const homeReturnHint = document.getElementById('home-return-hint');
  let homeReturnHintTimer: number | null = null;
  document.addEventListener(
    'click',
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return;
      if (
        shouldPersistArticleBackHref({
          linkHref: anchor.href,
          currentOrigin: location.origin,
          currentPath: location.pathname,
          isArticleLink: anchor.hasAttribute('data-article-link'),
        })
      ) {
        writeStorage('session', ARTICLE_BACK_NAV_STORAGE_KEY, getCurrentArticleBackHref());
        rememberArticleOrigin(anchor.pathname, getCurrentArticleBackHref());
      }
    },
    { capture: true, signal: scope.signal },
  );
  const hideHomeReturnHint = () => {
    if (!homeReturnHintLayer) return;
    homeReturnHintLayer.classList.add('hiding');
    homeReturnHintLayer.classList.remove('visible');
    homeReturnHintLayer.setAttribute('aria-hidden', 'true');
    if (homeReturnHintTimer !== null) {
      window.clearTimeout(homeReturnHintTimer);
      homeReturnHintTimer = null;
    }
  };

  const showHomeReturnHint = () => {
    if (!homeReturnHintLayer || !homeReturnHint) return;
    if (!shouldShowHomeReturnHint(readStorage('local', HOME_RETURN_HINT_STORAGE_KEY))) {
      return;
    }

    writeStorage('local', HOME_RETURN_HINT_STORAGE_KEY, '1');
    homeReturnHintLayer.classList.remove('hiding');
    homeReturnHintLayer.classList.add('visible');
    homeReturnHintLayer.setAttribute('aria-hidden', 'false');

    if (homeReturnHintTimer !== null) {
      window.clearTimeout(homeReturnHintTimer);
    }

    homeReturnHintTimer = scope.timeout(() => {
      hideHomeReturnHint();
    }, 10000);
  };

  const hero = document.querySelector('.hero');
  if (hero) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        floatRight.classList.toggle('visible', !entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    obs.observe(hero);
    addDisposer(() => obs.disconnect());
  } else {
    floatRight.classList.add('visible');
  }

  if (backToTop) {
    const onBackToTopClick = () => {
      const isHome = document.body.dataset.pageKind === 'home';
      if (isHome && window.scrollY <= 8) {
        hideHomeReturnHint();
        window.dispatchEvent(new CustomEvent('home:return-to-hero'));
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    };
    backToTop.addEventListener('click', onBackToTopClick);
    addDisposer(() => backToTop.removeEventListener('click', onBackToTopClick));
  }

  if (homeReturnHint) {
    const onHomeReturnHintClick = () => {
      hideHomeReturnHint();
      window.dispatchEvent(new CustomEvent('home:return-to-hero'));
    };
    homeReturnHint.addEventListener('click', onHomeReturnHintClick);
    addDisposer(() => homeReturnHint.removeEventListener('click', onHomeReturnHintClick));
  }

  const onShowHomeReturnHint = () => {
    showHomeReturnHint();
  };
  window.addEventListener('home:show-return-hint', onShowHomeReturnHint);
  addDisposer(() => window.removeEventListener('home:show-return-hint', onShowHomeReturnHint));

  scope.add(hideHomeReturnHint);
});

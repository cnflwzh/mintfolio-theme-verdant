import { onPage } from './lifecycle';
import { createPostList } from './postList';
import { initHero } from './hero';
import { initHomePanels } from './homePanels';
import { initFeatureBanner } from './featureBanner';

onPage('#hero', (hero, scope) => {
  const list = createPostList(scope);
  initHero(hero, scope);
  initHomePanels(hero, list.items, scope);
  initFeatureBanner(scope);
});

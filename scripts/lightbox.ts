import { createLightboxController, type PageScope } from '@mintfolio/core/client';

/** Default provides its controls; all preview behavior comes from Core. */
export function initLightbox(root: HTMLElement, scope: PageScope): void {
  const dialog = document.querySelector<HTMLDialogElement>('#image-lightbox');
  const image = document.querySelector<HTMLImageElement>('#lightbox-image');
  const viewport = document.getElementById('lightbox-viewport');
  const zoomIn = document.querySelector<HTMLButtonElement>('#lightbox-zoom-in');
  const zoomOut = document.querySelector<HTMLButtonElement>('#lightbox-zoom-out');
  const zoomLevel = document.querySelector<HTMLOutputElement>('#lightbox-zoom-level');
  const reset = document.getElementById('lightbox-reset');
  if (!dialog || !image || !viewport || !zoomIn || !zoomOut || !zoomLevel || !reset) return;
  createLightboxController({ root, dialog, image, viewport, zoomIn, zoomOut, zoomLevel, reset, close: document.getElementById('lightbox-close'), signal: scope.signal });
}

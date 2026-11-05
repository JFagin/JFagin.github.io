"use strict";
(() => {
  const frame = document.getElementById('microlensing-frame');
  if (!frame) return;
  let inView = false;
  const sendViewport = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const stickyHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
    const height = Math.max(200, Math.floor(viewportHeight - stickyHeight - 16));
    frame.contentWindow?.postMessage({type: 'microlensing-viewport', height}, location.origin);
  };
  const sendVisibility = () => frame.contentWindow?.postMessage({
    type: 'microlensing-visibility', visible: inView && !document.hidden,
  }, location.origin);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type !== 'microlensing-height') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height >= 200 && height <= 10000) {
      frame.style.height = `${Math.ceil(height)}px`;
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sendVisibility();
    }).observe(frame);
  } else inView = true;
  frame.addEventListener('load', () => { sendViewport(); sendVisibility(); });
  window.addEventListener('resize', sendViewport);
  window.visualViewport?.addEventListener('resize', sendViewport);
  document.addEventListener('visibilitychange', sendVisibility);
})();

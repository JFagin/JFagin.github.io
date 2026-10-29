"use strict";
(() => {
  const frame = document.getElementById('microlensing-frame');
  if (!frame) return;
  let inView = false;
  const sendVisibility = () => frame.contentWindow?.postMessage({
    type: 'microlensing-visibility', visible: inView && !document.hidden,
  }, location.origin);
  const sendViewport = () => frame.contentWindow?.postMessage({
    type: 'microlensing-viewport', height: window.innerHeight,
    inset: document.querySelector('.site-header')?.getBoundingClientRect().height || 0,
  }, location.origin);
  window.addEventListener('resize', sendViewport);
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
  frame.addEventListener('load', () => { sendVisibility(); sendViewport(); });
  document.addEventListener('visibilitychange', sendVisibility);
})();

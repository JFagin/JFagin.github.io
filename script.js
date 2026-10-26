"use strict";

document.documentElement.classList.add("js");

const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const navGroups = [...nav.querySelectorAll(".nav-group")];
menu.hidden = false;
function closeDropdowns(except = null) {
  navGroups.forEach(group => { if (group !== except) group.open = false; });
}
function closeMenu() {
  nav.classList.remove("is-open");
  menu.setAttribute("aria-expanded", "false");
  closeDropdowns();
}
menu.addEventListener("click", () => {
  const opened = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(opened));
  nav.classList.toggle("is-open", opened);
  if (!opened) closeDropdowns();
});
navGroups.forEach(group => group.addEventListener("toggle", () => {
  if (group.open) closeDropdowns(group);
}));
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  closeMenu();
  const target = document.getElementById(link.hash.slice(1));
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({preventScroll:true});
  }
}));
document.addEventListener("click", event => {
  if (!event.target.closest(".site-header")) closeMenu();
});
nav.addEventListener("focusout", event => {
  if (event.relatedTarget && !nav.contains(event.relatedTarget)) closeDropdowns();
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  const openGroup = navGroups.find(group => group.open);
  if (openGroup) {
    closeDropdowns();
    openGroup.querySelector("summary").focus();
  } else if (nav.classList.contains("is-open")) {
    closeMenu();
    menu.focus();
  }
});
window.matchMedia("(min-width: 761px)").addEventListener("change", closeMenu);

// Follow document order, since Research and Simulations are interleaved.
const navSections = [...nav.querySelectorAll('a[href^="#"]')]
  .map(link => ({link, target:document.getElementById(link.hash.slice(1))}))
  .filter(item => item.target)
  .sort((a,b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
let navFramePending = false;
function updateCurrentSection() {
  navFramePending = false;
  const offset = document.querySelector(".header-inner").getBoundingClientRect().height + 32;
  let current = null;
  let currentTop = -Infinity;
  for (const item of navSections) {
    const top = item.target.getBoundingClientRect().top;
    if (top <= offset) {
      // Side-by-side About targets share a vertical position on desktop.
      if (current?.hash === location.hash && Math.abs(top - currentTop) < 4) continue;
      current = item.link;
      currentTop = top;
    }
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = navSections.at(-1)?.link;
  navSections.forEach(({link}) => {
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  navGroups.forEach(group => group.classList.toggle("is-current", !!current && group.contains(current)));
}
function scheduleNavUpdate() {
  if (navFramePending) return;
  navFramePending = true;
  requestAnimationFrame(updateCurrentSection);
}
window.addEventListener("scroll", scheduleNavUpdate, {passive:true});
window.addEventListener("resize", scheduleNavUpdate);
window.addEventListener("load", scheduleNavUpdate);
window.addEventListener("hashchange", scheduleNavUpdate);
updateCurrentSection();

const descriptionToggle = document.querySelector("#publication-descriptions");
const descriptions = document.querySelectorAll("#publications .publication-list article > p:not(.publication-authors):not(.publication-venue)");
descriptionToggle.closest("label").hidden = false;
function updateDescriptions() {
  descriptions.forEach(description => { description.hidden = !descriptionToggle.checked; });
}
descriptionToggle.addEventListener("change", updateDescriptions);
// Start each page visit with descriptions visible, including restored form state.
window.addEventListener("pageshow", () => {
  descriptionToggle.checked = true;
  updateDescriptions();
});
updateDescriptions();

const filters = document.querySelector(".publication-filters");
const publications = [...document.querySelectorAll("[data-publication]")];
filters.hidden = false;
filters.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    let count = 0;
    filters.querySelectorAll("button").forEach(other => other.setAttribute("aria-pressed", String(other === button)));
    publications.forEach(item => {
      const show = button.dataset.filter === "all" || item.dataset.publication === button.dataset.filter;
      item.hidden = !show;
      if (show) count++;
    });
    document.querySelector("#publication-count").textContent = `${count} selected publications shown.`;
  });
});

const dialog = document.querySelector("#figure-dialog");
const dialogImage = document.querySelector("#dialog-image");
document.querySelectorAll("[data-figure]").forEach(link => {
  link.addEventListener("click", event => {
    // The normal image link still works without dialog support or JavaScript.
    if (typeof dialog.showModal !== "function" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.querySelector("#figure-title").textContent = link.dataset.title;
    document.querySelector("#dialog-caption").textContent = link.dataset.caption;
    dialogImage.src = link.href;
    dialogImage.alt = link.querySelector("img").alt;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

const animationStatus = document.querySelector("#animation-status");
const playButtons = [...document.querySelectorAll("[data-play]")];
const requestIds = new Map();
function stopAnimation(button) {
  const image = document.getElementById(button.dataset.play);
  requestIds.set(button, (requestIds.get(button) || 0) + 1);
  image.src = image.dataset.still;
  button.disabled = false;
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = '<span aria-hidden="true">▶</span> Play animation';
}
playButtons.forEach(button => {
  button.hidden = false;
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-pressed") === "true") {
      stopAnimation(button);
      animationStatus.textContent = "Animation stopped. Static preview restored.";
      return;
    }
    const image = document.getElementById(button.dataset.play);
    const requestId = (requestIds.get(button) || 0) + 1;
    requestIds.set(button, requestId);
    button.disabled = true;
    button.textContent = "Loading animation…";
    animationStatus.textContent = "Loading the selected simulation.";
    const preload = new Image();
    preload.onload = () => {
      if (requestIds.get(button) !== requestId) return;
      image.src = image.dataset.animation;
      button.disabled = false;
      button.setAttribute("aria-pressed", "true");
      button.innerHTML = '<span aria-hidden="true">■</span> Stop animation';
      animationStatus.textContent = "Animation playing. Use Stop animation to return to the static preview.";
    };
    preload.onerror = () => {
      if (requestIds.get(button) !== requestId) return;
      stopAnimation(button);
      animationStatus.textContent = "The animation could not be loaded. The static preview is still available. Please try again.";
    };
    // No GIF is requested before an explicit click, including with reduced motion.
    preload.src = image.dataset.animation;
  });
});
const animationTabs = document.querySelector(".animation-tabs");
animationTabs.hidden = false;
function selectAnimation(name) {
  playButtons.forEach(stopAnimation);
  document.querySelectorAll("[data-animation-tab]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.animationTab === name)));
  document.querySelectorAll("[data-animation-panel]").forEach(panel => { panel.hidden = panel.dataset.animationPanel !== name; });
}
animationTabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => selectAnimation(button.dataset.animationTab)));
selectAnimation("transfer");
document.addEventListener("visibilitychange", () => { if (document.hidden) playButtons.forEach(stopAnimation); });
document.querySelector("#year").textContent = String(new Date().getFullYear());

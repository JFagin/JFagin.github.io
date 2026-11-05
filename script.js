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
  const offset = document.querySelector(".header-inner").getBoundingClientRect().height + 64;
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
const scienceVideos = [...document.querySelectorAll("[data-science-video]")];
scienceVideos.forEach(video => {
  video.addEventListener("play", () => {
    scienceVideos.forEach(other => { if (other !== video) other.pause(); });
    animationStatus.textContent = `${video.dataset.videoName} playing. Use the video controls to pause, seek or view fullscreen.`;
  });
  const showVideoError = () => { video.closest("figure").querySelector("[data-video-error]").hidden = false; };
  video.addEventListener("error", showVideoError);
  video.querySelectorAll("source").forEach(source => source.addEventListener("error", showVideoError));
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) scienceVideos.forEach(video => video.pause());
});
if ("IntersectionObserver" in window) {
  const videoVisibility = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      const fullscreen = document.fullscreenElement;
      if (!isIntersecting && !(fullscreen && fullscreen.contains(target))) target.pause();
    });
  }, {threshold: 0});
  scienceVideos.forEach(video => videoVisibility.observe(video));
}
document.querySelector("#year").textContent = String(new Date().getFullYear());

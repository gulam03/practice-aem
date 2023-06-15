import { readBlockConfig, decorateIcons } from "../../scripts/lib-franklin.js";

// load scroll to top
window.addEventListener("load", function (event) {
  window.scroll({
    top: 0,
    left: 0,
  });
});

let isIsiExpanded = false;

/**
 *
 */
function detectionOfBodyIsiMarkers() {
  let isiSectionTarget = document.querySelector(
    ".isi-section-marker[data-block-status=loaded]"
  );

  let theIsiBlock = document.querySelector("#persistent-isi");

  let distanceToBottom =
    window.innerHeight +
    window.scrollY -
    (isiSectionTarget.offsetTop + isiSectionTarget.clientHeight);

  let positionCalcIntoVisibleScroll =
    distanceToBottom + isiSectionTarget.offsetHeight - 75;

  if (positionCalcIntoVisibleScroll > 0) {
    if (!theIsiBlock.classList.contains("persistent-isi--scroll-hidden")) {
      theIsiBlock.classList.add("persistent-isi--scroll-hidden");
    }
  } else {
    if (theIsiBlock.classList.contains("persistent-isi--scroll-hidden")) {
      theIsiBlock.classList.remove("persistent-isi--scroll-hidden");
    }
  }
}

/**
 *
 */
function scrollingMarkers() {
  let timeoutId;

  window.addEventListener("scroll", () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      detectionOfBodyIsiMarkers();
    }, 150);
  });
}

function resizeListener() {
  let timeoutId;
  window.addEventListener("resize", () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      targetTrackingInteraction();
    }, 350);
  });
}

function targetTrackingInteraction() {
  const allowedPercent = isIsiExpanded ? 80 : 20;
  const allowedHeightCollapse = Math.round(
    (window.innerHeight / 100) * allowedPercent
  );

  document.querySelector(
    "#persistent-isi .isi-wrapper-js-container"
  ).style.height = `${allowedHeightCollapse}px`;
}

function targetClickInteraction() {
  document
    .querySelector("#toggle-controls-persistent-isi")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isExpanded = e.target.getAttribute("aria-expanded") === "true";
      if (!isExpanded) {
        isIsiExpanded = true;
        e.target.setAttribute("aria-expanded", "true");
        document
          .querySelector("#persistent-isi")
          .classList.add("persistent-isi--open");
        targetTrackingInteraction();
      } else {
        isIsiExpanded = false;
        e.target.setAttribute("aria-expanded", "false");
        document
          .querySelector("#persistent-isi")
          .classList.remove("persistent-isi--open");
        targetTrackingInteraction();
      }
    });
}

/**
 * lots of structure needed
 */
function targetIsiInteractions() {
  const targetMainIsi = document.querySelector(".isi-wrapper-js-container");

  targetMainIsi.children[0].classList.add("persistent-isi-left");
  targetMainIsi.children[1].classList.add("persistent-isi-right");

  document
    .querySelector(".persistent-isi-top")
    .children[0].classList.add("persistent-isi-top-inner");
  document
    .querySelector(".persistent-isi-bottom")
    .children[0].classList.add("persistent-isi-bottom-inner");

  document
    .querySelector(".persistent-isi-top-inner")
    .children[0].classList.add("persistent-isi-top-text");
  document
    .querySelector(".persistent-isi-bottom-inner")
    .children[0].classList.add("persistent-isi-bottom-text");

  const isiSectionTarget = document.querySelector(
    ".isi-section-marker[data-block-status=loaded]"
  );

  // if there is not ISI content to copy, then return out and do not display:block
  const targetTextDiv = document.querySelector(".persistent-isi-bottom-text");
  if (!isiSectionTarget || !targetTextDiv) {
    console.error("ISI content not found: do not load ");

    return;
  }

  setTimeout(() => {
    const copyTheHtml = isiSectionTarget.innerHTML;
    targetTextDiv.innerHTML = copyTheHtml;

    document
      .querySelector("#persistent-isi")
      .classList.add("persistent-isi--loaded");
  }, 1);

  const extraMarkup = document.createElement("a");
  extraMarkup.id = "toggle-controls-persistent-isi";
  extraMarkup.href = "#";
  extraMarkup.setAttribute("aria-expanded", "false");
  extraMarkup.innerHTML = `&nbsp;`;
  document.querySelector(".persistent-isi-top-text").append(extraMarkup);

  // click events
  targetClickInteraction();

  //////////////////////////////////////
  // adjust height once painted
  setTimeout(() => {
    // clicks
    targetTrackingInteraction();

    // resizing
    resizeListener();

    // react to scroll events
    scrollingMarkers();
  }, 100);
  //////////////////////////////////////
}

/**
 * loads and decorates the persistent isi
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = "";
  const isiPath = cfg.isi || "/isi";
  const resp = await fetch(`${isiPath}.plain.html`);
  const html = await resp.text();

  const isi = document.createElement("div");
  isi.className = "isi-wrapper-js-container";
  isi.innerHTML = html;

  await decorateIcons(isi);
  block.append(isi);

  targetIsiInteractions();
}

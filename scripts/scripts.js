import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadPrefooter,
  loadIsi,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

function buildImageCaptionBlock(main) {
  const p = main.getElementsByTagName('P');
  Array.from(p).forEach((block) => {
    const picture = block.getElementsByTagName('PICTURE');
    if (picture.length == 1) {
      const pWrapper = picture[0].parentElement;
      let hasUpperCaption = false;
      let hasLowerCaption = false;
      const prevSibling = pWrapper.previousElementSibling;
      const nextSibling = pWrapper.nextElementSibling

      if (prevSibling && prevSibling.innerText.match(/\[.*\]/)) {
        hasUpperCaption = true;
      }
      if (nextSibling && nextSibling.innerText.match(/\[.*\]/)) {
        hasLowerCaption = true;
      }

      if (hasUpperCaption || hasLowerCaption) {

        const wrapper = document.createElement('div');
        wrapper.classList.add('image-wrapper');
        const parent = block.parentNode;
        let before = block;
        if (hasUpperCaption) {
          before = prevSibling;
        }
        parent.insertBefore(wrapper, before);
        if (hasUpperCaption) {
          const caption = parseCaption(prevSibling);
          wrapper.appendChild(caption);
          prevSibling.remove();
        }

        const imageWrapper = document.createElement('div');
        imageWrapper.appendChild(picture[0]);
        imageWrapper.classList.add('image');
        wrapper.appendChild(imageWrapper);
        block.remove();

        if (hasLowerCaption) {
          const caption = parseCaption(nextSibling);
          wrapper.appendChild(caption);
          nextSibling.remove();
        }
      }
    }
    function parseCaption(node) {
      const caption = document.createElement('div');
      caption.classList.add('image-caption');
      const text = node.innerText.replace('[', '').replace(']', '');
      caption.innerHTML = text;
      return caption;
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildImageCaptionBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // creating due to block issues currently....
  const isiDiv = doc.createElement('div');
  isiDiv.id = 'persistent-isi';
  isiDiv.className = 'persistent-isi-loaded-from-scripts';
  doc.body.append(isiDiv);

  loadHeader(doc.querySelector('header'));
  loadPrefooter(doc.querySelector('main'));
  loadFooter(doc.querySelector('footer'));

  loadIsi(doc.querySelector('#persistent-isi'));
  // loadCSS(`//www.cibinqo.com/assets/my-custom.css`);
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

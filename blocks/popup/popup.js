/**
 * safe classnames
 */
const toSafeClassName = (str) => {
  return str
    .replace(/[^\w-]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
};

/**
 * sanitize domain strings
 */
const extractDomain = (url) => {
  const domainSanitized = url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!domainRegex.test(domainSanitized)) {
    console.error("Invalid domain");
    return false;
  }
  return domainSanitized;
};

/**
 * Remove Event Listeners to Modal Popup
 */
const removeEventModalListeners = () => {
  document
    .querySelector("#popup-wrapper .continue-btn")
    .removeEventListener("click", () => {});
  document
    .querySelector("#popup-wrapper .cancel-btn")
    .removeEventListener("click", () => {});
};

/**
 * Close Modal
 */
const closePopupModal = (event) => {
  event.preventDefault();
  document.body.classList.remove("modal-open");
  delete window.external_link_url;
  removeEventModalListeners();
};

/**
 * Add Event Listeners to Modal Popup
 */
const addEventModalListeners = () => {
  document
    .querySelector("#popup-wrapper .continue-btn")
    .addEventListener("click", (event) => {
      event.preventDefault();
      window.open(window.external_link_url, "_self");
    });

  document
    .querySelector("#popup-wrapper .cancel-btn")
    .addEventListener("click", (event) => {
      event.preventDefault();
      closePopupModal(event);
    });
};

/**
 * Loaded Modal Popup markup
 */
const loadModalMarkup = async (block) => {
  block.innerHTML = "";

  const externalLinkPopup = `/global/popups/external-link-popup`;
  const resp = await fetch(`${externalLinkPopup}.plain.html`);
  const html = await resp.text();
  const orginalMarkup = document.createElement("div");
  orginalMarkup.innerHTML = html;

  orginalMarkup.querySelectorAll(".modal-popup > div").forEach((el) => {
    if (el?.nodeName !== "DIV" || el?.children?.length !== 2) return;
    const propertyName = toSafeClassName(el.children[0].textContent);
    el.children[1].classList.add(propertyName);
    el.children[0].remove();
  });

  const structuredMarkup = `<div>
  ${orginalMarkup.querySelector(".header").outerHTML}
  ${orginalMarkup.querySelector(".description").outerHTML}
    <div class="buttons">
      <a href="#" class="continue-btn">
      ${orginalMarkup.querySelector(".continue").textContent}
      </a>
      <a href="#" class="cancel-btn">
        ${orginalMarkup.querySelector(".cancel").textContent}
      </a>
    </div>
  </div>`;

  const popupMarkup = document.createElement("div");
  popupMarkup.classList.add("modal-wrapper");
  popupMarkup.innerHTML = structuredMarkup;
  block.append(popupMarkup);
};

/**
 * Open Modal Popup
 */
const openPopupModal = (event) => {
  if (!event?.target?.href) {
    return;
  }

  event.preventDefault();
  // add link to window
  window.external_link_url = event?.target?.href;
  document.body.classList.add("modal-open");
  addEventModalListeners();
};

/**
 * loads and decorates the popup
 * @param {Element} block The popup block element
 */
export default async function decorate(block) {
  block.innerHTML = "";

  const respWhite = await fetch(`global/popups/external-link-whitelist.json`);
  const externalLinkWhiteList = await respWhite.text();
  const jsonLinkWhiteList = JSON.parse(externalLinkWhiteList);
  const availableDomainData = Boolean(
    jsonLinkWhiteList?.data && jsonLinkWhiteList?.data?.length > 0
  );
  const availableWhiteListDomains = availableDomainData
    ? jsonLinkWhiteList.data.map((obj) => {
        const flatDomain = Object.values(obj).flat()[0];
        return extractDomain(flatDomain);
      })
    : [];

  const externalLinks = document.querySelectorAll('body a[href^="http"]');
  if (!externalLinks) return;

  externalLinks.forEach((link) => {
    // return if allowed whitelisted domain
    const domain = extractDomain(link.href);
    if (availableWhiteListDomains.includes(domain)) return;
    link.addEventListener("click", (event) => {
      openPopupModal(event);
    });
  });

  // load markup but is hidden
  loadModalMarkup(block);
}

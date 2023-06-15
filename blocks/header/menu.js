export function setAllDropdownsToClosed() {
  document
    .querySelectorAll('.i-am-main-menu ul li a.toggle-children-link')
    .forEach((link) => {
      link.setAttribute('aria-expanded', 'false');
      link.parentElement.classList.remove('has-children--opened');
    });
}

export function toggleMainMenu() {
  document.querySelector('.i-am-main-menu ul').classList.add('menu-structure');
  document
    .querySelector('.i-am-main-menu ul')
    .parentElement.classList.add('menu-wrapper');

  document
    .querySelectorAll('.i-am-main-menu ul > li')
    .forEach((navSection, i) => {
      const hasChildren = Boolean(navSection.querySelector('ul'));

      if (hasChildren) {
        navSection.classList.add('has-children');
        navSection.querySelector('ul').classList.add('sub-menu');
        navSection.querySelector('a').classList.add('toggle-children-link');
      }

      // apply menu links
      const link = navSection.querySelector('li > a');
      const url = link.textContent
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      link.setAttribute('href', `/${url}`);

      // link.classList.add(`main-menu-link-index-${i}`);
      link.classList.add(`main-menu-link-${url}`);
      if (link.parentElement) {
        link.parentElement.classList.add(`main-menu-list-${url}`);
      }

      // special condition for home url
      if (url === 'home') {
        link.setAttribute('href', '/');
        link.classList.add('home-icon');
      }
    });

  document
    .querySelectorAll('.i-am-main-menu ul  li a.toggle-children-link')
    .forEach((link, i) => {
      setAllDropdownsToClosed();

      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const expanded = link.getAttribute('aria-expanded') === 'true';
        setAllDropdownsToClosed();

        if (expanded) {
          link.setAttribute('aria-expanded', 'false');
          link.parentElement.classList.remove('has-children--opened');
        } else {
          link.setAttribute('aria-expanded', 'true');
          link.parentElement.classList.add('has-children--opened');
        }
      });
    });
}
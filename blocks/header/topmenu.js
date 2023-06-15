export function toggleBlueTopMenu() {
  document
    .querySelector('.blue-top-menu ul')
    .classList.add('menu-structure-blue-top');
  document
    .querySelector('.blue-top-menu ul')
    .parentElement.classList.add('menu-wrapper-blue-top');

  const singleDropDown = document.querySelector(
    'ul.menu-structure-blue-top li ul',
  );

  if (!singleDropDown) return;

  singleDropDown.classList.add('sub-menu-blue-top');

  document
    .querySelector('ul.sub-menu-blue-top')
    .parentElement.classList.add('has-children-blue');

  const linkClickTarget = document.querySelector(
    '.menu-structure-blue-top li.has-children-blue a',
  );

  linkClickTarget.classList.add('toggle-children-link-blue');
  linkClickTarget.setAttribute('aria-expanded', 'false');

  linkClickTarget.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const linkEl = e.target;

    const expanded = linkEl.getAttribute('aria-expanded') === 'true';

    if (expanded) {
      linkEl.setAttribute('aria-expanded', 'false');
      linkEl.parentElement.classList.remove('has-children--opened');
    } else {
      linkEl.setAttribute('aria-expanded', 'true');
      linkEl.parentElement.classList.add('has-children--opened');
    }
  });
}
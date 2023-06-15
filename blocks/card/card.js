function createImage(item) {
  const img = document.createElement('img');
  img.src = item.content;
  return img.outerHTML;
}

function createLink(item) {
  const div = document.createElement('div');
  div.innerHTML = item.content;
  div.firstElementChild.setAttribute('target', '_blank');
  return div.innerHTML;
}

function decode(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function createForm(item) {
  const config = JSON.parse(item.content);
  const form = document.createElement('helix-form-wrapper');
  form.setAttribute('config-token', config['config-token']);
  form.setAttribute('api-endpoint-url', config['endpoint-url'].trim());
  form.setAttribute('submission-endpoint-url', config['submission-url'].trim());
  form.setAttribute('container-visibility', 'SHOW_BOTH');
  form.setAttribute('method', 'GET');

  const success = document.createElement('div');
  success.setAttribute('slot', 'success-message');
  success.setAttribute('class', 'shelix-form-wrapper__result');
  success.innerHTML = decode(config?.success);
  form.appendChild(success);
  return form.outerHTML;
}

function createContent(item) {
  switch (item.type) {
    case 'Image':
      return createImage(item);
    case 'Link':
      return createLink(item);
    case 'Form':
      return createForm(item);
    case 'Description':
    default:
      return item.content;
  }
}

export default function decorate(block) {
  [...block.children].forEach((div) => {
    const elements = div.getElementsByTagName('div');
    const item = {};
    item.type = elements[0].innerText;
    item.content = elements[1].innerHTML;
    const content = createContent(item);
    div.innerHTML = content;
  });
}

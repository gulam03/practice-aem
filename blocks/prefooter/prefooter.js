import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const prefooterPath = cfg.prefooter || '/prefooter';
  const resp = await fetch(`${prefooterPath}.plain.html`);
  const html = await resp.text();
  const prefooter = document.createElement('div');
  prefooter.innerHTML = html;
  block.classList.add('section');
  block.classList.remove('block');
  await decorateIcons(prefooter);
  block.append(prefooter);
}

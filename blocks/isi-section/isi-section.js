export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`isi-${cols.length}-cols`);
}

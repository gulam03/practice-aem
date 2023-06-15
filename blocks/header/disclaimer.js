export function topDisclaimerMarkup() {
  const disclaimer = document.querySelector('.disclaimer div');

  const extraMarkup = document.createElement('a');
  extraMarkup.id = 'close-disclaimer';
  extraMarkup.href = '#';
  extraMarkup.title = 'close';
  extraMarkup.innerHTML = '<img src="assets/imgs/close-icon-top.png" alt="Close">';
  disclaimer.append(extraMarkup);

  document
    .querySelector('.disclaimer #close-disclaimer')
    .addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // can add localStorage if needed
      document.querySelector('.disclaimer').style.display = 'none';
    });
}
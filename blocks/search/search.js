import { readBlockConfig } from '../../scripts/lib-franklin.js';

function loadSearchResults(data) {
  const results = data?.data?.results;
  const searchResults = document.getElementById('search-results');
  searchResults.innerHTML = '';
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    const title = result?.title;
    const url = result.page_link;
    const snippet = result.description;
    const resultDiv = document.createElement('div');
    const resultTitle = document.createElement('a');
    resultTitle.setAttribute('href', url);
    resultTitle.innerHTML = title;
    resultDiv.appendChild(resultTitle);
    const resultSnippet = document.createElement('p');
    resultSnippet.innerHTML = snippet;
    resultDiv.appendChild(resultSnippet);
    searchResults.appendChild(resultDiv);
  }
}

function createFromTemplate(block, searchIndex) {
  block.innerHTML = '';
  fetch('/blocks/search/search.html')
    .then((response) => response.text())
    .then((template) => {
      const container = document.createElement('template-container');
      container.innerHTML = template;
      block.append(container);
      const form = container.querySelector('#search-html-template');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = container.querySelector('.search-query');
        const keyword = input.value;
        const url = `https://next-gen-search-staging.digitalpfizer.com/api/v3/search?fuzziness=0&isipi=1&index=${searchIndex}&pageNumber=1&pageSize=100&keyword=${keyword}`;
        fetch(url)
          .then((response) => response.json())
          .then((data) => loadSearchResults(data))
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      });
    });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (config.searchindex) {
    createFromTemplate(block, config.searchindex);
  }
}

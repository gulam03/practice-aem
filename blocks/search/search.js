import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  if(config.searchindex) {
    createFromTemplate(block, config.searchindex);
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
      let form = container.querySelector('#search-html-template');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        let input = container.querySelector('.search-query');
        let keyword = input.value;
        let url = `https://next-gen-search-staging.digitalpfizer.com/api/v3/search?fuzziness=0&isipi=1&index=${searchIndex}&pageNumber=1&pageSize=100&keyword=${keyword}`;
        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            loadSearchResults(data);
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    });
}


function loadSearchResults(data) {
  let results = data.data.results;
  let searchResults = document.getElementById('search-results');
  searchResults.innerHTML = '';
  for (let i = 0; i < results.length; i++) {
    let result = results[i];
    let title = result.title;
    let url = result.page_link;
    let snippet = result.description;
    let resultDiv = document.createElement('div');
    let resultTitle = document.createElement('a');
    resultTitle.setAttribute('href', url);
    resultTitle.innerHTML = title;
    resultDiv.appendChild(resultTitle);
    let resultSnippet = document.createElement('p');
    resultSnippet.innerHTML = snippet;
    resultDiv.appendChild(resultSnippet);
    searchResults.appendChild(resultDiv);
  }
}

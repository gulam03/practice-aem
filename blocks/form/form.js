import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // Get the block config and set the token
  const config = readBlockConfig(block);
  const token = config.configtoken;
  // Create the form element
  createForm(block, token);

} 

function createInput(type, name, placeholder) {
  var input = document.createElement("input");
  input.setAttribute("type", type);
  input.setAttribute("name", name);
  input.setAttribute("placeholder", placeholder);

  return input;
}

async function formsApiRequest(token, method = 'GET', payload = null) {
  const url = `https://ms-forms-service-staging.digitalpfizer.com/api/v2/forms`;
  const headers = new Headers();
  headers.append('x-config-token', token);
  let response = await fetch(url, {
    method: method,
    headers: headers,
    body: payload
  });

  return response;
}

async function createForm(block, token) {
  const form = document.createElement("form");
  // Create the input elements
  const nameField = createInput("text", "name", "Name");
  form.appendChild(nameField);
  const messageField = createInput("text", "message", "Message");
  form.appendChild(messageField);
  const emailField = createInput("email", "email", "foo@bar.com");
  form.appendChild(emailField);
  // Create the submit button
  const button = document.createElement("button");
  button.setAttribute("type", "submit");
  button.innerHTML = "Submit";
  button.classList.add("inline-block","px-6","py-2.5","bg-blue-600","text-white","font-medium","text-xs","leading-tight","uppercase","rounded","shadow-md","hover:bg-blue-700","hover:shadow-lg","focus:bg-blue-700","focus:shadow-lg","focus:outline-none","focus:ring-0","active:bg-blue-800","active:shadow-lg","transition","duration-150","ease-in-out");
  // Add the button to the form
  form.appendChild(button);
  let request = formsApiRequest(token, 'GET');
  request
    .then(response => response.json())
    .then(data => {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        console.log(event);
        const csrf = data.data.csrfToken;
        const payload = getPayload(event, csrf);
        let request = formsApiRequest(token, 'POST', payload);
        request.then(function(response) {
            return response.json();
          })
          .then(function(data) {
            console.log(data);
            showSuccessMessage(block);
          })
          .catch(function(error) {
            console.log(error);
          });
      });
    console.log(data);
})  
  // Add the form to the page
  block.textContent = '';
  block.append(form); 
}

function getPayload(event, csrf) {
  const formData = new FormData(event.target);
  const payload = {    
      "name": formData.get("name"),
      "message": formData.get("message"),
      "email": formData.get("email"),
      "csrfToken": csrf
    }
  
  console.log(payload);
  return JSON.stringify(payload);
}

function showSuccessMessage(block) {
  const successMessageWrapper = document.createElement("div");
  const successMessage = document.createElement("p");
  successMessageWrapper.classList.add("text-center", "success-message", "bg-green-100","rounded-lg","py-5","px-6","mb-4","text-base","text-green-700","mb-3","font-medium","border","border-green-300","shadow-sm");
  successMessageWrapper.appendChild(successMessage);
  successMessage.innerHTML = "Thank you for your submission!";  
  block.textContent = '';
  block.append(successMessageWrapper);
}


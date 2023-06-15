import { readBlockConfig } from '../../scripts/lib-franklin.js';

let GLOBAL_CONFIG = [];

function getEndpoint() {
  return GLOBAL_CONFIG.Endpoint;
}

async function formsApiRequest(token, method = 'GET', payload = null) {
  const headers = new Headers();
  headers.append('x-config-token', token);
  const response = await fetch(getEndpoint(), {
    method,
    headers,
    body: payload,
  });
  return response;
}

async function fetchBuilderForm(token) {
  const resp = await formsApiRequest(token);
  if (resp.status === 200) {
    const json = await resp.json();
    const formDef = {
      submitTo: getEndpoint(),
      configToken: token,
      csrfToken: json.data.csrfToken,
    };
    formDef.data = json.data.fields.map((fd) => {
      if (fd.id === 'submit') {
        return {
          Field: 'submit',
          Label: 'Submit',
          Placeholder: '',
          Type: 'submit',
          Format: '',
          Mandatory: '',
          Options: '',
          Rules: '',
          Extra: '/forms/thank-you',
        };
      }
      let mandatory = '';
      if (fd.validators) mandatory = fd.validators.find((v) => v.type === 'required') ? 'x' : '';
      return {
        Field: fd.name,
        Label: fd.label,
        Type: fd.type,
        Value: fd.value,
        Mandatory: mandatory,
        Placeholder: fd.placeholder || '',
      };
    });
    return (formDef);
  }
  return { error: `Error loading webform: ${token}` };
}

/*
 * Standard Franklin forms rendering
 *
 */

function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const { csrfToken, configToken } = form.dataset;
  payload.csrfToken = csrfToken;
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'x-config-token': configToken,
    },
    body: JSON.stringify(csrfToken ? payload : { data: payload }),
  });
  const message = await resp.text();
  return ({
    success: resp.status < 400,
    status: resp.status,
    message,
  });
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  button.type = fd.Type;
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        const submission = await submitForm(form);
        if (submission.success) {
          const redirectTo = fd.Extra;
          const resp = await fetch(`${redirectTo}.plain.html`);
          const html = await resp.text();
          const container = form.closest('.section');
          container.outerHTML = html;
        } else {
          // eslint-disable-next-line no-alert
          window.alert(submission.message);
        }
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  if (fd.Value) input.value = fd.Value;
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function createForm(formDefinition) {
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = formDefinition.submitTo;
  form.dataset.csrfToken = formDefinition.csrfToken;
  form.dataset.configToken = formDefinition.configToken;
  formDefinition.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'textarea':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      case 'hidden':
        fieldWrapper.append(createInput(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  const formChange = () => {
    applyRules(form, rules);
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      if (form.checkValidity()) {
        button.removeAttribute('disabled', '');
      } else {
        button.setAttribute('disabled', '');
      }
    }
  };

  form.addEventListener('change', formChange);
  formChange();

  return (form);
}

async function loadGlobalConfiguration() {
  return fetch('/config/forms.json')
    .then((resp) => resp.json())
    .then((data) => {
      const dataArray = data.data.map((row) => [row.Key, row.Value]);
      return Object.fromEntries(dataArray);
    });
}

export default async function decorate(block) {
  GLOBAL_CONFIG = await loadGlobalConfiguration();

  // temporary bcs we dont have a workflow yet for webforms.pfizer in franklin
  const getWorkflowState = () => 'wd';

  const adjustConfigToken = (token) => {
    const env = getWorkflowState();

    if (token.endsWith('__wd')) {
      return `${token.substr(0, token.length - 4)}__${env}`;
    }
    return token;
  };

  let formDef;
  const config = readBlockConfig(block);
  if (config && config['webform-config-token']) {
    const token = adjustConfigToken(config['webform-config-token']);
    block.textContent = '';
    formDef = await fetchBuilderForm(token);
  }
  if (formDef) {
    if (formDef.error) {
      block.textContent = formDef.error;
    } else {
      block.append(createForm(formDef));
    }
  }
}

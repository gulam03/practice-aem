export default function decorate(block) {
    let items=[];
    [...block.children].forEach((div) => {
        const elements = div.getElementsByTagName('div');
        const item = {};
        item.type = elements[0].innerText
        item.content = elements[1].innerHTML
        let content = createContent(item)
        div.innerHTML = content;
    });
}

function createContent(item) {
    switch(item.type) {
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

function createImage(item) {
    let img = document.createElement("img");
    img.src = item.content;
    return img.outerHTML;
}

function createLink(item) {
    let div = document.createElement("div");
    div.innerHTML = item.content;
    div.firstElementChild.setAttribute('target', '_blank');
    return div.innerHTML;
}

function createForm(item) {
    const config = JSON.parse(item.content);
    let form = document.createElement("helix-form-wrapper");
    form.setAttribute('config-token', config['config-token']);
    form.setAttribute('api-endpoint-url', config['endpoint-url'].trim());
    form.setAttribute('submission-endpoint-url', config['submission-url'].trim());
    form.setAttribute('container-visibility', 'SHOW_BOTH');
    form.setAttribute('method', 'GET');
    let success = document.createElement("div");
    success.setAttribute('slot', 'success-message');
    success.setAttribute('class', 'shelix-form-wrapper__result');
    success.innerHTML = decode(config['success'])
    form.appendChild(success);
    return form.outerHTML
}

function decode(str) {
    let txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}
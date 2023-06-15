import { readBlockConfig } from "../../scripts/lib-franklin.js";

/**
 * loads and decorates the an example for 3rd party widget
 * @reference: https://www.cibinqo.com/find-a-doctor
 */

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const configurationwidget = config?.configurationwidget;
  const convertObjParse = JSON.parse(configurationwidget);

  // confirm widgetUrl and partnerId exist
  if (!convertObjParse?.widgetUrl || !convertObjParse?.partnerId) return;

  const widgetUrl = convertObjParse?.widgetUrl;

  if (!document.head.querySelector(`script[src="${widgetUrl}"]`)) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "directory-widget";
    script.src = widgetUrl;

    document.head.appendChild(script);
  }

  const widgetMarkup = `
  <div class="finda-doctor">
    <directory-widget partner="${convertObjParse?.partnerId}" id="finddoctorsearch">
    </directory-widget>
  </div>`;

  // remove config row
  const lastChild = block.children[block.children.length - 1];
  if (lastChild) {
    lastChild.remove();
  }

  const widget = document.createElement("div");
  const namespaceprefix = "doctor-widget";
  const childLength = block.children.length;

  [...block.children].forEach((row, i) => {
    const rowMarkup = document.createElement("div");
    const rowCount = i + 1;

    const contentInRow = row.querySelector("div").innerHTML;
    const firstClass = rowCount === 1 ? `${namespaceprefix}--first` : "";
    const lastClass =
      rowCount === childLength ? `${namespaceprefix}--last` : "";

    const markup = `
        <div class='${namespaceprefix}--row ${firstClass} ${lastClass}'>
          <div>
            ${contentInRow ?? ""}
          </div>
          ${firstClass ? widgetMarkup : ""}
        </div>
    `;

    rowMarkup.innerHTML = markup;
    widget.append(rowMarkup);
  });

  block.innerHTML = "";
  block.append(widget);
}

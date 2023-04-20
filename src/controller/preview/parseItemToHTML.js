import { getLocalizedString } from "../utils.js";

function buildAltLabels(item, prefLang) {
  if (!item.altLabel) return "";
  const altLabels = getLocalizedString(item.altLabel, prefLang);
  const html = "<p>alias: " + altLabels.join(", ") + "</p>";
  return html;
}

function buildExamples(item, prefLang) {
  if (!item.example) return "";
  const example = getLocalizedString(item.example, prefLang);
  const head = "<div><head>Examples:</head><ul>";
  const tail = "</ul></div>";
  const examples = example.map((e) => `<li>${e}</li>`);
  const html = head + examples + tail;
  return html;
}

function buildScheme(item) {
  if (!item.inScheme) return "";
  const scheme = item.inScheme ? item.inScheme[0].id : "";
  const html = `in ConceptScheme: <b><a href="${scheme}" target="_blank" style="text-decoration: none;">${scheme}</a></b>`;
  return html;
}

function buildDefinition(item, prefLang) {
  if (!item.definition) return "";
  const def = item.definition
    ? getLocalizedString(item.definition, prefLang)
    : "";
  return `<p><i>${def}</i></p>`;
}

function buildImg(item) {
  if (!item.img) return "";
  const img = item.img;
  const img_url = img ? img.url : "";
  const img_alt = img ? img.alt : "";
  const html = `
<div style="width: 100px; text-align: center; margin-right: 9px; float: left">
<img src="${img_url}" alt="${img_alt}" style="height: 100px" />
</div>`;
  return html;
}
function buildScope(item, prefLang) {
  if (!item.scopeNote) return "";
  const scopeNote = item.scopeNote
    ? getLocalizedString(item.scopeNote, prefLang)
    : "";
  return `<p>${scopeNote}</p>`;
}

export default function parseItemToHTML(item, prefLang) {
  const label = getLocalizedString(item.prefLabel, prefLang);
  const type = item.type;

  const altLabels_html = buildAltLabels(item, prefLang);
  const examples_html = buildExamples(item, prefLang);
  const scheme_html = buildScheme(item);
  const def_html = buildDefinition(item, prefLang);
  const img_html = buildImg(item);
  const scope_html = buildScope(item, prefLang);

  const html = `
<html><head><meta charset="utf-8" /></head>
<body style="margin: 0px; font-family: Arial; sans-serif">
<div style="height: 100px; width: 320px; font-size: 0.7em">

<h3 style="margin-left: 5px;"><a href="${item.id}">${label}</a></h3>
${img_html}
<div style="margin-left: 5px;">
<p>
${type}: <a target="_blank" href="${item.id}">${item.id}</a>
<br/>
${scheme_html}
</p>
${def_html}
${scope_html}
${altLabels_html}
${examples_html}
</div>
</div>
</body>
</html>`;

  return html;
}

import esQueries from "../queries/index.js";
import {
  getParameters,
  getLocalizedString,
  knownProblemHandler,
  errorHandler,
} from "./utils.js";

export default async function preview(req, res) {
  const { account, dataset, id, prefLang } = getParameters(req);

  try {
    const queryResult = await esQueries.queryID(account, dataset, id);
    if (queryResult.hits.total.value === 0) {
      return knownProblemHandler(res, {
        code: 404,
        message: "Sorry, nothing at this url.",
      });
    }

    const item = queryResult.hits.hits[0]._source;
    const html = parseItemToHTML(item, prefLang);

    return res.send(html);
  } catch (error) {
    return errorHandler(res, error);
  }
}

function parseItemToHTML(item, prefLang) {
  const label = getLocalizedString(item.prefLabel, prefLang);
  const altLabels = getLocalizedString(item.altLabel, prefLang);
  const desc = getLocalizedString(item.description, prefLang);
  const examples = getLocalizedString(item.examples, prefLang);
  const def = item.definition
    ? getLocalizedString(item.definition, prefLang)
    : "";
  const scope_note = item.scopeNote
    ? getLocalizedString(item.scopeNote, prefLang)
    : "";
  const scheme = item.inScheme ? item.inScheme[0].id : "";
  const type = item.type;
  const img = item.img;
  const img_url = img ? img.url : "";
  const img_alt = img ? img.alt : "";

  var img_html = "";
  var desc_html = "";
  var scheme_html = "";
  var def_html = "";
  var scope_html = "";
  var altLabels_html = "";
  var examples_html = "";

  if (img_url) {
    img_html = `<div style="width: 100px; text-align: center; margin-right: 9px; float: left">
    <img src="${img_url}" alt="${img_alt}" style="height: 100px" />
  </div>`;
  }
  if (scheme) {
    scheme_html = `in ConceptScheme: <b><a href="${scheme}" target="_blank" style="text-decoration: none;">${scheme}</a></b>`;
  }
  if (desc) {
    desc_html = `<p>${desc}</p>`;
  }
  if (def) {
    def_html = `<p><i>${def}</i></p>`;
  }
  if (scope_note) {
    scope_html = `<p>${scope_note}</p>`;
  }
  if (altLabels) {
    altLabels_html = "<p>alias: " + altLabels.join(", ") + "</p>";
  }
  if (examples) {
    examples_html = "<div><head>Examples:</head><ul>";
    for (let x in examples) {
      examples_html = examples_html + `<li>${x}</li>`;
    }
    examples_html = examples_html + `</ul></div>`;
  }

  const html = `<html><head><meta charset="utf-8" /></head>
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
      ${desc_html}
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

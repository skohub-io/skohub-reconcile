import { getParameters, errorHandler, ReconcileError, checkAccountDataset } from "../utils.js";
import queryID from "../../queries/queryID.js";
import { config } from "../../config.js";

const defaultLanguage = config.app_defaultlang ? config.app_defaultlang : "en";

const buildHtml = (result, language) => {
  const prefLabel =
    result?.prefLabel[language || defaultLanguage] || "ID not found";
  const definition = result?.definition?.[language || defaultLanguage] || ""
  const id = result?.id || "";
  const scopeNote = result?.scopeNote?.[language || defaultLanguage] || "";

  const html = `<div>
                  <h1>${prefLabel}</h1>
                  <p style=\"font-size: 0.8em; color: black;\">ID: ${id}</p>
                  <p style=\"font-size: 0.8em; color: black;\">Definition: ${definition}</p>
                  <p style=\"font-size: 0.8em; color: black;\">Scope Note: ${scopeNote}</p>
                </div>`;
  return html;
};

export default async function flyout(req, res) {
  const { account, dataset, language, id } = getParameters(req);

  try {
    await checkAccountDataset(res, account, dataset);
    if (!id) throw new ReconcileError("Please provide an id as query parameter", 400);
    const qRes = await queryID(account, dataset, id);
    const result = qRes.hits.hits[0]?._source;
    const html = buildHtml(result, language);

    res.status(200);
    return res.json({
      id: id,
      html: html,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
}

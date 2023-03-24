import { getParameters } from "./utils.js";
import queryID from "../esQueries/queryID.js";
import config from "../config.js";

const defaultLanguage = config.app_defaultlang ? config.app_defaultlang : 'en'

export default async function flyout(req, res) {
  const { account, dataset, language } = getParameters(req);
  const id = req.query.id;
  if (!id) {
    return res.json({
      status_code: 400,
      success: false,
      message: "Please provide an id as query parameter",
    });
  }

  const qRes = await queryID(account, dataset, id);
  const result = qRes.hits.hits[0]._source;
  const html = `<p style=\"font-size: 0.8em; color: black;\">${result.prefLabel[language || defaultLanguage]}</p>`;

  return res.json({
    id: id,
    html: html,
  });
}

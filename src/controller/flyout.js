import { getURLParameters } from "./utils.js";
import {queryID, funcB} from "../esQueries/queryID.js";

export const flyout = async (req, res) => {
  const { account, dataset, prefLang } = getURLParameters(req);
  const id = req.query.id;
  if (!id) {
    return res.json({
      status_code: 400,
      success: false,
      message: "Please provide an id as query parameter",
    });
  }

  // const qRes = await queryID(account, dataset, id);
  const qRes = funcB()
  const result = qRes.responses[0].hits.hits[0]._source;
  const html = `<p style=\"font-size: 0.8em; color: black;\">${result.prefLabel[prefLang]}</p>`;

  return res.json({
    id: id,
    html: html,
  });
}

// export default {flyout}
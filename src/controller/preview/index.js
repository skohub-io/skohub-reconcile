import queryID from "../../queries/queryID.js";
import {
  getParameters,
  errorHandler,
  ReconcileError,
  checkAccountDataset
} from "../utils.js";
import parseItemToHTML from "./parseItemToHTML.js";

export default async function preview(req, res) {
  try {
    const { account, dataset, id, language } = getParameters(req);
    await checkAccountDataset(account, dataset);
    const queryResult = await queryID(account, dataset, id);
    if (queryResult.hits.total.value === 0) throw new ReconcileError("Sorry, nothing at this url.", 404)
    const item = queryResult.hits.hits[0]._source;
    const html = parseItemToHTML(item, language);

    res.status(200)
    return res.send(html);
  } catch (error) {
    return errorHandler(res, error);
  }
}

import queryID from "../../queries/queryID.js";
import {
  getParameters,
  knownProblemHandler,
  errorHandler,
  checkAccountDataset
} from "../utils.js";
import parseItemToHTML from "./parseItemToHTML.js";

export default async function preview(req, res) {
  const { account, dataset, id, prefLang } = getParameters(req);

  try {
    await checkAccountDataset(res, account, dataset);
  } catch (error) {
    return knownProblemHandler(res, error.err);
  }

  try {
    const queryResult = await queryID(account, dataset, id);
    if (queryResult.hits.total.value === 0) {
      return knownProblemHandler(res, {
        code: 404,
        message: "Sorry, nothing at this url.",
      });
    }

    const item = queryResult.hits.hits[0]._source;
    const html = parseItemToHTML(item, prefLang);

    res.status(200)
    return res.send(html);
  } catch (error) {
    return errorHandler(res, error);
  }
}

import { config } from "../../config.js";
import esQueries from "../../queries/index.js";
import {
  getParameters,
  esToRec,
  getQueries,
  checkAccountDataset,
  errorHandler,
  knownProblemHandler,
} from "../utils.js";

export default async function query(req, res) {
  const { account, dataset, prefLang, threshold } = getParameters(req);
  const queries = getQueries(req);
  const queryNames = Object.keys(queries);

  await checkAccountDataset(res, account, dataset);

  try {
    const esQuery = await esQueries.query(
      account,
      dataset,
      queries
    );

    const allData = {};

    esQuery.responses.forEach((element, index) => {
      var qData = [];
      if (element.hits.hits) {
        element.hits.hits.forEach((doc) => {
          qData.push(esToRec(doc, prefLang, threshold));
        });
      }
      allData[queryNames[index]] = { result: qData };
    });
    return res.json(allData);
  } catch (error) {
    return errorHandler(res, error);
    // return _knownProblemHandler(res, resp.err)
  }
}

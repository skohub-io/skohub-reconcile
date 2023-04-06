import { config } from "../config.js";
import esQueries from "../queries/index.js";
import {
  getParameters,
  esToRec,
  getQueryParameters,
  checkAccountDataset,
  errorHandler,
} from "./utils.js";

export default async function query(req, res) {
  const { account, dataset, prefLang } = getParameters(req);
  const threshold = req.query.threshold
    ? req.query.threshold
    : config.es_threshold;
  const queryParameters = getQueryParameters(req);
  const reqQNames = Object.keys(queryParameters);

  try {
    const resp = await checkAccountDataset(account, dataset);
    const esQuery = await esQueries.query(
      resp.account,
      resp.dataset,
      queryParameters
    );
    var allData = {};
    esQuery.responses.forEach((element, index) => {
      var qData = [];
      if (element.hits.hits) {
        element.hits.hits.forEach((doc) => {
          qData.push(esToRec(doc, prefLang, threshold));
        });
      }
      allData[reqQNames[index]] = { result: qData };
    });
    return res.json(allData);
  } catch (error) {
    return errorHandler(res, error);
    // return _knownProblemHandler(res, resp.err)
  }
}

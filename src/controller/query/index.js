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

  try {
    await checkAccountDataset(res, account, dataset);
  } catch (error) {
    return knownProblemHandler(res, error.err);
  }

  try {
    const queryResponse = await esQueries.query(
      account,
      dataset,
      queries
    );

    const allData = queryResponse.responses.reduce((acc, response, index) => {
      const qData = response.hits.hits
        ? response.hits.hits.map(doc => esToRec(doc, prefLang, threshold))
        : [];
      return {
        ...acc,
        [queryNames[index]]: { result: qData }
      };
    }, {});
    
    res.status(200);
    return res.json(allData);
  } catch (error) {
    return errorHandler(res, error);
  }
}

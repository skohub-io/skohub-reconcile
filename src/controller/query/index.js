import esQueries from "../../queries/index.js";
import {
  getParameters,
  esToRec,
  getQueries,
  checkAccountDataset,
  errorHandler,
  knownProblemHandler,
  validateAgainstSchema
} from "../utils.js";

export default async function query(req, res) {
  // check for correct header
  if (req.headers["content-type"] !== "application/json") {
    return knownProblemHandler(
      res,
      {
        code: 415,
        message: "Unsupported Media Type. Use application/json"
      }
    )
  }

  // check queries against schema
  if (!validateAgainstSchema(req.body, "queryBatch")) {
    return knownProblemHandler(
      res,
      {
        code: 403,
        message: "Data is not valid against reconciliation query batch scheme. Consult the spec."
      }
    )
  }
  const queries = getQueries(req);
  const { account, dataset, language, threshold } = getParameters(req);

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
      queries,
      language
    );

    const allData = queryResponse.responses.reduce((acc, response, index) => {
      const qData = response.hits.hits
        ? response.hits.hits.map(doc => esToRec(doc, language, threshold))
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

import esQueries from "../../queries/index.js";
import {
  getParameters,
  esToRec,
  getQueries,
  checkAccountDataset,
  errorHandler,
  validateAgainstSchema,
  ReconcileError
} from "../utils.js";

function validateRequest(req) {
  if (req.method === "POST") {
    // check for correct header
    if (
      !(req.headers["content-type"].includes("application/json") || // v3
        req.headers["content-type"].includes("application/x-www-form-urlencoded"))  // v2
    ) {
      throw new ReconcileError("Unsupported Media Type. Use application/json for v3 or application/x-www-form-urlencoded for v2", 415);
    }
  }
}

function validQueryBatch(req) {
  // v3
  if (req.headers["content-type"] === "application/json") {
    if (!validateAgainstSchema(req.body, "queryBatchV3")) {
      throw new ReconcileError("Not valid against reconciliation query batch scheme. Consult the V3-spec.", 403, "", req.body)
    }
  } else if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
    if (!validateAgainstSchema(req.body, "queryBatchV2")) {
      throw new ReconcileError("Not valid against reconciliation query batch scheme. Consult the V2-spec.", 403, "", req.body)
    }
  } else if (req.method === "GET") {
    // GET requests are used by the [Testbench](https://reconciliation-api.github.io/testbench/)
    // queries by the testbench seem to be sent as V3 Batch queries
    const queries = Object.values(
      JSON.parse(req.query.queries)
    )
    if (!validateAgainstSchema({ queries }, "queryBatchV3")) {
      throw new ReconcileError("Not valid against reconciliation query batch scheme. Consult the V2-spec for GET requests.", 403, "", queries)
    }
  }
}

async function buildQueryResponse(req) {
  const queries = getQueries(req);
  const { account, dataset, language, threshold } = getParameters(req);
  await checkAccountDataset(account, dataset);

  const elasticQueryResponse = await esQueries.query(
    account,
    dataset,
    queries,
    language
  );
  // v2
  // since v3 spec is not mentioning reconciliation GET queries, we use v2 response batch
  if (req.headers["content-type"].includes("application/x-www-form-urlencoded") || req.method === "GET") {
    const queryNames = Object.keys(queries);
    const allData = elasticQueryResponse.responses.reduce((acc, response, index) => {
      const qData = response.hits.hits
        ? response.hits.hits.map(doc => esToRec(doc, language, threshold))
        : [];
      return {
        ...acc,
        [queryNames[index]]: { result: qData }
      };
    }, {});
    validateAgainstSchema(allData, "resultBatchV2")
    const queryResponse = allData
    return queryResponse;
    // v3
  } else if (req.headers["content-type"].includes("application/json")) {
    const allData = elasticQueryResponse.responses.reduce((acc, response) => {
      const qData = response.hits.hits
        ? response.hits.hits.map(doc => esToRec(doc, language, threshold))
        : [];
      return {
        ...acc,
        candidates: qData
      };
    }, {});
    validateAgainstSchema(allData, "resultBatchV3")
    const queryResponse = { results: [allData] }
    return queryResponse;
  }
}

export default async function query(req, res) {
  try {
    validateRequest(req)
    validQueryBatch(req)
    const queryResponse = await buildQueryResponse(req)
    res.status(200);
    return res.json(queryResponse);
  } catch (error) {
    return errorHandler(res, error)
  }
}

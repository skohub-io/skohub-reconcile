import esQueries from "../queries/index.js";
import { config } from "../config.js";
import Ajv from "ajv"
import queryBatchSchemaV2 from "./query/schemas/queryBatchSchemaV2.json" assert { type: "json" }
import queryBatchSchemaV3 from "./query/schemas/queryBatchSchemaV3.json" assert { type: "json" }
import resultBatchSchemaV2 from "./query/schemas/resultBatchSchemaV2.json" assert { type: "json" }
import resultBatchSchemaV3 from "./query/schemas/resultBatchSchemaV3.json" assert { type: "json" }


export class ReconcileError extends Error {
  constructor(message, code, name, query) {
    super(message);
    this.name = name;
    this.code = code;
    this.query = query;
  }
}

export function errorHandler(res, err) {
  // TODO log error
  res.status(err?.code || 500);
  return res.json({
    status_code: err?.code || 500,
    success: false,
    error_name: err?.name,
    query: err?.query,
    data: [],
    message: err?.message || err,
  });
}

export function getParameters(req) {
  // Remember that in server.js we have configured query parameter parsing to use standard URLSearchParams
  const account = req.query.account || "";
  const dataset = req.query.dataset || "";
  const language = req.query.language || config.default_language;
  const id = req?.params?.id ? req.params.id : req.query.id ? req.query.id : "";
  const prefix = req.query.prefix || "";
  const threshold = req.query.threshold
    ? req.query.threshold
    : config.es_threshold;
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : 0;
  return { account, dataset, id, language, threshold, prefix, cursor };
}

export function esToRec(doc, prefLang, threshold) {
  const concept = doc._source;
  let obj = {
    id: concept.id,
    name:
      getLocalizedString(concept.prefLabel, prefLang) ||
      getLocalizedString(concept.title, prefLang),
    description:
      getLocalizedString(concept.scopeNote, prefLang) ||
      getLocalizedString(concept.description, prefLang) ||
      "",
    score: doc._score,
    match: parseFloat(doc._score) > threshold ? true : false,
    type: [
      {
        id: concept.type,
        name: getLocalizedString(concept.type, prefLang),
      },
    ],
  };
  if (concept.inScheme) obj.inScheme = concept.inScheme;
  return obj;
}

export function getLocalizedString(obj, prefLang) {
  if (obj === undefined) {
    return false
  } else if (obj === null) {
    return false
  } else if (typeof obj === "string") {
    return obj;
  } else if (obj.hasOwnProperty(prefLang)) {
    if (typeof obj[prefLang] === "string") return obj[prefLang];
    else if (Array.isArray(obj[prefLang]) && obj[prefLang].length !== 0) return obj[prefLang];
    else return false
  } else {
    return false
  }
}

/**
 * Get the queries from "queries" query parameter
 * @param {*} req
 * @returns {object} Object containing the query parameters
 */
export function getQueries(req) {
  if (req.method === "GET") {
    return JSON.parse(req.query.queries);
  } else if (req.method === "POST") {
    return req.body.queries;
  }
  throw new Error("Unhandled request method for parsing query parameters.");
}

/**
 * Check if the account and dataset are present in the data
 * @param {string} account
 * @param {string} dataset
 * @returns {Promise} Promise that resolves to true if the account and dataset are present in the data
 * @throws {NotExistentException}
 */
export async function checkAccountDataset(account, dataset) {
  const allAccounts = await esQueries.getAccounts();
  const allDatasets = await esQueries.getDatasets();

  if (account && allAccounts.indexOf(account) == -1) {
    return Promise.reject(
      new ReconcileError(`Sorry, nothing at this url. (Nonexistent account '${account}'.)`, 404, "Nonexistent Account"));
  }
  if (dataset && allDatasets.indexOf(dataset) == -1) {
    return Promise.reject(
      new ReconcileError(`Sorry, nothing at this url. (Nonexistent dataset '${dataset}'.)`, 404, "Nonexistent Dataset"))
  }

  return true;
}

const ajv = new Ajv()
/**
 * Check a query against the JSON Schema from the specification (https://reconciliation-api.github.io/specs/draft/#reconciliation-query-batch-json-schema)
 * @param {Object} query - query to check against
 * @param {("queryBatchV2" | "queryBatchV3" | "resultBatchV2" | "resultBatchV3")} schema - schema to validate against
 * @returns {Boolean}
 */
export function validateAgainstSchema(toValidate, schema) {
  const validateQueryBatchV3 = ajv.compile(queryBatchSchemaV3)
  const validateQueryBatchV2 = ajv.compile(queryBatchSchemaV2)
  const validateResultBatchV2 = ajv.compile(resultBatchSchemaV2)
  const validateResultBatchV3 = ajv.compile(resultBatchSchemaV3)

  switch (schema) {
    case "queryBatchV2":
      return validateQueryBatchV2(toValidate)
    case "queryBatchV3":
      return validateQueryBatchV3(toValidate)
    case "resultBatchV2":
      return validateResultBatchV2(toValidate)
    case "resultBatchV3":
      return validateResultBatchV3(toValidate)
  }
}



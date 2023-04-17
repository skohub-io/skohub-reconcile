import esQueries from "../queries/index.js";
import { config } from "../config.js";

export function knownProblemHandler(res, err) {
  const error = {
    status_code: err.code,
    success: false,
    data: [],
    message: err.message,
  };
  res.status(err.code);
  return res.json(error);
}

export function errorHandler(res, err) {
  // TODO log error
  res.status(500);
  return res.json({
    status_code: 500,
    success: false,
    data: [],
    message: err,
  });
}

export function getParameters(req) {
  // Remember that in server.js we have configured query parameter parsing to use standard URLSearchParams
  const account = req.query.account || "";
  const dataset = req.query.dataset || "";
  const language = req.query.language;
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
  return "";
  } else if (typeof obj === "object") {
    return obj[prefLang] ?? `No label in language ${prefLang} provided`;
  } else if (typeof obj === "string") {
    return obj;
  } else {
    return `Error: Could not retrieve label from ${typeof obj}. No label in language ${prefLang} provided`;
  }
}

/**
 * Get the queries from "queries" query parameter
 * @param {*} req
 * @returns {object} Object containing the query parameters
 */
export function getQueries(req) {
  try {
    if (req.method === "GET") {
      return JSON.parse(req.query.queries);
    } else if (req.method === "POST") {
      return JSON.parse(req.body.queries);
    }
  } catch (error) {
    throw new Error("Unhandled request method for parsing query parameters.");
  }
}

export function NotExistentException(err) {
  this.name = "NotExistentException";
  this.err = err || {};
}

/**
 * Check if the account and dataset are present in the data
 * @param {string} account
 * @param {string} dataset
 * @returns {Promise} Promise that resolves to true if the account and dataset are present in the data
 * @throws {NotExistentException}
 */
export async function checkAccountDataset(res, account, dataset) {
  const allAccounts = await esQueries.getAccounts();
  const allDatasets = await esQueries.getDatasets();

  if (account && allAccounts.indexOf(account) == -1) {
    return Promise.reject(
      new NotExistentException({
        message: `Sorry, nothing at this url. (Nonexistent account '${account}'.)`,
        code: 404,
      })
    );
  }
  if (dataset && allDatasets.indexOf(dataset) == -1) {
    return Promise.reject(
      new NotExistentException({
        message: `Sorry, nothing at this url. (Nonexistent dataset '${dataset}'.)`,
        code: 404,
      })
    );
  }

  return true;
}

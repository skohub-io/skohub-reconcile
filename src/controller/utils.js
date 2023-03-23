import esQueries from "../esQueries/index.js";

export function knownProblemHandler(res, err) {
  // console.log(err.message)
  const error = {
    status_code: err.code,
    success: false,
    data: [],
    message: err.message,
  };
  res.status(err.code).json(error);
  return { err: error };
}

export function errorHandler(res, err) {
  console.trace(err);
  res.json({ status_code: 500, success: false, data: [], message: err });
}

export function getURLParameters(req, defaultLanguage) {
  // Remember that in server.js we have configured query parameter parsing to use standard URLSearchParams
  const account = req.params.account
    ? req.params.account
    : req.query.account
    ? req.query.account
    : "";
  const dataset = req.params.dataset
    ? req.params.dataset
    : req.query.dataset
    ? req.query.dataset
    : "";
  const id = req.params.id ? req.params.id : req.query.id ? req.query.id : "";
  const prefLang = req.query.lang ? req.query.lang : defaultLanguage;
  return { account, dataset, id, prefLang };
}

export function esToRec(doc, prefLang, threshold) {
  const concept = doc._source;
  let obj = {
    id: concept.id.split("/").pop(),
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
  if (Object.prototype.toString.call(obj) === "[object Object]") {
    if (prefLang && obj[prefLang] != "") {
      return obj[prefLang];
    } else {
      return Object.values(obj)[0];
    }
  } else if (typeof obj === "string" || obj instanceof String) {
    return obj;
  }
  return null;
}

/**
 *
 * @param {*} req
 * @returns {object} Object containing the query parameters
 */
export function getQueryParameters(req) {
  try {
    if (req.method === "GET") {
      return JSON.parse(req.query.queries);
    } else if (req.method === "POST") {
      return req.body;
    }
  } catch (error) {
    throw new Error("Unhandled request method for parsing query parameters.");
  }
}

export async function checkAccountDataset(account, dataset) {
  // if account or dataset is nonempty but not in available accounts or datasets, return 404
  var allAccounts = await esQueries.getAccounts();
  var allDatasets = await esQueries.getDatasets();
  if (account && [].slice.call(allAccounts).indexOf(account) == -1) {
    return {
      err: {
        message: `Sorry, nothing at this url. (Nonexistent account '${account}'.)`,
        code: 404,
      },
      account,
      dataset,
    };
  }
  if (dataset && [].slice.call(allDatasets).indexOf(dataset) == -1) {
    // if dataset fails, try again with a dataset value without the last path component
    // (maybe that's an id which express router could not extract)
    var pComponents = dataset.split("/");
    const id = pComponents.pop();
    dataset = pComponents.join("/");
    if (dataset && [].slice.call(allDatasets).indexOf(dataset) == -1) {
      return {
        err: {
          message: `Sorry, nothing at this url. (Nonexistent dataset '${dataset}'.)`,
          code: 404,
        },
        account,
        dataset,
        id,
      };
    }
  }
  return { err: null, account, dataset };
}

import config from "../config.js";
import {
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "./utils.js";
import esQueries from "../esQueries/index.js";

const supportedAPIversions = ["0.2"];

export default async function manifest(req, res) {
  const { account, dataset, language } = getParameters(req);

  const accountDataset = await checkAccountDataset(account, dataset, language);
  if (accountDataset.err) {
    return knownProblemHandler(res, accountDataset.err);
  }
  const qRes = await esQueries.query(account, dataset);
  if (qRes.responses[0].hits.total.value == 0) {
    return knownProblemHandler(res, {
      code: 404,
      message: "Sorry, nothing at this url.",
    });
  }
  // for identifierSpace, preferredNamespaceUri takes precedence over our parsing of the schema's id
  const prefix = parsePrefix(qRes);

  var dsname = "";
  var dsparam = "";
  var accparam = "";
  var idparam = "";
  if (account || dataset) {
    dsname =
      " for " +
      (account
        ? "account '" +
          account +
          "'" +
          (dataset ? ", dataset '" + dataset + "'" : "")
        : dataset
        ? ", dataset '" + dataset + "'"
        : "");
  }
  if (dataset) {
    dsparam = `dataset=${dataset}`;
    idparam = `&id={{id}}`;
  } else {
    dsparam = `dataset={{id}}`;
  }
  if (account) {
    accparam = `account=${account}`;
  } else {
    accparam = `account={{account}}`;
  }

  return res.send({
    versions: supportedAPIversions,
    name: `SkoHub reconciliation service${dsname}`,
    identifierSpace: `${prefix}`,
    schemaSpace: "http://www.w3.org/2004/02/skos/core#",
    defaultTypes: [
      { id: "ConceptScheme", name: "ConceptScheme" },
      ...(dataset ? [{ id: "Concept", name: "Concept" }] : []),
    ],
    view: { url: `${prefix}{{id}}` },
    preview: {
      url: `${process.env.APP_BASEURL}/_preview?${accparam}&${dsparam}${idparam}`,
      width: 100,
      height: 320,
    },
    suggest: {
      entity: {
        service_url: `${process.env.APP_BASEURL}`,
        service_path: `/_suggest/${account}&${dataset}?service=entity`,
        flyout_service_path: `/_suggest/_flyout/${account}/${dataset}?id={{id}}}`,
      },
      property: {
        service_url: `${process.env.APP_BASEURL}`,
        service_path: `/_suggest/${account}&${dataset}?service=property`,
        flyout_service_path: `/_suggest/_flyout/${account}&${dataset}?id={{id}}`,
      },
      type: {
        service_url: `${process.env.APP_BASEURL}`,
        service_path: `/_suggest?service=type&${account}&${dataset}`,
        flyout_service_path: `/_suggest/_flyout/${account}&${dataset}?id={{id}}`,
      },
    },
  });
}

function parsePrefix(esQuery) {
  let prefix = "";
  const firstHit = esQuery.responses[0].hits.hits[0];
  if (firstHit._source.preferredNamespaceUri) {
    prefix = firstHit._source.preferredNamespaceUri.id;
  } else {
    prefix = firstHit._source.id.substring(
      0,
      firstHit._source.id.lastIndexOf("/") + 1
    );
  }
  return prefix;
}

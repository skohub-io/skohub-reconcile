import config from "../config.js";
import {
  getURLParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "./utils.js";
import esQueries from "../esQueries/index.js";

const defaultLanguage = config.app_defaultlang ? config.app_defaultlang : "en";
const supportedAPIversions = ["0.2"];

export default async function manifest(req, res) {
  const { account, dataset, prefLang } = getURLParameters(req, defaultLanguage);

  const accountDataset = await checkAccountDataset(account, dataset, prefLang);
  if (accountDataset.err) {
    return knownProblemHandler(res, accountDataset.err);
  }
  const esQuery = await esQueries.query(account, dataset);
  if (esQuery.responses[0].hits.total.value == 0) {
    knownProblemHandler(res, {
      code: 404,
      message: "Sorry, nothing at this url.",
    });
  } else {
    // for identifierSpace, preferredNamespaceUri takes precedence over our parsing of the schema's id
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
    var datasets;
    var d = [];
    esQuery.responses[0].hits.hits.forEach((item) => {
      if (item._source.type == "ConceptScheme") {
        d.push({
          id: item._source.id,
          title: item._source.title,
          description: item._source.description,
          reconciliation:
            process.env.APP_BASEURL +
            `_reconcile?account=${
              item._source.account
            }&dataset=${encodeURIComponent(
              item._source.id.substring(0, item._source.id.lastIndexOf("/"))
            )}`,
          ...(!account ? { account: item._source.account } : {}),
        });
      }
    });
    if (!dataset && d.length > 0) {
      datasets = { datasets: d };
    }

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
      ...datasets,
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
}

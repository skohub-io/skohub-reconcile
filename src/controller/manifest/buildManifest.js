import { config } from "../../config.js";

const supportedAPIversions = config.supported_api_versions;

export function buildManifest(qRes, account, dataset, language) {
  const prefNamespaceOfConceptScheme = parsePrefNamespace(qRes);
  const { dsname, accparam, dsparam, idparam } = buildName(account, dataset);
  return {
    versions: supportedAPIversions,
    name: `SkoHub reconciliation service${dsname}`,
    identifierSpace: `${prefNamespaceOfConceptScheme}`,
    schemaSpace: "http://www.w3.org/2004/02/skos/core#",
    defaultTypes: [
      { id: "ConceptScheme", name: "ConceptScheme" },
      { id: "Concept", name: "Concept" },
    ],
    ...(prefNamespaceOfConceptScheme && { view: { url: `${prefNamespaceOfConceptScheme}{{id}}` } }),
    preview: {
      url: `${config.app_baseurl}/_preview?language=${language}&${accparam}&${dsparam}${idparam}`,
      width: 100,
      height: 320,
    },
    suggest: {
      entity: {
        service_url: `${config.app_baseurl}`,
        service_path: `/_suggest?language=${language}&account=${account}&dataset=${dataset}&service=entity`,
        flyout_service_path: `/_suggest/_flyout?language=${language}&account=${account}&dataset=${dataset}&id=$\{id\}`,
      },
      property: {
        service_url: `${config.app_baseurl}`,
        service_path: `/_suggest?language=${language}&account=${account}&dataset=${dataset}&service=property`,
        flyout_service_path: `/_suggest/_flyout?language=${language}&account=${account}&dataset=${dataset}&id=$\{id\}`,
      },
      type: {
        service_url: `${config.app_baseurl}`,
        service_path: `/_suggest?language=${language}&account=${account}&dataset=${dataset}&service=property`,
        flyout_service_path: `/_suggest/_flyout&language=${language}&account=${account}&dataset=${dataset}&id=$\{id\}`,
      },
    },
  };
}

function buildName(account, dataset) {
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
  return { dsname, accparam, dsparam, idparam };
}

function parsePrefNamespace(esQuery) {
  const firstHit = esQuery.responses[0].hits.hits[0];
  if (firstHit._source.preferredNamespaceUri) {
    const prefix = firstHit._source.preferredNamespaceUri.id;
    return prefix;
  } else {
    return null;
  }
}

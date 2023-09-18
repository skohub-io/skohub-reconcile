import { config } from "../config.js";
import esb from "elastic-builder";
import { esClient } from "../elastic/connect.js";

const index = config.es_index;

// Query for a particular object (Concept or ConceptScheme)
/**
 * Query for concepts and/or vocabularies
 * @param {string} account
 * @param {string} dataset
 * @param {string} id 
 * @returns {Promise} Elasticsearch query result
 */
export default async function(
  account,
  dataset,
  id
) {
  const reqObject = esb
    .requestBodySearch()
    .query(
      esb.boolQuery().must([
        ...(account ? [esb.termQuery("account", account)] : []), // add account condition only if account is set
        ...(dataset ? [esb.termQuery("dataset", dataset)] : []), // add dataset condition only if dataset is set
        ...(id ? [esb.termQuery("id", id)] : []), // add id condition only if id is set
        ...(!id
          ? [esb.queryStringQuery("ConceptScheme").defaultField("type")]
          : []), // if there's no id, then search for vocabularies
      ])
    )
    .size(100);
  const result = await esClient.search({
    index: index,
    ...reqObject.toJSON(),
  });
  return result;
}

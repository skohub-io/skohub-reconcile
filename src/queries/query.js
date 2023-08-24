import esb from 'elastic-builder';
import { esClient } from "../elastic/connect.js";
import { config } from '../config.js'

export const index = config.es_index

const esMultiFields = (language) => [
  `prefLabel.${language}^4.0`,
  `altLabel.${language}^2.0`,
  `hiddenLabel.${language}^1.5`,
  `title.${language}^3.0`,
  `description.${language}^1.0`,
  `notation.${language}^1.2`
];

/**
 * Query for concepts and/or vocabularies
 * @param {string} account
 * @param {string} dataset
 * @param {Object} reqQueries Received quers according to [reconciliation spec](https://reconciliation-api.github.io/specs/0.2/#structure-of-a-reconciliation-query).
 * @returns {Array} Elasticsearch query requests
 */
const buildQuery = (account, dataset, reqQueries, language) => {
  const requests = [];
  if (Object.keys(reqQueries).length) {
    for (let key in reqQueries) {
      const reqObject = esb.requestBodySearch();
      reqObject.query(
        esb.boolQuery()
          .must([...(account ? [esb.termQuery('account', account)] : []),
          ...(dataset ? [esb.termQuery('dataset', dataset)] : []),
          ...(dataset ? [esb.boolQuery()
            .should([esb.termQuery('inScheme.id', dataset),
            esb.termQuery('id', dataset),
            esb.termQuery('dataset', dataset),
            ])] : []),
          ...(!dataset ? [esb.boolQuery().must(esb.queryStringQuery('ConceptScheme').defaultField('type'))] : []),
          esb.multiMatchQuery(esMultiFields(language), reqQueries[key].query)
          ])
          .should(reqQueries[key]['type'] ?
            esb.queryStringQuery(reqQueries[key]['type']).defaultField('type').boost(4) :
            esb.queryStringQuery('Concept').defaultField('type')
          )
      )
        .size(reqQueries[key].limit || 500);
      requests.push(reqObject);
    }
  } else {
    const reqObject = esb.requestBodySearch();
    reqObject.query(
      esb.boolQuery()
        .must([...(account ? [esb.termQuery('account', account)] : []),
        ...(dataset ? [esb.termQuery('dataset', dataset)] : []),
        esb.termQuery('type', 'ConceptScheme')
        ])
        .should([...(dataset ? [esb.termQuery('id', dataset)] : [])])
    )
      .size(500);
    requests.push(reqObject);
  }
  return requests;
}

export const query = async (account, dataset, reqQueries = {}, language) => {
  const requests = buildQuery(account, dataset, reqQueries, language);

  const searches = requests.flatMap((doc) => [
    { index: index },
    { ...doc.toJSON() }
  ]);
  const result = await esClient.msearch({
    searches: searches
  });
  return result;
}

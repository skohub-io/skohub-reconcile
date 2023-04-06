import esb from 'elastic-builder';
import { esClient } from "../elastic/esConnect.js";
import config from '../config.js'

export const index = config.es_index

const esMultiFields = [
  'prefLabel*^4.0',
  'altLabel*^2.0',
  'hiddenLabel*^1.5',
  'title*^3.0',
  'description*^1.0',
  'notation*^1.2'
];
/**
 * Query for concepts and/or vocabularies
 * @param {string} account
 * @param {string} dataset
 * @param {object} reqQueries Query objects according to [reconciliation spec](https://reconciliation-api.github.io/specs/0.2/#structure-of-a-reconciliation-query).
 * @returns {Promise} Elasticsearch query result
 */

export default async function query(account, dataset, reqQueries = {}) {
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
            // esb.termQuery('inScheme.id', 'http://' + dataset),
            // esb.termQuery('inScheme.id', 'https://' + dataset),
            esb.termQuery('id', dataset),
            // esb.termQuery('id', 'http://' + dataset),
            // esb.termQuery('id', 'https://' + dataset),
            esb.termQuery('dataset', dataset),
            ])] : []),
          ...(!dataset ? [esb.boolQuery().must(esb.queryStringQuery('ConceptScheme').defaultField('type'))] : []),
          esb.multiMatchQuery(esMultiFields, reqQueries[key].query)
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

  const searches = requests.flatMap((doc) => [
    { index: index },
    { ...doc.toJSON() }
  ]);
  const result = await esClient.msearch({
    searches: searches
  });
  return result;
}

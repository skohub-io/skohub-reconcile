import * as esb from 'elastic-builder'
import config from './config.js'
import * as esConnect from './esConnect.js'

const index = config.es_index
const esClient = esConnect.esClient

async function query (tenant, vocab, reqQueries) {
  const queries = []
  for (var key in reqQueries) {
    // const reqObject = new QueryObject(value.query, value.type, value.limit, value.properties, value.type_strict)

    const reqObject = esb.requestBodySearch()
      .query(esb.boolQuery()
        .must(esb.termQuery('tenant', tenant))
        .must(esb.termQuery('vocab', vocab))
        .must(esb.multiMatchQuery(['preferredName^4.0', 'variantName^2.0', 'temporaryName^1.0'], reqQueries[key].query))
        .should(esb.queryStringQuery('Concept').defaultField('type'))
      )
      .size(reqQueries[key].limit)

    queries.push({ index: index })
    queries.push(reqObject)
  }
  return esClient.msearch({
    body: queries.toJSON()
  })
}

export { query }

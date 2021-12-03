import * as esb from 'elastic-builder'
import config from './config.js'
import * as esConnect from './esConnect.js'

const index = config.es_index
const esClient = esConnect.esClient
const esMultiFields = [
  'prefLabel*^4.0',
  'altLabel*^2.0',
  'hiddenLabel*^1.5',
  'title*^3.0',
  'description*^1.0'
]

async function query (tenant, vocab, reqQueries) {
  // console.log(`tenant, vocab, reqQueries: ${tenant}, ${vocab}, ${reqQueries}`)
  var queries = ''
  for (var key in reqQueries) {
    const reqObject = esb.requestBodySearch()
      .query(esb.boolQuery()
        .must(esb.termQuery('tenant', tenant))
        .must(esb.termQuery('vocab', vocab))
        .must(esb.multiMatchQuery(esMultiFields, reqQueries[key].query))
        .should(esb.queryStringQuery('Concept').defaultField('type'))
      )
      .size(reqQueries[key].limit || 5)

    queries = queries + `{ "index": "${index}" }` + '\n'
    queries = queries + JSON.stringify(reqObject.toJSON()) + '\n'
  };
  // console.log(queries)

  return esClient.msearch({
    body: queries
  })
}

export { query }

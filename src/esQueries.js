import config from './config.js'
import esb from 'elastic-builder'
import * as esConnect from './esConnect.js'

const index = config.es_index
const esClient = esConnect.esClient
const esMultiFields = [
  'prefLabel*^4.0',
  'altLabel*^2.0',
  'hiddenLabel*^1.5',
  'title*^3.0',
  'description*^1.0',
  'notation*^1.2'
]

async function query (vocab, reqQueries) {
  // console.log(`vocab, reqQueries: ${vocab}, ${JSON.stringify(reqQueries)}`)
  var queries = ''
  for (var key in reqQueries) {
    const reqObject = esb.requestBodySearch()
      .query(esb.boolQuery()
        .must([esb.boolQuery()
          .should([ esb.termQuery('inScheme.id', vocab),
                    esb.termQuery('inScheme.id', 'http://' + vocab),
                    esb.termQuery('inScheme.id', 'https://' + vocab),
                    esb.termQuery('id', vocab),
                    esb.termQuery('id', 'http://' + vocab),
                    esb.termQuery('id', 'https://' + vocab)
                  ]),
          esb.multiMatchQuery(esMultiFields, reqQueries[key].query)])
        .should( reqQueries[key]['type'] ? esb.queryStringQuery(reqQueries[key]['type']).defaultField('type').boost(4) : esb.queryStringQuery('Concept').defaultField('type') )
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

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

// Query for concepts and/or vocabularies
async function query (account, dataset, reqQueries) {
  // console.log(`vquery(account, dataset, reqQueries): ${account}, ${dataset}, ${JSON.stringify(reqQueries)}`)
  const requests = []
  if (reqQueries) {
    for (let key in reqQueries) {
      const reqObject = esb.requestBodySearch()
      reqObject.query(
        esb.boolQuery()
          .must([ ...(account ? [esb.termQuery('account.keyword', account)] : []), // add account condition only if account is set
                  ...(dataset ? [esb.termQuery('dataset.keyword', dataset)] : []), // add dataset condition only if dataset is set
                  ...(dataset ? [esb.boolQuery()
                                .should([ esb.termQuery('inScheme.id', dataset),
                                          // esb.termQuery('inScheme.id', 'http://' + dataset),
                                          // esb.termQuery('inScheme.id', 'https://' + dataset),
                                          esb.termQuery('id', dataset),
                                          // esb.termQuery('id', 'http://' + dataset),
                                          // esb.termQuery('id', 'https://' + dataset),
                                          esb.termQuery('dataset.keyword', dataset),
                                        ])] : []),
                  ...(!dataset ? [esb.boolQuery().must(esb.queryStringQuery('ConceptScheme').defaultField('type'))] : []), // if we don't have a dataset parameter, only search for vocabularies...
                  esb.multiMatchQuery(esMultiFields, reqQueries[key].query)
                ])
          .should( reqQueries[key]['type'] ?
                    esb.queryStringQuery(reqQueries[key]['type']).defaultField('type').boost(4) :
                    esb.queryStringQuery('Concept').defaultField('type')
                 )
        )
        .size(reqQueries[key].limit || 500)
    requests.push(reqObject)
    }
  } else {
    const reqObject = esb.requestBodySearch()
    reqObject.query(
      esb.boolQuery()
        .must([ ...(account ? [esb.termQuery('account.keyword', account)] : []), // add account condition only if account is set
                ...(dataset ? [esb.termQuery('dataset.keyword', dataset)] : []), // add dataset condition only if dataset is set
                esb.termQuery('type.keyword', 'ConceptScheme')
              ])
        .should([ ...(dataset ? [esb.termQuery('id', dataset)] : []) ])
      )
      .size(500)
    requests.push(reqObject)
  }

  const searches = requests.flatMap((doc) => [
    {index: "skohub-reconcile"},
    {...doc.toJSON()}
  ])
  const result = await esClient.msearch({
    searches: searches
  })
  console.log(`result:\n${JSON.stringify(result)}`)
  return result
}

// Query for a particular object (Concept or ConceptScheme)
async function queryID (account, dataset, id) {
  // console.log(`esQueries.queryID: account: '${account}', dataset: '${dataset}', id: '${id}'.`)
  var queries = ''
  const reqObject = esb.requestBodySearch()
    .query(esb.boolQuery()
      .must([ ...(account ? [esb.termQuery('account', account)] : []), // add account condition only if account is set
              ...(dataset ? [esb.termQuery('dataset', dataset)] : []), // add dataset condition only if dataset is set
              ...(id ? [esb.termsQuery('id', [id, dataset + '/' + id])] : []), // add id condition only if id is set
              ...(!id ? [esb.queryStringQuery('ConceptScheme').defaultField('type')] : []), // if there's no id, then search for vocabularies
            ])
    )
    .size(100)
  queries = queries + `{ "index": "${index}" }` + '\n' + JSON.stringify(reqObject.toJSON()) + '\n'
  // console.log(queries)

  var result = await esClient.msearch({
    body: queries
  })
  // console.log(`result:\n${JSON.stringify(result)}`)
  return result
}

// Query for autocompletion suggestions for a prefix string
async function suggest (account, dataset, prefix, cursor, prefLang) {
  // console.log(` suggest(account, dataset, prefix, cursor, language): ${account}, ${dataset}, ${prefix}, ${cursor}, ${prefLang}.`)

  // See https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/suggest_examples.html
  // Define a contexts object having either account or dataset or both
  var ctx
  if (!account && !dataset) {
    ctx = { account: await getAccounts() }
  } else {
    ctx = {
      ...(account && { account: [ account ] }),
      ...(dataset && { dataset: [ dataset ] })
    }
  }

  var suggests
  // For each of the fields, define a completion search
  (['prefLabel', 'altLabel', 'title']).forEach(n => {
    var item = {
      prefix: prefix,
      completion: {
          field: `${n}.${prefLang}.completion`,
          skip_duplicates: true,
          fuzzy: true,
          contexts: ctx
        }
      }
    // console.log(`item: ${JSON.stringify(item)}`)
    suggests = { [`${n}Suggest`]: item, ...suggests }
  })

  var queries = `{ "index": "${index}" }` + '\n' + JSON.stringify({ suggest: suggests }) + '\n'
  // console.log(`queries: ${queries}`)

  // Do the search
  var result = await esClient.msearch({
    body: queries
  })
  // console.log(`result:\n${JSON.stringify(result)}`)
  return result
}

// Get all account names
async function getAccounts () {
  var accounts = []
  var aggs = { from: 0,
               size: 0,
               track_total_hits: false,
               aggs: {
                  accounts: {
                      terms: { field: "account.keyword" }
                  }
               }
             }
  var queries = `{ "index": "${index}" }` + '\n' + JSON.stringify(aggs) + '\n'
  // console.log(`queries: ${queries}`)

  // Do the search
  try {
    const resp = await esClient.search({
      index: index,
      ...aggs
    })
    resp.aggregations.accounts.buckets.forEach((element, _) => {
        accounts.push(element.key)
      })
    return accounts 
  } catch (error) {
    console.trace(err.message)
    return []
  }
}

// Get all dataset names
async function getDatasets () {
  var datasets = []
  var aggs = { from: 0,
    size: 0,
    track_total_hits: false,
    aggs: {
       datasets: {
           terms: { field: "dataset.keyword" }
       }
    }
  }
  var queries = `{ "index": "${index}" }` + '\n' + JSON.stringify(aggs) + '\n'
  // console.log(`queries: ${queries}`)

  // Do the search
  try {
    const resp = await esClient.search({
      index: index,
      ...aggs
    })
    resp.aggregations.datasets.buckets.forEach((element, _) => {
        datasets.push(element.key)
      })
    return datasets
  } catch (error) {
    console.trace(err.message)
    return []
  }
}

export { query, queryID, suggest, getAccounts, getDatasets }

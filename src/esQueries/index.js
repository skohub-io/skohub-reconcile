import config from '../config.js'
import esConnect from '../esConnect.js'
import queryID from "./queryID.js"
import query from "./query.js"
import suggest from "./suggest.js"

export const index = config.es_index
export const esClient = esConnect.esClient
// Get all account names
export async function getAccounts () {
  var accounts = []
  var aggs = { from: 0,
               size: 0,
               track_total_hits: false,
               aggs: {
                  accounts: {
                      terms: { field: "account" }
                  }
               }
             }
  var queries = `{ "index": "${index}" }` + '\n' + JSON.stringify(aggs) + '\n'

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
    console.trace(error)
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
           terms: { field: "dataset" }
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
    console.trace(error)
    return []
  }
}

export default { query, queryID, suggest, getAccounts, getDatasets }

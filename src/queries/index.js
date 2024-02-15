import { config } from "../config.js";
import { esClient } from "../elastic/connect.js";
import queryID from "./queryID.js";
import { query } from "./query.js";
import { suggest } from "./suggest.js";

export const index = config.es_index;

// add jsdoc for this function
export async function getAccounts() {
  var accounts = [];
  var aggs = {
    from: 0,
    size: 0,
    track_total_hits: false,
    aggs: {
      accounts: {
        terms: { field: "account" },
      },
    },
  };

  try {
    const resp = await esClient.search({
      index: index,
      ...aggs,
    });
    resp.aggregations.accounts.buckets.forEach((element, _) => {
      accounts.push(element.key);
    });
    return accounts;
  } catch (error) {
    console.trace(error);
    return [];
  }
}

async function getDatasets() {
  var datasets = [];
  var aggs = {
    from: 0,
    size: 0,
    track_total_hits: false,
    aggs: {
      datasets: {
        terms: { field: "dataset" },
      },
    },
  };

  try {
    const resp = await esClient.search({
      index: index,
      ...aggs,
    });
    resp.aggregations.datasets.buckets.forEach((element, _) => {
      datasets.push(element.key);
    });
    return datasets;
  } catch (error) {
    console.trace(error);
    return [];
  }
}

/**
  * @returns {[{
  * dataset: string,
  * account: string,
  * languages: [string]
  * }]} Array of account dataset combination
  */
async function getDatasetAccountCombination() {
  const combinations = []
  const aggregation =
  {
    "size": 0,
    "aggs": {
      "dataset_account_combinations": {
        "terms": {
          "field": "dataset",
        },
        "aggs": {
          "accounts": {
            "terms": {
              "field": "account",
            },
            "aggs": {
              "languages": {
                "scripted_metric": {
                  "init_script": "state.languages = [:]",
                  "map_script": "if (params._source.containsKey('prefLabel')) { for (entry in params._source.prefLabel.entrySet()) { state.languages.put(entry.getKey(), true) } }",
                  "combine_script": "return state",
                  "reduce_script": "def languages = [:]; for (state in states) { for (entry in state.languages.entrySet()) { languages.put(entry.getKey(), true) } } return languages.keySet()"
                }
              }
            }
          }
        }
      }
    }
  }
  try {
    const resp = await esClient.search({
      index: index,
      ...aggregation,
    });
    resp.aggregations.dataset_account_combinations.buckets.forEach((dataset, _) => {

      dataset.accounts.buckets.forEach(account => combinations.push({
        dataset: dataset.key,
        account: account.key,
        languages: account.languages.value
      }))
    });
    return combinations;
  } catch (error) {
    console.trace(error);
    return [];
  }

}

export default { query, queryID, suggest, getAccounts, getDatasets, getDatasetAccountCombination };

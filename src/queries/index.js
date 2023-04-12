import { config } from "../config.js";
import { esClient } from "../elastic/connect.js";
import queryID from "./queryID.js";
import { query } from "./query.js";
import suggest from "./suggest.js";

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

export default { query, queryID, suggest, getAccounts, getDatasets };

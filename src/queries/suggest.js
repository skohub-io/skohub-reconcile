import { getAccounts, index } from "./index.js";
import { esClient } from "../elastic/connect.js";
import { config } from "../config.js";


// Query for autocompletion suggestions for a prefix string
export async function suggest(
  account,
  dataset,
  prefix,
  cursor,
  language
) {
  // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#context-suggester
  // Define a contexts object having either account or dataset or both
  let ctx;
  if (!account && !dataset) {
    ctx = { account: await getAccounts() };
  } else {
    ctx = {
      ...(account && { account: [account] }),
      ...(dataset && { dataset: [dataset] }),
    };
  }
  // For each of the fields, define a completion search
  const suggests = ["prefLabel", "altLabel", "hiddenLabel", "title"].map(
    (n) => {
      return {
        size: config.suggest_query_size,
        from: cursor,
        query: {
          bool: {
            must: [
              {
                term: {
                  dataset: dataset,
                },
              },
              {
                term: {
                  account: account,
                },
              },
              {
                term: {
                  type: "Concept",
                },
              },
              {
                wildcard: {
                  [`${n}.${language}`]: {
                    value: `*${prefix.toLowerCase()}*`,
                    boost: 1.0,
                  },
                },
              },
            ],
          },
        },
      };
    }
  );

  // Do the search
  const searches = suggests.flatMap((suggest) => [
    { index: index },
    { ...suggest },
  ]);
  const result = await esClient.msearch({
    searches: searches,
  });
  return result;
}

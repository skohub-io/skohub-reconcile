import { getAccounts, index, esClient } from './index.js';

// Query for autocompletion suggestions for a prefix string
export default async function suggest(account, dataset, prefix, cursor, language) {
  // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#context-suggester
  // Define a contexts object having either account or dataset or both
  let ctx;
  if (!account && !dataset) {
    ctx = { account: await getAccounts() };
  } else {
    ctx = {
      ...(account && { account: [account] }),
      ...(dataset && { dataset: [dataset] })
    };
  }
  // For each of the fields, define a completion search
  const suggests = (['prefLabel', 'altLabel', "hiddenLabel", 'title']).map(n => {
    return {
      suggest: {
        "rec-suggest": {
          prefix: prefix,
          completion: {
            field: `${n}.${language}.completion`,
            skip_duplicates: true,
            fuzzy: true,
            contexts: ctx,
            size: 10 + cursor
          }
        }
      }
    };
  });

  // Do the search
  const searches = suggests.flatMap((suggest) => [
    { index: index },
    { ...suggest }
  ]);
  const result = await esClient.msearch({
    searches: searches
  });
  return result;
}

import { suggest as suggestQuery } from "../../queries/suggest.js";

export async function queryForSuggestions(account, dataset, prefix, cursor, language) {
  const esQueryResponse = await suggestQuery(
    account,
    dataset,
    prefix,
    cursor,
    language
  );
  const options = esQueryResponse.responses.flatMap((r) => {
    return r?.hits?.hits ?? [];
  });
  const result = options.map((element, _) => {
    return {
      name: element._source.prefLabel[language],
      id: element._source.id,
      ...(element._source.description && {
        description: element._source.description,
      }),
      ...(element._source.type && {
        notable: []
      }),
    };
  });
  return result;
}

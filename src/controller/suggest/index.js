import esQueries from "../../queries/index.js";
import {
  errorHandler,
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "../utils.js";

export default async function suggest(req, res, next) {
  const { account, dataset, language, prefix } = getParameters(req);
  const cursor = parseCursor(req.query.cursor || 0);

  try {
    await checkAccountDataset(res, account, dataset);
  } catch (error) {
    return knownProblemHandler(res, error.err);
  }

  if (!prefix)
    return knownProblemHandler(res, {
      code: 400,
      message: "No prefix provided",
    });

  try {
    const esQueryResponse = await esQueries.suggest(
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
          notable: {
            id: element._source.type,
            name: element._source.type,
          },
        }),
      };
    });
    return res.json({
      result: result.length > cursor ? result.slice(cursor) : result,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
}

function parseCursor(cursor) {
  if (cursor < 0) return 0;
  return parseInt(cursor);
}

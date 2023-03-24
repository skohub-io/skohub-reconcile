import esQueries from "../esQueries/index.js";
import { getParameters, errorHandler } from "./utils.js";

export default async function suggest(req, res) {
  function parseCursor(cursor) {
    if (cursor < 0) return 0;
    return parseInt(cursor);
  }
  const { account, dataset, language } = getParameters(req);
  const service = req.query.service || "";
  const prefix = req.query.prefix;
  const cursor = parseCursor(req.query.cursor || 0);

  try {
    const qRes = await esQueries.suggest(
      account,
      dataset,
      prefix,
      cursor,
      language
    );
    const options = qRes.responses.flatMap((r) => {
      // @ts-ignore
      return r?.suggest?.["rec-suggest"][0].options ?? [];
    });
    const result = options.map((element, _) => {
      return {
        name: element.text,
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

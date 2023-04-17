import {
  errorHandler,
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "../utils.js";
import { queryForSuggestions } from "./queryForSuggestions.js";

export default async function suggest(req, res, next) {
  const { account, dataset, language, prefix, cursor } = getParameters(req);

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
    const result = await queryForSuggestions(account, dataset, prefix, cursor, language);
    return res.json({
      result: result,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
}

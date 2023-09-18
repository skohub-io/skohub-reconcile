import {
  errorHandler,
  getParameters,
  checkAccountDataset,
  ReconcileError,
} from "../utils.js";
import { queryForSuggestions } from "./queryForSuggestions.js";

export default async function suggest(req, res, next) {
  const { account, dataset, language, prefix, cursor } = getParameters(req);

  try {
    await checkAccountDataset(res, account, dataset);
    if (!prefix) throw new ReconcileError("No prefix provided", 400);
    const result = await queryForSuggestions(account, dataset, prefix, cursor, language);
    return res.json({
      result: result,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
}

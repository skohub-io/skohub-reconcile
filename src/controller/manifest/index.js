import {
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "../utils.js";
import esQueries from "../../queries/index.js";
import { buildManifest } from "./buildManifest.js";

// TODO can i return to default export later?
export const manifest = async (req, res) => {
  const { account, dataset, language } = getParameters(req);
  const accountDataset = await checkAccountDataset(account, dataset, language);
  if (accountDataset.err) {
    return knownProblemHandler(res, accountDataset.err);
  }
  const qRes = await esQueries.query(account, dataset);
  if (qRes.responses[0].hits.total.value == 0) {
    return knownProblemHandler(res, {
      code: 404,
      message: "Sorry, nothing at this url.",
    });
  }
  const manifest = buildManifest(qRes, account, dataset, language);
  return res.send(manifest);
}

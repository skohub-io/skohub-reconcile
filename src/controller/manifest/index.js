import {
  getParameters,
  checkAccountDataset,
  errorHandler
} from "../utils.js";
import esQueries from "../../queries/index.js";
import { buildManifest } from "./buildManifest.js";

export default async function(req, res) {
  try {
    const { account, dataset, language } = getParameters(req);
    await checkAccountDataset(account, dataset);
    const qRes = await esQueries.query(account, dataset);
    const manifest = buildManifest(qRes, account, dataset, language);
    return res.send(manifest);
  } catch (error) {
    return errorHandler(res, error);
  }
}

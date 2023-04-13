import {
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
  errorHandler
} from "../utils.js";
import esQueries from "../../queries/index.js";
import { buildManifest } from "./buildManifest.js";

export default async function (req, res) {
  const { account, dataset, language } = getParameters(req);

  try {
    await checkAccountDataset(account, dataset);
  } catch (error) {
    if (error.name === "NotExistentException") {
      return knownProblemHandler(res, error.err);
    } else {
      return errorHandler(res, error);
    }
  }

  const qRes = await esQueries.query(account, dataset);

  try {
    const manifest = buildManifest(qRes, account, dataset, language);
    return res.send(manifest);
  } catch (error) {
    return knownProblemHandler(res, {
      code: 404,
      message: "Sorry, nothing at this url.",
    });
  }
}

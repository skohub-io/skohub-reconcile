import {
  getParameters,
  checkAccountDataset,
  knownProblemHandler,
} from "../utils.js";
import esQueries from "../../queries/index.js";
import { buildManifest } from "./buildManifest.js";

export default async function (req, res) {
  const { account, dataset, language } = getParameters(req);

  try {
    await checkAccountDataset(account, dataset);
  } catch (error) {
    if (error.name === "NotExistentException") {
      console.log(error);
      return knownProblemHandler(res, error.err);
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

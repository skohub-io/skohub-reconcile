import manifest from "../manifest/index.js";
import query from "../query/index.js";

export default async function reconcile(req, res) {
  if (!Object.keys(req.query).includes("queries")) {
    manifest(req, res);
  } else {
    query(req, res);
  }
}


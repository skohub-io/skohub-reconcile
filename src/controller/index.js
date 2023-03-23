import config from "../config.js";
import flyout from "./flyout.js";
import manifest from "./manifest.js";
import query from "./query.js";
import preview from "./preview.js";
import suggest from "./suggest.js";

export const defaultLanguage = config.app_defaultlang
  ? config.app_defaultlang
  : "en";

async function reconcile(req, res) {
  if (!Object.keys(req.query).includes("queries")) {
    manifest(req, res);
  } else {
    query(req, res);
  }
}

async function extend(req, res) {
  res.json({
    status_code: 501,
    success: true,
    message: "Extend function(s) have not been implemented yet.",
  });
}

export default { reconcile, query, preview, suggest, extend, flyout, manifest };

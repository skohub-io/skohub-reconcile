import cors from "cors";
import express from "express";
import morgan from "morgan";
import * as router from "./router.js";
import { checkElastic } from "./elastic/checkElastic.js";
import { config } from "./config.js";

console.log(`skohub-reconcile server starting...`);
await checkElastic();

const app = express();

if (process.env.DEBUG) {
  app.use(morgan("dev"));
  app.use((req, _, next) => {
    console.log(req.headers);
    console.log(req.body);
    next();
  });
}

app.use((req, _, next) => {
  let protocol = req.get("x-forwarded-proto") || req.protocol;
  let host = req.get("x-forwarded-host") || req.get("host");
  req.publicHost = protocol + "://" + host;
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", router.routes);
app.set("port", config.app_port || 3000);

// We use URLSearchParams parsing rather than express's standard qs.
// For reasons why, see https://evanhahn.com/gotchas-with-express-query-parsing-and-how-to-avoid-them/
app.set("query parser", function (queryString) {
  return new URLSearchParams(queryString);
});

app.listen(app.get("port"), () => {
  console.log(
    `SkoHub Reconcile server up and listening on port ${app.get("port")}.`
  );
});

export { app };

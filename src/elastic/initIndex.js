import fs from "fs";
import path from "path";
import { URL } from "url";
import { esClient } from "./connect.js";

const __dirname = new URL(".", import.meta.url).pathname;

const schema = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./schema/esSchema.json"))
);

export async function createIndex(name) {
  console.log(`(re)creating index '${name}' ...`);
  await esClient.indices.create({ index: name, body: schema })
  return ;
}

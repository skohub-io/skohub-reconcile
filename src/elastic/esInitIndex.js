import fs from "fs";
import path from "path";
import { URL } from "url";
import { esClient } from "./esConnect.js";

const __dirname = new URL(".", import.meta.url).pathname;

const index = "skohub-reconcile";
const schema = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./schema/esSchema.json"))
);

export async function createIndex(name) {
  console.log(`(re)creating index '${name}' ...`);
  await esClient.indices.create({ index: name, body: schema })
  return ;
}

async function resetIndex(writeSampleData) {
  if (await esClient.indices.exists({ index: index })) {
    await esClient.indices.delete({ index: index });
  }
  await createIndex(index);
  console.log(`    index '${index}' has been reset.`);
}

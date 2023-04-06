import { esClient } from "./esConnect.js";
import { createIndex } from "./esInitIndex.js";
import { config } from "../config.js";

const index = config.es_index;

export async function resetIndex() {
  if (await esClient.indices.exists({ index: index })) {
    await esClient.indices.delete({ index: index });
  }
  await createIndex(index);
  console.log(`    index '${index}' has been reset.`);
}

resetIndex();

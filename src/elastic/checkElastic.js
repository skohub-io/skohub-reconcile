import { config } from "../config.js";
import { esClient } from "./esConnect.js";
import { createIndex } from "./esInitIndex.js";


function NoIndexError(message) {
  this.name = "NoIndexError";
  this.message = message;
  this.stack = new Error().stack;
}

const recIndex = config.es_index;

export async function checkElastic() {
  await esClient.ping()
  try {
    if (await esClient.ping()) {
      console.log("elasticsearch server found.");
    } else {
      console.error("elasticsearch server not found. Stopping...");
      process.exit(1);
    }
    console.log(`check for index '${recIndex}' ...`);

    if (await esClient.indices.exists({ index: recIndex })) {
      console.log(`index '${recIndex}' found.`);
    } else {
      throw new NoIndexError(`index '${recIndex}' does not exist.`);
    }
    console.log(`index '${recIndex}' ready.`);
  } catch (error) {
    if (error instanceof NoIndexError) {
      console.log(`${error.message}`);
      console.log(
        "index not available! Creating index..."
      );
      await createIndex(recIndex);
      console.log("Restarting check...")
      await checkElastic();
    }
  }
}

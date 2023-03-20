import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import config from './config.js'
import * as esConnect from './esConnect.js'

const __dirname = new URL('.', import.meta.url).pathname

const esClient = esConnect.esClient
const index = config.es_index
const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'esSchema.json')))
const sampleData = fs.readFileSync(path.resolve(__dirname, 'esSampleData_bulk.ndjson'))

async function writeSampleDataToEs (index, streamData) {
  esClient.bulk({
    index: index,
    body: streamData
  }), function (error, _) {
    if (error) {
      console.error('Failed to import data', error)
    } else {
      console.log('Successfully imported data', data[i])
    }
  }
};

async function createIndex (name) {
  console.log(`- (re)creating index '${name}' ...`)
  return esClient.indices.create({ index: name, body: schema })
};

async function resetIndex (writeSampleData) {
  console.log("Write sample data: ", writeSampleData);
  if (await esClient.indices.exists({ index: index })) {
    await esClient.indices.delete({ index: index })
  }
  await createIndex(index)
  if (writeSampleData) {
    await writeSampleDataToEs(index, sampleData)
  }
  console.log(`    index '${index}' has been reset.`)
};

export { createIndex, resetIndex }

import fs from 'fs'
import path from 'path'
import { URL } from 'url';
import config from './config.js'
import * as esConnect from './esConnect.js'

const __dirname = new URL('.', import.meta.url).pathname;

const esClient = esConnect.esClient
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'esSampleData.json')))
const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'esSchema.json')))

const index = config.es_index
const type = config.es_type

async function writeSampleDataToEs (index, data) {
  for (let i = 0; i < data.length; i++) {
    await esClient.create({
      refresh: true,
      index: index,
      id: i,
      body: data[i]
    }, function (error, _) {
      if (error) {
        console.error('Failed to import data', error)
      } else {
        console.log('Successfully imported data', data[i])
      }
    })
  }
};

async function createMapping (index, type) {
  return esClient.indices.putMapping({ index, type, body: { properties: schema } })
};

async function resetIndex () {
  if (esClient.indices.exists({ index })) {
    esClient.indices.delete({ index })
  }
  esClient.indices.create({ index })
  createMapping(esClient, index, type)
  writeSampleDataToEs(index, data)
};

export { resetIndex }

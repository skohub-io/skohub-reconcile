import { Client } from '@elastic/elasticsearch'
import { config } from '../config.js'

let esClient

if (config.es_user && config.es_pass) {
  esClient = new Client({ node: `${config.es_proto}://${config.es_user}:${config.es_pass}@${config.es_host}:${config.es_port}` })
} else {
  esClient = new Client({ node: `${config.es_proto}://${config.es_host}:${config.es_port}` })
}

export { esClient }

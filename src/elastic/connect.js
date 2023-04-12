import { Client } from '@elastic/elasticsearch'
import { config } from '../config.js'

const setupClient = () => {
  if (config.es_user && config.es_pass) {
    return new Client({ node: `${config.es_proto}://${config.es_user}:${config.es_pass}@${config.es_host}:${config.es_port}` })
  } else {
    return new Client({ node: `${config.es_proto}://${config.es_host}:${config.es_port}` })
  }
}

const esClient = setupClient()

export { esClient }

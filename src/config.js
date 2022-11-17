import dotenv from 'dotenv'

const result = dotenv.config()
let config = {
  es_proto: process.env.ES_PROTO,
  es_host: process.env.ES_HOST,
  es_port: process.env.ES_PORT,
  es_user: process.env.ES_USERNAME,
  es_pass: process.env.ES_PASSWORD,
  es_index: process.env.ES_INDEX,
  es_type: process.env.ES_TYPE,
  es_threshold: process.env.ES_THRESH,
  app_port: process.env.APP_PORT,
  app_baseurl: process.env.APP_BASEURL,
  app_defaultlang: process.env.APP_DEFAULTLANG
}

if (result.error) {
  console.log(result.error, '[Error Parsing env variables!]')
  throw result.error
};
// console.log(result.parsed, '[Parsed env variables!]');

export { config as default }

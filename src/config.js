import dotenv from 'dotenv'

const result = dotenv.config()
export const config = {
  es_proto: process.env.ES_PROTO,
  es_host: process.env.ES_HOST,
  es_port: process.env.ES_PORT,
  es_user: process.env.ES_USERNAME,
  es_pass: process.env.ES_PASSWORD,
  es_index: process.env.ES_INDEX,
  es_type: process.env.ES_TYPE,
  es_threshold: process.env.ES_THRESH,
  app_port: process.env.APP_PORT,
  app_port_exposed: process.env.APP_PORT_EXPOSED,
  app_baseurl: process.env.APP_BASEURL,
  supported_api_versions: JSON.parse(process.env.SUPPORTED_API_VERSIONS),
  suggest_query_size: process.env.SUGGEST_QUERY_SIZE,
  default_language: process.env.DEFAULT_LANGUAGE,
}

if (result.error) {
  console.log(result.error, '[Error Parsing env variables!]')
  throw result.error
};

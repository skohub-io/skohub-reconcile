import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(configDir, '..')

const loadEnvironment = (envFile) => dotenv.config({ path: path.join(projectRoot, envFile) })
const envResult = loadEnvironment('.env')

if (envResult.error) {
  const missingEnvMessage = `Missing .env file. Create .env from .sample.env before starting the application.`
  throw new Error(missingEnvMessage)
}

const getEnvValue = (key, fallback = undefined) => process.env[key] ?? fallback

export function parseSupportedApiVersions(value) {
  if (!value) {
    return ['0.2', '0.3.0-alpha']
  }

  try {
    return JSON.parse(value)
  } catch {
    return ['0.2', '0.3.0-alpha']
  }
}

export const config = {
  es_proto: getEnvValue('ES_PROTO'),
  es_host: getEnvValue('ES_HOST'),
  es_port: getEnvValue('ES_PORT'),
  es_user: getEnvValue('ES_USERNAME'),
  es_pass: getEnvValue('ES_PASSWORD'),
  es_index: getEnvValue('ES_INDEX'),
  es_type: getEnvValue('ES_TYPE'),
  es_threshold: getEnvValue('ES_THRESH'),
  app_port: getEnvValue('APP_PORT'),
  app_port_exposed: getEnvValue('APP_PORT_EXPOSED'),
  app_baseurl: getEnvValue('APP_BASEURL'),
  supported_api_versions: parseSupportedApiVersions(getEnvValue('SUPPORTED_API_VERSIONS')),
  suggest_query_size: getEnvValue('SUGGEST_QUERY_SIZE'),
  default_language: getEnvValue('DEFAULT_LANGUAGE'),
}


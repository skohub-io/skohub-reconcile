// Pure helpers for turning environment variables into the application config.
// This module has no side effects so it can be unit tested without a .env file.

export const DEFAULT_API_VERSIONS = ['0.2', '0.3.0-alpha']

export const REQUIRED_ENV_KEYS = ['ES_PROTO', 'ES_HOST', 'ES_PORT', 'ES_INDEX', 'APP_BASEURL']

export function parseSupportedApiVersions(value) {
  if (value === undefined || value === '') {
    return DEFAULT_API_VERSIONS
  }

  const invalid = (cause) =>
    new Error(
      `SUPPORTED_API_VERSIONS must be a JSON array of strings, e.g. ${JSON.stringify(DEFAULT_API_VERSIONS)}, got: ${value}`,
      cause ? { cause } : undefined
    )

  let parsed
  try {
    parsed = JSON.parse(value)
  } catch (error) {
    throw invalid(error)
  }

  if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === 'string')) {
    throw invalid()
  }

  return parsed
}

export function findMissingEnvKeys(env, keys = REQUIRED_ENV_KEYS) {
  return keys.filter((key) => env[key] === undefined || env[key] === '')
}

export function buildConfig(env) {
  const app_port = env.APP_PORT || '3000'
  return {
    es_proto: env.ES_PROTO,
    es_host: env.ES_HOST,
    es_port: env.ES_PORT,
    es_user: env.ES_USERNAME,
    es_pass: env.ES_PASSWORD,
    es_index: env.ES_INDEX,
    es_type: env.ES_TYPE,
    es_threshold: env.ES_THRESH,
    app_port,
    app_port_exposed: env.APP_PORT_EXPOSED || app_port,
    app_baseurl: env.APP_BASEURL,
    app_defaultlang: env.APP_DEFAULTLANG || 'en',
    supported_api_versions: parseSupportedApiVersions(env.SUPPORTED_API_VERSIONS),
    suggest_query_size: env.SUGGEST_QUERY_SIZE || '10',
    default_language: env.DEFAULT_LANGUAGE || 'en',
  }
}

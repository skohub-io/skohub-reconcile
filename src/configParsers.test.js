import { describe, expect, it } from 'vitest'
import {
  DEFAULT_API_VERSIONS,
  REQUIRED_ENV_KEYS,
  buildConfig,
  findMissingEnvKeys,
  parseSupportedApiVersions,
} from './configParsers.js'

const sampleEnv = {
  ES_PROTO: 'http',
  ES_HOST: 'elastic',
  ES_PORT: '9200',
  ES_INDEX: 'skohub-reconcile',
  APP_BASEURL: 'http://localhost:3000',
}

describe('parseSupportedApiVersions', () => {
  it('returns the default versions when no value is provided', () => {
    expect(parseSupportedApiVersions()).toEqual(DEFAULT_API_VERSIONS)
    expect(parseSupportedApiVersions('')).toEqual(DEFAULT_API_VERSIONS)
  })

  it('parses valid JSON arrays of strings', () => {
    expect(parseSupportedApiVersions('["0.2", "0.3.0-alpha"]')).toEqual(['0.2', '0.3.0-alpha'])
  })

  it('throws on invalid JSON instead of silently using the default', () => {
    expect(() => parseSupportedApiVersions('["0.2", "0.3.0-alpha"')).toThrow(/SUPPORTED_API_VERSIONS/)
    expect(() => parseSupportedApiVersions('not-json')).toThrow(/SUPPORTED_API_VERSIONS/)
  })

  it('throws when the JSON is not an array of strings', () => {
    expect(() => parseSupportedApiVersions('0.2')).toThrow(/SUPPORTED_API_VERSIONS/)
    expect(() => parseSupportedApiVersions('{"a": 1}')).toThrow(/SUPPORTED_API_VERSIONS/)
    expect(() => parseSupportedApiVersions('[0.2]')).toThrow(/SUPPORTED_API_VERSIONS/)
  })
})

describe('findMissingEnvKeys', () => {
  it('returns an empty list when all required keys are set', () => {
    expect(findMissingEnvKeys(sampleEnv)).toEqual([])
  })

  it('lists every required key that is unset or empty', () => {
    const env = { ...sampleEnv, ES_HOST: '', APP_BASEURL: undefined }
    expect(findMissingEnvKeys(env)).toEqual(['ES_HOST', 'APP_BASEURL'])
  })

  it('checks exactly the documented required keys', () => {
    expect(findMissingEnvKeys({})).toEqual(REQUIRED_ENV_KEYS)
  })
})

describe('buildConfig', () => {
  it('maps environment variables to config keys', () => {
    const config = buildConfig({
      ...sampleEnv,
      ES_USERNAME: 'user',
      ES_PASSWORD: 'secret',
      ES_THRESH: '0.5',
      APP_PORT: '4000',
      APP_PORT_EXPOSED: '8080',
      APP_DEFAULTLANG: 'de',
      SUPPORTED_API_VERSIONS: '["0.2"]',
      SUGGEST_QUERY_SIZE: '25',
      DEFAULT_LANGUAGE: 'de',
    })
    expect(config).toMatchObject({
      es_proto: 'http',
      es_host: 'elastic',
      es_port: '9200',
      es_user: 'user',
      es_pass: 'secret',
      es_index: 'skohub-reconcile',
      es_threshold: '0.5',
      app_port: '4000',
      app_port_exposed: '8080',
      app_baseurl: 'http://localhost:3000',
      app_defaultlang: 'de',
      supported_api_versions: ['0.2'],
      suggest_query_size: '25',
      default_language: 'de',
    })
  })

  it('applies defaults for optional keys', () => {
    const config = buildConfig(sampleEnv)
    expect(config.app_port).toBe('3000')
    expect(config.app_port_exposed).toBe('3000')
    expect(config.app_defaultlang).toBe('en')
    expect(config.default_language).toBe('en')
    expect(config.suggest_query_size).toBe('10')
    expect(config.supported_api_versions).toEqual(DEFAULT_API_VERSIONS)
  })
})

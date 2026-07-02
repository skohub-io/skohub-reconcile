import { describe, expect, it } from 'vitest'
import { parseSupportedApiVersions } from './config.js'

describe('parseSupportedApiVersions', () => {
  it('returns the default versions when no value is provided', () => {
    expect(parseSupportedApiVersions()).toEqual(['0.2', '0.3.0-alpha'])
  })

  it('parses valid JSON arrays', () => {
    expect(parseSupportedApiVersions('["0.2", "0.3.0-alpha"]')).toEqual(['0.2', '0.3.0-alpha'])
  })

  it('falls back to the default versions for invalid JSON', () => {
    expect(parseSupportedApiVersions('not-json')).toEqual(['0.2', '0.3.0-alpha'])
  })
})

import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, findMissingEnvKeys } from './configParsers.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(projectRoot, '.env')

// .env is optional: configuration may also come entirely from the process
// environment (docker run -e ..., Kubernetes, node --env-file, ...).
// Values already present in process.env take precedence over .env.
const envResult = dotenv.config({ path: envFile })
if (envResult.error && envResult.error.code !== 'ENOENT') {
  throw new Error(`Failed to load ${envFile}: ${envResult.error.message}`, { cause: envResult.error })
}

const missing = findMissingEnvKeys(process.env)
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      `Set them in the environment or in ${envFile} (see .sample.env).`
  )
}

export const config = buildConfig(process.env)

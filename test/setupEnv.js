// Make the test suite runnable on a fresh clone without a .env file:
// load the documented sample values. Variables that are already set
// (e.g. from a real .env or the CI environment) are not overridden.
import dotenv from 'dotenv'

dotenv.config({ path: new URL('../.sample.env', import.meta.url).pathname })

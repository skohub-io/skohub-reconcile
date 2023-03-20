import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import * as esConnect from './esConnect.js'
import * as esInitIndex from './esInitIndex.js'
import * as router from './router.js'

dotenv.config()
const esClient = esConnect.esClient

console.log(`skohub-reconcile server starting ...`)

function checkElastic() {
  try {
    if (esClient.ping()) {
      console.log('  elasticsearch server found.')
    }
    
    console.log(`- check for index '${process.env.ES_INDEX}' ...`)
    
    if (esClient.indices.exists({index: process.env.ES_INDEX})) {
      console.log(`    index '${process.env.ES_INDEX}' found.`)
    } else {
      console.log(`    index '${process.env.ES_INDEX}' does not exist.`)
      esInitIndex.createIndex(process.env.ES_INDEX)
    }
    console.log(`  index '${process.env.ES_INDEX}' ready.`)
  } catch (error) {
    if (process.env.DEBUG) { console.log('Error checking for Elasticsearch: ', error) }
    console.log('\nelasticsearch server and/or index not available! Exiting...')
    console.error(error)
    process.exit()    
  }
}

checkElastic()

const app = express()

if (process.env.DEBUG) {
  app.use(morgan('dev'))
  app.use((req, _, next) => {
    console.log(req.headers)
    console.log(req.body)
    next()
  })
}

app.use((req, _, next) => {
  let protocol = req.get('x-forwarded-proto') || req.protocol
  let host = req.get('x-forwarded-host') || req.get('host')
  req.publicHost = protocol + '://' + host
  next()
})

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/', router.routes)
app.set('port', process.env.APP_PORT || 3000)
// We use URLSearchParams parsing rather than express's standard qs.
// For reasons why, see https://evanhahn.com/gotchas-with-express-query-parsing-and-how-to-avoid-them/
app.set('query parser', function (queryString) {
  return URLSearchParams(queryString)
})

app.listen(app.get('port'), () => {
  console.log(`\nskohub-reconcile server up and listening on port ${app.get('port')}.\n`)
})

export { app }
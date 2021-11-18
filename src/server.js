import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import * as esConnect from './esConnect.js'
import * as esInitIndex from './esInitIndex.js'
import * as router from './router.js'

dotenv.config()
const esClient = esConnect.esClient

await esClient.ping()
  .then(_ => {
    console.log('ElasticSearch server found')
  })
  .catch(error => {
    if (process.env.DEBUG) { console.log('Error checking for Elasticsearch: ', error) }
    console.log('ElasticSearch server seems to be down! Exiting...')
    process.exit()
  })

esInitIndex.resetIndex()

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

app.listen(app.get('port'), () => {
  console.log(`Reconciliation server listening on port, ${app.get('port')}`)
})

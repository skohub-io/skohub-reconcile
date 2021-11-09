import reconciliation from './reconciliation'
import indexingdb from '../src/indexingdb'

const {
  ES_NODE = 'http://localhost:9200',
  ES_INDEX = 'skohub',
  PORT
} = process.env

indexingdb({ ES_NODE, ES_INDEX })
  .then(db => reconciliation(db).listen(PORT || 3000,
    () => console.log(`Reconciliation API listening on port ${PORT || 3000}!`)))

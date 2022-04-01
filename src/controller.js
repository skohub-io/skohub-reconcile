import config from './config.js'
import * as esQueries from './esQueries.js'

function _esToRec (doc, prefLang, threshold) {
  const concept = doc._source
  let obj = {
    'id': concept.id,
    'name': _getLocalizedString(concept.prefLabel, prefLang) || _getLocalizedString(concept.title, prefLang),
    'description': _getLocalizedString(concept.scopeNote, prefLang) || _getLocalizedString(concept.description, prefLang),
    'score': doc._score,
    'match': ( parseFloat(doc._score) > threshold ? true : false ),
    'type': [
      {
        'id': concept.type,
        'name': _getLocalizedString(concept.type, prefLang)
      }
    ]
  }
  if (concept.inScheme)
    obj.inScheme = concept.inScheme
  return obj
}

function _getLocalizedString ( obj, prefLang ) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    if (prefLang && obj[prefLang] != "") {
      return obj[prefLang]
    } else {
      return Object.values(obj)[0]
    }
  } else if (typeof obj === 'string' || obj instanceof String) {
    return obj
  }
  return null
}

async function vocab (req, res) {
  if (!req.query.queries) {
    manifest(req, res)
  } else {
    req.body.queries = req.query.queries
    query(req, res)
  }
}

async function manifest (req, res) {
  const vocab = req.params.vocab
  res.send({
    'versions': ['0.2'],
    'name': `SkoHub reconciliation service for ${vocab}`,
    'identifierSpace': 'http://www.w3.org/2004/02/skos/core#Concept',
    'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
    'defaultTypes': [{ 'id': 'Concept', 'name': 'Concept' }, { 'id': 'ConceptScheme', 'name': 'ConceptScheme' }],
    'view': { 'url': `{{id}}` }
  })
}

async function query (req, res) {
  const vocab = req.params.vocab
  const threshold = (req.params.threshold ? req.params.threshold : config.es_threshold)
  const prefLang = req.query.lang
  const reqJSON = JSON.parse(req.body.queries)
  let reqQNames = Object.keys(reqJSON)
  // TODO: validate input. E.g.: if (!(paramsList instanceof Array)) throw Error('invalid argument: paramsList must be an array');
  await esQueries.query(vocab, reqJSON)
    .then(resp => {
      var allData = {}
      resp.body.responses.forEach((element, index) => {
        var qData = []
        if (element.hits.hits) {
          element.hits.hits.forEach(doc => {
            qData.push(_esToRec(doc, prefLang, threshold))
          })
        }
        allData[reqQNames[index]] = { 'result': qData }
      })
      // res.json({ status_code: 200, success: true, data: allData, message: 'Concepts successfully fetched.' })
      res.json(allData)
    })
    .catch(err => {
      console.trace(err.message)
      res.json({ status_code: 500, success: false, data: [], message: err })
    })
}

// preview
// suggest
// extend

export { vocab, manifest, query }

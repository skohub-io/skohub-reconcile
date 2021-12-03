import * as esQueries from './esQueries.js'

function _esToRec (doc) {
  const concept = doc._source
  return {
    'id': concept.id,
    'name': concept.prefLabel || concept.title,
    'description': concept.scopeNote || concept.description,
    'score': doc._score,
    'match': true,
    'type': [
      {
        'id': concept.type,
        'name': concept.type
      }
    ]
  }
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
  const tenant = req.params.tenant
  const vocab = req.params.vocab
  res.send({
    'versions': ['0.2'],
    'name': `SkoHub reconciliation service for ${tenant}/${vocab}`,
    'identifierSpace': 'http://www.w3.org/2004/02/skos/core#Concept',
    'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
    'defaultTypes': [{ 'id': 'Concept', 'name': 'Concept' }, { 'id': 'ConceptScheme', 'name': 'ConceptScheme' }],
    'view': { 'url': `https://skohub.io/${req.params.tenant}/${req.params.vocab}/heads/main/w3id.org/${req.params.tenant}/${req.params.vocab}/{{id}}` }
  })
}

async function query (req, res) {
  const tenant = req.params.tenant
  const vocab = req.params.vocab
  const reqJSON = JSON.parse(req.body.queries)
  let reqQNames = Object.keys(reqJSON)
  // TODO: validate input. E.g.: if (!(paramsList instanceof Array)) throw Error('invalid argument: paramsList must be an array');
  await esQueries.query(tenant, vocab, reqJSON)
    .then(resp => {
      var allData = {}
      resp.body.responses.forEach((element, index) => {
        var qData = []
        if (element.hits.hits) {
          element.hits.hits.forEach(doc => {
            qData.push(_esToRec(doc))
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

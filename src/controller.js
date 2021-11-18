import * as esQueries from './esQueries.js'

function _esToRec (concept) {
  return {
    'id': concept.id,
    'name': concept.preferredLabel,
    'description': concept.scopeNote,
    'score': concept.score,
    'match': true,
    'type': [
      {
        'id': 'Concept',
        'name': 'Concept'
      }
    ]
  }
}

async function vocab (req, res) {
  if (!req.query.queries) {
    this.manifest(req, res)
  } else {
    req.body.queries = req.query.queries
    this.query(req, res)
  }
}

async function manifest (req, res) {
  res.send({
    'versions': ['0.2'],
    'name': 'SkoHub reconciliation service',
    'identifierSpace': 'http://www.w3.org/2004/02/skos/core#Concept',
    'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
    'defaultTypes': [{ 'id': 'Concept', 'name': 'Concept' }, { 'id': 'ConceptScheme', 'name': 'ConceptScheme' }],
    'view': { 'url': `https://skohub.io/${req.params.tenant}/${req.params.vocab}/heads/main/w3id.org/${req.params.tenant}/${req.params.vocab}/{{id}}` }
  })
}

async function query (req, res) {
  const tenant = req.params.tenant
  const vocab = req.params.vocab
  const reqJSON = req.body.queries
  // TODO: validate input. E.g.: if (!(paramsList instanceof Array)) throw Error('invalid argument: paramsList must be an array');
  await esQueries.query(tenant, vocab, reqJSON)
    .then(resp => {
      const data = resp.body.hits.hits.map((concept) => {
        return _esToRec(concept)
      })
      console.log(data)
      res.json({ status_code: 200, success: true, data: data, message: 'Concepts successfully fetched.' })
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

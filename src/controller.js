import config from './config.js'
import * as esQueries from './esQueries.js'

function _esToRec (doc, prefLang, threshold) {
  const concept = doc._source
  let obj = {
    'id': concept.id.split('/').pop(),
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
  await esQueries.q_vocab(vocab)
  .then(resp => {
    res.send({
      'versions': ['0.2'],
      'name': `SkoHub reconciliation service for ${vocab}`,
      'identifierSpace': `${resp.preferredNamespaceUri}`,
      'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
      'defaultTypes': [{ 'id': 'Concept', 'name': 'Concept' }, { 'id': 'ConceptScheme', 'name': 'ConceptScheme' }],
      'view': { 'url': `${process.env.APP_VIEW_BASEURL}/${vocab}/{{id}}` }
    })
    .catch(err => {
      console.trace(err.message)
      res.json({ status_code: 500, success: false, data: [], message: err })
    })
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

async function suggest (req, res) {
  res.json({ status_code: 501, success: true, message: 'Suggestions have not been implemented yet.' })
}

async function preview (req, res) {
  const url = ""
  const id = ""
  const img_url = ""
  const img_alt = ""
  const label = ""
  const def = ""
  const scope_note = ""
  const examples = []

  var img_html = ""
  var scope_html = ""
  var def_html = ""
  var examples_html = ""

  if (img_url.length > 0) {
    img_html = `<div style="width: 100px; text-align: center; overflow: hidden; margin-right: 9px; float: left">
    <img src="${ img_url }" alt="${ img_alt }" style="height: 100px" />
  </div>`
  }

  if (scope_note.length > 0) {
    scope_html = `<p>${ scope_note }</p>`
  }

  if (def.length > 0) {
    def_html = `<p><i>${ def }</i></p>`
  }

  if (examples.length > 0) {
    examples_html = `<div><head>Examples:</head><ul>`
    for (x in examples) {
        examples_html = examples_html + `<li>${ x }</li>`
    }
    examples_html = examples_html + `</ul></div>`
  }

  const html = `<html><head><meta charset="utf-8" /></head>
  <body style="margin: 0px; font-family: Arial; sans-serif">
  <div style="height: 100px; width: 320px; overflow: hidden; font-size: 0.7em">
  
    <h3>Preview has not yet been implemented.</h3>
    ${img_html }

    <div style="margin-left: 5px;">
      <b><a href="${ url }" target="_blank" style="text-decoration: none;">${ label }</a></b>
      <span style="color: #505050;">(${ id })</span>
      ${ def_html }
      ${ scope_html }
      ${ examples_html }
    </div>
  
  </div>
  </body>
  </html>`
  res.json({ status_code: 501, success: false, message: html })
}

async function extend (req, res) {
  res.json({ status_code: 501, success: true, message: 'Extend function(s) have not been implemented yet.' })
}

async function flyout (req, res) {
  res.json({ status_code: 501, success: true, message: 'FlyOut has not been implemented yet.' })
}

async function all_manifests (req, res) {
  res.json({ status_code: 501, success: true, message: 'All Manifests function has not been implemented yet.' })
  // client.cat.indices(...)
  // client.indices.get('_all')
}

async function search_vocabs (req, res) {
  res.json({ status_code: 501, success: true, message: 'Search for vocabularies has not been implemented yet.' })
  // client.cat.indices(...)
  // client.indices.get('_all')
  // client.indices.getMapping(...)
}

export { vocab, manifest, query, suggest, preview, extend, flyout, all_manifests, search_vocabs }

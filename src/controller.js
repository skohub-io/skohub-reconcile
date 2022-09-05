import config from './config.js'
import * as esQueries from './esQueries.js'

const defaultLanguage = 'en'

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

function _getParams (req) {
  const account = req.params.account ? req.params.account : ( req.query.account ? req.query.account : "" )
  const vocab  = req.params.vocab  ? req.params.vocab  : ( req.query.vocab  ? req.query.vocab  : "" )
  const id     = req.params.id     ? req.params.id     : ( req.query.id     ? req.query.id     : "" )
  const prefLang = req.query.lang  ? req.query.lang : defaultLanguage
  return { account, vocab, id, prefLang }
}

async function _checkTenantVocab(account, vocab, id) {
  // if account or vocab is nonempty but not in available accounts or vocabs, return 404
  var allAccounts = await esQueries.getAccounts()
  var allVocabs = await esQueries.getVocabs()
  if (account && [].slice.call(allAccounts).indexOf(account) == -1) {
    return { err: {message: `Sorry, nothing at this url. (Nonexistent account '${ account }'.)`, code: 404}, account, vocab, id }
  }
  if (vocab && [].slice.call(allVocabs).indexOf(vocab) == -1) {
    // if vocab fails, try again with a vocab value without the last path component
    // (maybe that's an id which express router could not extract)
    var pComponents = vocab.split('/')
    id = pComponents.pop()
    vocab = pComponents.join('/')
    if (vocab && [].slice.call(allVocabs).indexOf(vocab) == -1) {
      return { err: {message: `Sorry, nothing at this url. (Nonexistent vocab '${ vocab }'.)`, code: 404}, account, vocab, id }
    }
  }
  return { err: null, account, vocab, id }
}

function _knownProblemHandler(res, err) {
  // console.log(err.message)
  const error = { status_code: err.code, success: false, data: [], message: err.message }
  res.status(err.code).json(error)
  return {err: error}
}

function _errorHandler(res, err) {
  console.trace(err)
  res.json({ status_code: 500, success: false, data: [], message: err })
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
  const { account, vocab, prefLang } = _getParams(req)

  await _checkTenantVocab(account, vocab)
  .then(resp => { if (!resp.err) { return esQueries.query(resp.account, resp.vocab) } else { return _knownProblemHandler(res, resp.err) } })
  .then(resp => { if (!resp.err)
    {
      if (resp.body.responses[0].hits.total.value == 0) {
        _knownProblemHandler(res, {code: 404, message : 'Sorry, nothing at this url.'})
      } else {

        // for identifierSpace, preferredNamespaceUri takes precedence over our parsing of the schema's id
        var prefix = ""
        if (vocab && resp.body.responses[0].hits.hits[0]._source.preferredNamespaceUri) {
          prefix = resp.body.responses[0].hits.hits[0]._source.preferredNamespaceUri.id
        } else if ( vocab && resp.body.responses[0].hits.hits) {
          prefix = resp.body.responses[0].hits.hits[0]._source.id.substring(0, resp.body.responses[0].hits.hits[0]._source.id.lastIndexOf('/') + 1)
        } else {
          prefix = ""
        }

        var endpoint = ""
        var extraTenant = ""
        if (account) {
          endpoint = endpoint + account + '/'
        } else {  // if we are on root level then account must be introduced in some places, e.g. after _preview urls
          extraTenant = '{{prefix}}/'
        }
        if (vocab) { endpoint = endpoint + encodeURIComponent(vocab) + '/'}

        var vocabs
        var v = []
        resp.body.responses[0].hits.hits.forEach(item => {
          if (item._source.type == "ConceptScheme" ) {
            v.push({
              id: item._source.id,
              title: item._source.title,
              description: item._source.description,
              reconciliation: process.env.APP_BASEURL + item._source.account + '/' + encodeURIComponent(item._source.id.substring(0, item._source.id.lastIndexOf('/'))),
              ...( !account ? { prefix: item._source.account } : {}) 
            })
          }
        })
        if (!vocab && v.length > 0) {
          vocabs = { vocabs: v }
        }

        res.send({
          'versions': ['0.2'],
          'name': `SkoHub reconciliation service${ (endpoint) && ' for ' + decodeURIComponent(endpoint)}`,
          'identifierSpace': `${prefix}`,
          'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
          'defaultTypes': [
            { 'id': 'ConceptScheme', 'name': 'ConceptScheme' },
            ...( vocab ? [{ 'id': 'Concept', 'name': 'Concept' }] : [])
          ],
          ...vocabs,
          'view': { 'url': `${prefix}{{id}}` },
          'preview': { 'url': `${process.env.APP_BASEURL}${endpoint}_preview/${extraTenant}{{id}}`, 'width': 100, 'height': 320 }
        })
      }
    }
  })
  .catch(err => _errorHandler(res, err))
}

async function query (req, res) {
  const { account, vocab, prefLang } = _getParams(req)
  const threshold = (req.params.threshold ? req.params.threshold : config.es_threshold)
  const reqJSON = JSON.parse(req.body.queries)
  let reqQNames = Object.keys(reqJSON)

  await _checkTenantVocab(account, vocab)
  .then(resp => { if (!resp.err) { return esQueries.query(resp.account, resp.vocab, reqJSON) } else { return _knownProblemHandler(res, resp.err) } })
  .then(resp => { if (!resp.err)
    {
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
    }
  })
  .catch(err => _errorHandler(res, err))
}

async function preview (req, res) {
  const { account, vocab, id, prefLang } = _getParams(req)
  // console.log(`account: '${ account }', vocab: '${ vocab }', id: '${ id }'.`)

  await _checkTenantVocab(account, vocab, id)
  .then(resp => { if (!resp.err) { return esQueries.queryID(resp.account, resp.vocab, resp.id) } else { return _knownProblemHandler(res, resp.err) } })
  .then(resp => { if (!resp.err)
    {
      if (resp.body.responses[0].hits.total.value == 0) {
        _knownProblemHandler(res, {code: 404, message : 'Sorry, nothing at this url.'})
      } else {
        const result = resp.body.responses[0].hits.hits[0]._source

        let newVocab = result.vocab
        if (result.id.substring(0,4) == 'http') {
          var url = result.id
        } else {
          var url = newVocab + result.id
        }
        const label = _getLocalizedString(result.prefLabel, prefLang)
        const altLabels = _getLocalizedString(result.altLabel, prefLang)
        const desc = _getLocalizedString(result.description, prefLang)
        const examples = _getLocalizedString(result.examples, prefLang)
        const def = result.definition ? _getLocalizedString(result.definition, prefLang) : ''
        const scope_note = result.scopeNote ? _getLocalizedString(result.scopeNote, prefLang) : ''
        const scheme = result.inScheme ? result.inScheme[0].id : ''
        const type = result.type
        const img = result.img
        const img_url = img ? img.url : ''
        const img_alt = img ? img.alt : ''

        var img_html = ''
        var desc_html = ''
        var scheme_html = ''
        var def_html = ''
        var scope_html = ''
        var altLabels_html = ''
        var examples_html = ''

        if (img_url) {
          img_html = `<div style="width: 100px; text-align: center; margin-right: 9px; float: left">
          <img src="${ img_url }" alt="${ img_alt }" style="height: 100px" />
        </div>`
        }
        if (scheme) { scheme_html = `in ConceptScheme: <b><a href="${ scheme }" target="_blank" style="text-decoration: none;">${ scheme }</a></b>`}
        if (desc) { desc_html = `<p>${ desc }</p>` }
        if (def) { def_html = `<p><i>${ def }</i></p>` }
        if (scope_note) { scope_html = `<p>${ scope_note }</p>` }
        if (altLabels) { altLabels_html = '<p>alias: ' + altLabels.join(', ') + '</p>'}
        if (examples) {
          examples_html = '<div><head>Examples:</head><ul>'
          for (x in examples) {
              examples_html = examples_html + `<li>${ x }</li>`
          }
          examples_html = examples_html + `</ul></div>`
        }

        const html = `<html><head><meta charset="utf-8" /></head>
        <body style="margin: 0px; font-family: Arial; sans-serif">
        <div style="height: 100px; width: 320px; font-size: 0.7em">
        
          <h3 style="margin-left: 5px;"><a href="${ url }">${ label }</a></h3>
          ${ img_html }
          <div style="margin-left: 5px;">
            <p>
              ${ type } <span style="color: #505050;">(id: ${ id ? id : result.id })</span><br/>
              ${ scheme_html }
            </p>
            ${ desc_html }
            ${ def_html }
            ${ scope_html }
            ${ altLabels_html }
            ${ examples_html }
          </div>
        </div>
        </body>
        </html>`

        res.send(html)
      }
    }
  })
  .catch(err => _errorHandler(res, err))
}

async function suggest (req, res) {
  const { account, vocab, prefLang } = _getParams(req)
  const prefix = req.query.prefix
  const cursor = req.query.cursor ? req.query.cursor - 1 : 0
  // console.log(`account: '${ account }', vocab: '${ vocab }', prefix: '${ prefix }', cursor: '${ cursor }', language: '${ prefLang }'.`)

  await _checkTenantVocab(account, vocab)
  .then(resp => { if (!resp.err) { return esQueries.suggest(resp.account, resp.vocab, prefix, cursor, prefLang) } else { return _knownProblemHandler(res, resp.err) } })
  .then(resp => { if (!resp.err)
    {
      const response = resp.body.responses[0].suggest
      const options = [...response.prefLabelSuggest[0].options, ...response.altLabelSuggest[0].options, ...response.titleSuggest[0].options].slice(cursor)
      var result = []
      options.forEach((element, _) => {
          result.push({
            'name': element.text,
            'id': element._source.id,
            ...( element._source.description && { 'description': element._source.description }),
            ...( element._source.type && { 'notable': {
                'id': element._source.type,
                'name': element._source.type
              }})
          })
      })
      res.json(result)
    }
  })
  .catch(err => _errorHandler(res, err))
}

async function extend (req, res) {
  res.json({ status_code: 501, success: true, message: 'Extend function(s) have not been implemented yet.' })
}

async function flyout (req, res) {
  res.json({ status_code: 501, success: true, message: 'FlyOut has not been implemented yet.' })
}

export { vocab, query, preview, suggest, extend, flyout }

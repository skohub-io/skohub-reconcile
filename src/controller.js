import config from './config.js'
import * as esQueries from './esQueries.js'

const defaultLanguage = config.app_defaultlang ? config.app_defaultlang : 'en'
const supportedAPIversions = ['0.2']

function _esToRec (doc, prefLang, threshold) {
  const concept = doc._source
  let obj = {
    'id': concept.id.split('/').pop(),
    'name': _getLocalizedString(concept.prefLabel, prefLang) || _getLocalizedString(concept.title, prefLang),
    'description': _getLocalizedString(concept.scopeNote, prefLang) || _getLocalizedString(concept.description, prefLang) || "",
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

function _getURLParameters (req) {
  // Remember that in server.js we have configured query parameter parsing to use standard URLSearchParams
  const account  = req.params.account    ? req.params.account    : ( req.query.account ? req.query.account : "" )
  const dataset  = req.params.dataset    ? req.params.dataset    : ( req.query.dataset ? req.query.dataset : "" )
  const id       = req.params.id         ? req.params.id         : ( req.query.id      ? req.query.id      : "" )
  const prefLang = req.query.lang ? req.query.lang : defaultLanguage
  return { account, dataset, id, prefLang }
}

/**
 * 
 * @param {*} req 
 * @returns {object} Object containing the query parameters
 */
function getQueryParameters(req) {
  try {
    if (req.method === "GET") {
      return JSON.parse(req.query.queries)
    }
    else if (req.method === "POST") {
      return req.body
    }
  } catch (error) {
    throw new Error("Unhandled request method for parsing query parameters: ", error)
  }
}

async function _checkAccountDataset(account, dataset) {
  // if account or dataset is nonempty but not in available accounts or datasets, return 404
  var allAccounts = await esQueries.getAccounts()
  var allDatasets = await esQueries.getDatasets()
  if (account && [].slice.call(allAccounts).indexOf(account) == -1) {
    return { err: {message: `Sorry, nothing at this url. (Nonexistent account '${ account }'.)`, code: 404}, account, dataset }
  }
  if (dataset && [].slice.call(allDatasets).indexOf(dataset) == -1) {
    // if dataset fails, try again with a dataset value without the last path component
    // (maybe that's an id which express router could not extract)
    var pComponents = dataset.split('/')
    const id = pComponents.pop()
    dataset = pComponents.join('/')
    if (dataset && [].slice.call(allDatasets).indexOf(dataset) == -1) {
      return { err: {message: `Sorry, nothing at this url. (Nonexistent dataset '${ dataset }'.)`, code: 404}, account, dataset, id }
    }
  }
  return { err: null, account, dataset}
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

async function dataset (req, res) {
  if (!Object.keys(req.query).length) {
    manifest(req, res)
  } else {
    query(req, res)
  }
}

async function manifest (req, res) {
  const { account, dataset, prefLang } = _getURLParameters(req)

  const accountDataset = await _checkAccountDataset(account, dataset)
  if (accountDataset.err) { 
    return _knownProblemHandler(res, accountDataset.err) 
  }
  const esQuery = await esQueries.query(accountDataset.account, accountDataset.dataset)
  if (esQuery.responses[0].hits.total.value == 0) {
        _knownProblemHandler(res, {code: 404, message : 'Sorry, nothing at this url.'})
  } else {
    // for identifierSpace, preferredNamespaceUri takes precedence over our parsing of the schema's id
    let prefix = ""
    const firstHit = esQuery.responses[0].hits.hits[0]
    if (firstHit._source.preferredNamespaceUri) {
      prefix = firstHit._source.preferredNamespaceUri.id
    } else {
      prefix = firstHit._source.id.substring(0, firstHit._source.id.lastIndexOf('/') + 1)
    }
    var datasets
    var d = []
    esQuery.responses[0].hits.hits.forEach(item => {
      if (item._source.type == "ConceptScheme" ) {
        d.push({
          id: item._source.id,
          title: item._source.title,
          description: item._source.description,
          reconciliation: process.env.APP_BASEURL + `_reconcile?account=${ item._source.account }&dataset=${ encodeURIComponent(item._source.id.substring(0, item._source.id.lastIndexOf('/'))) }`,
          ...( !account ? { account: item._source.account } : {})
        })
      }
    })
    if (!dataset && d.length > 0) {
      datasets = { datasets: d }
    }

    var dsname = ''
    var dsparam = ''
    var accparam = ''
    var idparam = ''
    if ( account || dataset ) {
        dsname = ' for ' + ( account ? "account '" + account + "'" + ( dataset ? ", dataset '" + dataset + "'" : '' ): ( dataset ? ", dataset '" + dataset + "'"  : '' ) )
    }
    if (dataset) {
        dsparam = `dataset=${ dataset }`
        idparam = `&id={{id}}`
    } else {
        dsparam = `dataset={{id}}`
    }
    if (account) {
      accparam = `account=${ account }`
    } else {
        accparam = `account={{account}}`
    }

  return res.send({
      'versions': supportedAPIversions,
      'name': `SkoHub reconciliation service${ dsname }`,
      'identifierSpace': `${ prefix }`,
      'schemaSpace': 'http://www.w3.org/2004/02/skos/core#',
      'defaultTypes': [
        { 'id': 'ConceptScheme', 'name': 'ConceptScheme' },
        ...( dataset ? [{ 'id': 'Concept', 'name': 'Concept' }] : [])
      ],
      ...datasets,
      'view': { 'url': `${ prefix }{{id}}` },
      'preview': { 
        'url': `${ process.env.APP_BASEURL }/_preview?${ accparam }&${ dsparam }${ idparam }`, 
        'width': 100, 
        'height': 320 
      },
      'suggest': {
        entity: {
          service_url: `${ process.env.APP_BASEURL }`,
          service_path: `/_suggest?service=entity&${ accparam }&${ dsparam }`
        },
        property: {
          service_url: `${ process.env.APP_BASEURL }`,
          service_path: `/_suggest?service=property&${ accparam }&${ dsparam }`
        },
        type: {
          service_url: `${ process.env.APP_BASEURL }`,
          service_path: `/_suggest?service=type&${ accparam }&${ dsparam }`
        }
      }
    })
  }
}

async function query (req, res) {
  const { account, dataset, prefLang } = _getURLParameters(req)
  const threshold = (req.query.threshold ? req.query.threshold : config.es_threshold)
  const queryParameters = getQueryParameters(req)
  const reqQNames = Object.keys(queryParameters)

  try {
    const resp = await _checkAccountDataset(account, dataset)
    const esQuery = await esQueries.query(resp.account, resp.dataset, queryParameters) 
    var allData = {}
    esQuery.responses.forEach((element, index) => {
      var qData = []
      if (element.hits.hits) {
        element.hits.hits.forEach(doc => {
          qData.push(_esToRec(doc, prefLang, threshold))
      })
    }
    allData[reqQNames[index]] = { 'result': qData }
    })
    return res.json(allData)
  } catch (error) { 
    return _errorHandler(res, error)
    // return _knownProblemHandler(res, resp.err) 
  }
}

async function preview (req, res) {
  const { account, dataset, id, prefLang } = _getURLParameters(req)

  try {
    const resp = await _checkAccountDataset(account, dataset)
    const esQuery = await esQueries.queryID(resp.account, resp.dataset, id) 
    if (esQuery.responses[0].hits.total.value == 0) {
      _knownProblemHandler(res, {code: 404, message : 'Sorry, nothing at this url.'})
    } 
    const result = esQuery.responses[0].hits.hits[0]._source
    let newDataset = result.dataset
    // TODO what and why is this necessary?
    if (result.id.substring(0,4) == 'http') {
      var url = result.id
    } else {
      var url = newDataset + result.id
    }
    const label      = _getLocalizedString(result.prefLabel, prefLang)
    const altLabels  = _getLocalizedString(result.altLabel, prefLang)
    const desc       = _getLocalizedString(result.description, prefLang)
    const examples   = _getLocalizedString(result.examples, prefLang)
    const def        = result.definition ? _getLocalizedString(result.definition, prefLang) : ''
    const scope_note = result.scopeNote  ? _getLocalizedString(result.scopeNote, prefLang) : ''
    const scheme     = result.inScheme   ? result.inScheme[0].id : ''
    const type       = result.type
    const img        = result.img
    const img_url    = img ? img.url : ''
    const img_alt    = img ? img.alt : ''

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

    return res.send(html)
  } catch (error) {
    return _errorHandler(res, error)
    // return _knownProblemHandler(res, resp.err) 
  }
}

// TODO how to handle curosr?
async function suggest (req, res) {
  console.log("suggest")
  const { account, dataset, prefLang } = _getURLParameters(req)
  const service =  req.query.service || ""
  const prefix = req.query.prefix
  const cursor = req.query.cursor ? req.query.cursor - 1 : 0

  try {
    const qRes = await esQueries.suggest(account, dataset, prefix, cursor, prefLang)
    const options = qRes.responses.flatMap(r => {
      return r.suggest["rec-suggest"][0].options
    })
    const result = options.map((element, _) => {
        return {
          'name': element.text,
          'id': element._source.id,
           ...( element._source.description && { 'description': element._source.description }),
           ...( element._source.type && { 'notable': {
              'id': element._source.type,
              'name': element._source.type
            }})
        }
    })
    return res.json({"result": result})
  } catch (error) {
    return _errorHandler(res, error)
  }
}

async function extend (req, res) {
  res.json({ status_code: 501, success: true, message: 'Extend function(s) have not been implemented yet.' })
}

async function flyout (req, res) {
  res.json({ status_code: 501, success: true, message: 'FlyOut has not been implemented yet.' })
}

export { dataset, query, preview, suggest, extend, flyout }

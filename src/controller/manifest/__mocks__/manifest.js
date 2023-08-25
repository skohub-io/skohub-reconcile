export const validManifest = {
  "versions": [
    "0.2"
  ],
  "name": "SkoHub reconciliation service for account 'dini-ag-kim', dataset 'https://w3id.org/rhonda/polmat/scheme'",
  "identifierSpace": "https://w3id.org/rhonda/polmat/",
  "schemaSpace": "http://www.w3.org/2004/02/skos/core#",
  "defaultTypes": [
    {
      "id": "ConceptScheme",
      "name": "ConceptScheme"
    },
    {
      "id": "Concept",
      "name": "Concept"
    }
  ],
  "view": {
    "url": "{{id}}"
  },
  "preview": {
    "url": "http://localhost:3000/preview?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&id={{id}}",
    "width": 100,
    "height": 320
  },
  "suggest": {
    "entity": {
      "service_url": "http://localhost:3000",
      "service_path": "/suggest?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&service=entity",
      "flyout_service_path": "/suggest/flyout?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&id=${id}"
    },
    "property": {
      "service_url": "http://localhost:3000",
      "service_path": "/suggest?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&service=property",
      "flyout_service_path": "/suggest/flyout?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&id=${id}"
    },
    "type": {
      "service_url": "http://localhost:3000",
      "service_path": "/suggest?language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&service=property",
      "flyout_service_path": "/suggest/flyout&language=en&account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&id=${id}"
    }
  }
}

export const queryResponse = {
  took: 5,
  responses: [
    {
      took: 5,
      timed_out: false,
      _shards: {
        total: 1,
        successful: 1,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: 1,
          relation: "eq",
        },
        max_score: 13.48282,
        hits: [
          {
            _index: "skohub-reconcile",
            _id: "5d8b4899d11b11ab7da1c4307fd07660aed0c41321f063986868930a0705f2e4",
            _score: 13.48282,
            _source: {
              id: "https://w3id.org/rhonda/polmat/scheme",
              type: "ConceptScheme",
              bibliographicCitation: {
                "@language": "en",
                "@value":
                  "Härter, K. et al.: RHONDA Categories of Matters regulated by Police Ordinances. SKOS Concept Scheme. Version 1.0.0. URL: <https://w3id.org/rhonda/polmat/1.0.0>",
              },
              contributor: [
                "Härter, Karl",
                "Kotkas, Toomas",
                "Romein, Annemieke",
                "Stolleis, Michael",
                "Wagner, Andreas",
              ],
              created: "2020-11-10",
              creator: {
                id: "https://orcid.org/0000-0003-1835-1653",
              },
              description: {
                en: "Concept scheme of matters regulated by early modern legal rules / police ordinances",
              },
              issued: "2020-11-10",
              license: {
                id: "https://creativecommons.org/publicdomain/zero/1.0/",
              },
              modified: "2022-03-28",
              publisher: {
                id: "http://lobid.org/gnd/2019144-3",
              },
              source: {
                id: "https://raw.githubusercontent.com/rhonda-org/vocabs-polmat/main/polmat.ttl",
              },
              title: {
                en: "RHONDA Categories of Matters regulated by Police Ordinances",
                de: "RHONDA Materien der Policeyordnungen",
                fr: "RHONDA Categorisation des matières d'ordonnances de police",
                nl: "RHONDA Politie Ordinanties",
              },
              preferredNamespacePrefix: "polmat",
              preferredNamespaceUri: {
                id: "https://w3id.org/rhonda/polmat/",
              },
              seeAlso: {
                id: "https://github.com/rhonda-org/PoliceOrdinances/wiki",
              },
              versionIRI: {
                id: "https://w3id.org/rhonda/polmat/1.0.0",
              },
              versionInfo: "1.0.0",
              hasTopConcept: [
                {
                  id: "https://w3id.org/rhonda/polmat/n0",
                },
              ],
              prefLabel: {
                en: "RHONDA Police Legislation Matters Concept Scheme",
                de: "RHONDA Policeyordnungsmaterien Vokabular",
                nl: "RHONDA Politieordonnanties vocabulaire",
              },
              term_status: "testing",
              dataset: "https://w3id.org/rhonda/polmat/scheme",
              account: "dini-ag-kim",
            },
          },
        ],
      },
      status: 200,
    },
  ],
};

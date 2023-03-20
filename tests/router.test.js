import request from "supertest"
import express from "express"
import {routes} from "../src/router"

const app = new express()
app.use("/", routes)

describe('endpoints',  () => {
  const url = "/_reconcile/dini-ag-kim/https://w3id.org/rhonda/polmat/scheme"
  test('should return a service manifest', async () => {
    const res = await request(app)
      .get(url)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual({
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
        "url": "https://w3id.org/rhonda/polmat/{{id}}"
      },
      "preview": {
        "url": "http://localhost:3000/_preview?account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme&id={{id}}",
        "width": 100,
        "height": 320
      },
      "suggest": {
        "entity": {
          "service_url": "http://localhost:3000",
          "service_path": "/_suggest/?service=entity?account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme"
        },
        "property": {
          "service_url": "http://localhost:3000",
          "service_path": "/_suggest/?service=property?account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme"
        },
        "type": {
          "service_url": "http://localhost:3000",
          "service_path": "/_suggest/?service=type?account=dini-ag-kim&dataset=https://w3id.org/rhonda/polmat/scheme"
        }
      }
    })
  })
  test("suggest property", async() => {
    const url = "http://localhost:3000/_suggest?account=dini-ag-kim&dataset=https%3A%2F%2Fw3id.org%2Frhonda%2Fpolmat%2Fscheme&service=property&prefix=Poli&cursor=0"
    const res = await request(app).get("/", url)
    expect(res.statusCode).toBe(200)
  })
})



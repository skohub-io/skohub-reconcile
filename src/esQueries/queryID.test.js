import {queryID} from "./queryID.js";
import { Client } from "@elastic/elasticsearch";
import Mock from "@elastic/elasticsearch-mock";

const mock = new Mock();
const client = new Client({
  node: "http://localhost:9200",
  Connection: mock.getConnection(),
});

mock.add(
  {
    method: "GET",
    path: "/",
  },
  () => {
    return { status: "ok" };
  }
);

mock.add(
  {
    method: "POST",
    path: "/skohub-reconcile/_search",
  },
  () => {
    return {
      hits: {
        total: { value: 1, relation: "eq" },
        hits: [{ _source: { id: "http://example.org/1" } }],
      },
    };
  }
);

describe("Elasticsearch queries", () => {
  it("pings elastic", async () => {
    client.ping();
  });

  it("returns a response if queries for an ID", async () => {
    const result = await queryID(
      "dini-ag-kim",
      "http://example.org/scheme",
      "http://example.org/1",
      client
    );
    expect(result).toEqual({
      hits: {
        total: { value: 1, relation: "eq" },
        hits: [{ _source: { id: "http://example.org/1" } }],
      },
    });
  });
});

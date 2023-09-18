import { describe, expect, it, vi } from "vitest";
import esQueries from "../../queries/index.js";
import * as utils from "../utils.js";
import queryResponseV2 from "./__mocks__/queryResponseV2.js";
import queryResponseV3 from "./__mocks__/queryResponseV3.js";
import elasticResponse from "./__mocks__/elasticResponse.js";
import query from "./index.js";


vi.mock("../utils.js", async () => {
  const actual = await vi.importActual("../utils.js");
  return {
    ...actual,
    checkAccountDataset: vi.fn().mockReturnValue(true),
    getQueries: vi.fn().mockReturnValue({
      q1: {},
      q2: {},
    }),
  };
});

vi.mock("../../queries/index.js", async () => {
  return {
    default: {
      query: null,
    },
  };
});

const mockedQueries = vi.mocked(esQueries);
const mockedUtils = vi.mocked(utils)

describe("query", () => {
  it("returns a query result for v2", async () => {
    mockedQueries.query = vi.fn().mockReturnValue(elasticResponse);
    const req = {
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      query: {
        account: "dini-ag-kim",
        language: "en",
        dataset: "https://w3id.org/rhonda/polmat/scheme"
      },
      body: {
        q1: {
          query: "dini-ag-kim",
        },
        q2: {
          query: "test"
        }
      },
      params: {},
    };
    const res = {
      send: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
    };
    await query(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(queryResponseV2);
  });

  it("returns a query result for v3", async () => {
    mockedQueries.query = vi.fn().mockReturnValue(elasticResponse);
    const req = {
      headers: {
        "content-type": "application/json"
      },
      query: {
        account: "dini-ag-kim",
        language: "en",
        dataset: "https://w3id.org/rhonda/polmat/scheme"
      },
      body: {
        queries: [
          {
            query: "dini-ag-kim",
          }
        ]
      },
      params: {},
    };
    const res = {
      send: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
    };
    await query(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(queryResponseV3);
  });

  // test missing content type
  it("returns a 415, because of invalid header content-type", async () => {
    const req = {
      method: "POST",
      headers: {
        "content-type": "bla"
      },
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme"
      },
      body: {
        queries: [
          {
            query: "dini-ag-kim",
          }

        ]
      },
      params: {
      },
    };
    const res = {
      send: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
    };
    await query(req, res);
    expect(res.status).toBeCalledWith(415);
  });

  // test invalid query
  it("returns a 403, because of invalid query against query scheme", async () => {
    const req = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme"
      },
      body: {
        queries: [
          {
            querie: "dini-ag-kim",
          }

        ]
      },
      params: {
      },
    };
    const res = {
      send: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
    };
    await query(req, res);
    expect(res.status).toBeCalledWith(403);
  });
});

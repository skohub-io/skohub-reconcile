import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import esQueries from "../../queries/index.js";
import * as utils from "../utils.js";
import allData from "./__mocks__/allData.js";
import queryResponse from "./__mocks__/queryResponse.js";
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

describe("query", () => {
  it("returns a query result", async () => {
    mockedQueries.query = vi.fn().mockReturnValue(queryResponse);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
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
    expect(res.json).toBeCalledWith(allData);
  });

  it("add test for error handling if query result is invalid", async () => {
    mockedQueries.query = vi.fn().mockReturnValue([]);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
      },
      params: {},
    };
    const res = {
      send: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
    };
    await query(req, res);
    expect(res.status).toBeCalledWith(500);
  });
});

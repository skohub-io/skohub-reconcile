import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as esQueries from "../queries/index.js";
import * as utils from "./utils.js";
import { checkAccountDataset } from "./utils.js";

vi.mock("../../queries/index.js", async () => {
  return {
    default: {
      getAccounts: vi.fn(),
      getDatasets: vi.fn(),
    },
  };
});

describe("checkAccountDataset", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns true", async () => {
    esQueries.default.getAccounts = vi
      .fn()
      .mockResolvedValue(["dini-ag-kim", "test"]);
    esQueries.default.getDatasets = vi
      .fn()
      .mockResolvedValue(["https://w3id.org/rhonda/polmat/scheme"]);
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
    const result = await checkAccountDataset(
      res,
      req.query.account,
      req.query.dataset
    );
    expect(result).toBe(true);
  });

  it("throws known error if checkAccount fails", async () => {
    esQueries.default.getAccounts = vi.fn().mockResolvedValue([]);
    const req = {
      query: {
        account: "not-existing",
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
    await checkAccountDataset(res, req.query.account, req.query.dataset);
    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith({
      data: [],
      message: `Sorry, nothing at this url. (Nonexistent account '${req.query.account}'.)`,
      status_code: 404,
      success: false,
    });
  });

  it("throws error if checkDataset fails", async () => {
    esQueries.default.getAccounts = vi
      .fn()
      .mockResolvedValue(["dini-ag-kim", "test"]);
    esQueries.default.getDatasets = vi.fn().mockResolvedValue([""]);

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
    await checkAccountDataset(res, req.query.account, req.query.dataset);
    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith({
      data: [],
      message: `Sorry, nothing at this url. (Nonexistent dataset '${req.query.dataset}'.)`,
      status_code: 404,
      success: false,
    });
  });
});

describe("esToReconcile", () => {
  it.todo("add test for esToReconcile")
});
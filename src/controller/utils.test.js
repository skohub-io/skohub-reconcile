import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(
      async () =>
        await checkAccountDataset(res, req.query.account, req.query.dataset)
    ).rejects.toThrowError(utils.NotExistentException);
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
    expect(
      async () =>
        await checkAccountDataset(res, req.query.account, req.query.dataset)
    ).rejects.toThrowError(utils.NotExistentException);
  });
});

describe("esToReconcile", () => {
  it.todo("add test for esToReconcile");
});

describe("getParameters", () => {
  it("returns parameters", () => {
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        cursor: 0,
        prefix: "P",
      },
      params: {},
    };
    const result = utils.getParameters(req);
    expect(result).toEqual({
      account: "dini-ag-kim",
      dataset: "https://w3id.org/rhonda/polmat/scheme",
      language: "en",
      cursor: 0,
      prefix: "P",
      id: "",
    });
  });

  it("returns parameters also if 'params' attribute is missing", () => {
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        cursor: 0,
        prefix: "P",
      },
    };
    const result = utils.getParameters(req);
    expect(result).toEqual({
      account: "dini-ag-kim",
      dataset: "https://w3id.org/rhonda/polmat/scheme",
      language: "en",
      cursor: 0,
      prefix: "P",
      id: "",
    });
  });
});

describe("getLocalizedString", () => {
  it("returns localized string", () => {
    const obj = {
      en: "test en",
      de: "test de",
    };
    const result = utils.getLocalizedString(obj, "en");
    expect(result).toEqual("test en");
  });

  it("returns info if no localized string is available", () => {
    const obj = {
      en: "test",
      de: "test",
    };
    const result = utils.getLocalizedString(obj, "fr");
    expect(result).toEqual("No label in language fr provided");
  });

  it("returns empty string if obj is undefined", () => {
    const obj = undefined;
    const result = utils.getLocalizedString(obj, "fr");
    expect(result).toEqual("");
  });
});

describe("get queries from query parameter (getQueries)", () => {
  const queries = {
    q0: {
      query: "Regelungsmaterie",
    },
    q1: {
      query: "Policeymaterie",
    },
  };
  it("parses queries from query parameter when request method is 'GET'", () => {
    const req = {
      method: "GET",
      query: {
        queries: JSON.stringify(queries),
      },
    };
    const result = utils.getQueries(req);
    expect(result).toEqual(queries);
  });

  it("parses queries from query parameter when request method is 'POST'", () => {
    const req = {
      method: "POST",
      body: {
        queries: JSON.stringify(queries),
      },
    };
    const result = utils.getQueries(req);
    expect(result).toEqual(queries);
  });
});

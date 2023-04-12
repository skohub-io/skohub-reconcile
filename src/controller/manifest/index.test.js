import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryResponse, validManifest } from "../__mocks__/manifest.js";
import manifest from "./index.js";
import * as esQueries from "../../queries/index.js";


vi.mock("../utils.js" , async () => {
  const actual = await vi.importActual("../utils.js")
  return {
    ...actual,
    checkAccountDataset: vi.fn().mockResolvedValue({err: null}),
  }
})

vi.mock("../../queries/index.js" , async () => {
  return {
    default: {
      query: null
    }
  }
})


describe("Manifest", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("correctly passes requests", async () => {
    esQueries.default.query = vi.fn().mockResolvedValue(queryResponse);
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
    };
    await manifest(req, res);
    expect(res.send).toBeCalledWith(validManifest);
  });

  it("not passing request", async () => {
    esQueries.default.query = vi.fn().mockResolvedValue([]);
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
    };
    await manifest(req, res);
    expect(res.send).toBeCalledWith(validManifest);
  });
});

  it.todo("should return no manifest since dataset or account is not present")
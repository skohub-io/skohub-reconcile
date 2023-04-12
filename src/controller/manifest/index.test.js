import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryResponse, validManifest } from "../__mocks__/manifest.js";
import { manifest } from "./index.js";
import { checkAccountDataset } from '../utils.js';

describe("Manifest", () => {
  it("correctly passes requests", async () => {
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
    // expect(checkAccountDataset).toBeCalledWith(
    //   "dini-ag-kim",
    //   "https://w3id.org/rhonda/polmat/scheme",
    //   "en"
    // );
    expect(res.send).toBeCalledWith(validManifest);
  });
  it("should return no manifest since dataset or account is not present", async () => {
    
  });
});

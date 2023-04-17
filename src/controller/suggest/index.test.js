import { beforeAll, describe, expect, it, vi } from "vitest";
import suggest from ".";
import { queryForSuggestions } from "./queryForSuggestions";
import { suggestions } from "./__mocks__/suggestions";

vi.mock("../utils.js", async () => {
  const actual = await vi.importActual("../utils.js");
  return {
    ...actual,
    checkAccountDataset: vi.fn().mockReturnValue(true),
  };
});

vi.mock("./queryForSuggestions.js", () => {
  return {
    queryForSuggestions: vi.fn(),
  };
});

const mockedQueryForSuggestions = vi.mocked(queryForSuggestions);

describe("suggest controller", () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  it("should return a list of suggestions", async () => {
    mockedQueryForSuggestions.mockResolvedValueOnce(suggestions);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        cursor: 0,
        prefix: "P",
      },
    };
    const res = {
      json: vi.fn(),
    };
    await suggest(req, res);
    expect(res.json).toHaveBeenCalledWith({
      result: suggestions,
    });
  });

  it("returns an error if no prefix is provided", async () => {
    mockedQueryForSuggestions.mockResolvedValueOnce(suggestions);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        cursor: 0,
      },
    };
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };
    await suggest(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: [],
      message: "No prefix provided",
      status_code: 400,
      success: false,
    });
  });

  it("returns an error if sth else goes wrong", async () => {
    mockedQueryForSuggestions.mockRejectedValueOnce("Something went wrong");
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        cursor: 0,
        prefix: "P",
      },
    };
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };
    await suggest(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      data: [],
      message: "Something went wrong",
      status_code: 500,
      success: false,
    });
  });
});

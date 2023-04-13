import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import queryID from "../../queries/queryID.js";
import preview from "./index.js";
import queryResult from "./__mocks__/queryResult.js";

vi.mock("../../queries/queryID.js", async () => {
  return {
    default: vi.fn(),
  };
});

const mockedQueryID = vi.mocked(queryID);

describe("preview", () => {
  it("status is 200 and res.send got called", async () => {
    mockedQueryID.mockResolvedValue(queryResult);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        id: "http://test.org/1",
      },
      params: {},
    };
    const res = {
      json: vi.fn(),
      status: vi.fn(),
      send: vi.fn(),
    };
    await preview(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalled();
  });

  it("returns error if no hit is found", async () => {
    mockedQueryID.mockResolvedValue({
      ...queryResult,
      hits: { total: { value: 0 } },
    });
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        id: "http://test.org/1",
      },
      params: {},
    };
    const res = {
      json: vi.fn(),
      status: vi.fn(),
      send: vi.fn(),
    };
    await preview(req, res);
    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith({
      status_code: 404,
      success: false,
      data: [],
      message: "Sorry, nothing at this url.",
    });
  });

  it("returns error if something in between goes wrong", async () => {
    mockedQueryID.mockResolvedValue([]);
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        id: "http://test.org/1",
      },
      params: {},
    };
    const res = {
      json: vi.fn(),
      status: vi.fn(),
      send: vi.fn(),
    };
    await preview(req, res);
    expect(res.status).toBeCalledWith(500);
  });
});

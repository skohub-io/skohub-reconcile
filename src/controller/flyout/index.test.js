import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import queryID from "../../queries/queryID.js";
import queryResult from "./__mocks__/queryResult.js";
import flyout from "./index.js";

vi.mock("../../queries/queryID.js", async () => {
  return {
    default: vi.fn(),
  };
});

const mockedQueryID = vi.mocked(queryID);

describe("flyout", () => {
  it("returns a an object with id and html", async () => {
    const response =
      {
        html: `<div>
                  <h1>Test EN</h1>
                  <p style="font-size: 0.8em; color: black;">ID: http://test.org/1</p>
                  <p style="font-size: 0.8em; color: black;">Definition: Definition EN</p>
                  <p style="font-size: 0.8em; color: black;">Scope Note: Scope Note EN</p>
                </div>`,
        id: "http://test.org/1",
      }

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
    };

    await flyout(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(response);
  });

  it("returns an error if no id is provided", async () => {
    const req = {
      query: {
        account: "dini-ag-kim",
        dataset: "https://w3id.org/rhonda/polmat/scheme",
        language: "en",
        id: "",
      },
      params: {},
    };
    const res = {
      json: vi.fn(),
      status: vi.fn(),
    };

    await flyout(req, res);
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({
      data: [],
      message: "Please provide an id as query parameter",
      success: false,
      status_code: 400, 
    });
  
  });
});

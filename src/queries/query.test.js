import { jest } from "@jest/globals";

jest.mock("./query.js", () => ({
  query: jest.fn(() => Promise.resolve(4)),
}));

jest.unstable_mockModule("../elastic/connect.js", () => {
  return {
    esClient: {
      msearch: jest.fn(() => Promise.resolve(4)),
    },
  };
});

const { query } = await import("./query.js");
const { esClient } = await import("../elastic/connect.js");

describe("query", () => {
  it("should return a result", async () => {
    const result = await query("Test", "test");
    expect(result).toBe(4);
  });
});

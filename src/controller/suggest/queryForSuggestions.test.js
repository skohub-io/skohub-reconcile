import { describe, expect, it, vi } from "vitest";
import { suggest as suggestQuery } from "../../queries/suggest.js";
import { buildQueryResponses } from "./__mocks__/elasticQueryResponse.js";
import { queryForSuggestions } from "./queryForSuggestions.js";

vi.mock("../../queries/suggest.js", () => {
  return {
    suggest: vi.fn(),
  };
});

const mockedSuggestQuery = vi.mocked(suggestQuery);

describe("queryForSuggestions", () => {
  it("should return a list of suggestions", async () => {
    const responses = buildQueryResponses(3);
    mockedSuggestQuery.mockResolvedValue(buildQueryResponses(3));
    const result = await queryForSuggestions(
      "account",
      "dataset",
      "prefix",
      0,
      "en"
    );
    expect(result).toEqual([
      {
        name: "Test 1 EN",
        id: "http://test.org/1",
        notable: [],
      },
      {
        name: "Test 2 EN",
        id: "http://test.org/2",
        notable: [],
      },
      {
        name: "Test 3 EN",
        id: "http://test.org/3",
        notable: [],
      },
    ]);
  });

  it("should return an empty list if no suggestions are found", async () => {
    mockedSuggestQuery.mockResolvedValue(buildQueryResponses(0));
    const result = await queryForSuggestions(
      "account",
      "dataset",
      "prefix",
      0,
      "en"
    );
    expect(result).toEqual([]);
  });
});

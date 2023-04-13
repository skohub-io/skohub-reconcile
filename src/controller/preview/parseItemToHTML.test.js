import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import queryID from "../../queries/queryID.js";
import parseItemToHTML from "./parseItemToHTML.js";
import queryResult from "./__mocks__/queryResult.js";
import html from "./__mocks__/html.js";

describe("build HTML", () => {
  it("build html out of item", async () => {
    const item = queryResult.hits.hits[0]._source;
    const html =  parseItemToHTML(item, "en");
    expect(html).toBe(html);
  });
});

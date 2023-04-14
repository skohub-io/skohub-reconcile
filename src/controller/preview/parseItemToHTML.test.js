import { afterEach, describe, expect, it, vi } from "vitest";
import parseItemToHTML from "./parseItemToHTML.js";
import queryResult from "./__mocks__/queryResult.js";
import htmlResult from "./__mocks__/htmlResult.js";

describe("build HTML", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("build html out of item", () => {
    const item = queryResult.hits.hits[0]._source;
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(htmlResult);
  });

  it("builds html if altLabel field are missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.altLabel;
    const modifiedHtmlResult = htmlResult.replace(
      /<p>alias: Alt Label 1 EN, Alt Label 2 EN<\/p>/,
      ""
    );
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if example field are missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.example;
    const modifiedHtmlResult = htmlResult.replace(
      "<div><head>Examples:</head><ul><li>Example 1 EN</li>,<li>Example 2 EN</li></ul></div>",
      ""
    );
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("build html if inScheme field is missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.inScheme;
    const modifiedHtmlResult = htmlResult.replace(
      `in ConceptScheme: <b><a href="http://test.org/scheme" target="_blank" style="text-decoration: none;">http://test.org/scheme</a></b>`,
      ""
    );
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if definition field is missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.definition;
    const modifiedHtmlResult = htmlResult.replace(
      `<p><i>Definition EN</i></p>`,
      ""
    );
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if scopeNote field is missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.scopeNote;
    const modifiedHtmlResult = htmlResult.replace(`<p>Scope Note EN</p>`, "");
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if img field is missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.img;
    const modifiedHtmlResult = htmlResult.replace(
      /<div[^>]*style="width:\s*100px[^>]*>.*?<\/div>/gs,
      ""
    );
    const html = parseItemToHTML(mockedItem, "en");
    // remove line breaks to make it easier to compare
    expect(html.replace(/\n/g, "")).toBe(modifiedHtmlResult.replace(/\n/g, ""));
  });

  it("builds html if scopeNote field is missing", () => {
    const item = queryResult.hits.hits[0]._source;
    const mockedItem = Object.assign({}, item);
    delete mockedItem.scopeNote;
    const modifiedHtmlResult = htmlResult.replace(`<p>Scope Note EN</p>`, "");
    const html = parseItemToHTML(mockedItem, "en");
    expect(html).toBe(modifiedHtmlResult);
  });
});

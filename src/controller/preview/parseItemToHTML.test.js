import { beforeEach, describe, expect, it, vi } from "vitest";
import parseItemToHTML from "./parseItemToHTML.js";
import queryResult from "./__mocks__/queryResult.js";
import htmlResult from "./__mocks__/htmlResult.js";

let item;

describe("build HTML", () => {
  beforeEach(() => {
    item = structuredClone(queryResult.hits.hits[0]._source);
  });

  it("build html out of item", () => {

    const html = parseItemToHTML(item, "en");
    expect(html).toBe(htmlResult);
  });

  it("builds html if altLabel field are missing", () => {
    delete item.altLabel
    const modifiedHtmlResult = htmlResult.replace(
      /<p>alias: Alt Label 1 EN, Alt Label 2 EN<\/p>/,
      ""
    );
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if altLabel in language is missing", () => {
    delete item.altLabel.en;
    const modifiedHtmlResult = htmlResult.replace(
      /<p>alias: Alt Label 1 EN, Alt Label 2 EN<\/p>/,
      ""
    );
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if example field are missing", () => {
    delete item.example;
    const modifiedHtmlResult = htmlResult.replace(
      "<div><head>Examples:</head><ul><li>Example 1 EN</li>,<li>Example 2 EN</li></ul></div>",
      ""
    );
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("build html if inScheme field is missing", () => {
    delete item.inScheme;
    const modifiedHtmlResult = htmlResult.replace(
      `in ConceptScheme: <b><a href="http://test.org/scheme" target="_blank" style="text-decoration: none;">http://test.org/scheme</a></b>`,
      ""
    );
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if definition field is missing", () => {
    delete item.definition;
    const modifiedHtmlResult = htmlResult.replace(
      `<p><i>Definition EN</i></p>`,
      ""
    );
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if scopeNote field is missing", () => {
    delete item.scopeNote;
    const modifiedHtmlResult = htmlResult.replace(`<p>Scope Note EN</p>`, "");
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });

  it("builds html if img field is missing", () => {
    delete item.img;
    const modifiedHtmlResult = htmlResult.replace(
      /<div[^>]*style="width:\s*100px[^>]*>.*?<\/div>/gs,
      ""
    );
    const html = parseItemToHTML(item, "en");
    // remove line breaks to make it easier to compare
    expect(html.replace(/\n/g, "")).toBe(modifiedHtmlResult.replace(/\n/g, ""));
  });

  it("builds html if scopeNote field is missing", () => {
    delete item.scopeNote;
    const modifiedHtmlResult = htmlResult.replace(`<p>Scope Note EN</p>`, "");
    const html = parseItemToHTML(item, "en");
    expect(html).toBe(modifiedHtmlResult);
  });
});

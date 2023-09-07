import { describe, expect, it } from 'vitest'
import { queryResponse, validManifest } from "./__mocks__/manifest.js";
import { valid } from 'semver';

const qRes = queryResponse
const { buildManifest } = await import("./buildManifest.js");

describe("Build manifest", () => {
  it("should return a valid manifest", async () => {
    const manifestRes = await buildManifest(qRes, "dini-ag-kim", "https://w3id.org/rhonda/polmat/scheme", "en");
    expect(manifestRes).toStrictEqual(validManifest)
    // TODO validate manifest against schema
    expect(manifestRes.versions.every(v => valid(v))).toBeTruthy()
  });
});

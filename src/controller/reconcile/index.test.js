import { describe, expect, it, vi } from "vitest";
import reconcile from "./index.js";
import manifest from "../manifest/index.js";
import query from "../query/index.js";

vi.mock("../manifest/index.js", () => {
  return {
    default: vi.fn(),
  };
});

vi.mock("../query/index.js", () => {
  return {
    default: vi.fn(),
  };
});

describe("Reconcile", () => {
  it("call manifest function if no queries are provided", async () => {
    const req = {
      query: {},
    };
    const res = {};
    await reconcile(req, res);
    expect(manifest).toBeCalledWith(req, res);
  });

  it("call query function if queries are provided", async () => {
    const req = {
      query: {
        queries: '{\n  "q0": {\n    "query": "Regelungsmaterie"\n  },\n\t  "q1": {\n    "query": "Policeymaterie"\n  }\n}'
      },
    };
    const res = {};
    await reconcile(req, res);
    expect(query).toBeCalledWith(req, res);
  });
});

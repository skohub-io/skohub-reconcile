import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { query } from "./query.js";

vi.mock('../elastic/connect.js', async () => {
  // const actual = await vi.importActual("../elastic/connect.js")
  return {
    esClient: {
      connect: vi.fn(),
      msearch: vi.fn().mockResolvedValue([])
    }
  }
})

describe("query", () => {
  it("should return a result", async () => {
    const result = await query("Test", "test");
    expect(result).toStrictEqual([]);
  });
});

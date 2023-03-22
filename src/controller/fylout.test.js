import * as queryIDModule from "../esQueries/queryID.js";
import { jest } from "@jest/globals";
import {flyout} from "./flyout.js";

jest.unstable_mockModule("../esQueries/queryID", () => {
  // const original = jest.requireActual("../esQueries/queryID")
  return {
    __esModule: true,
    // ...original,
    funcB: jest.fn(() => 10)
  }
})

jest.unstable_mockModule("./myModule", () => {
  // const original = jest.requireActual("../esQueries/queryID")
  return {
    __esModule: true,
    // ...original,
    getRandom: jest.fn(() => 10),
  }
})


const { getRandom } = await import("./myModule")
const { funcB } = await import("../esQueries/queryID")

it("is 10", () => {
  expect(getRandom()).toBe(10)
})

it("funcB", () => {
  const spy = jest.spyOn(queryIDModule, "funcB")

  expect(funcB()).toBe(10)
})

// it("test flyout", () => {
//   const req = {
//     params: {
//       account: "dini-ag-kim",
//       dataset: "http://example.org/schema",
//       id: "http://example.org/schema/1"
//     },
//     query: {
//       id: "http://example.org/schema/1"
//     }
//   }
//   const res = {}
//   const result = flyout(req, res)

//   expect(result).toStrictEqual({
//     id: "",
//     html: ""
//   })
// })
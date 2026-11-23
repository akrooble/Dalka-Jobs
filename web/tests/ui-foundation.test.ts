import assert from "node:assert/strict";
import test from "node:test";
import { paginate } from "../lib/ui.ts";
import { validateExample } from "../lib/ui-preview.ts";

test("pagination gives correct ranges and leaves source data untouched", () => {
  const rows = ["a", "b", "c", "d", "e", "f", "g"];
  const result = paginate(rows, 2, 3);
  assert.deepEqual(result, { rows: ["d", "e", "f"], page: 2, totalPages: 3, totalRows: 7, from: 4, to: 6 });
  assert.deepEqual(rows, ["a", "b", "c", "d", "e", "f", "g"]);
});

test("a stale high page clamps after rows are filtered", () => {
  assert.deepEqual(paginate(["match"], 5, 3), { rows: ["match"], page: 1, totalPages: 1, totalRows: 1, from: 1, to: 1 });
  assert.deepEqual(paginate([1, 2, 3, 4], 99, 3).rows, [4]);
});

test("empty rows have a usable first page and no false row range", () => {
  assert.deepEqual(paginate([], 20, 3), { rows: [], page: 1, totalPages: 1, totalRows: 0, from: 0, to: 0 });
});

test("invalid or fractional requested pages recover predictably", () => {
  for (const page of [Number.NaN, Infinity, -10, 0]) assert.equal(paginate([1, 2, 3], page, 1).page, 1);
  assert.deepEqual(paginate([1, 2, 3], 2.8, 1).rows, [2]);
});

test("invalid page sizes are rejected instead of creating impossible navigation", () => {
  for (const size of [0, -1, 1.5, Infinity, Number.NaN]) assert.throws(() => paginate([1], 1, size), RangeError);
});

test("example validation reports both empty fields with real field targets", () => {
  const issues = validateExample({ name: " \t ", type: "" });
  assert.deepEqual(issues.map((issue) => issue.fieldId), ["example-name", "example-type"]);
  assert.ok(issues.every((issue) => issue.label && issue.message));
});

test("correcting either example field leaves only the remaining error", () => {
  assert.deepEqual(validateExample({ name: "Sample", type: "unexpected" }).map((issue) => issue.fieldId), ["example-type"]);
  assert.deepEqual(validateExample({ name: "x", type: "sample-a" }).map((issue) => issue.fieldId), ["example-name"]);
});

test("valid example values pass without changing the entered values", () => {
  const values = { name: "  Fictional example  ", type: "sample-b" };
  assert.deepEqual(validateExample(values), []);
  assert.equal(values.name, "  Fictional example  ");
});

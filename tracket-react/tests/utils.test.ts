import { describe, expect, test } from "vitest";
import { dateToString } from "../src/utils";

describe("dateToString", () => {
  test("should be converted to API format", () => {
    const result = dateToString(new Date("2024-01-01T01:00:00"));

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-04:00$/);
  });
});

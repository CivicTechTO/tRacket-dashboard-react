import { describe, expect, test } from "vitest";
import { getLocations } from "../src/components/api/locations";

describe("data loading operations", () => {
  test("/locations ", async () => {
    const locations = await getLocations();

    const expected = expect.objectContaining({
      locations: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          label: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          radius: expect.any(Number),
          active: expect.any(Boolean),
          latestTimestamp: expect.any(String),
        }),
      ]),
    });

    expect(locations).toEqual(expected);
  });
});

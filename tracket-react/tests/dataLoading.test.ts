import { describe, expect, test } from "vitest";
import { getLocations } from "../src/components/api/locations";

describe("data loading operations", () => {
  const V1_API_TEST_ID = "572250";

  test("/locations ", async () => {
    const result = await getLocations();

    const expected = {
      locations: expect.arrayContaining([
        {
          id: expect.any(String),
          label: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          radius: expect.any(Number),
          active: expect.any(Boolean),
          latestTimestamp: expect.any(String),
        },
      ]),
    };

    expect(result).toEqual(expected);
  });

  test("/locations/<location-id>", async () => {
    const result = await getLocations(V1_API_TEST_ID);

    const expected = {
      locations: [
        {
          id: V1_API_TEST_ID,
          label: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          radius: expect.any(Number),
          active: expect.any(Boolean),
          latestTimestamp: expect.any(String),
        },
      ],
    };

    expect(result.locations).toHaveLength(1);
    expect(result).toEqual(expected);
  });
});

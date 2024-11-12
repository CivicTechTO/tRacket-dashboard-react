import { describe, expect, test } from "vitest";
import {
  getLocationNoiseData,
  getLocations,
} from "../src/components/api/locations";
import { makeTracketApiRequest } from "../src/components/api/base";
import { Granularity, NoiseTimed } from "../src/types/api";

describe("data loading operations", () => {
  const V1_API_TEST_ID = 572250;

  describe("locations api", () => {
    test("/locations ", async () => {
      const result = await getLocations();

      const expected = {
        locations: expect.arrayContaining([
          {
            id: expect.any(Number),
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

    test("/locations/:location-id", async () => {
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

  describe("/locations/:location-id/noise with plain request", () => {
    const endpoint = `/locations/${V1_API_TEST_ID}/noise`;

    test("should return TimedLocationNoiseData for default params", async () => {
      const result = await makeTracketApiRequest("GET", endpoint);

      expect(result.measurements?.length).toBeGreaterThan(0);

      result.measurements?.forEach((v: NoiseTimed) => {
        expect(v).toEqual({
          min: expect.any(Number),
          max: expect.any(Number),
          mean: expect.any(Number),
          timestamp: expect.any(String),
        });
      });
    });

    test("should return AggregateLocationNoiseData for life-time granularity", async () => {
      const result = await makeTracketApiRequest("GET", endpoint, {
        params: {
          granularity: Granularity.LifeTime,
        },
      });

      expect(result.measurements).toHaveLength(1);

      result.measurements?.forEach((v: NoiseTimed) => {
        expect(v).toEqual({
          min: expect.any(Number),
          max: expect.any(Number),
          mean: expect.any(Number),
          count: expect.any(Number),
          start: expect.any(String),
          end: expect.any(String),
        });
      });
    });
  });

  describe("/locations/:location-id/noise with noise api", () => {
    test("should return TimedLocationNoiseData with pagination", async () => {
      const result = await getLocationNoiseData(V1_API_TEST_ID, {
        page: 1,
      });

      expect(result.measurements?.length).toBeGreaterThan(0);

      result.measurements?.forEach((v) => {
        expect(v).toEqual({
          min: expect.any(Number),
          max: expect.any(Number),
          mean: expect.any(Number),
          timestamp: expect.any(String),
        });
      });
    });
    test("should return TimedLocationNoiseData for hourly granularity with pagination", async () => {
      const result = await getLocationNoiseData(V1_API_TEST_ID, {
        granularity: Granularity.Hourly,
        page: 1,
      });

      expect(result.measurements?.length).toBeGreaterThan(0);

      result.measurements?.forEach((v) => {
        expect(v).toEqual({
          min: expect.any(Number),
          max: expect.any(Number),
          mean: expect.any(Number),
          timestamp: expect.any(String),
        });
      });
    });

    test("should return AggregateLocationNoiseData for life-time granularity", async () => {
      const result = await getLocationNoiseData(V1_API_TEST_ID, {
        granularity: Granularity.LifeTime,
      });

      expect(result.measurements).toHaveLength(1);

      result.measurements?.forEach((v) => {
        expect(v).toEqual({
          min: expect.any(Number),
          max: expect.any(Number),
          mean: expect.any(Number),
          count: expect.any(Number),
          start: expect.any(String),
          end: expect.any(String),
        });
      });
    });
  });
});

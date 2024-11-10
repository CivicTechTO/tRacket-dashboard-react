import { z } from "zod";
import { dateToString } from "../utils";

enum Granularity {
  Raw = "raw",
  Hourly = "hourly",
  LifeTime = "life-time",
}

/**
 * Model for data in API request made for getting noise measurements.
 */
export type NoiseRequestParams = {
  granularity?: Granularity;
  start?: Date;
  end?: Date;
  page?: number;
};

const GranularitySchema = z.enum([
  Granularity.Raw,
  Granularity.Hourly,
  Granularity.LifeTime,
]);

export const NoiseRequestParamsSchema = z.object({
  granularity: GranularitySchema.default(Granularity.Raw),
  start: z.date().optional().transform(transformDateToString),
  end: z.date().optional().transform(transformDateToString),
  page: z
    .number()
    .gte(0)
    .optional()
    .transform((v) => v?.toString()),
});

function transformDateToString(date?: Date) {
  if (date) {
    return dateToString(date);
  }
  return undefined;
}

/**
 * Single location type.
 */
type Location = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
  latestTimestamp: string;
};

/**
 * Locations data type.
 */
export type LocationsData = {
  locations: Location[];
};

export const LocationSchema = z.object({
  id: z.coerce.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number(),
  active: z.boolean(),
  latestTimestamp: z.string().transform((v) => {
    if (v.startsWith("0000")) {
      return "1892-01-03 01:11:00-04:00";
    }
    return v;
  }),
});

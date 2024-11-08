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

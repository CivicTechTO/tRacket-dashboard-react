import { dateToString } from "../utils";
import { Granularity } from "../types/api";
import { z } from "zod";

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

function transformDateToString(date?: Date) {
  if (date) {
    return dateToString(date);
  }
  return undefined;
}

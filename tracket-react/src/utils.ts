/**
 * Turn a date object into a string following the API format.
 * @param date
 */
export const dateToString = (date: Date) => {
  const dateWithoutTZ = date.toISOString().split(".")[0];
  const FIXED_TZ = "-04:00";
  
  return dateWithoutTZ + FIXED_TZ;
};

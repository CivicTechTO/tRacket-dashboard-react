// offset to UTC/GMT - 5 h
const EST_OFFSET = -5;

/**
 * Construct current date based on timezone offset to UTC/GMT
 * @param tzOffset - Hours of offset, "-" for behind
 * @returns
 */
export const getCurrentDate = (tzOffset: number) => {
  const now = new Date(Date.now());
  now.setUTCHours(now.getUTCHours() + tzOffset);

  return now;
};

/**
 * Get the current threshold for marking a sensor as active.
 */
export const getActiveTimeLimit = () => {
  // in the last 2 hours
  const threshold = -2;
  const limit = getCurrentDate(EST_OFFSET);
  limit.setUTCHours(limit.getUTCHours() + threshold);

  return limit;
};

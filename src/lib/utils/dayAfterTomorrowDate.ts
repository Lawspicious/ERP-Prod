const offsetIST = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
export const dayAfterTomorrow = new Date(
  new Date().getTime() + offsetIST + 172800000,
)
  .toISOString()
  .split('T')[0];

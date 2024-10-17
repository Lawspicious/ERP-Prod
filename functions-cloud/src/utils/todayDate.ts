const offsetIST = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
export const today = new Date(new Date().getTime() + offsetIST)
  .toISOString()
  .split('T')[0];

// Add 30 days to today's date
export const today30 = new Date(
  new Date().getTime() + offsetIST + 30 * 24 * 60 * 60 * 1000,
)
  .toISOString()
  .split('T')[0];

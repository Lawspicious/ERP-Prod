const offsetIST = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
export const today = new Date(new Date().getTime() + offsetIST)
  .toISOString()
  .split('T')[0];

import * as dotenv from 'dotenv';

dotenv.config();

/** Central configuration — every hardcoded environment value lives here, nowhere else. */
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5501',
  defaultTimeoutMs: 5_000,
  navigationTimeoutMs: 15_000,
};

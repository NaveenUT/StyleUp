import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Central configuration — every environment-specific value used anywhere in this
 * project is read from here, never inlined in a page class or spec file.
 * Backed by `.env` (mirrored in `.env.example`).
 */
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5501/',
  appUsername: process.env.APP_USERNAME || '',
  appPassword: process.env.APP_PASSWORD || '',
  timeout: Number(process.env.TIMEOUT) || 60_000,
};

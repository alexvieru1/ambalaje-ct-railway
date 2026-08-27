import { loadEnv } from '@medusajs/framework/utils'

import { assertValue } from 'utils/assert-value'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Is development environment
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Public URL for the backend
 */
export const BACKEND_URL = process.env.BACKEND_PUBLIC_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 'http://localhost:9000'

/**
 * Database URL for Postgres instance used by the backend
 */
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  'Environment variable for DATABASE_URL is not set',
)

/**
 * (optional) Redis URL for Redis instance used by the backend
 */
export const REDIS_URL = process.env.REDIS_URL;

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = process.env.ADMIN_CORS;

/**
 * Auth CORS origins
 */
export const AUTH_CORS = process.env.AUTH_CORS;

/**
 * Store/frontend CORS origins
 */
export const STORE_CORS = process.env.STORE_CORS;

/**
 * JWT Secret used for signing JWT tokens
 */
export const JWT_SECRET = assertValue(
  process.env.JWT_SECRET,
  'Environment variable for JWT_SECRET is not set',
)

/**
 * Cookie secret used for signing cookies
 */
export const COOKIE_SECRET = assertValue(
  process.env.COOKIE_SECRET,
  'Environment variable for COOKIE_SECRET is not set',
)

/**
 * (optional) Minio configuration for file storage
 */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
export const MINIO_BUCKET = process.env.MINIO_BUCKET; // Optional, if not set bucket will be called: medusa-media

/**
 * (optional) Resend API Key and from Email - do not set if using SendGrid
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;

/**
 * (optionl) SendGrid API Key and from Email - do not set if using Resend
 */
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM;

/**
 * (optional) Stripe API key and webhook secret
 */
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * (optional) Meilisearch configuration
 */
export const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
export const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY;

/**
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as 'worker' | 'server' | 'shared' | undefined) ?? 'shared'

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'

/**
 * SmartBill Cloud — source of truth for inventory.
 *
 * Credentials come from SmartBill Cloud → Contul meu → Integrari.
 * The sync is inert unless SMARTBILL_SYNC_ENABLED is 'true', and it only ever
 * writes when SMARTBILL_SYNC_DRY_RUN is explicitly 'false'.
 */
export const SMARTBILL_USERNAME = process.env.SMARTBILL_USERNAME
export const SMARTBILL_TOKEN = process.env.SMARTBILL_TOKEN
export const SMARTBILL_CIF = process.env.SMARTBILL_CIF

/**
 * Gestiune name exactly as it appears in SmartBill — CASE-SENSITIVE.
 */
export const SMARTBILL_WAREHOUSE = process.env.SMARTBILL_WAREHOUSE

/**
 * Medusa stock location the SmartBill gestiune maps to.
 */
export const SMARTBILL_STOCK_LOCATION_ID = process.env.SMARTBILL_STOCK_LOCATION_ID

/**
 * True only when every credential and mapping needed for a sync is present.
 */
export const SMARTBILL_CONFIGURED = Boolean(
  SMARTBILL_USERNAME &&
    SMARTBILL_TOKEN &&
    SMARTBILL_CIF &&
    SMARTBILL_WAREHOUSE &&
    SMARTBILL_STOCK_LOCATION_ID,
)

export const SMARTBILL_SYNC_ENABLED = process.env.SMARTBILL_SYNC_ENABLED === 'true'

/**
 * Cron expression for the scheduled sync. Defaults to hourly at :15.
 */
export const SMARTBILL_SYNC_CRON = process.env.SMARTBILL_SYNC_CRON || '15 * * * *'

/**
 * Dry run is the default: writes happen only on an explicit 'false'.
 */
export const SMARTBILL_SYNC_DRY_RUN = process.env.SMARTBILL_SYNC_DRY_RUN !== 'false'

/**
 * Auto-release Medusa reservations older than this many hours; 0 disables.
 */
export const SMARTBILL_RESERVATION_MAX_AGE_HOURS = Number.parseInt(
  process.env.SMARTBILL_RESERVATION_MAX_AGE_HOURS ?? '0',
  10,
) || 0

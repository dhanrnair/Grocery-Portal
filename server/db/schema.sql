-- Idempotent: safe to run on every `npm run db:setup`.
-- There is no migration tool. To change an existing table, append an
-- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` below; editing a CREATE
-- TABLE above does nothing to a database that already has the table.

-- Better Auth tables (default names/columns for the email+password setup in server/auth.js).
CREATE TABLE IF NOT EXISTS "user" (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image           text,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS session (
  id          text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token       text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId"    text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_idx ON session ("userId");
CREATE TABLE IF NOT EXISTS account (
  id                      text PRIMARY KEY,
  "accountId"             text NOT NULL,
  "providerId"            text NOT NULL,
  "userId"                text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope                   text,
  password                text,
  "createdAt"             timestamptz NOT NULL DEFAULT now(),
  "updatedAt"             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_idx ON account ("userId");
CREATE TABLE IF NOT EXISTS verification (
  id          text PRIMARY KEY,
  identifier  text NOT NULL,
  value       text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier);

CREATE TABLE IF NOT EXISTS products (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  category    text NOT NULL,
  unit        text NOT NULL,                 -- e.g. '1 kg', '500 g', '1 L', 'each'
  price       numeric(10, 2) NOT NULL CHECK (price >= 0),
  stock       integer NOT NULL CHECK (stock >= 0),
  image       text NOT NULL,
  description text NOT NULL,
  position    integer NOT NULL DEFAULT 0     -- default display order (text ids sort wrongly)
);

CREATE TABLE IF NOT EXISTS orders (
  id         text PRIMARY KEY,
  user_id    text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  status     text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'cancelled')),
  name       text NOT NULL,
  email      text NOT NULL,
  address    text NOT NULL,
  city       text NOT NULL,
  zip        text NOT NULL,
  subtotal   numeric(10, 2) NOT NULL,
  delivery   numeric(10, 2) NOT NULL,
  total      numeric(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id   text NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products (id),
  name       text NOT NULL,
  unit       text NOT NULL,
  image      text NOT NULL,
  price      numeric(10, 2) NOT NULL,        -- snapshot at order time
  qty        integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);

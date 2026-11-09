-- Gives every order made before access tokens were set one. New orders get theirs when they're created.
-- gen_random_uuid() is built into PostgreSQL 13+ and uses a secure random source; two of them make a 244-bit token.
UPDATE "Order"
SET "accessToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "accessToken" IS NULL;

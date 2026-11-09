-- Raising a user's sessionVersion signs out every session issued before it (e.g. "sign out of other devices").
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

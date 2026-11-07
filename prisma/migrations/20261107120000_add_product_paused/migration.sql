-- A paused product stays visible in the store but can't be bought. Its stock is kept.
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isPaused" BOOLEAN NOT NULL DEFAULT false;

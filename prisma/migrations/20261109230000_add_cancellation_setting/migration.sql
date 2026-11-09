-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN     "cancellationAllowed" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationAllowed" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "cancellationAllowed" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);


-- The one settings row. Cancellation stays allowed, as it has been so far.
INSERT INTO "StoreSettings" ("id", "cancellationAllowed", "updatedAt") VALUES (1, true, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;

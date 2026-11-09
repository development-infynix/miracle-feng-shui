-- CreateEnum
CREATE TYPE "OrderEventActor" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "OrderStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "actor" "OrderEventActor" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Orders from before this table have no history. Each gets the event that created it, at the time it was
-- placed, and, if it has moved on since, one more event to its current status. The time of that second
-- event isn't known, so it uses the closest date on the order and says so in its note.
WITH placed AS (
  SELECT
    o."id",
    o."userId",
    o."status",
    o."paymentMethod",
    o."createdAt",
    COALESCE(o."deliveredAt", o."cancellationRequestedAt", o."updatedAt") AS "changedAt",
    (CASE
      WHEN o."paymentMethod" = 'COD' THEN 'COD_PENDING'
      WHEN o."status" = 'PENDING' AND o."paymentStatus" <> 'PAID' THEN 'PENDING'
      ELSE 'PAID'
    END)::"OrderStatus" AS "firstStatus"
  FROM "Order" o
  WHERE NOT EXISTS (SELECT 1 FROM "OrderStatusEvent" e WHERE e."orderId" = o."id")
),
first_events AS (
  INSERT INTO "OrderStatusEvent" ("id", "orderId", "fromStatus", "toStatus", "actor", "changedById", "note", "createdAt")
  SELECT
    gen_random_uuid()::text, p."id", NULL, p."firstStatus",
    (CASE WHEN p."paymentMethod" = 'COD' THEN 'CUSTOMER' ELSE 'SYSTEM' END)::"OrderEventActor",
    CASE WHEN p."paymentMethod" = 'COD' THEN p."userId" END,
    CASE WHEN p."paymentMethod" = 'COD' THEN 'Order placed' ELSE 'Payment confirmed' END,
    p."createdAt"
  FROM placed p
  RETURNING "orderId"
)
INSERT INTO "OrderStatusEvent" ("id", "orderId", "fromStatus", "toStatus", "actor", "changedById", "note", "createdAt")
SELECT
  gen_random_uuid()::text, p."id", p."firstStatus", p."status", 'SYSTEM', NULL,
  'Recorded when order history began; the time is approximate.',
  GREATEST(p."changedAt", p."createdAt" + INTERVAL '1 second')
FROM placed p
WHERE p."status" <> p."firstStatus";

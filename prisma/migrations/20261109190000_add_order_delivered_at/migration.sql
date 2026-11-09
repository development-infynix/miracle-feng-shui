-- When an order was marked Delivered. A review written after it, by the same customer, is a verified purchase.
ALTER TABLE "Order" ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- Orders already delivered have no recorded date; their last update is the closest estimate.
UPDATE "Order" SET "deliveredAt" = "updatedAt" WHERE "status" = 'DELIVERED' AND "deliveredAt" IS NULL;

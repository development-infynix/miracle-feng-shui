-- Archived products can be deleted for good two weeks after they were archived.
-- archivedAt records when. Products archived before this migration get their last update time,
-- the best record there is of when they were archived.
ALTER TABLE "Product" ADD COLUMN "archivedAt" TIMESTAMP(3);
UPDATE "Product" SET "archivedAt" = "updatedAt" WHERE "isActive" = false;

-- Order lines outlive a deleted product: they keep their own title, price and photo, and lose only the link.
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

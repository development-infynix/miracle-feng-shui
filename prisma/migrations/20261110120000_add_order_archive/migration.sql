-- An admin can archive a finished order: it leaves the Orders list for the Archive page. Null means not archived.
-- Each archive or restore is recorded in OrderArchiveEvent, shown in the admin order history.
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OrderArchiveEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderArchiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderArchiveEvent_orderId_createdAt_idx" ON "OrderArchiveEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_archivedAt_idx" ON "Order"("archivedAt");

-- AddForeignKey
ALTER TABLE "OrderArchiveEvent" ADD CONSTRAINT "OrderArchiveEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderArchiveEvent" ADD CONSTRAINT "OrderArchiveEvent_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


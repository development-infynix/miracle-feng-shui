-- Admins can hide a review (it moves to the Archive, restorable) with a reason, and reply to it publicly.
-- Every hide, restore and reply is recorded in ReviewEvent.
-- CreateEnum
CREATE TYPE "ReviewHideReason" AS ENUM ('ABUSIVE', 'SPAM', 'PERSONAL_DETAILS', 'OFF_TOPIC', 'NOT_GENUINE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewEventAction" AS ENUM ('HIDDEN', 'RESTORED', 'REPLIED', 'REPLY_REMOVED');

-- DropIndex
DROP INDEX "Review_productId_idx";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "hiddenAt" TIMESTAMP(3),
ADD COLUMN     "hiddenNote" TEXT,
ADD COLUMN     "hiddenReason" "ReviewHideReason",
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "reply" TEXT;

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "action" "ReviewEventAction" NOT NULL,
    "reason" "ReviewHideReason",
    "note" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewEvent_reviewId_createdAt_idx" ON "ReviewEvent"("reviewId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_productId_hiddenAt_idx" ON "Review"("productId", "hiddenAt");

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- The author of a hidden review can ask the store to look again; the admin restores it or answers.
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReviewEventAction" ADD VALUE 'APPEALED';
ALTER TYPE "ReviewEventAction" ADD VALUE 'APPEAL_DECLINED';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "appealMessage" TEXT,
ADD COLUMN     "appealResolvedAt" TIMESTAMP(3),
ADD COLUMN     "appealResponse" TEXT,
ADD COLUMN     "appealedAt" TIMESTAMP(3);


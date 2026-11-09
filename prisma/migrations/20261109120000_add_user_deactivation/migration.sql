-- An admin can deactivate a customer account: it can't sign in, and open sessions end. Null means active.
ALTER TABLE "User" ADD COLUMN "deactivatedAt" TIMESTAMP(3);

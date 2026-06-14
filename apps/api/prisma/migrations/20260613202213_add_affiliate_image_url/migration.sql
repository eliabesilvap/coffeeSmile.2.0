-- Add affiliate fields to Post
ALTER TABLE "Post" ADD COLUMN "affiliateUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "affiliateButtonText" TEXT;
ALTER TABLE "Post" ADD COLUMN "affiliateImageUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "affiliateImagePublicId" TEXT;

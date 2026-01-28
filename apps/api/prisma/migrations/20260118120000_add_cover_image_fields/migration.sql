-- Rename coverImage to coverImageUrl and make it optional
ALTER TABLE "Post" RENAME COLUMN "coverImage" TO "coverImageUrl";
ALTER TABLE "Post" ALTER COLUMN "coverImageUrl" DROP NOT NULL;

-- Add optional public_id for Cloudinary
ALTER TABLE "Post" ADD COLUMN "coverImagePublicId" TEXT;

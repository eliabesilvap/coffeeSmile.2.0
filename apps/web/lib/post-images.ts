import { getImage } from '@/lib/cloudinary';

type PostImageSource = {
  coverImageUrl?: string | null;
  coverUrl?: string | null;
  imageUrl?: string | null;
};

type ImageVariant = Parameters<typeof getImage>[1];

export function resolvePostCoverSource(post: PostImageSource) {
  return post.coverImageUrl ?? post.coverUrl ?? post.imageUrl ?? null;
}

export function resolvePostCoverImage(post: PostImageSource, variant: ImageVariant) {
  const source = resolvePostCoverSource(post);
  if (variant === 'hero') {
    return getImage(source, 'hero');
  }
  return getImage(source, variant);
}

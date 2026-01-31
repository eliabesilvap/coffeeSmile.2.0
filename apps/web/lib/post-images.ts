import { getImage } from '@/lib/cloudinary';

type PostImageSource = {
  coverImageUrl?: string | null;
  coverUrl?: string | null;
  imageUrl?: string | null;
  bookCoverImageUrl?: string | null;
  bookCoverUrl?: string | null;
  bookImageUrl?: string | null;
};

type ImageVariant = Parameters<typeof getImage>[1];

export function resolvePostCoverSource(post: PostImageSource) {
  return post.coverImageUrl ?? post.coverUrl ?? post.imageUrl ?? null;
}

export function resolveBookCoverSource(post: PostImageSource) {
  return post.bookCoverImageUrl ?? post.bookCoverUrl ?? post.bookImageUrl ?? null;
}

export function resolvePostCoverImage(post: PostImageSource, variant: ImageVariant) {
  const source = resolvePostCoverSource(post);
  if (variant === 'hero') {
    return getImage(source, 'hero');
  }
  return getImage(source, variant);
}

export function resolveBookCoverImage(post: PostImageSource, variant: ImageVariant) {
  return getImage(resolveBookCoverSource(post), variant);
}

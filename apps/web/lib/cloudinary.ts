const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_MARKER = '/upload/';

const TRANSFORM_SEGMENT_REGEX = /^([a-z]{1,4}_[^/]+)(,[a-z]{1,4}_[^/]+)*$/i;

const AUTO_TOKENS = ['q_auto', 'f_auto', 'dpr_auto'];

const VARIANT_TRANSFORMS: Record<
  'card' | 'hero' | 'thumb' | 'book',
  string
> = {
  card: 'c_fill,ar_16:9,w_1200',
  hero: 'c_fill,ar_16:9,w_1600',
  thumb: 'c_fill,w_200,h_140',
  book: 'c_fill,w_360,h_540',
};

function hasTransformSegment(segment: string) {
  return TRANSFORM_SEGMENT_REGEX.test(segment);
}

function applyAutoTokens(tokens: string[]) {
  const hasQ = tokens.some((token) => token.startsWith('q_'));
  const hasF = tokens.some((token) => token.startsWith('f_'));
  const hasDpr = tokens.some((token) => token.startsWith('dpr_'));
  const next = [...tokens];
  if (!hasQ) next.push('q_auto');
  if (!hasF) next.push('f_auto');
  if (!hasDpr) next.push('dpr_auto');
  return next;
}

function buildTransform(variant: keyof typeof VARIANT_TRANSFORMS) {
  return `${VARIANT_TRANSFORMS[variant]},${AUTO_TOKENS.join(',')}`;
}

function updateCloudinaryPath(pathname: string, transform: string) {
  const uploadIndex = pathname.indexOf(UPLOAD_MARKER);
  if (uploadIndex === -1) {
    return pathname;
  }

  const prefix = pathname.slice(0, uploadIndex + UPLOAD_MARKER.length);
  const remainder = pathname.slice(uploadIndex + UPLOAD_MARKER.length);
  const segments = remainder.split('/').filter(Boolean);

  if (segments.length === 0) {
    return pathname;
  }

  const [firstSegment, ...rest] = segments;
  const restPath = rest.join('/');

  if (hasTransformSegment(firstSegment)) {
    const tokens = applyAutoTokens(firstSegment.split(','));
    const nextFirst = tokens.join(',');
    return restPath ? `${prefix}${nextFirst}/${restPath}` : `${prefix}${nextFirst}`;
  }

  return restPath ? `${prefix}${transform}/${remainder}` : `${prefix}${transform}/${remainder}`;
}

export function getCloudinaryImageUrl(
  url: string | null | undefined,
  variant: keyof typeof VARIANT_TRANSFORMS,
) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== CLOUDINARY_HOST) {
      return url;
    }

    const transform = buildTransform(variant);
    parsed.pathname = updateCloudinaryPath(parsed.pathname, transform);
    return parsed.toString();
  } catch {
    return url;
  }
}

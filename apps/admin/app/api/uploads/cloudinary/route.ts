import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { getAdminSession } from '@/lib/session';

const requestSchema = z.object({
  filename: z.string().trim().min(1).optional(),
  folder: z.string().trim().min(1).optional(),
  resourceType: z.literal('image'),
});

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Pedido invalido.' }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ message: 'Cloudinary nao configurado.' }, { status: 500 });
  }

  const folder = parsed.data.folder ?? process.env.CLOUDINARY_FOLDER ?? 'coffeesmile';
  const timestamp = Math.floor(Date.now() / 1000);

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      allowed_formats: ALLOWED_FORMATS.join(','),
      max_bytes: MAX_BYTES,
    },
    apiSecret,
  );

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    allowedFormats: ALLOWED_FORMATS,
    maxBytes: MAX_BYTES,
  });
}

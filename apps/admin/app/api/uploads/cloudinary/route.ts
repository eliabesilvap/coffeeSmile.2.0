import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

const DEFAULT_ALLOWED_FORMATS = ['jpg', 'png', 'webp'];
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

function buildSignature(
  params: Record<string, string | number>,
  apiSecret: string,
) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Nao autorizado.' }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Configuracao do Cloudinary incompleta.' },
        { status: 500 },
      );
    }

    let payload: { folder?: string } | null = null;
    try {
      payload = (await request.json()) as { folder?: string };
    } catch {
      payload = null;
    }

    if (payload?.folder && typeof payload.folder !== 'string') {
      return NextResponse.json({ message: 'Parametros invalidos.' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const allowedFormats = DEFAULT_ALLOWED_FORMATS;
    const maxBytes = DEFAULT_MAX_BYTES;
    const folder = payload?.folder?.trim() || undefined;

    const signatureParams: Record<string, string | number> = {
      timestamp,
      allowed_formats: allowedFormats.join(','),
      max_bytes: maxBytes,
    };

    if (folder) {
      signatureParams.folder = folder;
    }

    const signature = buildSignature(signatureParams, apiSecret);

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      allowedFormats,
      maxBytes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Nao foi possivel gerar a assinatura.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

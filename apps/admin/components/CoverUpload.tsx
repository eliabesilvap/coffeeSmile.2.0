'use client';

import { useRef, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type UploadSignatureResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder?: string;
  allowedFormats?: string[];
  maxBytes?: number;
};

type UploadResult = {
  secure_url: string;
  public_id: string;
};

type CoverUploadProps = {
  value?: string | null;
  publicId?: string | null;
  onChange: (next: { url: string; publicId: string | null }) => void;
};

function resolvePreviewUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return url;
  try {
    return new URL(url, siteUrl).toString();
  } catch {
    return url;
  }
}

export function CoverUpload({ value, publicId, onChange }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = resolvePreviewUrl(value);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleClear = () => {
    onChange({ url: '', publicId: null });
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato invalido. Usa JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('A imagem excede 5MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const signatureResponse = await fetch('/api/uploads/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: 'image' }),
      });

      if (!signatureResponse.ok) {
        const payload = await signatureResponse.json().catch(() => null);
        throw new Error(payload?.message ?? 'Nao foi possivel gerar a assinatura.');
      }

      const signatureData = (await signatureResponse.json()) as UploadSignatureResponse;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', String(signatureData.timestamp));
      formData.append('signature', signatureData.signature);
      if (signatureData.folder) {
        formData.append('folder', signatureData.folder);
      }
      if (signatureData.allowedFormats?.length) {
        formData.append('allowed_formats', signatureData.allowedFormats.join(','));
      }
      if (typeof signatureData.maxBytes === 'number') {
        formData.append('max_bytes', String(signatureData.maxBytes));
      }

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const uploadData = (await uploadResponse.json()) as UploadResult & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message ?? 'Nao foi possivel enviar a imagem.');
      }

      onChange({ url: uploadData.secure_url, publicId: uploadData.public_id ?? publicId ?? null });
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Ocorreu um erro no upload.';
      setError(message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Imagem de capa</p>
          <p className="text-xs text-slate-500">JPG, PNG ou WebP até 5MB.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-button-secondary" onClick={handlePick} disabled={uploading}>
            {uploading ? 'Enviando...' : 'Enviar capa'}
          </button>
          {value ? (
            <button type="button" className="admin-button-secondary" onClick={handleClear} disabled={uploading}>
              Remover
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview da capa" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400">Sem imagem selecionada.</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

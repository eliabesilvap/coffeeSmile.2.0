'use client';

import { useEffect, useRef, useState } from 'react';

type PostShareProps = {
  title: string;
  className?: string;
};

const DEFAULT_SHARE_TEXT = 'Leitura rápida no CoffeeSmile';

export function PostShare({ title, className }: PostShareProps) {
  const [url, setUrl] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUrl(window.location.href);
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const shareData = {
    title,
    text: DEFAULT_SHARE_TEXT,
    url,
  };

  const handleNativeShare = async () => {
    if (!canShare || !url) return;
    try {
      await navigator.share(shareData);
    } catch {
      // Silent fallback: UI already shows alternative actions.
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    const markCopied = () => {
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        markCopied();
        return;
      }
    } catch {
      // Fallback below.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      markCopied();
    } catch {
      // Ignore copy failure.
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const whatsappUrl = `https://wa.me/?text=${encodedUrl}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  return (
    <div
      className={[
        'flex flex-wrap items-center gap-2 rounded-2xl border border-brand-100 bg-white/70 px-4 py-3 text-brand-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {canShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Compartilhar"
          className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50/70 px-3 py-2 text-sm font-medium text-brand-800 transition hover:bg-black/5"
        >
          <IconShare />
          Compartilhar
        </button>
      )}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar link"
        className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-3 py-2 text-sm transition hover:bg-black/5"
      >
        <IconLink />
        Copiar link
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no WhatsApp"
        className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-3 py-2 text-sm transition hover:bg-black/5"
      >
        <IconWhatsapp />
        WhatsApp
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartilhar no X"
        className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-3 py-2 text-sm transition hover:bg-black/5"
      >
        <IconX />
      </a>
      <span aria-live="polite" className="text-xs text-brand-600">
        {copied ? 'Link copiado' : ''}
      </span>
    </div>
  );
}

function IconShare() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 h-4 w-4"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 16v4h16v-4" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 h-4 w-4"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L14 19" />
    </svg>
  );
}

function IconWhatsapp() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0 h-4 w-4"
    >
      <path d="M12 3.3a8.7 8.7 0 0 0-7.6 12.9L3 21l4.9-1.3A8.7 8.7 0 1 0 12 3.3Zm0 1.8a6.9 6.9 0 0 1 5.8 10.7l-.3.4.6 2.5-2.6-.7-.4.2a6.9 6.9 0 1 1-3.1-13.1Zm-3.3 4.4c.2-.4.4-.4.7-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.7.7 1.8 0 .2 0 .3-.1.4-.2.2-.3.5-.5.7-.2.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.9.3.2.4.2.5.4.1.2.1 1-.2 1.6-.3.6-1.4 1.2-2 1.3-.6.1-1.3.1-2.1-.2-.5-.1-1.1-.3-1.9-.7-3.4-1.5-5.7-5.1-5.9-5.4-.2-.3-1.4-1.9-1.4-3.7 0-1.8.9-2.7 1.2-3.1Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0 h-4 w-4"
    >
      <path d="M4.5 4h4.3l3.1 4.3L15.5 4H20l-6.1 7.4L20 20h-4.3l-3.6-4.9L8.1 20H4l6.6-8L4.5 4Zm5.2 2 6.5 9.2h1.6L11.3 6H9.7Z" />
    </svg>
  );
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatStatus(status: 'draft' | 'published') {
  return status === 'published' ? 'Publicado' : 'Rascunho';
}

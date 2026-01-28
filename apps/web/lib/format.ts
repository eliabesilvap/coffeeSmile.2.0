export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date(iso));
}
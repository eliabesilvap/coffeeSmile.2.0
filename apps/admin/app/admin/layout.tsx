import { Sidebar } from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="border-b border-brand-100 bg-white/70 px-8 py-6 backdrop-blur">
          <h1 className="font-display text-2xl text-slate-900">Painel CoffeeSmile</h1>
          <p className="mt-1 text-sm text-slate-500">Gestão de conteúdos</p>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

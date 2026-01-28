export function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container-shell py-12 md:py-16">{children}</div>;
}

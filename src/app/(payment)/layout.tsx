export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-surface-muted">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {children}
      </div>
    </main>
  );
}

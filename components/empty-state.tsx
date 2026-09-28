export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-muted-foreground">
      <p className="font-display text-xl text-accent-2">{message}</p>
    </div>
  );
}

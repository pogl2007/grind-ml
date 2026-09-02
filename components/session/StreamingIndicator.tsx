export function StreamingIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-text" />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-text"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-text"
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}

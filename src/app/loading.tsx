export default function Loading() {
  return (
    <div className="grid gap-6" aria-label="Loading workspace" aria-busy="true">
      <div className="h-36 animate-pulse rounded-tf-xl border border-border bg-card" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-tf-lg border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="h-96 animate-pulse rounded-tf-lg border border-border bg-card xl:col-span-8" />
        <div className="h-96 animate-pulse rounded-tf-lg border border-border bg-card xl:col-span-4" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Memuat halaman">
      <div className="border-b border-ink/10 bg-surface-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      <section className="bg-surface px-4 py-12 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 md:h-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="flex gap-8 border-t border-ink/10 pt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        </div>
      </section>

      <section className="bg-surface-sunken px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-9 w-72" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </section>
    </main>
  );
}

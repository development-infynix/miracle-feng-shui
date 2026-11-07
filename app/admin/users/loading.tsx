export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-gray-200" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-32 rounded-lg bg-gray-100" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="h-12 bg-gray-100 border-b border-gray-200" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 border-b border-gray-100 flex items-center gap-4 px-4"
          >
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-4 w-64 rounded bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="h-4 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
